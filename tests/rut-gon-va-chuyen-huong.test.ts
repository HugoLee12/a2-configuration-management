// Kiểm thử hộp đen: mọi request đi qua nginx đúng như người dùng thật.
// Không import mã service, không nói chuyện thẳng với cơ sở dữ liệu.
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { BASE_URL, createLink, READY_TIMEOUT_MS, waitForStack } from "./stack.ts";

describe("rút gọn link và chuyển hướng qua nginx", () => {
  before(waitForStack, { timeout: READY_TIMEOUT_MS + 5_000 });

  it("tạo link mới thì nhận về mã ngắn", async () => {
    const res = await createLink({ url: "https://example.com/mot-duong-dan-rat-dai" });
    assert.equal(res.status, 201);

    const body = (await res.json()) as { code: string; shortUrl: string };
    assert.match(body.code, /^[0-9a-zA-Z]{7}$/);
    assert.equal(body.shortUrl, `${BASE_URL}/${body.code}`);
  });

  it("truy cập mã ngắn thì được chuyển hướng tới địa chỉ gốc", async () => {
    const url = "https://example.com/dich-den";
    const { code } = (await (await createLink({ url })).json()) as { code: string };

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
    const res = await createLink({});
    assert.equal(res.status, 400);

    const body = (await res.json()) as { error: string };
    assert.match(body.error, /url/);
  });
});
