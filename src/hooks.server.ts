import type { Handle, HandleServerError } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { handleSession } from "svelte-kit-cookie-session";

import { getUser } from "$lib/server/db";
import { initClient, login } from "$lib/server/auth";
import { errorString } from "$lib/util/error";

export const handle = handleSession(
  {
    secret: env.SESSION_SECRET,
    rolling: 99,
    expires: 365,
  },
  async ({ event, resolve }) => {
    event.locals.auth = initClient();

    // Get user from session
    const session = event.locals.session.data;
    if (session.sub) {
      const user = await getUser(session.sub);
      event.locals.auth.setCredentials(user.credentials);
      event.locals.user = user;
      return resolve(event);
    }

    // Authorize user using code
    const code = event.url.searchParams.get("code");
    if (code) {
      const user = await login(event.locals.auth, code);
      await event.locals.session.set({ sub: user.sub });
      event.locals.auth.setCredentials(user.credentials);
      event.locals.user = user;
      return resolve(event);
    }

    // Continue without user
    return resolve(event);
  }
) satisfies Handle;

export const handleError = (({ error }) => {
  console.error(error);
  return {
    message: errorString(error),
  };
}) satisfies HandleServerError;
