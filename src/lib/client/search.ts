import type {
  audio,
} from "@/lib/server/types/audio";

import {
  expose,
} from "comlink";

import MiniSearch from "minisearch";

import type {
  search_api,
} from "./search_api";

import type {
  storage_audio,
} from "./storage";

import {
  storage_audio_get_by_id,
  storage_audio_get_next_downloaded_not_indexed,
  storage_audio_update,
  storage_connect,
} from "./storage";

const tokenize =
  //
  (
    //
    input:
      //
      string,
  ): string[] => {
    const trigrams =
      //
      [];

    const words =
      //
      input
        //
        .trim()
        //
        .split(/[\s\p{P}]+/u)
        //
        .filter(Boolean);

    for (const word of words) {
      const normalized =
        //
        word
          //
          .normalize("NFD")
          //
          .replace(/[\u0300-\u036f]/g, "")
          //
          .toLowerCase();

      if (normalized.length < 3) {
        continue;
      }

      for (
        //
        let i = 0;
        //
        i <= normalized.length - 3;
        //
        i++
      ) {
        const trigram =
          //
          normalized.substring(
            //
            i,
            //
            i + 3,
          );

        trigrams.push(trigram);
      }
    }

    return trigrams;
  };

type document =
  //
  Pick<
    //
    audio,
    //
    | "id"
    //
    | "album"
    //
    | "artist"
    //
    | "composer"
    //
    | "genre"
    //
    | "performer"
    //
    | "title"
  >;

const storage_audio_to_document =
  //
  (
    //
    {
      audio: {
        id,

        album,

        artist,

        composer,

        genre,

        performer,

        title,
      },
    }:
      //
      storage_audio,
  ): document => {
    return (
      {
        id,

        album,

        artist,

        composer,

        genre,

        performer,

        title,
      }
    );
  };

let sync_access_handle:
  //
  any;

try {
  sync_access_handle =
    //
    await navigator.storage.getDirectory()
      //
      .then(directory =>
        directory.getDirectoryHandle(
          //
          "search",
          //
          { create: true },
        )
      )
      //
      .then(directory =>
        directory.getFileHandle(
          //
          "minisearch",
          //
          { create: true },
        )
      )
      //
      .then(file =>
        // @ts-ignore
        file.createSyncAccessHandle()
      );
} catch (e) {
  //
}

if (sync_access_handle) {
  let index:
    //
    MiniSearch<document>;

  const options =
    //
    {
      autoVacuum:
        //
        false,

      fields:
        //
        [
          "album",

          "artist",

          "composer",

          "genre",

          "performer",

          "title",
        ],

      tokenize,

      searchOptions:
        //
        {
          boost:
            //
            {
              artist:
                //
                2,

              performer:
                //
                2,

              title:
                //
                2,
            },
        },
    };

  const file_size =
    //
    sync_access_handle.getSize();

  if (file_size > 0) {
    const buffer =
      //
      new ArrayBuffer(
        file_size,
      );

    sync_access_handle.read(buffer);

    const decoder =
      //
      new TextDecoder(
        "utf-8",
      );

    try {
      index =
        //
        MiniSearch.loadJSON(
          //
          decoder.decode(buffer),
          //
          options,
        );
    } catch (e) {
      console.warn(`failed to deserialize minisearch: ${e}`);
    }
  }

  index ??= new MiniSearch(options);

  const storage_connection =
    //
    await storage_connect();

  const save =
    //
    async () => {
      console.time("to vacuum");

      try {
        await index.vacuum();
      } finally {
        console.timeEnd("to vacuum");
      }

      console.time("to persist");

      try {
        const array =
          //
          new TextEncoder()
            //
            .encode(
              JSON.stringify(index),
            );

        const data_view =
          //
          new DataView(
            //
            array.buffer,
            //
            array.byteOffset,
            //
            array.byteLength,
          );

        sync_access_handle.truncate(0);

        sync_access_handle.write(data_view);

        sync_access_handle.flush();
      } finally {
        console.timeEnd("to persist");
      }
    };

  const run =
    //
    async () => {
      while (true) {
        const storage_audio =
          //
          await storage_audio_get_next_downloaded_not_indexed(
            storage_connection,
          );

        if (storage_audio === null) {
          break;
        }

        const {
          audio: {
            id,
          },
        } = storage_audio;

        console.groupCollapsed(id);

        console.debug(`dirt count: ${index.dirtCount}`);

        console.debug(`dirt factor: ${index.dirtFactor}`);

        console.debug(`document count: ${index.documentCount}`);

        console.debug(`term count: ${index.termCount}`);

        const document =
          //
          storage_audio_to_document(storage_audio);

        console.time("to index");

        try {
          if (index.has(id)) {
            index.replace(document);
          } else {
            index.add(document);
          }
        } finally {
          console.timeEnd("to index");
        }

        await save();

        console.groupEnd();

        await storage_audio_update(
          //
          storage_connection,
          //
          id,
          //
          storage_audio => Object.assign({}, storage_audio, { is_indexed: 1 }),
        );
      }
    };

  (async () => {
    while (true) {
      try {
        await run();
      } catch (e) {
        console.warn(`uncaught error while indexing: ${e}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  })();

  const search =
    //
    (
      //
      query:
        //
        string,
      //
      offset:
        //
        number,
      //
      limit:
        //
        number,
    ): string[] =>
      index
        //
        .search(query)
        //
        .slice(offset, offset + limit)
        //
        .map(result => result.id);

  const remove =
    //
    (id: string) =>
      storage_audio_get_by_id(
        //
        storage_connection,
        //
        id,
      )
        //
        .then(async storage_audio => {
          if (storage_audio) {
            const document =
              //
              storage_audio_to_document(storage_audio);

            index.remove(document);

            console.groupCollapsed(document.id);

            try {
              await save();
            } finally {
              console.groupEnd();
            }
          }
        });

  const search_api: search_api =
    //
    {
      search,

      remove,
    };

  expose(search_api);
}
