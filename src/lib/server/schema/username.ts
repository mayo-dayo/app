import {
  z,
} from "astro:schema";

export const username =
  //
  z
    //
    .string()
    //
    .min(3)
    //
    .max(24)
    //
    .regex(/^[a-zA-Z0-9]+$/);

export type username =
  //
  z.infer<typeof username>;
