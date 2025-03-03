create table playlists(
  id text not null primary key,
  user_id text not null references users (id) on delete cascade on
  update
    restrict,
    name text not null,
    time_created integer not null
) without rowid;

create table playlist_items(
  playlist_id text not null references playlists (id) on delete cascade on
  update
    restrict,
    audio_id text not null references audio (id) on delete cascade on
  update
    restrict,
    primary key (playlist_id, audio_id)
) without rowid;
