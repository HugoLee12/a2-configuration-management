create table if not exists links (
  code       text primary key,
  url        text not null,
  created_at timestamptz not null default now()
);
