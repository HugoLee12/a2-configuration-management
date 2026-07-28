// Kiểm thử hộp đen: mọi request đi qua nginx đúng như người dùng thật.
// Không import mã service, không nói chuyện thẳng với cơ sở dữ liệu.
//
// Tiêu chí "dừng worker thì chuyển hướng vẫn hoạt động" của #5 cố ý không có
// test ở đây: worker không nằm sau nginx nên không với tới được từ seam này, và
// #13 sẽ dùng lại chính bộ test này làm smoke test cho blue-green, nơi một test
// tự dừng container là thứ không được phép tồn tại.
// Tiêu chí đó kiểm bằng tay, log ghi ở docs/nhat-ky-du-an.md.
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { setTimeout as sleep } from "node:timers/promises";
import { BASE_URL, createLink, READY_TIMEOUT_MS, waitForStack } from "./stack.ts";

// Worker tổng hợp theo chu kỳ nên số lượt tới muộn hơn lượt truy cập vài giây.
const AGGREGATE_TIMEOUT_MS = 15_000;

async function newCode(): Promise<string> {
  const res = await createLink({ url: "https://example.com/dich-den" });
  assert.equal(res.status, 201);
  return ((await res.json()) as { code: string }).code;
}

async function visit(code: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${code}`, { redirect: "manual" });
  assert.equal(res.status, 302);
}

function readStats(code: string): Promise<Response> {
  return fetch(`${BASE_URL}/api/v1/links/${code}/stats`);
}

async function readVisits(code: string): Promise<number> {
  const res = await readStats(code);
  assert.equal(res.status, 200);
  return ((await res.json()) as { visits: number }).visits;
}

/** Chờ số lượt của một mã lên tới ít nhất `expected`, rồi trả về giá trị đọc được. */
async function waitForVisits(code: string, expected: number): Promise<number> {
  const deadline = Date.now() + AGGREGATE_TIMEOUT_MS;
  for (;;) {
    const visits = await readVisits(code);
    if (visits >= expected) return visits;
    if (Date.now() > deadline) {
      throw new Error(`Mã ${code} mới đạt ${visits} lượt sau ${AGGREGATE_TIMEOUT_MS}ms`);
    }
    await sleep(200);
  }
}

describe("thống kê lượt truy cập qua nginx", () => {
  before(waitForStack, { timeout: READY_TIMEOUT_MS + 5_000 });

  it("mã vừa tạo thì chưa có lượt truy cập nào", async () => {
    const code = await newCode();

    const res = await readStats(code);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { code, visits: 0 });
  });

  it("mỗi lượt truy cập mã ngắn được cộng vào số lượt của chính mã đó", async () => {
    const code = await newCode();
    const otherCode = await newCode();

    await visit(code);
    await visit(code);
    await visit(code);

    assert.equal(await waitForVisits(code, 3), 3);
    // Mã khác không ăn ké lượt của mã trên, kể cả sau khi worker đã chạy.
    assert.equal(await readVisits(otherCode), 0);
  });

  it("xem thống kê của mã không tồn tại thì báo lỗi rõ ràng", async () => {
    const res = await readStats("khongCo");
    assert.equal(res.status, 404);

    const body = (await res.json()) as { error: string };
    assert.equal(body.error, "Mã ngắn không tồn tại");
  });
});
