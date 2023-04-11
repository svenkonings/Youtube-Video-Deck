import type { OAuth2Client } from "google-auth-library";
import google from "@googleapis/youtube";
import type { All } from "$lib/util/types";
import { Subscription } from "$lib/model/Subscription";

const youtube = google.youtube({
  version: "v3",
  http2: true,
});

export async function getSubscriptions(auth: OAuth2Client, pageToken?: string) {
  const subscriptions = await listSubscriptions(auth, pageToken);
  let nextPage;
  if (subscriptions.nextPageToken) {
    nextPage = getSubscriptions(auth, subscriptions.nextPageToken);
  }
  const channelMap = await getChannelMap(auth, subscriptions);
  let result = subscriptions.items.map(subscription =>
    Subscription(subscription, channelMap[subscription.snippet.resourceId.channelId])
  );
  if (nextPage) {
    result = result.concat(await nextPage);
  }
  return result;
}

async function listSubscriptions(
  auth: OAuth2Client,
  pageToken?: string
): Promise<All<google.youtube_v3.Schema$SubscriptionListResponse>> {
  const response = await youtube.subscriptions.list({
    auth,
    part: ["snippet"],
    fields: "items(snippet(title,resourceId/channelId,thumbnails/default/url)),nextPageToken",
    mine: true,
    order: "alphabetical",
    maxResults: 50,
    pageToken,
  });
  return response.data as All<google.youtube_v3.Schema$SubscriptionListResponse>;
}

async function getChannelMap(
  auth: OAuth2Client,
  subscriptions: All<google.youtube_v3.Schema$SubscriptionListResponse>
): Promise<Record<string, All<google.youtube_v3.Schema$Channel>>> {
  const channels = await listChannels(auth, subscriptions);
  const result: Record<string, All<google.youtube_v3.Schema$Channel>> = {};
  for (const channel of channels.items) {
    result[channel.id] = channel;
  }
  return result;
}

async function listChannels(
  auth: OAuth2Client,
  subscriptions: All<google.youtube_v3.Schema$SubscriptionListResponse>
): Promise<All<google.youtube_v3.Schema$ChannelListResponse>> {
  const response = await youtube.channels.list({
    auth,
    part: ["contentDetails"],
    fields: "items(id,contentDetails/relatedPlaylists/uploads)",
    id: subscriptions.items.map(subscription => subscription.snippet.resourceId.channelId),
    maxResults: 50,
  });
  return response.data as All<google.youtube_v3.Schema$ChannelListResponse>;
}
