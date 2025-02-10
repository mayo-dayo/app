import type {
  player_audio,
} from "./player_audio";

export const QUEUE_PLAY_NOW =
  //
  "queue.play_now";

export const QUEUE_PLAY_NEXT =
  //
  "queue.play_next";

export const QUEUE_PLAY_LATER =
  //
  "queue.play_later";

export const QUEUE_SHUFFLE_IN =
  //
  "queue.shuffle_in";

export type queue_play_now =
  //
  CustomEvent<player_audio>;

export type queue_play_next =
  //
  CustomEvent<player_audio>;

export type queue_play_later =
  //
  CustomEvent<player_audio>;

export type queue_shuffle_in =
  //
  CustomEvent<player_audio>;

export const queue_play_now =
  //
  (player_audio: player_audio) => {
    const event: queue_play_now =
      //
      new CustomEvent(
        QUEUE_PLAY_NOW,
        //
        { detail: player_audio },
      );

    window.dispatchEvent(event);
  };

export const queue_play_next =
  //
  (player_audio: player_audio) => {
    const event: queue_play_next =
      //
      new CustomEvent(
        //
        QUEUE_PLAY_NEXT,
        //
        { detail: player_audio },
      );

    window.dispatchEvent(event);
  };

export const queue_play_later =
  //
  (player_audio: player_audio) => {
    const event: queue_play_later =
      //
      new CustomEvent(
        QUEUE_PLAY_LATER,
        //
        { detail: player_audio },
      );

    window.dispatchEvent(event);
  };

export const queue_shuffle_in =
  //
  (player_audio: player_audio) => {
    //
    const event: queue_shuffle_in =
      //
      new CustomEvent(
        QUEUE_SHUFFLE_IN,
        //
        { detail: player_audio },
      );

    window.dispatchEvent(event);
  };
