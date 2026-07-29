import express from "express";
import { Counter } from "prom-client";
import { mountMetrics, registry } from "../../shared/src/metrics.ts";
import { mountProbes, pool } from "../../shared/src/service.ts";

// Xem chú thích cùng chỗ trong services/link về lý do không khai báo ở phần dùng chung.
const redirectsServed = new Counter({
  name: "redirects_total",
  help: "Số lượt chuyển hướng đã phục vụ",
  registers: [registry],
});

const app = express();

// Cả hai đều phải trước `/:code`, nếu không thì các đường dẫn nội bộ rơi vào
// route bắt tất cả.
mountMetrics(app);
mountProbes(app);

app.get("/:code", async (req, res) => {
  const { rows } = await pool.query<{ url: string }>("select url from links where code = $1", [
    req.params.code,
  ]);
  const link = rows[0];
  if (!link) {
    res.status(404).json({ error: "Mã ngắn không tồn tại" });
    return;
  }

  try {
    await pool.query("insert into visits (code) values ($1)", [req.params.code]);
  } catch (error) {
    // Thống kê là nhánh phụ, hỏng thì không được kéo theo chuyển hướng. Đổi lại
    // là mất sự kiện lần này, chấp nhận được vì số lượt không phải dữ liệu tính tiền.
    console.error(error);
  }

  redirectsServed.inc();

  // 302 chứ không 301: trình duyệt cache 301 vĩnh viễn nên lượt truy cập sau sẽ
  // không đi qua service này nữa, làm hỏng việc đếm lượt.
  res.redirect(302, link.url);
});

app.listen(3000);
