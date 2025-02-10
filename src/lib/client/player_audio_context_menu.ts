import type {
  Signal,
} from "solid-js";

import type {
  player_audio,
} from "./player_audio";

export type player_audio_context_menu =
  //
  {
    player_audio_signal:
      //
      Signal<player_audio | null>;

    x:
      //
      number;

    y:
      //
      number;

    close:
      //
      () => void;
  };
