import type { Settings } from "$lib/model/Settings";
import { Subscription, addUploads } from "$lib/model/Subscription";
import type {
  Channel,
  ChannelListResponse,
  PlaylistItemListResponse,
  SubscriptionListResponse,
  VideoListResponse,
} from "$lib/types/google";

import google from "@googleapis/youtube";
import type { OAuth2Client } from "google-auth-library";

const youtube = google.youtube({
  version: "v3",
  http2: true,
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
  await Promise.all(result.map(s => (activeSubscriptions.has(s.channelId) ? loadUploads(auth, s) : undefined)));
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
  const channels = await listChannels(auth, subscriptions);
  const result: Record<string, Channel> = {};
  for (const channel of channels.items) {
    result[channel.id] = channel;
  }
  return result;
}

async function listChannels(auth: OAuth2Client, subscriptions: SubscriptionListResponse): Promise<ChannelListResponse> {
  const response = await youtube.channels.list({
    auth,
    part: ["contentDetails"],
    fields: "items(id,contentDetails/relatedPlaylists/uploads)",
    id: subscriptions.items.map(subscription => subscription.snippet.resourceId.channelId),
    maxResults: 50,
  });
  return response.data as ChannelListResponse;
}

export async function loadUploads(auth: OAuth2Client, subscription: Subscription): Promise<void> {
  const playlistItems = await listPlaylistItems(auth, subscription);
  const videos = await listVideos(auth, playlistItems);
  addUploads(subscription, playlistItems, videos);
}

async function listPlaylistItems(auth: OAuth2Client, subscription: Subscription): Promise<PlaylistItemListResponse> {
  const response = await youtube.playlistItems.list({
    auth,
    part: ["snippet"],
    fields: "items/snippet/resourceId/videoId,nextPageToken",
    playlistId: subscription.uploadsPlaylistId,
    maxResults: 50,
    pageToken: subscription.nextUploadPageToken,
  });
  return response.data as PlaylistItemListResponse;
}

async function listVideos(auth: OAuth2Client, playlistItems: PlaylistItemListResponse): Promise<VideoListResponse> {
  const response = await youtube.videos.list({
    auth,
    part: ["id", "snippet", "liveStreamingDetails", "contentDetails", "statistics"],
    fields:
      "items(id,snippet(title,description,thumbnails/medium/url,publishedAt),liveStreamingDetails(actualStartTime,scheduledStartTime),contentDetails/duration,statistics(viewCount,likeCount,commentCount))",
    id: playlistItems.items.map(item => item.snippet.resourceId.videoId),
    maxResults: 50,
  });
  return response.data as VideoListResponse;
}
