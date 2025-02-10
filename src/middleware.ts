import {
  context_get_or_init,
} from "@/lib/server/context/get_or_init";

import {
  is_protected_route,
} from "@/lib/server/is_protected_route";

import {
  token,
} from "@/lib/server/schema/token";

import {
  sign,
} from "@/lib/server/sign";

import type {
  user,
} from "@/lib/server/types/user";

import {
  defineMiddleware,
  sequence,
} from "astro:middleware";

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
    const on_error =
      //
      (
        redirect:
          //
          string,
      ) =>
        //
        is_protected_route(request.url)
          //
          ? request.redirect(redirect)
          //
          : next();

    let payload;

    try {
      payload =
        //
        token.parse(
          request.cookies
            //
            ?.get("token")
            //
            ?.json(),
        );
    } catch (e) {
      return on_error("/sign-up");
    }

    const {
      database,

      secret,
    } = request.locals.context;

    if (
      payload.signature
        //
        !== sign(
          //
          secret,
          //
          payload.user_id,
        )
    ) {
      return on_error("/sign-in");
    }

    const user =
      //
      database
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
        .get(payload.user_id) as Pick<user, "name" | "perms"> | null;

    if (user === null) {
      return on_error("/sign-up");
    }

    request.locals.user =
      //
      {
        id:
          //
          payload.user_id,

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
