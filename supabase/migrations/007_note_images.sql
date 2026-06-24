-- Not görselleri

create table if not exists note_attachments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references notes(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  mime_type text not null,
  file_size bigint not null check (file_size > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_note_attachments_note
  on note_attachments(note_id);

insert into storage.buckets (id, name, public)
values ('note-images', 'note-images', true)
on conflict (id) do nothing;

drop policy if exists "note_images_public_read" on storage.objects;
create policy "note_images_public_read"
on storage.objects for select
using (bucket_id = 'note-images');

drop policy if exists "note_images_service_insert" on storage.objects;
create policy "note_images_service_insert"
on storage.objects for insert
with check (bucket_id = 'note-images');

drop policy if exists "note_images_service_delete" on storage.objects;
create policy "note_images_service_delete"
on storage.objects for delete
using (bucket_id = 'note-images');
