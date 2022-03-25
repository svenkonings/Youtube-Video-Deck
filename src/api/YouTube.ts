import type {Subscriptions} from "../model/Subscriptions";
import type {SubscriptionsList} from "../types/SubscriptionsList";
import type {ChannelMap} from "../types/ChannelMap";
import type {Subscription} from "../model/Subscription";
import {addUploads} from "../model/Subscription";
import {batchRequest, request, toRequest} from "./Gapi";

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
      fields: 'etag,items(snippet(title,resourceId/channelId)),nextPageToken',
      mine: 'true',
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

export async function listAllPlaylistItems(subscriptions: Subscriptions): Promise<void> {
  // TODO: Cache response with etags
  const requests = new Map(subscriptions.items.map(subscription => [subscription.uploadsPlaylistId, listPlaylistItemsRequest(subscription)]));
  const responses = await batchRequest('/youtube/v3', requests);
  await Promise.all(subscriptions.items.map(async subscription => addUploads(subscription, await responses.get(subscription.uploadsPlaylistId).json())));
}

export async function listPlaylistItems(subscription: Subscription): Promise<void> {
  const response = await request(listPlaylistItemsRequest(subscription));
  const result = await response.json();
  addUploads(subscription, result);
}

function listPlaylistItemsRequest(subscription: Subscription): Request {
  return toRequest('/youtube/v3/playlistItems', {
    method: 'GET',
    query: {
      part: 'snippet',
      fields: 'etag,items(snippet(title,description,publishedAt,thumbnails/medium/url,resourceId/videoId)),nextPageToken',
      playlistId: subscription.uploadsPlaylistId,
      maxResults: '50',
      ...subscription.nextUploadPageToken && {pageToken: subscription.nextUploadPageToken},
    },
  });
}
