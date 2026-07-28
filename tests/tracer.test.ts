// Kiểm thử hộp đen: mọi request đi qua nginx đúng như người dùng thật.
// Không import mã service, không nói chuyện thẳng với cơ sở dữ liệu.
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { setTimeout as sleep } from "node:timers/promises";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:8081";
const READY_TIMEOUT_MS = 60_000;

async function waitForStack(): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  for (;;) {
    try {
      const res = await fetch(`${BASE_URL}/khong-ton-tai`);
      if (res.status === 404) return;
    } catch {
      // stack chưa nhận kết nối
    }
    if (Date.now() > deadline) {
      throw new Error(`Stack tại ${BASE_URL} không sẵn sàng sau ${READY_TIMEOUT_MS}ms`);
    }
    await sleep(1000);
  }
}

async function createLink(url: string): Promise<Response> {
  return fetch(`${BASE_URL}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

describe("rút gọn link và chuyển hướng qua nginx", () => {
  before(waitForStack, { timeout: READY_TIMEOUT_MS + 5_000 });

  it("tạo link mới thì nhận về mã ngắn", async () => {
    const res = await createLink("https://example.com/mot-duong-dan-rat-dai");
    assert.equal(res.status, 201);

    const body = (await res.json()) as { code: string; shortUrl: string };
    assert.match(body.code, /^[0-9a-zA-Z]{7}$/);
    assert.equal(body.shortUrl, `${BASE_URL}/${body.code}`);
  });

  it("truy cập mã ngắn thì được chuyển hướng tới địa chỉ gốc", async () => {
    const url = "https://example.com/dich-den";
    const { code } = (await (await createLink(url)).json()) as { code: string };

    const res = await fetch(`${BASE_URL}/${code}`, { redirect: "manual" });
    assert.equal(res.status, 302);
    assert.equal(res.headers.get("location"), url);
  });

  it("truy cập mã không tồn tại thì báo lỗi rõ ràng", async () => {
    const res = await fetch(`${BASE_URL}/khongCo`, { redirect: "manual" });
    assert.equal(res.status, 404);

    const body = (await res.json()) as { error: string };
    assert.equal(body.error, "Mã ngắn không tồn tại");
  });

  it("tạo link thiếu url thì bị từ chối", async () => {
    const res = await fetch(`${BASE_URL}/api/links`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);

    const body = (await res.json()) as { error: string };
    assert.match(body.error, /url/);
  });
});
