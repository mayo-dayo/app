import {
  z,
} from "astro:schema";

export const incoming_id =
  //
  z
    //
    .string()
    //
    .length(36);

export type incoming_id =
  //
  z.infer<
    typeof incoming_id
  >;

export const incoming_username =
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

export type incoming_username =
  //
  z.infer<
    typeof incoming_username
  >;

export const incoming_password =
  //
  z
    //
    .string()
    //
    .min(8)
    //
    .max(64);

export type incoming_password =
  //
  z.infer<
    typeof incoming_password
  >;
