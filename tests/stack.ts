// Phần dùng chung của các file kiểm thử: địa chỉ stack và cổng gác sẵn sàng.
// Không có gì ở đây được phép biết về mã service hay về cơ sở dữ liệu.
import { setTimeout as sleep } from "node:timers/promises";

export const BASE_URL = process.env.BASE_URL ?? "http://localhost:8081";
export const READY_TIMEOUT_MS = 60_000;

// Nói ra địa chỉ đang bị bắn vào, trước khi test đầu tiên chạy.
// Bước 4 và bước 6 của `docs/trien-khai-thu-cong.md` là cùng một lệnh `npm test`
// và chỉ khác nhau ở biến BASE_URL, nên nếu không in ra thì hai lần chạy để lại
// đầu ra giống hệt nhau và không còn cách nào biết lần nào bắn vào đâu.
// Đặt ở đây, lúc nạp module, để dòng này có mặt cả khi bộ kiểm thử đỏ.
console.log(`[kiểm thử] địa chỉ đang kiểm thử: ${BASE_URL}`);

export function createLink(body: unknown): Promise<Response> {
  return fetch(`${BASE_URL}/api/v1/links`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Chờ tới khi service link thật sự trả lời qua nginx.
 * Phải bắt đúng mã 400 chứ không phải "có trả lời là được": nginx hỏng upstream
 * thì trả 502, còn cửa /api/ bị đấu nhầm sang service redirect thì trả 404, nên
 * chỉ 400 mới chứng minh request đã đi tới đúng service.
 */
export async function waitForStack(): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  for (;;) {
    try {
      if ((await createLink({})).status === 400) return;
    } catch {
      // stack chưa nhận kết nối
    }
    if (Date.now() > deadline) {
      throw new Error(`Stack tại ${BASE_URL} không sẵn sàng sau ${READY_TIMEOUT_MS}ms`);
    }
    await sleep(1000);
  }
}
