import { setTimeout as sleep } from "node:timers/promises";
import express from "express";
import { mountProbes, pool } from "../../shared/src/service.ts";

const INTERVAL_MS = 1000;

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

// Worker vẫn nghe HTTP trên mạng nội bộ của Docker, chỉ để trả lời hai đường dẫn
// thăm dò; nó không có mục `ports:` nên vẫn không ra tới ngoài. Không có máy chủ
// này thì không có cách nào hỏi `stats` xem nó còn sống hay đã sẵn sàng.
const app = express();
mountProbes(app);
app.listen(3000);
