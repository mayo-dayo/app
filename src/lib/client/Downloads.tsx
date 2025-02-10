import {
  Entrypoint,
} from "./Entrypoint";

import {
  get_page,
} from "./player_audio_storage";

import {
  render_player_audio_list,
} from "./render_player_audio_list";

export const List =
  //
  Entrypoint(() =>
    render_player_audio_list(
      get_page,
    )
  );
