import { initClient, login } from "$lib/server/auth";
import { getUser, updateCredentials } from "$lib/server/db";
import type { User } from "$lib/server/model/User";
import { errorString } from "$lib/util/error";

import { env } from "$env/dynamic/private";

import type { Handle, HandleServerError } from "@sveltejs/kit";
import { handleSession } from "svelte-kit-cookie-session";

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
      initUser(event.locals, user);
      return resolve(event);
    }

    // Authorize user using code
    const code = event.url.searchParams.get("code");
    if (code) {
      const user = await login(event.locals.auth, code);
      await event.locals.session.set({ sub: user.sub });
      initUser(event.locals, user);
      return resolve(event);
    }

    // Continue without user
    return resolve(event);
  }
) satisfies Handle;

function initUser(locals: App.Locals, user: User): void {
  locals.auth.on("tokens", async tokens => await updateCredentials(user.sub, tokens));
  locals.auth.setCredentials(user.credentials);
  locals.user = user;
}

export const handleError = (({ error }) => {
  console.error(error);
  return {
    message: errorString(error),
  };
}) satisfies HandleServerError;
