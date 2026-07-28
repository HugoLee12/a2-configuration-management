// Kiểm thử hộp đen: mọi request đi qua nginx đúng như người dùng thật.
// Không import mã service, không nói chuyện thẳng với cơ sở dữ liệu.
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { createLink, READY_TIMEOUT_MS, waitForStack } from "./stack.ts";

/** Chuỗi không phân tích được thành một địa chỉ, dù đọc kiểu gì. */
const SAI_DINH_DANG = ["khong-phai-dia-chi", "http://", "://example.com", "   "];

/** Đúng cú pháp địa chỉ, nhưng chuyển hướng tới thì không còn là chuyển hướng web. */
const GIAO_THUC_BI_TU_CHOI = [
  "javascript:alert(1)",
  "data:text/html,xin-chao",
  "file:///etc/passwd",
  "ftp://example.com/tep",
];

describe("xác thực địa chỉ đầu vào qua nginx", () => {
  before(waitForStack, { timeout: READY_TIMEOUT_MS + 5_000 });

  it("địa chỉ sai định dạng bị từ chối kèm lý do", async () => {
    for (const url of SAI_DINH_DANG) {
      const res = await createLink({ url });
      assert.equal(res.status, 400, `${JSON.stringify(url)} lẽ ra phải bị từ chối`);

      const body = (await res.json()) as { error: string };
      assert.match(body.error, /url/);
    }
  });

  it("chỉ chấp nhận giao thức http và https", async () => {
    for (const url of GIAO_THUC_BI_TU_CHOI) {
      const res = await createLink({ url });
      assert.equal(res.status, 400, `${JSON.stringify(url)} lẽ ra phải bị từ chối`);

      // Lý do phải nói ra giao thức nào mới được nhận, không chỉ nói là sai.
      const body = (await res.json()) as { error: string };
      assert.match(body.error, /https/);
    }
  });

  it("địa chỉ http và https hợp lệ vẫn tạo được link", async () => {
    for (const url of ["http://example.com/khong-tls", "https://example.com/co-tls?a=1#b"]) {
      const res = await createLink({ url });
      assert.equal(res.status, 201, `${url} lẽ ra phải tạo được link`);

      const body = (await res.json()) as { code: string };
      assert.match(body.code, /^[0-9a-zA-Z]{7}$/);
    }
  });
});
