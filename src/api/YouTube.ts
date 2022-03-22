import type {Subscriptions} from "../model/Subscriptions";
import type {SubscriptionsList} from "../types/SubscriptionsList";
import type {ChannelMap} from "../types/ChannelMap";
import type {Subscription} from "../model/Subscription";
import {batchRequest, request} from "./Gapi";

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
  return request('/youtube/v3/subscriptions', {
    method: 'GET',
    query: {
      part: 'snippet',
      fields: 'etag,items(snippet(title,description,resourceId/channelId)),nextPageToken',
      mine: 'true',
      maxResults: '50',
      ...pageToken && {pageToken: pageToken},
    },
  }).then(response => response.json());
}

export async function listAllChannels(subscriptionItems: gapi.client.youtube.Subscription[][]): Promise<ChannelMap> {
  const responses = await batchRequest('/youtube/v3', subscriptionItems.map((subscriptions, i) => {
    return {
      id: `${i}`,
      method: 'GET',
      path: '/youtube/v3/channels',
      query: {
        part: 'contentDetails',
        fields: 'items(id,contentDetails/relatedPlaylists/uploads)',
        id: subscriptions.map(subscription => subscription.snippet.resourceId.channelId).join(','),
        maxResults: '50',
      },
    }
  }));
  const channelListResponses: gapi.client.youtube.ChannelListResponse[] =
      await Promise.all(Array.from(responses.values()).map(response => response.json()));
  return new Map(channelListResponses.flatMap(response => response.items.map(channel => [channel.id, channel])));
}

export async function listAllPlaylistItems(subscriptions: Subscriptions): Promise<void> {
  const responses = await batchRequest('/youtube/v3', subscriptions.items.map(subscription => {
    return {
      id: subscription.uploadsPlaylistId,
      method: 'GET',
      path: '/youtube/v3/playlistItems',
      query: {
        part: 'snippet',
        fields: 'etag,items(snippet(title,description,publishedAt,thumbnails/medium/url,resourceId/videoId)),nextPageToken',
        playlistId: subscription.uploadsPlaylistId,
        maxResults: '50',
        ...subscription.nextUploadPageToken && {pageToken: subscription.nextUploadPageToken},
      },
    }
  }));
  await Promise.all(subscriptions.items.map(async subscription => subscription.addUploads(await responses.get(subscription.uploadsPlaylistId).json())));
}

export async function listPlaylistItems(subscription: Subscription): Promise<void> {
  // TODO: Cache response with etags
  const response = await request('/youtube/v3/playlistItems', {
    method: 'GET',
    query: {
      part: 'snippet',
      fields: 'etag,items(snippet(title,description,publishedAt,thumbnails/medium/url,resourceId/videoId)),nextPageToken',
      playlistId: subscription.uploadsPlaylistId,
      maxResults: '50',
      ...subscription.nextUploadPageToken && {pageToken: subscription.nextUploadPageToken},
    },
  });
  const result = await response.json();
  subscription.addUploads(result);
}
