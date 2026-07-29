import { randomBytes } from "node:crypto";
import express from "express";
import { Counter } from "prom-client";
import { mountMetrics, registry } from "../../shared/src/metrics.ts";
import { mountProbes, pool } from "../../shared/src/service.ts";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CODE_LENGTH = 7;
const MAX_ATTEMPTS = 5;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Sinh mã ngắn ngẫu nhiên.
 * ponytail: phép chia dư làm 8 ký tự đầu bảng nhỉnh hơn một chút; không phải
 * thuộc tính bảo mật nên chấp nhận, đổi sang lấy mẫu từ chối nếu cần phân bố đều.
 */
function generateCode(): string {
  return Array.from(randomBytes(CODE_LENGTH), (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

// Khai báo ở đây chứ không ở phần dùng chung: ba service dùng chung một image,
// nên counter khai báo chung sẽ khiến service này phơi cả số của service kia ở
// giá trị 0, và Prometheus gộp cùng một tên chỉ số từ hai job thì đếm đôi.
const linksCreated = new Counter({
  name: "links_created_total",
  help: "Số link ngắn đã tạo thành công",
  registers: [registry],
});

const app = express();
app.use(express.json());
mountMetrics(app);
mountProbes(app);

// Số phiên bản nằm sẵn trong đường dẫn ngay từ v1, để #18 thêm được v2 chạy song
// song mà không phải đổi đường dẫn cũ. Xem docs/adr/0002-he-thong-demo-va-stack.md.
app.post("/api/v1/links", async (req, res) => {
  const url: unknown = req.body?.url;
  if (typeof url !== "string") {
    res.status(400).json({ error: "Trường url phải là một chuỗi" });
    return;
  }

  const parsed = URL.parse(url);
  if (!parsed) {
    res.status(400).json({ error: "Trường url không phải một địa chỉ hợp lệ" });
    return;
  }

  // Mã ngắn chỉ dùng để chuyển hướng web, nên giao thức nào cũng nhận thì service
  // redirect trở thành chỗ phát tán javascript: và data: dưới một địa chỉ trông sạch.
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    res.status(400).json({
      error: `Trường url chỉ chấp nhận giao thức http và https, không phải ${parsed.protocol.slice(0, -1)}`,
    });
    return;
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateCode();
    const { rowCount } = await pool.query(
      "insert into links (code, url) values ($1, $2) on conflict (code) do nothing",
      [code, url],
    );
    if (rowCount) {
      linksCreated.inc();
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
