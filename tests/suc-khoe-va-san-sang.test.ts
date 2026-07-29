// Kiểm thử hộp đen: mọi request đi qua nginx đúng như người dùng thật.
// Không import mã service, không nói chuyện thẳng với cơ sở dữ liệu.
//
// Tiêu chí "ngắt cơ sở dữ liệu thì /readyz đổi trạng thái trong vài giây" cố ý
// không có test ở đây: seam này chỉ biết gửi HTTP nên nó không có cách nào dừng
// Postgres, và #13 sẽ dùng lại chính bộ test này làm smoke test cho blue-green,
// nơi một test tự dừng container là thứ không được phép tồn tại.
// Tiêu chí đó kiểm bằng tay lúc triển khai, log ghi ở docs/nhat-ky-thu-cong.md.
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { probe, READY_TIMEOUT_MS, SERVICES, waitForStack } from "./stack.ts";

describe("endpoint sức khoẻ và sẵn sàng qua nginx", () => {
  before(waitForStack, { timeout: READY_TIMEOUT_MS + 5_000 });

  it("cả ba service đều báo tiến trình còn sống", async () => {
    for (const service of SERVICES) {
      const res = await probe(service, "healthz");
      assert.equal(res.status, 200, `${service} lẽ ra phải báo còn sống`);
      assert.deepEqual(await res.json(), { status: "sống" });
    }
  });

  it("cả ba service đều báo sẵn sàng khi còn kết nối được cơ sở dữ liệu", async () => {
    for (const service of SERVICES) {
      const res = await probe(service, "readyz");
      assert.equal(res.status, 200, `${service} lẽ ra phải báo sẵn sàng`);
      assert.deepEqual(await res.json(), { status: "sẵn sàng" });
    }
  });
});
