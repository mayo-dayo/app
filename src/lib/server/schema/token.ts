import {
  z,
} from "astro:schema";

import {
  id,
} from "./id";

export const token =
  //
  z.object({
    user_id:
      //
      id,

    signature:
      //
      z.string(),
  });

export type token =
  //
  z.infer<typeof token>;
