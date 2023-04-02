import { generateAuthUrl } from "$lib/server/auth";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  if (!locals.user) {
    const authUrl = generateAuthUrl(locals.auth);
    return { isSignedIn: false, authUrl } as const;
  } else {
    const settings = locals.user.settings;
    return { isSignedIn: true, settings } as const;
  }
}) satisfies PageServerLoad;

export const actions = {
  logout: async ({ locals }) => {
    await Promise.all([locals.auth.revokeCredentials(), locals.session.destroy()]);
    locals.user = undefined;
  },
} satisfies Actions;
