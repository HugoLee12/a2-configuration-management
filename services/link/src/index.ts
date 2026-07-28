import { randomBytes } from "node:crypto";
import express from "express";
import { Pool } from "pg";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CODE_LENGTH = 7;
const MAX_ATTEMPTS = 5;

// Pool đọc PGHOST/PGUSER/PGPASSWORD/PGDATABASE thẳng từ biến môi trường.
const pool = new Pool();

/**
 * Sinh mã ngắn ngẫu nhiên.
 * ponytail: phép chia dư làm 8 ký tự đầu bảng nhỉnh hơn một chút; không phải
 * thuộc tính bảo mật nên chấp nhận, đổi sang lấy mẫu từ chối nếu cần phân bố đều.
 */
function generateCode(): string {
  return Array.from(randomBytes(CODE_LENGTH), (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

const app = express();
app.use(express.json());

// Số phiên bản nằm sẵn trong đường dẫn ngay từ v1, để #18 thêm được v2 chạy song
// song mà không phải đổi đường dẫn cũ. Xem docs/adr/0002-he-thong-demo-va-stack.md.
app.post("/api/v1/links", async (req, res) => {
  const url: unknown = req.body?.url;
  // Kiểm tra tối thiểu để không ghi rác vào cơ sở dữ liệu; validate địa chỉ đầy đủ thuộc về #6.
  if (typeof url !== "string" || url.trim() === "") {
    res.status(400).json({ error: "Trường url phải là một chuỗi không rỗng" });
    return;
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateCode();
    const { rowCount } = await pool.query(
      "insert into links (code, url) values ($1, $2) on conflict (code) do nothing",
      [code, url],
    );
    if (rowCount) {
      res.status(201).json({ code, shortUrl: `${process.env.PUBLIC_BASE_URL}/${code}` });
      return;
    }
  }

  res.status(503).json({ error: "Không sinh được mã ngắn chưa dùng, thử lại" });
});

app.get("/api/v1/links/:code/stats", async (req, res) => {
  // Đi từ bảng links để phân biệt được mã không tồn tại với mã tồn tại mà chưa
  // có lượt nào: mã chưa có lượt thì worker thống kê chưa tạo dòng nào cho nó.
  const { rows } = await pool.query<{ visit_count: string }>(
    `select coalesce(link_stats.visit_count, 0) as visit_count
       from links left join link_stats on link_stats.code = links.code
      where links.code = $1`,
    [req.params.code],
  );
  const stats = rows[0];
  if (!stats) {
    res.status(404).json({ error: "Mã ngắn không tồn tại" });
    return;
  }

  // pg trả bigint về dạng chuỗi để không mất chính xác ở số lớn hơn 2^53.
  res.json({ code: req.params.code, visits: Number(stats.visit_count) });
});

app.listen(3000);
