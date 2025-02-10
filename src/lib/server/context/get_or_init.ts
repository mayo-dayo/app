import {
  audio_processor as AUDIO_PROCESSOR,
} from "@/lib/server/audio_processor";

import {
  database_connect,
} from "@/lib/server/database/connect";

import {
  database_migrate,
} from "@/lib/server/database/migrate";

import path from "node:path";

import type {
  context,
} from "./context";

let context: context | undefined;

export const context_get_or_init =
  //
  () => {
    if (context === undefined) {
      const database_path = path.join(process.env.MAYO_DATA_PATH, "db.sqlite");

      const database = database_connect(database_path);

      database_migrate(database);

      const audio_processor = new AUDIO_PROCESSOR(database);

      audio_processor.run();

      const secret = crypto.randomUUID();

      context = {
        audio_processor,

        database,

        secret,
      };
    }

    return context;
  };
