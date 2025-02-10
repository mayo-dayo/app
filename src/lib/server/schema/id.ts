import {
  z,
} from "astro:schema";

export const id =
  //
  z
    //
    .string()
    //
    .length(36);

export type id =
  //
  z.infer<typeof id>;
