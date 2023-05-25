import type { Actions, PageServerLoad } from "./$types";

import { generateAuthUrl } from "$lib/server/auth";

import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = ({ locals }) => {
  if (!locals.user) {
    return { isSignedIn: false } as const;
  } else {
    return {
      isSignedIn: true,
      settings: locals.user.settings,
    } as const;
  }
};

export const actions: Actions = {
  login: ({ locals }) => {
    const authUrl = generateAuthUrl(locals.auth);
    throw redirect(303, authUrl);
  },
  logout: async ({ locals }) => {
    await Promise.all([locals.auth.revokeCredentials(), locals.session.destroy()]);
    locals.user = undefined;
  },
};
