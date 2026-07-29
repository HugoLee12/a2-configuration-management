// Kiểm thử hộp đen: mọi request đi qua nginx đúng như người dùng thật.
// Không import mã service, không nói chuyện thẳng với cơ sở dữ liệu.
//
// Các phép kiểm số đếm ở đây so sánh mức chênh trước và sau, và chỉ đòi hỏi
// "tăng ít nhất bằng", không đòi "tăng đúng bằng". Lý do là `node --test` chạy
// các file kiểm thử song song trên cùng một stack, nên file khác cũng đang tạo
// link và truy cập mã ngắn trong lúc file này đo. Đòi đúng bằng thì test đỏ theo
// thứ tự chạy chứ không theo mã, mà mức chênh bằng 0 vẫn bắt được đúng cái lỗi
// cần bắt là số đếm không được gắn vào luồng nghiệp vụ.
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { setTimeout as sleep } from "node:timers/promises";
import { BASE_URL, createLink, READY_TIMEOUT_MS, SERVICES, waitForStack } from "./stack.ts";

// Worker tổng hợp theo chu kỳ nên số của nó tới muộn hơn lượt truy cập vài giây.
const AGGREGATE_TIMEOUT_MS = 15_000;

// Toàn bộ nhãn endpoint mà service redirect được phép sinh ra. Danh sách này
// đóng lại được chính là điều đang cần chứng minh, xem phép kiểm cardinality.
const REDIRECT_ENDPOINTS = new Set(["/:code", "/healthz", "/readyz", "/metrics", "unknown"]);

async function readMetrics(service: (typeof SERVICES)[number]): Promise<string> {
  const res = await fetch(`${BASE_URL}/internal/${service}/metrics`);
  assert.equal(res.status, 200, `${service} lẽ ra phải trả về metrics`);
  return res.text();
}

/** Giá trị của một chuỗi thời gian không nhãn, 0 nếu nó chưa xuất hiện. */
function value(metrics: string, name: string): number {
  const line = metrics.split("\n").find((l) => l.startsWith(`${name} `));
  return line ? Number(line.slice(name.length + 1)) : 0;
}

/** Mọi giá trị nhãn `endpoint` xuất hiện trong số đếm request. */
function endpointLabels(metrics: string): Set<string> {
  const labels = metrics
    .split("\n")
    .filter((line) => line.startsWith("http_requests_total{"))
    .map((line) => /endpoint="([^"]*)"/.exec(line)?.[1] ?? "");
  return new Set(labels);
}

async function visit(code: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${code}`, { redirect: "manual" });
  assert.equal(res.status, 302);
}

describe("endpoint metrics qua nginx", () => {
  before(waitForStack, { timeout: READY_TIMEOUT_MS + 5_000 });

  it("cả ba service phơi metrics theo định dạng công cụ chuẩn đọc được", async () => {
    for (const service of SERVICES) {
      const res = await fetch(`${BASE_URL}/internal/${service}/metrics`);
      assert.equal(res.status, 200, `${service} lẽ ra phải trả về metrics`);

      // Prometheus nhận diện phiên bản định dạng qua đúng header này.
      const contentType = res.headers.get("content-type") ?? "";
      assert.match(contentType, /text\/plain/, `${service} trả sai content-type: ${contentType}`);
      assert.match(contentType, /version=0\.0\.4/, `${service} trả sai content-type`);

      const body = await res.text();
      assert.match(body, /^# HELP /m, `${service} thiếu dòng HELP`);
      assert.match(body, /^# TYPE /m, `${service} thiếu dòng TYPE`);
    }
  });

  it("có số đếm request phân theo endpoint và mã trạng thái", async () => {
    for (const service of SERVICES) {
      // Chính request thăm dò này là thứ được đếm ở lần đọc metrics ngay sau đó.
      await fetch(`${BASE_URL}/internal/${service}/healthz`);
      const metrics = await readMetrics(service);

      const line = metrics
        .split("\n")
        .find((l) => l.startsWith("http_requests_total{") && l.includes('endpoint="/healthz"'));
      assert.ok(line, `${service} không đếm request tới /healthz`);
      assert.match(line, /method="GET"/, `${service} thiếu nhãn method`);
      assert.match(line, /status="200"/, `${service} thiếu nhãn status`);
      assert.ok(Number(line.split(" ").at(-1)) > 0, `${service} đếm được 0 request`);
    }
  });

  it("có phân bố độ trễ với đủ bucket, tổng và số mẫu", async () => {
    for (const service of SERVICES) {
      const metrics = await readMetrics(service);

      assert.match(
        metrics,
        /^http_request_duration_seconds_bucket\{.*le="\+Inf".*\} [0-9]/m,
        `${service} thiếu bucket +Inf của histogram độ trễ`,
      );
      assert.match(metrics, /^http_request_duration_seconds_sum\{/m, `${service} thiếu _sum`);
      assert.match(metrics, /^http_request_duration_seconds_count\{/m, `${service} thiếu _count`);
    }
  });

  it("tạo link và chuyển hướng làm hai số đếm nghiệp vụ tăng lên", async () => {
    const linksBefore = value(await readMetrics("link"), "links_created_total");
    const redirectsBefore = value(await readMetrics("redirect"), "redirects_total");

    const res = await createLink({ url: "https://example.com/dich-den" });
    assert.equal(res.status, 201);
    const { code } = (await res.json()) as { code: string };
    await visit(code);

    assert.ok(
      value(await readMetrics("link"), "links_created_total") > linksBefore,
      "links_created_total không tăng sau khi tạo link",
    );
    assert.ok(
      value(await readMetrics("redirect"), "redirects_total") > redirectsBefore,
      "redirects_total không tăng sau khi chuyển hướng",
    );
  });

  it("mã ngắn không sinh nhãn endpoint mới", async () => {
    const { code } = (await (
      await createLink({ url: "https://example.com/dich-den" })
    ).json()) as { code: string };
    await visit(code);

    const labels = endpointLabels(await readMetrics("redirect"));
    // Nếu nhãn lấy theo đường dẫn thô thì mỗi mã ngắn thành một chuỗi thời gian
    // riêng và Prometheus phình không giới hạn. Đây là phép kiểm giữ chỗ đó.
    for (const label of labels) {
      assert.ok(REDIRECT_ENDPOINTS.has(label), `nhãn endpoint ngoài danh sách: ${label}`);
    }
    assert.ok(labels.has("/:code"), "không thấy nhãn gộp của route chuyển hướng");
  });

  it("worker stats đếm chu kỳ tổng hợp và số lượt đã cộng dồn", async () => {
    const before = await readMetrics("stats");
    const cyclesBefore = Number(
      /^stats_aggregation_cycles_total\{result="success"\} ([0-9.e+]+)$/m.exec(before)?.[1] ?? 0,
    );
    const visitsBefore = value(before, "stats_visits_aggregated_total");

    const { code } = (await (
      await createLink({ url: "https://example.com/dich-den" })
    ).json()) as { code: string };
    await visit(code);

    const deadline = Date.now() + AGGREGATE_TIMEOUT_MS;
    for (;;) {
      const metrics = await readMetrics("stats");
      const cycles = Number(
        /^stats_aggregation_cycles_total\{result="success"\} ([0-9.e+]+)$/m.exec(metrics)?.[1] ?? 0,
      );
      const visits = value(metrics, "stats_visits_aggregated_total");
      if (cycles > cyclesBefore && visits > visitsBefore) return;
      if (Date.now() > deadline) {
        throw new Error(
          `worker stats mới đạt ${cycles} chu kỳ và ${visits} lượt sau ${AGGREGATE_TIMEOUT_MS}ms`,
        );
      }
      await sleep(200);
    }
  });

  it("mỗi service chỉ phơi số đếm nghiệp vụ của chính nó", async () => {
    // Ba service dùng chung một image. Nếu counter nghiệp vụ được khai báo ở phần
    // dùng chung thì cả ba đều phơi cả ba số, và Prometheus gộp cùng một tên chỉ
    // số từ ba job sẽ đếm đôi.
    const owners = {
      link: "links_created_total",
      redirect: "redirects_total",
      stats: "stats_visits_aggregated_total",
    } as const;

    for (const service of SERVICES) {
      const metrics = await readMetrics(service);
      for (const [owner, name] of Object.entries(owners)) {
        assert.equal(
          metrics.includes(name),
          owner === service,
          `${service} lẽ ra ${owner === service ? "phải" : "không được"} phơi ${name}`,
        );
      }
    }
  });
});
