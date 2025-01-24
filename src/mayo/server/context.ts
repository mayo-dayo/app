import {
  type Database,
} from "bun:sqlite";

import path from "node:path";

import {
  database_connect_and_migrate,
} from "@/mayo/server/database_connect_and_migrate";

import {
  type audio_processor,
  audio_processor_create,
  audio_processor_run,
} from "@/mayo/server/audio_processor";

export type context =
  //
  {
    database:
      //
      Database;

    audio_processor:
      //
      audio_processor;

    secret:
      //
      string;
  };

let context:
  //
  context | undefined;

export const context_get_or_init =
  //
  (): context => {
    if (context === undefined) {
      const database =
        //
        database_connect_and_migrate(
          //
          path.join(
            //
            process.env.MAYO_DATA_PATH,
            //
            "db.sqlite",
          ),
        );

      const audio_processor =
        //
        audio_processor_create(
          database,
        );

      audio_processor_run(
        audio_processor,
      );

      context =
        //
        {
          database,

          audio_processor,

          secret: crypto.randomUUID(),
        };
    }

    return context;
  };
