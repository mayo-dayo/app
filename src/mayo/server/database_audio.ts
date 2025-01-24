import {
  type database_audio,
  database_audio_thumbnail_sizes,
} from "@/mayo/common/database_audio";

import path from "node:path";

export const database_audio_get_directory_path =
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
    path
      //
      .join(
        //
        process.env.MAYO_DATA_PATH,
        //
        id,
      );

export const database_audio_get_original_file_path =
  //
  (
    {
      id,

      file_name,
    }:
      //
      Pick<
        //
        database_audio,
        //
        | "id"
        //
        | "file_name"
      >,
  ): string =>
    path
      //
      .join(
        //
        database_audio_get_directory_path({
          id,
        }),
        //
        file_name,
      );

export const database_audio_get_streamable_file_path =
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
    path
      //
      .join(
        //
        database_audio_get_directory_path({
          id,
        }),
        //
        "audio.mp4",
      );

export const database_audio_get_thumbnail_file_path =
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
    //
    size:
      //
      typeof database_audio_thumbnail_sizes[number],
  ): string =>
    path
      //
      .join(
        //
        database_audio_get_directory_path({
          id,
        }),
        //
        `thumbnail-${size}.webp`,
      );
