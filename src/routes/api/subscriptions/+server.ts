import type { RequestHandler } from "./$types";

import { loadSubscriptions } from "$lib/server/youtube";

import { error, json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, "User not logged in");
  }
  const subscriptionsResponse = await loadSubscriptions(locals.auth, locals.user.settings);
  return json(subscriptionsResponse);
};
