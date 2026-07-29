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

export const SERVICES = ["link", "redirect", "stats"] as const;

/** Gọi một đường dẫn thăm dò của một service, vẫn qua nginx như mọi request khác. */
export function probe(service: string, name: "healthz" | "readyz"): Promise<Response> {
  return fetch(`${BASE_URL}/internal/${service}/${name}`);
}

/**
 * Chờ tới khi cả ba service báo sẵn sàng qua nginx.
 *
 * Phải là /readyz chứ không phải "có trả lời là được". Cổng gác cũ chờ service
 * link đáp 400 cho một request thiếu url, mà nhánh 400 đó không chạm cơ sở dữ
 * liệu, nên nó báo sẵn sàng trong lúc Postgres còn đang khởi động và test chạy
 * ngay sau đó đỏ với mã 500.
 *
 * Hỏi cả ba service chứ không chỉ link, vì ba service khởi động không đồng thời,
 * và #13 sẽ dùng lại đúng cổng gác này làm smoke test cho blue-green.
 */
export async function waitForStack(): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  for (;;) {
    try {
      const responses = await Promise.all(SERVICES.map((svc) => probe(svc, "readyz")));
      if (responses.every((res) => res.status === 200)) return;
    } catch {
      // stack chưa nhận kết nối
    }
    if (Date.now() > deadline) {
      throw new Error(`Stack tại ${BASE_URL} không sẵn sàng sau ${READY_TIMEOUT_MS}ms`);
    }
    await sleep(1000);
  }
}
