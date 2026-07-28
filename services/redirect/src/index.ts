import express from "express";
import { Pool } from "pg";

// Pool đọc PGHOST/PGUSER/PGPASSWORD/PGDATABASE thẳng từ biến môi trường.
const pool = new Pool();

const app = express();

app.get("/:code", async (req, res) => {
  const { rows } = await pool.query<{ url: string }>("select url from links where code = $1", [
    req.params.code,
  ]);
  const link = rows[0];
  if (!link) {
    res.status(404).json({ error: "Mã ngắn không tồn tại" });
    return;
  }
  // 302 chứ không 301: trình duyệt cache 301 vĩnh viễn nên lượt truy cập sau sẽ
  // không đi qua service này nữa, làm hỏng việc đếm lượt ở #5.
  res.redirect(302, link.url);
});

app.listen(3000);
