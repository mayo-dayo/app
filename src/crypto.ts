export const sign =
  //
  (
    //
    secret:
      //
      string,
    //
    data:
      //
      string,
  ): string => {
    const hasher =
      //
      new Bun.CryptoHasher(
        //
        "blake2b512",
        //
        secret,
      );

    hasher.update(
      data,
    );

    const signature =
      //
      hasher.digest(
        "base64url",
      );

    return signature;
  };
