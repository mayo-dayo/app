import {
  z,
} from "astro:schema";

import {
  defineMiddleware,
  sequence,
} from "astro:middleware";

import type {
  database_user,
} from "@/mayo/common/database_user";

import {
  context_get_or_init,
} from "@/mayo/server/context";

import {
  sign,
} from "@/mayo/server/crypto";

import {
  incoming_id,
} from "@/mayo/server/incoming";

const context =
  //
  defineMiddleware((
    //
    request,
    //
    next,
  ) => {
    request.locals.context =
      //
      context_get_or_init();

    return next();
  });

const authentication =
  //
  defineMiddleware((
    //
    request,
    //
    next,
  ) => {
    //
    //
    // dprint-ignore
    const needs_authentication =
      //
      //
      //

          request.url.pathname === "/" 

      ||  request.url.pathname === "/endpoints/audio_stream"

      /*
       *
       * `navigator.mediaSession` doesn't send cookies when fetching `artwork`?
       *
       * ||  request.url.pathname === "/endpoints/audio_thumbnail"
       *
       */

      ||  request.url.pathname.startsWith("/_actions");

    //
    //
    //
    //
    //
    //

    if (needs_authentication === false) {
      return next();
    }

    const schema =
      //
      z.object({
        user_id:
          //
          incoming_id,

        signature:
          //
          z.string(),
      });

    let payload;

    try {
      payload =
        //
        schema.parse(
          request.cookies
            //
            ?.get("token")
            //
            ?.json(),
        );
    } catch (e) {
      return request.redirect("/sign-up");
    }

    const {
      user_id,

      signature,
    } = payload;

    const {
      secret,

      database,
    } = request.locals.context;

    if (
      signature
        //
        !== sign(
          //
          secret,
          //
          user_id,
        )
    ) {
      return request.redirect("/sign-up");
    }

    const user = database
      //
      .query(`
        select

          name,

          perms

        from 

          users

        where 

          id = ?1;
      `)
      //
      .get(user_id) as Pick<database_user, "name" | "perms"> | null;

    if (
      user === null
    ) {
      return request.redirect("/sign-up");
    }

    request.locals.user =
      //
      {
        id:
          //
          user_id,

        ...user,
      };

    return next();
  });

export const onRequest =
  //
  sequence(
    //
    context,
    //
    authentication,
  );
