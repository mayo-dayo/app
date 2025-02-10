import {
  createContextProvider,
} from "@solid-primitives/context";

import {
  makeEventListener,
} from "@solid-primitives/event-listener";

import {
  createSignal,
} from "solid-js";

const [NetworkErrorProvider, use_network_error] =
  //
  createContextProvider(() => {
    const [
      network_error,

      set_network_error,
    ] = createSignal(
      false,
    );

    makeEventListener(
      //
      window,
      //
      "network-error",
      //
      () => set_network_error(true),
      //
      { passive: true },
    );

    return network_error;
  });

export { NetworkErrorProvider, use_network_error };
