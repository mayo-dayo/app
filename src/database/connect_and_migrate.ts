import {
  Database,
} from "bun:sqlite";

export const database_connect_and_migrate =
  //
  (
    path:
      //
      string,
  ): Database => {
    const db =
      //
      new Database(
        //
        path,
        //
        {
          strict:
            //
            true,

          create:
            //
            true,
        },
      );

    db.exec(
      "pragma journal_mode = wal;",
    );

    db.exec(
      "pragma foreign_keys = on;",
    );

    const {
      user_version,
    } =
      //
      db
        //
        .query("pragma user_version;")
        //
        .get() as {
          user_version:
            //
            number;
        };

    switch (
      user_version
    ) {
      case 0:
        db.transaction(() => {
          db.exec(`
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

              uploader_id       text                references users (id) on delete set null on update restrict,

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

            pragma optimize;

            pragma user_version = 1;
         `);
        })();
    }

    return db;
  };
