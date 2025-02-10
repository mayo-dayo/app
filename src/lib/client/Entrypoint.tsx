import type {
  user,
} from "@/lib/server/types/user";

import {
  MultiProvider,
} from "@solid-primitives/context";

import type {
  Component,
} from "solid-js";

import {
  splitProps,
} from "solid-js";

import {
  NetworkErrorProvider,
} from "./network_error";

import {
  PlayerAudioMenuProvider,
} from "./player_audio_menu";

import {
  UserProvider,
} from "./user";

type Props =
  //
  {
    user?:
      //
      Pick<
        //
        user,
        //
        "id" | "name" | "perms"
      >;
  };

export const Entrypoint =
  //
  <P extends {}>(
    Wrapped:
      //
      Component<P>,
  ) => {
    const Inner: Component<P & Props> =
      //
      (props) => {
        const [
          {
            user,
          },

          others,
        ] =
          //
          splitProps(
            //
            props,
            //
            ["user"],
          );

        return (
          <MultiProvider
            //
            values={[
              [UserProvider, user],

              NetworkErrorProvider,

              PlayerAudioMenuProvider,
            ]}
          >
            <Wrapped {...(others as P)} />
          </MultiProvider>
        );
      };

    return Inner;
  };
