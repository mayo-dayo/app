import path from "node:path";

export type audio =
  //
  {
    id:
      //
      string;

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

    album:
      //
      string | null;

    artist:
      //
      string | null;

    composer:
      //
      string | null;

    genre:
      //
      string | null;

    performer:
      //
      string | null;

    title:
      //
      string | null;
  };

export const audio_page_size =
  //
  32;

export const audio_thumbnail_sizes =
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

export const audio_is_playable =
  //
  (
    {
      processing,

      processing_state,
    }:
      //
      Pick<
        //
        audio,
        //
        "processing" | "processing_state"
      >,
  ): boolean =>
    processing === 0
    && processing_state !== 1;

export const audio_get_directory_path =
  //
  (
    {
      id,
    }:
      //
      Pick<
        //
        audio,
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

export const audio_get_file_path_original =
  //
  (
    {
      id,

      file_name,
    }:
      //
      Pick<
        //
        audio,
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
        audio_get_directory_path(
          {
            id,
          },
        ),
        //
        file_name,
      );

export const audio_get_file_path_stream =
  //
  (
    {
      id,
    }:
      //
      Pick<
        //
        audio,
        //
        "id"
      >,
  ): string =>
    path
      //
      .join(
        //
        audio_get_directory_path(
          {
            id,
          },
        ),
        //
        "audio.mp4",
      );

export const audio_get_file_path_thumbnail =
  //
  (
    {
      id,
    }:
      //
      Pick<
        //
        audio,
        //
        "id"
      >,
    //
    size:
      //
      typeof audio_thumbnail_sizes[number],
  ): string =>
    path
      //
      .join(
        //
        audio_get_directory_path(
          {
            id,
          },
        ),
        //
        `thumbnail-${size}.avif`,
      );
