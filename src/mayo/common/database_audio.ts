import type {
  database_user,
} from "./database_user";

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

export const database_audio_page_size =
  //
  32;

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

export const database_audio_get_stream_endpoint_path =
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
  ): string => `/endpoints/audio_stream?id=${id}`;

export const database_audio_get_thumbnail_endpoint_path =
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
  ): string => `/endpoints/audio_thumbnail?id=${id}&size=${size}`;
