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

    tags:
      //
      Map<string, string> | null;

    can_play:
      //
      boolean;

    can_download:
      //
      boolean;

    can_remove:
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

export const parse_tags =
  //
  (
    tags:
      //
      string,
  ) =>
    //
    new Map(
      //
      (JSON.parse(tags) as string[][])
        //
        .map(([
          k,

          v,
        ]) => [
          k.toLowerCase(),

          v,
        ]),
    );

export const get_effective_title =
  //
  (
    {
      tags,

      audio,
    }:
      //
      player_audio,
  ) => (
    tags?.get("title")
      //
      ?? audio.file_name
  );

export const get_metadata =
  //
  (
    player_audio:
      //
      player_audio,
  ) => {
    const {
      audio,

      tags,
    } = player_audio;

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
      new MediaMetadata(
        {
          title:
            //
            get_effective_title(player_audio),

          artist:
            //
            tags?.get(
              "artist",
            ),

          album:
            //
            tags?.get(
              "album",
            ),

          artwork,
        },
      )
    );
  };
