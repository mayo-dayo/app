import {
  Entrypoint,
} from "./Entrypoint";

import {
  render_playlist_list,
} from "./render_playlist_list";

export const List = Entrypoint(render_playlist_list);
