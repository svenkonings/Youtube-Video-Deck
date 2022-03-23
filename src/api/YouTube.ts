import type {Subscriptions} from "../model/Subscriptions";
import type {SubscriptionsList} from "../types/SubscriptionsList";
import type {ChannelMap} from "../types/ChannelMap";
import type {Subscription} from "../model/Subscription";
import {batchRequest, request, toRequest} from "./Gapi";

export async function listAllSubscriptions(): Promise<SubscriptionsList> {
  let subscriptionListResponse = await listSubscriptions();
  const etag = subscriptionListResponse.etag;
  const items = [subscriptionListResponse.items];
  while (subscriptionListResponse.nextPageToken) {
    subscriptionListResponse = await listSubscriptions(subscriptionListResponse.nextPageToken);
    items.push(subscriptionListResponse.items);
  }
  return {etag, items};
}

export function listSubscriptions(pageToken?: string): Promise<gapi.client.youtube.SubscriptionListResponse> {
  // TODO: Cache response with etags
  return request(listSubscriptionsRequest(pageToken)).then(response => response.json());
}

function listSubscriptionsRequest(pageToken?: string): Request {
  return toRequest('/youtube/v3/subscriptions', {
    method: 'GET',
    query: {
      part: 'snippet',
      fields: 'etag,items(snippet(title,description,resourceId/channelId)),nextPageToken',
      mine: 'true',
      maxResults: '50',
      ...pageToken && {pageToken: pageToken},
    },
  });
}

export async function listAllChannels(subscriptionItems: gapi.client.youtube.Subscription[][]): Promise<ChannelMap> {
  const requests = new Map(subscriptionItems.map((subscriptions, i) => [`${i}`, listChannelsRequest(subscriptions)]));
  const responses = await batchRequest('/youtube/v3', requests);
  const channelListResponses: gapi.client.youtube.ChannelListResponse[] =
      await Promise.all(Array.from(responses.values()).map(response => response.json()));
  return new Map(channelListResponses.flatMap(response => response.items.map(channel => [channel.id, channel])));
}

export function listChannels(subscriptions: gapi.client.youtube.Subscription[]): Promise<gapi.client.youtube.ChannelListResponse> {
  return request(listChannelsRequest(subscriptions)).then(response => response.json());
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
  const requests = new Map(subscriptions.items.map(subscription => [subscription.uploadsPlaylistId, listPlaylistItemsRequest(subscription)]));
  const responses = await batchRequest('/youtube/v3', requests);
  await Promise.all(subscriptions.items.map(async subscription => subscription.addUploads(await responses.get(subscription.uploadsPlaylistId).json())));
}

export async function listPlaylistItems(subscription: Subscription): Promise<void> {
  // TODO: Cache response with etags
  const response = await request(listPlaylistItemsRequest(subscription));
  const result = await response.json();
  subscription.addUploads(result);
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
