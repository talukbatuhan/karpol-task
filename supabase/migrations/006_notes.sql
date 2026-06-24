-- Notlar modülü

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  color text not null default 'white'
    check (color in ('white', 'slate', 'navy', 'amber', 'rose', 'mint', 'sky', 'orange')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notes_created_at on notes(created_at desc);
create index if not exists idx_notes_title on notes(title);
