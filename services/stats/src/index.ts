import { setTimeout as sleep } from "node:timers/promises";
import { Pool } from "pg";

const INTERVAL_MS = 1000;

// Pool đọc PGHOST/PGUSER/PGPASSWORD/PGDATABASE thẳng từ biến môi trường.
const pool = new Pool();

// Rút toàn bộ hàng đợi rồi cộng dồn, gói trong đúng một câu lệnh nên hai việc
// đó cùng thành công hoặc cùng huỷ: không có kẽ nào làm mất hay đếm đôi sự kiện.
const AGGREGATE = `
  with drained as (
    delete from visits returning code
  )
  insert into link_stats (code, visit_count)
  select code, count(*) from drained group by code
  on conflict (code) do update set visit_count = link_stats.visit_count + excluded.visit_count
`;

// Chờ xong chu kỳ này rồi mới hẹn chu kỳ sau, thay vì setInterval, để một lần
// tổng hợp chậm không chồng lên lần kế tiếp.
async function run(): Promise<void> {
  for (;;) {
    try {
      await pool.query(AGGREGATE);
    } catch (error) {
      // Hỏng một chu kỳ không được làm chết worker: sự kiện vẫn nằm nguyên
      // trong bảng visits nên chu kỳ sau tổng hợp lại được.
      console.error(error);
    }
    await sleep(INTERVAL_MS);
  }
}

void run();
