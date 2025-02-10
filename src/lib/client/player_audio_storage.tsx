import {
  audio_page_size,
} from "@/lib/server/types/audio";

import {
  downloader_remove,
} from "./downloader_rpc";

import {
  opfs_audio_get_stream_file_url,
} from "./opfs";

import type {
  player_audio,
} from "./player_audio";

import {
  search_remove,
  search_search,
} from "./search_rpc";

import type {
  storage_audio,
} from "./storage";

import {
  storage_audio_get_by_id,
  storage_audio_get_by_id_array,
  storage_audio_get_paginated,
  storage_connect,
} from "./storage";

const into_player_audio =
  //
  (
    //
    storage_audio:
      //
      storage_audio,
  ): player_audio => {
    const audio =
      //
      storage_audio.audio;

    const can_play =
      //
      storage_audio.is_downloaded === 1;

    const can_download =
      //
      false;

    const can_remove =
      //
      true;

    const should_poll =
      //
      storage_audio.is_downloaded === 0;

    const download =
      //
      () => {};

    const remove =
      //
      () => remove_impl(storage_audio);

    const refetch =
      //
      () => refetch_impl(storage_audio);

    const create_stream_url =
      //
      () => opfs_audio_get_stream_file_url(storage_audio.audio.id);

    return {
      audio,

      can_play,

      can_download,

      can_remove,

      should_poll,

      download,

      remove,

      refetch,

      create_stream_url,
    };
  };

const remove_impl =
  //
  (
    //
    storage_audio:
      //
      storage_audio,
  ) => {
    downloader_remove(storage_audio.audio.id);

    search_remove(storage_audio.audio.id);
  };

const refetch_impl =
  //
  (
    //
    storage_audio:
      //
      storage_audio,
  ) =>
    storage_connect()
      //
      .then(storage_connection =>
        storage_audio_get_by_id(
          //
          storage_connection,
          //
          storage_audio.audio.id,
        )
          //
          .then(storage_audio =>
            storage_audio === null
              //
              ? null
              //
              : into_player_audio(storage_audio)
          )
          //
          .finally(() => storage_connection.close())
      );

export const get_page =
  //
  (
    //
    number:
      //
      number,
    //
    query?:
      //
      string,
  ) => {
    const offset =
      //
      audio_page_size * number;

    const limit =
      //
      audio_page_size;

    const storage_connection_promise =
      //
      storage_connect();

    if (query && query.length > 2 && query.length < 70) {
      return (
        search_search(
          //
          query,
          //
          offset,
          //
          limit,
        )
          //
          .then(id_array =>
            storage_connection_promise
              //
              .then(storage_connection =>
                storage_audio_get_by_id_array(
                  //
                  storage_connection,
                  //
                  id_array,
                )
                  //
                  .then(result =>
                    //
                    (result as storage_audio[]).map(into_player_audio)
                  )
                  //
                  .finally(() => storage_connection.close())
              )
          )
      );
    }

    return (
      storage_connection_promise
        //
        .then(storage_connection =>
          storage_audio_get_paginated(
            //
            storage_connection,
            //
            offset,
            //
            limit,
          )
            //
            .then(result =>
              //
              result.map(into_player_audio)
            )
            //
            .finally(() => storage_connection.close())
        )
    );
  };
