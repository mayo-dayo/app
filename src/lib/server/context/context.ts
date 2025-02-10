import type {
  Database,
} from "bun:sqlite";

import type {
  audio_processor,
} from "@/lib/server/audio_processor";

export type context =
  //
  {
    audio_processor:
      //
      audio_processor;

    database:
      //
      Database;

    secret:
      //
      string;
  };
