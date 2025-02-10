import {
  get_audio_file_handle,
  Storage,
} from "./storage";

let current_sync_access_handle: any | undefined;

const run =
  //
  async () => {
    const storage =
      //
      await Storage.open();

    try {
      main: while (true) {
        const next =
          //
          await storage.get_next_not_downloaded();

        if (next === null) {
          break;
        }

        const {
          audio: {
            id,

            size,
          },
        } = next;

        try {
          current_sync_access_handle =
            //
            await get_audio_file_handle(
              id,
            )
              //
              .then(file_handle =>
                // @ts-ignore
                file_handle.createSyncAccessHandle()
              );
        } catch (e) {
          continue;
        }

        try {
          let offset =
            //
            current_sync_access_handle.getSize();

          while (offset !== size) {
            try {
              const response =
                //
                await fetch(
                  //
                  `/endpoints/stream?id=${id}`,
                  //
                  {
                    headers:
                      //
                      {
                        range:
                          //
                          `bytes=${offset}-`,
                      },
                  },
                );

              const reader =
                // @ts-ignore
                response.body.getReader();

              while (true) {
                const {
                  done,

                  value,
                } = await reader.read();

                if (done) {
                  break;
                }

                if (value) {
                  const data_view =
                    //
                    new DataView(
                      //
                      value.buffer,
                      //
                      value.byteOffset,
                      //
                      value.byteLength,
                    );

                  if (
                    current_sync_access_handle
                  ) {
                    current_sync_access_handle.write(
                      //
                      data_view,
                      //
                      {
                        at:
                          //
                          offset,
                      },
                    );
                  } else {
                    continue main;
                  }

                  offset += value.length;
                }
              }
            } catch (e) {
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
          }
        } catch (e) {
          continue;
        } finally {
          if (
            current_sync_access_handle
          ) {
            current_sync_access_handle.close();

            current_sync_access_handle =
              //
              undefined;
          }
        }

        await storage
          //
          .put(
            {
              ...next,

              is_downloaded:
                //
                true,
            },
          );
      }
    } finally {
      storage.close();
    }
  };

let running = false;

const handle_run =
  //
  async () => {
    if (running) {
      return;
    }

    running = true;

    try {
      await run();
    } finally {
      running = false;
    }
  };

const handle_remove =
  //
  (
    audio_id: string,
  ) =>
    get_audio_file_handle(
      audio_id,
    )
      //
      .then(async file_handle => {
        let sync_access_handle;

        try {
          sync_access_handle =
            // @ts-ignore
            await file_handle.createSyncAccessHandle();
        } catch (e) {
          // delete the audio that is currently being downloaded
          if (current_sync_access_handle) {
            sync_access_handle =
              //
              current_sync_access_handle;

            current_sync_access_handle =
              //
              undefined;
          } else {
            return;
          }
        }

        try {
          sync_access_handle.truncate(0);
        } finally {
          sync_access_handle.close();
        }
      })
      //
      .finally(() =>
        Storage.open()
          //
          .then(storage =>
            storage.remove(audio_id)
              //
              .finally(() => storage.close())
          )
      );

self.addEventListener(
  //
  "message",
  //
  (
    e:
      //
      MessageEvent,
  ) => {
    const command = e.data.command as string;

    switch (command) {
      case "run":
        handle_run();

        break;
      case "remove":
        const audio_id = e.data.audio_id as string;

        handle_remove(audio_id);

        break;

      default:
        throw new Error("unreachable");
    }
  },
);
