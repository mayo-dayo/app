import type {
  database_user,
} from "./user";

import path from "node:path";

export type database_audio =
  //
  {
    id:
      //
      string;

    uploader_id:
      //
      database_user["id"] | null;

    time_uploaded:
      //
      number;

    file_name:
      //
      string;

    processing:
      //
      0 | 1;

    /*
     * 0 - extract metadata
     * 1 - error
     * 2 - extract thumbnail
     * 3 - transcode
     */
    processing_state:
      //
      0 | 1 | 2 | 3;

    has_thumbnail:
      //
      0 | 1;

    duration:
      //
      number | null;

    size:
      //
      number | null;

    tags:
      //
      string | null;
  };

export const database_audio_thumbnail_sizes =
  //
  [
    "512",

    "448",

    "384",

    "320",

    "256",

    "192",

    "128",

    "64",
  ] as const;

export const database_audio_get_audio_path =
  //
  (
    //
    {
      id,
    }:
      //
      Pick<
        //
        database_audio,
        //
        "id"
      >,
  ): string => `/endpoints/audio?id=${id}`;

export const database_audio_get_thumbnail_path =
  //
  (
    //
    {
      id,
    }:
      //
      Pick<
        //
        database_audio,
        //
        "id"
      >,
    //
    size:
      //
      typeof database_audio_thumbnail_sizes[number],
  ): string => `/endpoints/thumbnail?id=${id}&size=${size}`;

export const database_audio_get_filesystem_directory_path =
  //
  (
    {
      id,
    }:
      //
      Pick<
        //
        database_audio,
        //
        "id"
      >,
  ): string =>
    path.join(
      //
      process.env.MAYO_DATA_PATH,
      //
      id,
    );
