import type { RequestHandler } from "./$types";

import { loadDescription } from "$lib/server/youtube";

import { error, text } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.user) {
    throw error(401, "User not logged in");
  }
  const videoId = url.searchParams.get("videoId");
  if (!videoId) {
    throw error(400, "Missing required videoId param");
  }
  const descriptionResponse = await loadDescription(locals.auth, videoId);
  return text(descriptionResponse);
};
