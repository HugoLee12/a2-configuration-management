// Phần dùng chung của cả ba service: kết nối cơ sở dữ liệu và hai endpoint thăm dò.
// Thư mục này cố ý không phải một workspace và được import theo đường dẫn tương đối,
// vì Node không bóc kiểu cho file TypeScript nằm dưới node_modules.
import type { Express } from "express";
import { Pool } from "pg";

const PROBE_TIMEOUT_MS = 2000;

// Pool đọc PGHOST/PGUSER/PGPASSWORD/PGDATABASE thẳng từ biến môi trường.
export const pool = new Pool();

// Thăm dò đi bằng pool riêng, một kết nối, có hạn giờ ở cả hai nhánh chờ của pg.
// Cần cả hai, vì chúng chặn hai chỗ khác nhau:
//
// - connectionTimeoutMillis chặn lúc pool phải mở kết nối mới. Không có nó thì khi
//   Postgres còn giữ cổng mà không trả lời, /readyz treo thay vì trả 503. Postgres
//   bị stop thì ECONNREFUSED về ngay và không cần tới nó, nên chỉ thử stop sẽ tưởng
//   là đã xong trong khi chưa.
// - query_timeout chặn lúc pool đã có sẵn kết nối rỗi: câu lệnh được gửi trên socket
//   cũ rồi chờ vô hạn một câu trả lời không bao giờ tới, và connectionTimeoutMillis
//   không đụng tới nhánh này. Đã đo được khi pause Postgres: service link treo quá
//   30 giây trong khi hai service kia trả 503 sau 2 giây, khác nhau đúng ở chỗ pool
//   của link còn kết nối rỗi.
//
// Hạn giờ không đặt thẳng lên `pool` vì nó sẽ chặt mọi câu lệnh nghiệp vụ ở 2 giây,
// mà chu kỳ tổng hợp của worker stats quét cả bảng visits và không có lý do gì phải
// xong trong 2 giây.
const probePool = new Pool({
  max: 1,
  connectionTimeoutMillis: PROBE_TIMEOUT_MS,
  query_timeout: PROBE_TIMEOUT_MS,
});

/**
 * Gắn hai endpoint thăm dò lên một app express.
 * Phải gọi trước khi đăng ký route bắt tất cả, nếu không /healthz của service
 * redirect sẽ rơi vào `/:code`.
 */
export function mountProbes(app: Express): void {
  // Còn sống: chỉ nói tiến trình đang chạy và nhận được request, cố ý không chạm
  // Postgres. Gộp hai câu hỏi vào một endpoint thì mất cơ sở dữ liệu sẽ thành tín
  // hiệu khởi động lại container, trong khi khởi động lại không cứu được gì.
  app.get("/healthz", (_req, res) => {
    res.json({ status: "sống" });
  });

  // Sẵn sàng: chỉ đúng khi còn nói chuyện được với Postgres, vì không có cơ sở dữ
  // liệu thì cả ba service đều không phục vụ nổi request nào. Đây là tín hiệu mà
  // #13 sẽ dựa vào để quyết định chuyển lưu lượng hay huỷ bản mới.
  app.get("/readyz", async (_req, res) => {
    try {
      await probePool.query("select 1");
      res.json({ status: "sẵn sàng" });
    } catch (error) {
      console.error(error);
      res.status(503).json({ status: "chưa sẵn sàng" });
    }
  });
}
