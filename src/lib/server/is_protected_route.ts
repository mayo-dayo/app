export const is_protected_route =
  //
  (url: URL): boolean => {
    if (
      url.pathname === "/upload"
    ) {
      return true;
    }

    if (
      url.pathname === "/_actions/audio.remove/"
    ) {
      return true;
    }

    if (
      url.pathname === "/_actions/audio.create/"
    ) {
      return true;
    }

    if (
      Bun.env.MAYO_AUTHENTICATION === "required"
    ) {
      if (
        url.pathname.startsWith("/_actions/")
      ) {
        return true;
      }

      if (
        url.pathname === "/"
      ) {
        return true;
      }

      if (
        url.pathname === "/downloads"
      ) {
        return true;
      }

      if (
        url.pathname === "/endpoints/stream"
      ) {
        return true;
      }
    }

    return false;
  };
