import type {Subscriptions} from "../model/Subscriptions";
import type {SubscriptionsList} from "../types/SubscriptionsList";
import type {ChannelMap} from "../types/ChannelMap";
import type {Subscription} from "../model/Subscription";
import {addUploads, setUploads} from "../model/Subscription";
import {batchRequest, request, toRequest} from "./Gapi";
import type {Settings} from "../model/Settings";

export async function listAllSubscriptions(storedEtag?: string): Promise<SubscriptionsList> {
  let subscriptionListResponse = await listSubscriptions({etag: storedEtag});
  const etag = subscriptionListResponse.etag;
  const items = [subscriptionListResponse.items];
  while (subscriptionListResponse.nextPageToken) {
    subscriptionListResponse = await listSubscriptions({pageToken: subscriptionListResponse.nextPageToken});
    items.push(subscriptionListResponse.items);
  }
  return {etag, items};
}

export async function listSubscriptions(args: { pageToken?: string, etag?: string } = {}): Promise<gapi.client.youtube.SubscriptionListResponse> {
  let response = await request(listSubscriptionsRequest(args));
  return response.json();
}

function listSubscriptionsRequest(args: { pageToken?: string, etag?: string } = {}): Request {
  return toRequest('/youtube/v3/subscriptions', {
    method: 'GET',
    query: {
      part: 'snippet',
      fields: 'etag,items(snippet(title,resourceId/channelId,thumbnails/default/url)),nextPageToken',
      mine: 'true',
      order: 'alphabetical',
      maxResults: '50',
      ...args.pageToken && {pageToken: args.pageToken},
    },
    ...args.etag && {etag: args.etag},
  });
}

export async function listAllChannels(subscriptionItems: gapi.client.youtube.Subscription[][]): Promise<ChannelMap> {
  const requests = new Map(subscriptionItems.map((subscriptions, i) => [`${i}`, listChannelsRequest(subscriptions)]));
  const responses = await batchRequest('/youtube/v3', requests);
  const channelListResponses: gapi.client.youtube.ChannelListResponse[] =
      await Promise.all(Array.from(responses.values()).map(response => response.json()));
  return new Map(channelListResponses.flatMap(response => response.items.map(channel => [channel.id, channel])));
}

export async function listChannels(subscriptions: gapi.client.youtube.Subscription[]): Promise<gapi.client.youtube.ChannelListResponse> {
  let response = await request(listChannelsRequest(subscriptions));
  return response.json();
}

function listChannelsRequest(subscriptions: gapi.client.youtube.Subscription[]): Request {
  return toRequest('/youtube/v3/channels', {
    method: 'GET',
    query: {
      part: 'contentDetails',
      fields: 'items(id,contentDetails/relatedPlaylists/uploads)',
      id: subscriptions.map(subscription => subscription.snippet.resourceId.channelId).join(','),
      maxResults: '50',
    },
  });
}

export async function listAllPlaylistItems(subscriptions: Subscriptions, settings: Settings): Promise<void> {
  const subscriptionIds = new Set(settings.subscriptionGroups.flatMap(s => s.subscriptionIds));
  if (subscriptionIds.size > 0) {
    const activeSubscriptions = subscriptions.items.filter(s => subscriptionIds.has(s.channelId));
    const requests = new Map(activeSubscriptions.map(subscription => [subscription.uploadsPlaylistId, listPlaylistItemsRequest(subscription, true)]));
    const responses = await batchRequest('/youtube/v3', requests);
    await Promise.all(activeSubscriptions.map(subscription => listPlaylistItemsResponse(subscription, responses.get(subscription.uploadsPlaylistId), true)));
  }
}

export async function listPlaylistItems(subscription: Subscription): Promise<void> {
  const response = await request(listPlaylistItemsRequest(subscription, false));
  await listPlaylistItemsResponse(subscription, response, false)
}

function listPlaylistItemsRequest(subscription: Subscription, initial: boolean): Request {
  return toRequest('/youtube/v3/playlistItems', {
    method: 'GET',
    query: {
      part: 'snippet',
      fields: 'etag,items(snippet(title,description,publishedAt,thumbnails/medium/url,resourceId/videoId)),nextPageToken',
      playlistId: subscription.uploadsPlaylistId,
      maxResults: '50',
      ...!initial && subscription.nextUploadPageToken && {pageToken: subscription.nextUploadPageToken},
    },
    ...initial && subscription.uploadsEtag && {etag: subscription.uploadsEtag},
  });
}

async function listPlaylistItemsResponse(subscription: Subscription, response: Response, initial: boolean): Promise<void> {
  if (response.status === 304) return; // Not Modified
  if (!response.ok) throw response;
  const uploads = await response.json();
  initial ? setUploads(subscription, uploads) : addUploads(subscription, uploads);
}
