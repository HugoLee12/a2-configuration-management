import express from "express";
import { mountProbes, pool } from "../../shared/src/service.ts";

const app = express();

// Trước `/:code`, nếu không thì hai đường dẫn thăm dò rơi vào route bắt tất cả.
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

  // 302 chứ không 301: trình duyệt cache 301 vĩnh viễn nên lượt truy cập sau sẽ
  // không đi qua service này nữa, làm hỏng việc đếm lượt.
  res.redirect(302, link.url);
});

app.listen(3000);
