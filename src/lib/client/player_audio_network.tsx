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

import type {
  player_audio,
} from "./player_audio";

import {
  parse_tags,
} from "./player_audio";

import {
  create_stream_url_storage,
} from "./player_audio_storage";

import {
  Storage,
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
    const is_downloaded_map: Array<boolean | null> =
      //
      await Storage.open()
        //
        .then(storage =>
          storage
            //
            .get_all(batch.map(audio => audio.id))
            //
            .then(result =>
              result.map(item =>
                item
                  //
                  ? item.is_downloaded
                  //
                  : null
              )
            )
            //
            .finally(() => storage.close())
        );

    return (
      batch.map((audio, index) => {
        const tags =
          //
          audio.tags === null
            //
            ? null
            //
            : parse_tags(audio.tags);

        const can_play =
          //
          audio_is_playable(audio);

        return {
          audio:
            //
            audio,

          tags,

          can_play,

          can_download:
            //
            can_play && is_downloaded_map[index] === null,

          can_remove:
            //
            audio.processing === 0 && (user !== undefined && (user.perms & perms_can_remove) !== 0),

          should_poll:
            //
            audio.processing === 1,

          download:
            //
            () => download(audio),

          remove:
            //
            () => remove(audio.id),

          refetch:
            //
            () => refetch(audio.id),

          create_stream_url:
            //
            is_downloaded_map[index] === true
              //
              ? () => create_stream_url_storage(audio.id)
              //
              : async () => `/endpoints/stream?id=${audio.id}`,
        };
      })
    );
  };

const download =
  //
  (
    audio:
      //
      audio,
  ) =>
    Storage.open()
      //
      .then(storage =>
        storage.put(
          {
            audio,

            time_created:
              //
              Date.now(),

            is_downloaded:
              //
              false,
          },
        )
          //
          .then(() => {
            navigator.storage.persist();

            window.dispatchEvent(
              new CustomEvent("downloader-run"),
            );
          })
          //
          .finally(() => storage.close())
      );

const remove =
  //
  (
    //
    audio_id:
      //
      string,
  ) =>
    actions.audio.remove.orThrow(
      audio_id,
    )
      //
      .catch(() =>
        window.dispatchEvent(
          new CustomEvent("network-error"),
        )
      );

const refetch =
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
    number:
      //
      number,
  ): Promise<player_audio[]> => {
    const user =
      //
      use_user();

    return (
      actions.audio.get_page.orThrow(
        number,
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
        //
        .catch(() => {
          window.dispatchEvent(
            new CustomEvent("network-error"),
          );

          return [];
        })
    );
  };
