import {
  z,
} from "astro:schema";

export const password =
  //
  z
    //
    .string()
    //
    .min(8)
    //
    .max(64);

export type password =
  //
  z.infer<typeof password>;
