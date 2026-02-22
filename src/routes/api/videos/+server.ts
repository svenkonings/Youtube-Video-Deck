import type { RequestHandler } from "./$types";

import { loadVideos } from "$lib/server/youtube";

import { error, json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.user) {
    throw error(401, "User not logged in");
  }
  const playlistId = url.searchParams.get("playlistId");
  if (!playlistId) {
    throw error(400, "Missing required playlistId param");
  }
  const pageToken = url.searchParams.get("pageToken") ?? undefined;
  const videosResponse = await loadVideos(locals.auth, playlistId, pageToken);
  return json(videosResponse);
};
