import {
  createContextProvider,
} from "@solid-primitives/context";

import type {
  locals_user,
} from "@/mayo/common/locals_user";

type props =
  //
  {
    value:
      //
      locals_user;
  };

const [
  UserProvider,

  use_user,
] = createContextProvider(
  (
    {
      value,
    }:
      //
      props,
  ) => value,
);

export {
  //
  use_user,
  //
  UserProvider,
};
