import { setTimeout as sleep } from "node:timers/promises";
import express from "express";
import { Counter } from "prom-client";
import { mountMetrics, registry } from "../../shared/src/metrics.ts";
import { mountProbes, pool } from "../../shared/src/service.ts";

const INTERVAL_MS = 1000;

// Rút toàn bộ hàng đợi rồi cộng dồn, gói trong đúng một câu lệnh nên hai việc
// đó cùng thành công hoặc cùng huỷ: không có kẽ nào làm mất hay đếm đôi sự kiện.
//
// Phần ghi nằm trong CTE `upserted` mà truy vấn ngoài không đọc tới. Đây không
// phải mã chết: PostgreSQL chạy mọi câu lệnh sửa dữ liệu trong WITH đúng một lần
// và luôn tới cùng, bất kể truy vấn ngoài có đọc kết quả của nó hay không, nên
// tính nguyên tử ở trên không đổi. Viết vòng thế này chỉ để truy vấn ngoài trả
// về được **số lượt** đã gộp; rowCount của câu lệnh cũ là số **mã**, không dùng
// làm số đếm nghiệp vụ được.
const AGGREGATE = `
  with drained as (
    delete from visits returning code
  ),
  grouped as (
    select code, count(*) as visits from drained group by code
  ),
  upserted as (
    insert into link_stats (code, visit_count)
    select code, visits from grouped
    on conflict (code) do update set visit_count = link_stats.visit_count + excluded.visit_count
    returning code
  )
  select coalesce(sum(visits), 0) as visits from grouped
`;

const cycles = new Counter({
  name: "stats_aggregation_cycles_total",
  help: "Số chu kỳ tổng hợp thống kê đã chạy, phân theo kết quả",
  labelNames: ["result"] as const,
  registers: [registry],
});

const visitsAggregated = new Counter({
  name: "stats_visits_aggregated_total",
  help: "Số lượt truy cập đã được cộng dồn vào bảng link_stats",
  registers: [registry],
});

// Chờ xong chu kỳ này rồi mới hẹn chu kỳ sau, thay vì setInterval, để một lần
// tổng hợp chậm không chồng lên lần kế tiếp.
async function run(): Promise<void> {
  for (;;) {
    try {
      const { rows } = await pool.query<{ visits: string }>(AGGREGATE);
      // pg trả numeric về dạng chuỗi để không mất chính xác ở số lớn.
      visitsAggregated.inc(Number(rows[0]?.visits ?? 0));
      cycles.inc({ result: "success" });
    } catch (error) {
      // Hỏng một chu kỳ không được làm chết worker: sự kiện vẫn nằm nguyên
      // trong bảng visits nên chu kỳ sau tổng hợp lại được.
      cycles.inc({ result: "failure" });
      console.error(error);
    }
    await sleep(INTERVAL_MS);
  }
}

void run();

// Worker vẫn nghe HTTP trên mạng nội bộ của Docker, chỉ để trả lời các đường dẫn
// nội bộ; nó không có mục `ports:` nên vẫn không ra tới ngoài. Không có máy chủ
// này thì không có cách nào hỏi `stats` xem nó còn sống, đã sẵn sàng, hay chu kỳ
// tổng hợp của nó có đang chạy hay không.
const app = express();
mountMetrics(app);
mountProbes(app);
app.listen(3000);
