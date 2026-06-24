-- Not kartı renk seçeneklerini genişlet

alter table notes drop constraint if exists notes_color_check;

alter table notes add constraint notes_color_check check (
  color in (
    'white',
    'slate',
    'navy',
    'amber',
    'rose',
    'mint',
    'sky',
    'orange'
  )
);
