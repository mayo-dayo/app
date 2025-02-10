import type {
  user,
} from "@/lib/server/types/user";

import {
  createContextProvider,
} from "@solid-primitives/context";

const [UserProvider, use_user] =
  //
  createContextProvider(
    ({ value }: {
      value:
        //
        Pick<
          //
          user,
          //
          "id" | "name" | "perms"
        >;
    }) => value,
  );

export { use_user, UserProvider };
