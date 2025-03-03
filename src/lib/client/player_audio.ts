import type {
  audio,
} from "@/lib/server/types/audio";

import {
  audio_thumbnail_sizes,
} from "@/lib/server/types/audio";

export type player_audio =
  //
  {
    audio:
      //
      audio;

    can_play:
      //
      boolean;

    can_download:
      //
      boolean;

    can_remove:
      //
      boolean;

    is_downloaded:
      //
      boolean;

    should_poll:
      //
      boolean;

    download:
      //
      () => void;

    remove:
      //
      () => void;

    refetch:
      //
      () => Promise<player_audio | null>;

    create_stream_url:
      //
      () => Promise<string>;
  };

export const create_media_metadata =
  //
  (
    player_audio:
      //
      player_audio,
  ) => {
    const {
      audio,
    } = player_audio;

    const title =
      //
      audio.title
        //
        ?? audio.file_name;

    const artist =
      //
      audio.artist
        //
        ?? undefined;

    const album =
      //
      audio.album
        //
        ?? undefined;

    const artwork =
      //
      audio.has_thumbnail
        //
        ? audio_thumbnail_sizes
          //
          .map(size => {
            return {
              src:
                //
                `/endpoints/thumbnail?id=${audio.id}&size=${size}`,

              sizes:
                //
                `${size}x${size}`,
            };
          })
        //
        : [];

    return (
      new MediaMetadata({
        title,

        artist,

        album,

        artwork,
      })
    );
  };
