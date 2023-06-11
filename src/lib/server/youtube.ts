import { type Comment, Comments } from "$lib/model/Comment";
import type { Settings } from "$lib/model/Settings";
import { Subscription } from "$lib/model/Subscription";
import { Video } from "$lib/model/Video";
import type { VideosResponse } from "$lib/types/VideosResponse";
import type {
  Channel,
  ChannelListResponse,
  CommentThreadListResponse,
  PlaylistItemListResponse,
  SubscriptionListResponse,
  VideoListResponse,
} from "$lib/types/google";

import google from "@googleapis/youtube";
import type { OAuth2Client } from "google-auth-library";

const youtube = google.youtube({
  version: "v3",
  http2: true,
  retry: true,
});

export async function loadSubscriptions(auth: OAuth2Client, settings: Settings): Promise<Subscription[]> {
  const activeSubscriptions = new Set(settings.subscriptionGroups.flatMap(s => s.subscriptionIds));
  return await loadAllSubscriptions(auth, activeSubscriptions);
}

async function loadAllSubscriptions(
  auth: OAuth2Client,
  activeSubscriptions: Set<string>,
  pageToken?: string
): Promise<Subscription[]> {
  const subscriptions = await listSubscriptions(auth, pageToken);
  let nextPage;
  if (subscriptions.nextPageToken) {
    nextPage = loadAllSubscriptions(auth, activeSubscriptions, subscriptions.nextPageToken);
  }
  const channelMap = await getChannelMap(auth, subscriptions);
  let result = subscriptions.items.map(subscription =>
    Subscription(subscription, channelMap[subscription.snippet.resourceId.channelId])
  );
  // Load uploads of active subscriptions
  await Promise.all(result.filter(s => activeSubscriptions.has(s.channelId)).map(s => loadUploads(auth, s)));
  if (nextPage) {
    result = result.concat(await nextPage);
  }
  return result;
}

async function listSubscriptions(auth: OAuth2Client, pageToken?: string): Promise<SubscriptionListResponse> {
  const response = await youtube.subscriptions.list({
    auth,
    part: ["snippet"],
    fields: "items/snippet(title,resourceId/channelId,thumbnails/default/url),nextPageToken",
    mine: true,
    order: "alphabetical",
    maxResults: 50,
    pageToken,
  });
  return response.data as SubscriptionListResponse;
}

async function getChannelMap(
  auth: OAuth2Client,
  subscriptions: SubscriptionListResponse
): Promise<Record<string, Channel>> {
  const channelIds = subscriptions.items.map(subscription => subscription.snippet.resourceId.channelId);
  const channels = await listChannels(auth, channelIds);
  const result: Record<string, Channel> = {};
  for (const channel of channels.items) {
    result[channel.id] = channel;
  }
  return result;
}

async function listChannels(auth: OAuth2Client, id: string[]): Promise<ChannelListResponse> {
  const response = await youtube.channels.list({
    auth,
    part: ["contentDetails"],
    fields: "items(id,contentDetails/relatedPlaylists/uploads)",
    id,
    maxResults: 50,
  });
  return response.data as ChannelListResponse;
}

export async function loadUploads(auth: OAuth2Client, subscription: Subscription): Promise<void> {
  if (subscription.nextUploadPageToken === false) return;
  const videosResponse = await loadVideos(
    auth,
    subscription.title,
    subscription.uploadsPlaylistId,
    subscription.nextUploadPageToken
  );
  subscription.nextUploadPageToken = videosResponse.nextPageToken == null ? false : videosResponse.nextPageToken;
  subscription.uploads.push(...videosResponse.videos);
}

export async function loadVideos(
  auth: OAuth2Client,
  channelTitle: string,
  playlistId: string,
  pageToken?: string
): Promise<VideosResponse> {
  const playlistItems = await listPlaylistItems(auth, playlistId, pageToken);
  const videoIds = playlistItems.items.map(item => item.snippet.resourceId.videoId);
  const videos = await listVideos(auth, videoIds);
  return {
    videos: videos.items.map(v => Video(v, channelTitle)),
    nextPageToken: playlistItems.nextPageToken,
  };
}

async function listPlaylistItems(
  auth: OAuth2Client,
  playlistId: string,
  pageToken?: string
): Promise<PlaylistItemListResponse> {
  const response = await youtube.playlistItems.list({
    auth,
    part: ["snippet"],
    fields: "items/snippet/resourceId/videoId,nextPageToken",
    playlistId,
    maxResults: 50,
    pageToken,
  });
  return response.data as PlaylistItemListResponse;
}

async function listVideos(auth: OAuth2Client, id: string[]): Promise<VideoListResponse> {
  const response = await youtube.videos.list({
    auth,
    part: ["id", "snippet", "liveStreamingDetails", "contentDetails", "statistics"],
    fields:
      "items(id,snippet(title,description,thumbnails/medium/url,publishedAt),liveStreamingDetails(actualStartTime,scheduledStartTime),contentDetails/duration,statistics(viewCount,likeCount,commentCount))",
    id,
    maxResults: 50,
  });
  return response.data as VideoListResponse;
}

export async function loadComments(auth: OAuth2Client, videoId: string, pageToken?: string): Promise<Comment[]> {
  const commentThreads = await listCommentThreads(auth, videoId, pageToken);
  return Comments(commentThreads);
}

async function listCommentThreads(
  auth: OAuth2Client,
  videoId: string,
  pageToken?: string
): Promise<CommentThreadListResponse> {
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
  return response.data as CommentThreadListResponse;
}
