import {
  defineMiddleware,
  sequence,
} from "astro:middleware";

import {
  z,
} from "astro:schema";

import {
  context_get_or_init,
} from "@/context";

import {
  sign,
} from "@/crypto";

import {
  incoming_id,
} from "@/schema";

import type {
  database_user,
} from "@/database";

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
    const needs_authentication =
      // dprint-ignore
      request.url.pathname === "/" 

      ||  request.url.pathname === "/endpoints/audio"

      ||  request.url.pathname.startsWith("/_actions");

    if (
      !needs_authentication
    ) {
      return next();
    }

    const cookie =
      //
      request.cookies.get("token");

    if (
      !cookie
    ) {
      return request.redirect("/sign-up");
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
      payload = schema.parse(
        cookie.json(),
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
      signature !== sign(
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
        id: user_id,

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
