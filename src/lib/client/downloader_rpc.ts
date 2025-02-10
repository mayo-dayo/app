export const DOWNLOADER_RUN =
  //
  "downloader.run";

export const DOWNLOADER_REMOVE =
  //
  "downloader.remove";

export type downloader_run =
  //
  CustomEvent<
    undefined
  >;

export type downloader_remove =
  //
  CustomEvent<
    string
  >;

export const downloader_run =
  //
  () => {
    const event: downloader_run =
      //
      new CustomEvent(
        //
        DOWNLOADER_RUN,
        //
        {
          detail:
            //
            undefined,
        },
      );

    window.dispatchEvent(event);
  };

export const downloader_remove =
  //
  (
    //
    audio_id:
      //
      string,
  ) => {
    const event: downloader_remove =
      //
      new CustomEvent(
        //
        DOWNLOADER_REMOVE,
        //
        {
          detail:
            //
            audio_id,
        },
      );

    window.dispatchEvent(event);
  };
