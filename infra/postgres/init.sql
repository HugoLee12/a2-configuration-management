create table if not exists links (
  code       text primary key,
  url        text not null,
  created_at timestamptz not null default now()
);

-- Hàng đợi sự kiện truy cập. Service redirect ghi vào, worker thống kê rút ra
-- rồi xoá ngay trong cùng một câu lệnh, nên bảng này luôn gần rỗng và không cần
-- khoá chính lẫn chỉ mục.
create table if not exists visits (
  code text not null
);

-- Số lượt đã tổng hợp. Worker thống kê là nơi duy nhất ghi vào bảng này.
-- Xoá theo link vì một mã không còn tồn tại thì số lượt của nó cũng vô nghĩa.
create table if not exists link_stats (
  code        text primary key references links (code) on delete cascade,
  visit_count bigint not null default 0
);
