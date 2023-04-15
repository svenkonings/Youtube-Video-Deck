import type { Actions, PageServerLoad } from "./$types";

import { generateAuthUrl } from "$lib/server/auth";
import { getSubscriptions } from "$lib/server/youtube";

import { redirect } from "@sveltejs/kit";

export const load = (({ locals }) => {
  if (!locals.user) {
    return { isSignedIn: false } as const;
  } else {
    return {
      isSignedIn: true,
      settings: locals.user.settings,
      streamed: {
        subscriptions: getSubscriptions(locals.auth),
      },
    } as const;
  }
}) satisfies PageServerLoad;

export const actions = {
  login: ({ locals }) => {
    const authUrl = generateAuthUrl(locals.auth);
    throw redirect(303, authUrl);
  },
  logout: async ({ locals }) => {
    await Promise.all([locals.auth.revokeCredentials(), locals.session.destroy()]);
    locals.user = undefined;
  },
} satisfies Actions;
