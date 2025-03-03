import {
  perms_can_remove,
} from "@/lib/perms";

import type {
  audio,
} from "@/lib/server/types/audio";

import {
  audio_is_playable,
} from "@/lib/server/types/audio";

import type {
  user,
} from "@/lib/server/types/user";

import {
  actions,
} from "astro:actions";

import {
  downloader_run,
} from "./downloader_rpc";

import {
  opfs_audio_get_stream_file_url,
} from "./opfs";

import type {
  player_audio,
} from "./player_audio";

import {
  storage_audio_get_by_id_array,
  storage_audio_put,
  storage_connect,
} from "./storage";

import {
  use_user,
} from "./user";

const into_player_audio =
  //
  async (
    //
    batch:
      //
      audio[],
    //
    user?:
      //
      Pick<
        //
        user,
        //
        "id" | "name" | "perms"
      >,
  ) => {
    const is_downloaded_map =
      //
      await storage_connect()
        //
        .then(storage_connection =>
          storage_audio_get_by_id_array(
            //
            storage_connection,
            //
            batch.map(audio => audio.id),
          )
            //
            .then(result =>
              result.map(storage_audio =>
                storage_audio === null
                  //
                  ? null
                  //
                  : storage_audio.is_downloaded
              )
            )
            //
            .finally(() => storage_connection.close())
        );

    return (
      batch.map(
        (
          //
          audio,
          //
          index,
        ) => {
          const can_play =
            //
            navigator.onLine && audio_is_playable(audio);

          const can_download =
            //
            navigator.onLine && can_play && is_downloaded_map[index] === null;

          const can_remove =
            //
            navigator.onLine && audio.processing === 0 && (user !== undefined && (user.perms & perms_can_remove) !== 0);

          const is_downloaded =
            //
            is_downloaded_map[index] === 1;

          const should_poll =
            //
            navigator.onLine && audio.processing === 1;

          const download =
            //
            () => download_impl(audio);

          const remove =
            //
            () => actions.audio.remove.orThrow(audio.id);

          const refetch =
            //
            () => refetch_impl(audio.id);

          const create_stream_url =
            //
            is_downloaded
              //
              ? () => opfs_audio_get_stream_file_url(audio.id)
              //
              : async () => `/endpoints/stream?id=${audio.id}`;

          return {
            audio,

            can_play,

            can_download,

            can_remove,

            is_downloaded,

            should_poll,

            download,

            remove,

            refetch,

            create_stream_url,
          };
        },
      )
    );
  };

const download_impl =
  //
  (
    //
    audio:
      //
      audio,
  ) =>
    storage_connect()
      //
      .then(storage_connection =>
        storage_audio_put(
          //
          storage_connection,
          //
          {
            audio,

            time_created:
              //
              Date.now(),

            is_downloaded:
              //
              0,

            is_indexed:
              //
              0,
          },
        )
          //
          .then(() => {
            navigator.storage.persist();

            downloader_run();
          })
          //
          .finally(() => storage_connection.close())
      );

const refetch_impl =
  //
  (
    //
    audio_id:
      //
      string,
  ): Promise<player_audio | null> => {
    const user =
      //
      use_user();

    return (
      actions.audio.get_one.orThrow(
        audio_id,
      )
        //
        .then(audio =>
          audio === null
            //
            ? null
            //
            : (
              into_player_audio(
                //
                [audio],
                //
                user,
              )
                //
                .then(result => result[0])
            )
        )
        //
        .catch(() => {
          return null;
        })
    );
  };

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
  ): Promise<player_audio[]> => {
    const user =
      //
      use_user();

    return (
      actions.audio.get_page.orThrow(
        //
        {
          number,

          query:
            //
            query && (query.length > 2 && query.length < 70)
              //
              ? query
              //
              : undefined,
        },
      )
        //
        .then(page =>
          into_player_audio(
            //
            page,
            //
            user,
          )
        )
    );
  };
