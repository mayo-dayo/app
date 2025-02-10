create table users(
  id text not null primary key,
  name text not null unique,
  password_hash text not null,
  perms integer not null
) without rowid;

create table invites(
  id text not null primary key,
  perms integer not null,
  uses integer,
  check(
    uses is null
    or uses > 0
  )
) without rowid;

create table audio(
  id text not null primary key,
  time_uploaded integer not null,
  file_name text not null,
  processing integer not null default 1,
  processing_state integer not null default 0,
  has_thumbnail integer not null default 0,
  duration integer,
  size integer,
  album text,
  artist text,
  composer text,
  genre text,
  performer text,
  title text,
  check (
    processing = 0
    or processing = 1
    and (
      processing_state = 0
      or processing_state = 1
      or processing_state = 2
      or processing_state = 3
    )
  ),
  check (
    has_thumbnail = 0
    or has_thumbnail = 1
  )
) without rowid;

create index audio_time_uploaded on audio (time_uploaded);

create index audio_processing_time_uploaded on audio (processing, time_uploaded);

create virtual table audio_fts using fts5(
  id unindexed,
  album,
  artist,
  composer,
  genre,
  performer,
  title,
  content = '',
  contentless_delete = 1,
  contentless_unindexed = 1,
  tokenize = 'trigram'
);

create trigger audio_before_transcoding
after
update
  of processing_state on audio
  when new.processing_state = 3 begin
insert into
  audio_fts (
    id,
    album,
    artist,
    composer,
    genre,
    performer,
    title
  )
values
  (
    new.id,
    new.album,
    new.artist,
    new.composer,
    new.genre,
    new.performer,
    new.title
  );

end;

create trigger audio_after_delete
after
  delete on audio
  when old.processing_state = 3 begin
delete from
  audio_fts
where
  id = old.id;

end;
