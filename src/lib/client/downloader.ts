import {
  expose,
} from "comlink";

import type {
  downloader_api,
} from "./downloader_api";

import {
  opfs_audio_get_stream_file_handle,
} from "./opfs";

import {
  storage_audio_get_next_not_downloaded,
  storage_audio_remove,
  storage_audio_update,
  storage_connect,
} from "./storage";

import type {
  storage_connection,
} from "./storage";

let running = false;

const run =
  //
  async () => {
    if (running) {
      return;
    }

    running = true;

    try {
      await do_run();
    } finally {
      running = false;
    }
  };

let current_sync_access_handle: any | undefined;

const download_loop =
  //
  async (
    //
    storage_connection:
      //
      storage_connection,
  ) => {
    main: while (true) {
      const storage_audio =
        //
        await storage_audio_get_next_not_downloaded(
          storage_connection,
        );

      if (storage_audio === null) {
        break;
      }

      const {
        audio: {
          id,

          size,
        },
      } = storage_audio;

      try {
        current_sync_access_handle =
          //
          await opfs_audio_get_stream_file_handle(
            id,
          )
            //
            .then(file_handle =>
              // @ts-ignore
              file_handle.createSyncAccessHandle()
            );
      } catch (e) {
        console.warn(`failed to create a sync access handle: ${e}`);

        continue;
      }

      let offset =
        //
        current_sync_access_handle.getSize();

      request: while (
        // The handle can become undefined after an await.
        current_sync_access_handle !== undefined
        //
        && offset < size!
      ) {
        let response;

        try {
          response =
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
        } catch (e) {
          // Probably a network error, back off and try again.

          console.warn(`request failed: ${e}`);

          await new Promise(resolve => setTimeout(resolve, 1000 * 5));

          continue request;
        }

        if (response.status === 404) {
          // The audio is no longer available server-side, so there is no point in trying to download it.

          // Since the audio can no longer be downloaded, try to remove it from the storage.
          storage_audio_remove(
            //
            storage_connection,
            //
            id,
          );

          // If the handle is still there, try to remove the file.
          if (current_sync_access_handle) {
            try {
              current_sync_access_handle.truncate(0);

              current_sync_access_handle.close();
            } finally {
              current_sync_access_handle = undefined;
            }
          }

          // Move on. We did our best.

          continue main;
        }

        if (response.status !== 206) {
          // Probably a server error, back off and try again.

          console.warn(`unexpected response status: ${response.status}`);

          await new Promise(resolve => setTimeout(resolve, 1000 * 60));

          continue request;
        }

        const reader =
          // @ts-ignore
          response.body.getReader();

        while (true) {
          let read;

          try {
            read = await reader.read();
          } catch (e) {
            // If this throws, re-send the request.

            console.warn(`failed to read the response body: ${e}`);

            continue request;
          }

          const {
            done,

            value,
          } = read;

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

            if (current_sync_access_handle) {
              try {
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

                offset += value.length;

                continue;
              } catch (_e) {
                current_sync_access_handle.close();

                current_sync_access_handle = undefined;
              }
            }

            // The handle is gone or `write` threw.
            // Nothing we can do here.
            // Move on.

            continue main;
          }

          //
        }

        //
      }

      if (
        current_sync_access_handle
      ) {
        current_sync_access_handle.close();

        current_sync_access_handle = undefined;
      }

      await storage_audio_update(
        //
        storage_connection,
        //
        id,
        //
        storage_audio => Object.assign({}, storage_audio, { is_downloaded: 1 }),
      );

      //
    }
  };

const do_run =
  //
  async () => {
    const storage_connection =
      //
      await storage_connect();

    try {
      await download_loop(storage_connection);
    } finally {
      storage_connection.close();
    }
  };

const remove =
  //
  (
    audio_id:
      //
      string,
  ) =>
    opfs_audio_get_stream_file_handle(
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
          // This audio is the one that is currently being downloaded.
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
        storage_connect()
          //
          .then(storage_connection =>
            storage_audio_remove(
              //
              storage_connection,
              //
              audio_id,
            )
              //
              .finally(() => storage_connection.close())
          )
      );

const downloader_api: downloader_api =
  //
  {
    run,

    remove,
  };

expose(downloader_api);
