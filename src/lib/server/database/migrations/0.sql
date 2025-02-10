create table users(
  id              text      not null  primary key,

  name            text      not null  unique,

  password_hash   text      not null,

  perms           integer   not null
) without rowid;

create table invites(
  id              text      not null  primary key,

  perms           integer   not null,

  uses            integer,

  check(
    uses is null or uses > 0
  )
) without rowid;

create table audio(
  id                text      not null  primary key,

  time_uploaded     integer   not null,
  
  file_name         text      not null,

  processing        integer   not null  default 1,

  processing_state  integer   not null  default 0,

  has_thumbnail     integer   not null  default 0,

  duration          integer,

  size              integer,

  tags              text,

  check (
    processing = 0 or processing = 1 and (
      processing_state = 0 or

      processing_state = 1 or

      processing_state = 2 or

      processing_state = 3
    )
  ),

  check (
    has_thumbnail = 0 or has_thumbnail = 1
  )
) without rowid;

create index idx_audio_time_uploaded            on audio (time_uploaded);

create index idx_audio_processing_time_uploaded on audio (processing, time_uploaded); 
