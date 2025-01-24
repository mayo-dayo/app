import type {
  database_audio,
} from "./database_audio";

export type read_audio =
  //
  Pick<
    //
    database_audio,
    //
    | "id"
    //
    | "file_name"
    //
    | "time_uploaded"
    //
    | "processing"
    //
    | "processing_state"
    //
    | "has_thumbnail"
    //
    | "duration"
    //
    | "size"
    //
    | "tags"
  >;

export const read_audio_page_size =
  //
  32;
