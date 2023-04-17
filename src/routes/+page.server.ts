import type { Actions, PageServerLoad } from "./$types";

import { generateAuthUrl } from "$lib/server/auth";
import { updateExpanded } from "$lib/server/db";
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
  toggleExpanded: async ({ locals, request }) => {
    if (!locals.user) {
      throw new Error("Toggle expanded without user");
    }
    const data = await request.formData();
    const index = Number(data.get("index"));
    const value = !locals.user.settings.subscriptionGroups[index].expanded;
    await updateExpanded(locals.user.sub, index, value);
    locals.user.settings.subscriptionGroups[index].expanded = value;
  },
} satisfies Actions;
