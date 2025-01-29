import type {
  Component,
} from "solid-js";

import {
  MultiProvider,
} from "@solid-primitives/context";

import {
  PlayerQueueProvider,
} from "@/mayo/client/player_queue";

import {
  PlayerAudioMenuProvider,
} from "@/mayo/client/player_audio_menu";

import {
  player_audio_list_render,
} from "@/mayo/client/player_audio_list";

const Player: Component =
  //
  () => {
    return (
      <MultiProvider
        //
        values={[
          PlayerQueueProvider,

          PlayerAudioMenuProvider,
        ]}
      >
        {player_audio_list_render()}
      </MultiProvider>
    );
  };

export default Player;
