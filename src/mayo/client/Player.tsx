import type {
  Component,
} from "solid-js";

import {
  MultiProvider,
} from "@solid-primitives/context";

import type {
  locals_user,
} from "@/mayo/common/locals_user";

import {
  UserProvider,
} from "@/mayo/client/user_provider";

import {
  PlayerQueueProvider,
} from "@/mayo/client/player_queue";

import {
  PlayerAudioMenuProvider,
} from "@/mayo/client/player_audio_menu";

import {
  player_audio_list_render,
} from "@/mayo/client/player_audio_list";

type props =
  //
  {
    user?:
      //
      locals_user;
  };

const Player: Component<props> =
  //
  (
    {
      user,
    },
  ) => (
    <MultiProvider
      //
      values={[
        [UserProvider, user],

        PlayerQueueProvider,

        PlayerAudioMenuProvider,
      ]}
    >
      {player_audio_list_render()}
    </MultiProvider>
  );

export default Player;
