import type {
  player_audio,
} from "./player_audio";

import {
  parse_tags,
} from "./player_audio";

import {
  get_audio_file_handle,
  Storage,
} from "./storage";

import type {
  storage_item,
} from "./storage";

const into_player_audio =
  //
  (
    batch:
      //
      storage_item[],
  ): player_audio[] =>
    batch.map(storage_item => {
      const tags =
        //
        storage_item.audio.tags === null
          //
          ? null
          //
          : parse_tags(storage_item.audio.tags);

      return {
        audio:
          //
          storage_item.audio,

        tags,

        can_play:
          //
          storage_item.is_downloaded,

        can_download:
          //
          false,

        can_remove:
          //
          true,

        should_poll:
          //
          storage_item.is_downloaded == false,

        download:
          //
          () => {},

        remove:
          //
          () => remove(storage_item.audio.id),

        refetch:
          //
          () => refetch(storage_item),

        create_stream_url:
          //
          () => create_stream_url_storage(storage_item.audio.id),
      };
    });

export const create_stream_url_storage =
  //
  (
    audio_id:
      //
      string,
  ) =>
    get_audio_file_handle(audio_id)
      //
      .then(file => file.getFile())
      //
      .then(file => URL.createObjectURL(file));

const remove =
  //
  (
    audio_id:
      //
      string,
  ) =>
    window.dispatchEvent(
      new CustomEvent(
        //
        "downloader-remove",
        //
        { detail: { audio_id } },
      ),
    );

const refetch =
  //
  (
    storage_item:
      //
      storage_item,
  ): Promise<player_audio | null> =>
    Storage.open()
      //
      .then(storage =>
        storage
          //
          .get(
            storage_item.audio.id,
          )
          //
          .then(storage_item =>
            storage_item === null
              //
              ? null
              //
              : (
                into_player_audio(
                  [storage_item],
                )[0]
              )
          )
          //
          .finally(() => storage.close())
      );

export const get_page =
  //
  (
    number:
      //
      number,
  ): Promise<player_audio[]> =>
    Storage.open()
      //
      .then(storage =>
        storage
          //
          .get_page(
            number,
          )
          //
          .then(page =>
            into_player_audio(
              page,
            )
          )
          //
          .finally(() => storage.close())
      );
