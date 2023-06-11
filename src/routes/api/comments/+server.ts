import type { RequestHandler } from "./$types";

import { loadComments } from "$lib/server/youtube";

import { error, json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.user) {
    throw error(401, "User not logged in");
  }
  const videoId = url.searchParams.get("videoId");
  if (!videoId) {
    throw error(400, "Missing required videoId param");
  }
  const pageToken = url.searchParams.get("pageToken") ?? undefined;
  const commentsResponse = await loadComments(locals.auth, videoId, pageToken);
  return json(commentsResponse);
};
