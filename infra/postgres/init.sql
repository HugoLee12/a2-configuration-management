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
-- Cố ý không có khoá ngoại tới links, dù nhìn qua thì đặt vào là hợp lý: worker
-- rút hàng đợi và cộng dồn trong đúng một câu lệnh, nên một dòng visits trỏ tới
-- mã vừa bị xoá sẽ làm cả chu kỳ bị huỷ rồi lặp lại y hệt mãi mãi, đóng băng số
-- lượt của mọi mã chứ không riêng mã hỏng. #19 dọn link hết hạn thì dọn luôn
-- dòng thống kê tương ứng.
create table if not exists link_stats (
  code        text primary key,
  visit_count bigint not null default 0
);
