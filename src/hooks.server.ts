import {Playlist} from "$lib/model/Playlist";
import {initClient, login} from "$lib/server/auth";
import {getUser, updateCredentials, updateSettings} from "$lib/server/db";
import type {User} from "$lib/server/model/User";
import {getChannelMap} from "$lib/server/youtube";
import {objectToErrorMessage} from "$lib/util/error";

import {env} from "$env/dynamic/private";

import type {Handle, HandleServerError} from "@sveltejs/kit";
import {handleSession} from "svelte-kit-cookie-session";

export const handle: Handle = handleSession(
  {secret: env.SESSION_SECRET as string, rolling: 99, expires: 365, expires_in: "days"},
  async ({event, resolve}) => {
    event.locals.auth = initClient();

    try {
      // Authorize user using code
      const code = event.url.searchParams.get("code");
      if (code) {
        const user = await login(event.locals.auth, code);
        console.debug(event.route, "Login user", user.sub, user.credentials);
        await event.locals.session.set({sub: user.sub});
        initUser(event.locals, user);
        await migrateUser(event.locals);
        return resolve(event);
      }

      // Get user from session
      const session = event.locals.session.data;
      if (session.sub) {
        const user = await getUser(session.sub);
        console.debug(event.route, "Found user", user.sub);
        initUser(event.locals, user);
        await checkSession(event.locals);
        await migrateUser(event.locals);
        return resolve(event);
      }
    } catch (e) {
      console.error("Error on handle", e);
      await clearSession(event.locals);
    }

    // Continue without user
    return resolve(event);
  },
);

function initUser(locals: App.Locals, user: User): void {
  locals.auth.on("tokens", async tokens => await updateCredentials(user.sub, tokens));
  locals.auth.setCredentials(user.credentials);
  locals.user = user;
}

/** These are for backwards compatibility only */
async function migrateUser(locals: App.Locals): Promise<void> {
  if (locals.user !== undefined && locals.user.settings.subscriptionGroups !== undefined) {
    const channelIds = locals.user.settings.subscriptionGroups.flatMap(sg => sg.subscriptionIds);
    const channelMap = await getChannelMap(locals.auth, channelIds);
    locals.user.settings.channelGroups = [];
    for (const subscriptionGroup of locals.user.settings.subscriptionGroups) {
      locals.user.settings.channelGroups.push({
        name: subscriptionGroup.name,
        expanded: subscriptionGroup.expanded,
        channels: subscriptionGroup.subscriptionIds.map(sId => ({
          channelId: sId.substring(2),
          title: channelMap[sId].snippet.title,
          thumbnailUrl: channelMap[sId].snippet.thumbnails.default.url,
          playlists: [Playlist("UU")],
        })),
      });
    }
    delete locals.user.settings.subscriptionGroups;
    await updateSettings(locals.user.sub, locals.user.settings);
  }
}

async function checkSession(locals: App.Locals): Promise<void> {
  try {
    await locals.auth.getAccessToken();
  } catch (e) {
    console.error("Error on check session", e);
    await clearSession(locals);
  }
}

async function clearSession(locals: App.Locals): Promise<void> {
  locals.auth.setCredentials({});
  locals.user = undefined;
  // await locals.session.destroy();
}

export const handleError: HandleServerError = ({error}) => {
  console.error("Server error", error);
  return {message: objectToErrorMessage(error)};
};
