import {
  afterEach,
  describe,
  expect,
  test,
} from "vitest";

import type {
  storage_audio,
} from "./storage";

import {
  storage_audio_get_next_downloaded_not_indexed,
  storage_audio_get_next_not_downloaded,
  storage_audio_put,
  storage_audio_remove,
  storage_connect,
} from "./storage";

describe(
  //
  "storage_audio_get_next_downloaded_not_indexed",
  //
  async () => {
    const connection =
      //
      await storage_connect();

    const test_audio_ids: string[] =
      //
      [];

    afterEach(async () => {
      for (const id of test_audio_ids) {
        await storage_audio_remove(
          //
          connection,
          //
          id,
        );
      }

      test_audio_ids.length = 0;
    });

    const create_test_audio =
      //
      async (
        //
        id:
          //
          string,
        //
        is_downloaded:
          //
          0 | 1,
        //
        is_indexed:
          //
          0 | 1,
        //
        time_created:
          //
          number = Date.now(),
      ) => {
        const audio: storage_audio["audio"] =
          //
          {
            id,

            time_uploaded:
              //
              0,

            file_name:
              //
              "",

            processing:
              //
              0,

            processing_state:
              //
              0,

            has_thumbnail:
              //
              0,

            duration:
              //
              null,

            size:
              //
              null,

            album:
              //
              null,

            artist:
              //
              null,

            composer:
              //
              null,

            genre:
              //
              null,

            performer:
              //
              null,

            title:
              //
              null,
          };

        const storage_audio: storage_audio =
          //
          {
            audio,

            time_created,

            is_downloaded,

            is_indexed,
          };

        await storage_audio_put(
          //
          connection,
          //
          storage_audio,
        );

        test_audio_ids.push(id);

        return storage_audio;
      };

    test(
      //
      "returns null if the database is empty",
      //
      async () => {
        const result =
          //
          await storage_audio_get_next_downloaded_not_indexed(
            connection,
          );

        expect(result).toBeNull();
      },
    );

    test(
      //
      "returns null if there are no downloaded-but-not-indexed items",
      //
      async () => {
        await create_test_audio("test1", 0, 0); // not downloaded, not indexed

        await create_test_audio("test2", 0, 1); // not downloaded, indexed (shouldn't be possible but testing edge case)

        await create_test_audio("test3", 1, 1); // downloaded and indexed

        const result =
          //
          await storage_audio_get_next_downloaded_not_indexed(
            connection,
          );

        expect(result).toBeNull();
      },
    );

    test(
      //
      "returns the downloaded-not-indexed item when one exists",
      //
      async () => {
        // Add a mix of items
        await create_test_audio("test1", 0, 0); // not downloaded, not indexed

        const expected = await create_test_audio("test2", 1, 0); // downloaded, not indexed - should be returned

        await create_test_audio("test3", 1, 1); // downloaded and indexed

        const result =
          //
          await storage_audio_get_next_downloaded_not_indexed(
            connection,
          );

        expect(result).not.toBeNull();

        expect(result?.audio.id).toBe("test2");

        expect(result?.is_downloaded).toBe(1);

        expect(result?.is_indexed).toBe(0);

        expect(result).toEqual(expected);
      },
    );

    test(
      //
      "returns the oldest downloaded-not-indexed item when multiple exist",
      //
      async () => {
        const now = Date.now();

        // Create items with specific timestamps to test ordering
        await create_test_audio("test1", 0, 0, now); // not downloaded, not indexed

        await create_test_audio("test3", 1, 0, now + 200); // downloaded, not indexed (newer)

        const expected = await create_test_audio("test2", 1, 0, now + 100); // downloaded, not indexed (older)

        await create_test_audio("test4", 1, 1, now); // downloaded and indexed

        const result =
          //
          await storage_audio_get_next_downloaded_not_indexed(
            connection,
          );

        expect(result).not.toBeNull();

        expect(result?.audio.id).toBe("test2");

        expect(result?.time_created).toBe(now + 100);

        expect(result).toEqual(expected);
      },
    );

    test(
      //
      "handles large number of items correctly",
      //
      async () => {
        const now = Date.now();

        // Create many items
        for (let i = 0; i < 10; i++) {
          await create_test_audio(`other_${i}`, 0, 0, now + i); // not downloaded
        }

        // The item we expect to be returned (oldest downloaded not indexed)
        const expected = await create_test_audio("target", 1, 0, now - 1000);

        // More downloaded and indexed items
        for (let i = 0; i < 10; i++) {
          await create_test_audio(`indexed_${i}`, 1, 1, now + i); // downloaded and indexed
        }

        // More downloaded but not indexed items (but newer)
        for (let i = 0; i < 5; i++) {
          await create_test_audio(`newer_${i}`, 1, 0, now + i + 100); // downloaded, not indexed, but newer
        }

        const result =
          //
          await storage_audio_get_next_downloaded_not_indexed(
            connection,
          );

        expect(result).not.toBeNull();

        expect(result?.audio.id).toBe("target");

        expect(result).toEqual(expected);
      },
    );

    test(
      //
      "returns correct item even with negative timestamps",
      //
      async () => {
        // Test with negative timestamps (rare but possible edge case)
        await create_test_audio("test1", 0, 0, 100);

        const expected = await create_test_audio("test2", 1, 0, -1000); // negative timestamp

        await create_test_audio("test3", 1, 0, 200);

        const result =
          //
          await storage_audio_get_next_downloaded_not_indexed(
            connection,
          );

        expect(result).not.toBeNull();

        expect(result?.audio.id).toBe("test2");

        expect(result?.time_created).toBe(-1000);

        expect(result).toEqual(expected);
      },
    );
  },
);

describe(
  //
  "storage_audio_get_next_not_downloaded",
  //
  async () => {
    const connection =
      //
      await storage_connect();

    const test_audio_ids: string[] =
      //
      [];

    afterEach(async () => {
      for (const id of test_audio_ids) {
        await storage_audio_remove(
          //
          connection,
          //
          id,
        );
      }

      test_audio_ids.length = 0;
    });

    const create_test_audio =
      //
      async (
        //
        id:
          //
          string,
        //
        is_downloaded:
          //
          0 | 1,
        //
        is_indexed:
          //
          0 | 1,
        //
        time_created:
          //
          number = Date.now(),
      ) => {
        const audio: storage_audio["audio"] =
          //
          {
            id,

            time_uploaded:
              //
              0,

            file_name:
              //
              "",

            processing:
              //
              0,

            processing_state:
              //
              0,

            has_thumbnail:
              //
              0,

            duration:
              //
              null,

            size:
              //
              null,

            album:
              //
              null,

            artist:
              //
              null,

            composer:
              //
              null,

            genre:
              //
              null,

            performer:
              //
              null,

            title:
              //
              null,
          };

        const storage_audio: storage_audio =
          //
          {
            audio,

            time_created,

            is_downloaded,

            is_indexed,
          };

        await storage_audio_put(
          //
          connection,
          //
          storage_audio,
        );

        test_audio_ids.push(id);

        return storage_audio;
      };

    test(
      //
      "returns null if the database is empty",
      //
      async () => {
        const result =
          //
          await storage_audio_get_next_not_downloaded(
            connection,
          );

        expect(result).toBeNull();
      },
    );

    test(
      //
      "returns null if there are no not-downloaded items",
      //
      async () => {
        await create_test_audio("test1", 1, 0); // downloaded, not indexed
        
        await create_test_audio("test2", 1, 1); // downloaded, indexed
        
        const result =
          //
          await storage_audio_get_next_not_downloaded(
            connection,
          );

        expect(result).toBeNull();
      },
    );

    test(
      //
      "returns the not-downloaded item when one exists",
      //
      async () => {
        // Add a mix of items
        const expected = await create_test_audio("test1", 0, 0); // not downloaded, not indexed - should be returned
        
        await create_test_audio("test2", 1, 0); // downloaded, not indexed
        
        await create_test_audio("test3", 1, 1); // downloaded and indexed
        
        const result =
          //
          await storage_audio_get_next_not_downloaded(
            connection,
          );

        expect(result).not.toBeNull();
        
        expect(result?.audio.id).toBe("test1");
        
        expect(result?.is_downloaded).toBe(0);
        
        expect(result).toEqual(expected);
      },
    );

    test(
      //
      "returns the oldest not-downloaded item when multiple exist",
      //
      async () => {
        const now = Date.now();
        
        // Create items with specific timestamps to test ordering
        await create_test_audio("test3", 0, 0, now + 200); // not downloaded (newer)
        
        const expected = await create_test_audio("test1", 0, 0, now); // not downloaded (oldest) - should be returned
        
        await create_test_audio("test2", 0, 0, now + 100); // not downloaded (middle)
        
        await create_test_audio("test4", 1, 0, now); // downloaded, not indexed
        
        await create_test_audio("test5", 1, 1, now); // downloaded and indexed
        
        const result =
          //
          await storage_audio_get_next_not_downloaded(
            connection,
          );

        expect(result).not.toBeNull();
        
        expect(result?.audio.id).toBe("test1");
        
        expect(result?.time_created).toBe(now);
        
        expect(result).toEqual(expected);
      },
    );

    test(
      //
      "works correctly with not-downloaded but indexed items",
      //
      async () => {
        // This is an edge case as indexed items should be downloaded first
        // but we test it for thoroughness
        const now = Date.now();
        
        const expected = await create_test_audio("test1", 0, 0, now); // not downloaded, not indexed
        
        await create_test_audio("test2", 0, 1, now + 100); // not downloaded but indexed (shouldn't be possible)
        
        await create_test_audio("test3", 1, 0, now); // downloaded, not indexed
        
        const result =
          //
          await storage_audio_get_next_not_downloaded(
            connection,
          );

        expect(result).not.toBeNull();
        
        expect(result?.audio.id).toBe("test1");
        
        expect(result?.is_downloaded).toBe(0);
        
        expect(result).toEqual(expected);
      },
    );

    test(
      //
      "handles large number of items correctly",
      //
      async () => {
        const now = Date.now();
        
        // Create many items
        for (let i = 0; i < 10; i++) {
          await create_test_audio(`downloaded_${i}`, 1, 1, now + i); // downloaded and indexed
        }
        
        // The item we expect to be returned (oldest not downloaded)
        const expected = await create_test_audio("target", 0, 0, now - 1000);
        
        // More not downloaded items but newer
        for (let i = 0; i < 5; i++) {
          await create_test_audio(`newer_${i}`, 0, 0, now + i + 100); // not downloaded but newer
        }
        
        const result =
          //
          await storage_audio_get_next_not_downloaded(
            connection,
          );

        expect(result).not.toBeNull();
        
        expect(result?.audio.id).toBe("target");
        
        expect(result).toEqual(expected);
      },
    );

    test(
      //
      "returns correct item even with negative timestamps",
      //
      async () => {
        // Test with negative timestamps (rare but possible edge case)
        await create_test_audio("test1", 1, 0, 100); // downloaded
        
        const expected = await create_test_audio("test2", 0, 0, -1000); // not downloaded, negative timestamp
        
        await create_test_audio("test3", 0, 0, 200); // not downloaded, but newer
        
        const result =
          //
          await storage_audio_get_next_not_downloaded(
            connection,
          );

        expect(result).not.toBeNull();
        
        expect(result?.audio.id).toBe("test2");
        
        expect(result?.time_created).toBe(-1000);
        
        expect(result).toEqual(expected);
      },
    );
  },
);
