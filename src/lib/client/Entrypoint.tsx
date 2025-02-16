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
            ]}
          >
            <Wrapped {...(others as P)} />
          </MultiProvider>
        );
      };

    return Inner;
  };
