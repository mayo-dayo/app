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
  ContextMenuProvider,
  use_context_menu,
} from "./context_menu";

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

              ContextMenuProvider,
            ]}
          >
            <Wrapped {...(others as P)} />

            {use_context_menu()!.render()}
          </MultiProvider>
        );
      };

    return Inner;
  };
