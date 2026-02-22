import {Channel} from "$lib/model/Channel";
import {Comments, type Comment} from "$lib/model/Comment";
import {Video} from "$lib/model/Video";
import type {
  YTChannel,
  YTChannelListResponse,
  YTCommentThreadListResponse,
  YTPlaylistItemListResponse,
  YTSubscriptionListResponse,
  YTVideoListResponse,
} from "$lib/types/google";
import type {VideosResponse} from "$lib/types/VideosResponse";
import {hasProperty} from "$lib/util/types";

import google from "@googleapis/youtube";
import type {OAuth2Client} from "google-auth-library";

const youtube = google.youtube({version: "v3", retry: true});

export async function loadSubscriptions(auth: OAuth2Client, pageToken?: string): Promise<Channel[]> {
  const subscriptions = await listSubscriptions(auth, pageToken);
  let result = subscriptions.items.map(Channel);
  if (subscriptions.nextPageToken) {
    result = result.concat(await loadSubscriptions(auth, subscriptions.nextPageToken));
  }
  return result;
}

async function listSubscriptions(auth: OAuth2Client, pageToken?: string): Promise<YTSubscriptionListResponse> {
  const response = await youtube.subscriptions.list({
    auth,
    part: ["snippet"],
    fields: "items/snippet(title,resourceId/channelId,thumbnails/default/url),nextPageToken",
    mine: true,
    order: "alphabetical",
    maxResults: 50,
    pageToken,
  });
  return response.data as YTSubscriptionListResponse;
}

/**
 * These are for backwards compatibility only,
 * used to retrieve additional channel information while converting subscriptionGroups to channelGroups
 */
export async function getChannelMap(auth: OAuth2Client, channelIds: string[]): Promise<Record<string, YTChannel>> {
  const result: Record<string, YTChannel> = {};
  for (let i = 0; i < channelIds.length; i += 50) {
    const channelIdSlice = channelIds.slice(i, Math.min(i + 50, channelIds.length));
    const channels = await listChannels(auth, channelIdSlice);
    for (const channel of channels.items) {
      result[channel.id] = channel;
    }
  }
  return result;
}

async function listChannels(auth: OAuth2Client, id: string[]): Promise<YTChannelListResponse> {
  const response = await youtube.channels.list({
    auth,
    part: ["snippet"],
    fields: "items(id,snippet(title,thumbnails/default/url))",
    id,
    maxResults: 50,
  });
  return response.data as YTChannelListResponse;
}

export async function loadVideos(auth: OAuth2Client, playlistId: string, pageToken?: string): Promise<VideosResponse> {
  let playlistItems: YTPlaylistItemListResponse;
  try {
    playlistItems = await listPlaylistItems(auth, playlistId, pageToken);
  } catch (e: unknown) {
    if (hasProperty(e, "response") && hasProperty(e.response, "status") && e.response.status === 404) {
      return {videos: []};
    } else {
      throw e;
    }
  }
  const videoIds = playlistItems.items.map(item => item.snippet.resourceId.videoId);
  const videos = await listVideos(auth, videoIds);
  return {videos: videos.items.map(Video), nextPageToken: playlistItems.nextPageToken};
}

async function listPlaylistItems(
  auth: OAuth2Client,
  playlistId: string,
  pageToken?: string,
): Promise<YTPlaylistItemListResponse> {
  const response = await youtube.playlistItems.list({
    auth,
    part: ["snippet"],
    fields: "items/snippet/resourceId/videoId,nextPageToken",
    playlistId,
    maxResults: 50,
    pageToken,
  });
  return response.data as YTPlaylistItemListResponse;
}

async function listVideos(auth: OAuth2Client, id: string[]): Promise<YTVideoListResponse> {
  const response = await youtube.videos.list({
    auth,
    part: ["id", "snippet", "liveStreamingDetails", "contentDetails", "statistics"],
    fields:
      "items(id,snippet(channelTitle,title,description,thumbnails/medium/url,publishedAt),liveStreamingDetails(actualStartTime,scheduledStartTime),contentDetails/duration,statistics(viewCount,likeCount,commentCount))",
    id,
    maxResults: 50,
  });
  return response.data as YTVideoListResponse;
}

export async function loadComments(auth: OAuth2Client, videoId: string, pageToken?: string): Promise<Comment[]> {
  const commentThreads = await listCommentThreads(auth, videoId, pageToken);
  return Comments(commentThreads);
}

async function listCommentThreads(
  auth: OAuth2Client,
  videoId: string,
  pageToken?: string,
): Promise<YTCommentThreadListResponse> {
  const response = await youtube.commentThreads.list({
    auth,
    part: ["snippet", "replies"],
    fields:
      "items(snippet(topLevelComment(snippet(textDisplay,authorDisplayName,authorProfileImageUrl,authorChannelUrl,likeCount,publishedAt,updatedAt))),replies(comments(snippet(textDisplay,authorDisplayName,authorProfileImageUrl,authorChannelUrl,likeCount,publishedAt,updatedAt)))),nextPageToken",
    videoId,
    maxResults: 100,
    order: "relevance",
    pageToken,
  });
  return response.data as YTCommentThreadListResponse;
}
