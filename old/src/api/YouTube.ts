import type {Subscriptions} from "../model/Subscriptions";
import type {SubscriptionsList} from "../types/SubscriptionsList";
import type {ChannelMap} from "../types/ChannelMap";
import type {Subscription} from "../model/Subscription";
import {addUploads, setUploads} from "../model/Subscription";
import {batchRequest, request, toRequest} from "./Gapi";
import type {Settings} from "../model/Settings";
import type {ListVideoRequest} from "../types/ListVideoRequest";

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
    const listVideoRequests = await Promise.all(activeSubscriptions.map(subscription => listPlaylistItemsResponse(subscription, responses.get(subscription.uploadsPlaylistId), true)));
    await listAllVideos(listVideoRequests);
  }
}

export async function listPlaylistItems(subscription: Subscription): Promise<void> {
  const response = await request(listPlaylistItemsRequest(subscription, false));
  const listVideoRequest = await listPlaylistItemsResponse(subscription, response, false);
  await listVideos(listVideoRequest);
}

function listPlaylistItemsRequest(subscription: Subscription, initial: boolean): Request {
  return toRequest('/youtube/v3/playlistItems', {
    method: 'GET',
    query: {
      part: 'snippet',
      fields: 'etag,items/snippet/resourceId/videoId,nextPageToken',
      playlistId: subscription.uploadsPlaylistId,
      maxResults: '50',
      ...!initial && subscription.nextUploadPageToken && {pageToken: subscription.nextUploadPageToken},
    },
    ...initial && subscription.uploadsEtag && {etag: subscription.uploadsEtag},
  });
}

async function listPlaylistItemsResponse(subscription: Subscription, response: Response, initial: boolean): Promise<ListVideoRequest> {
  if (response.status === 304) return null; // Not Modified
  if (!response.ok) throw response;
  const playListItemListResponse = await response.json();
  return {
    subscription,
    playListItemListResponse,
    initial
  }
}

async function listAllVideos(listVideoRequests: ListVideoRequest[]): Promise<void> {
  const activeRequests = listVideoRequests.filter(request => !!request);
  if (activeRequests.length > 0) {
    const requests = new Map(activeRequests.map(listVideoRequest => [listVideoRequest.subscription.channelId, listVideosRequest(listVideoRequest.playListItemListResponse)]));
    const responses = await batchRequest('/youtube/v3', requests);
    await Promise.all(activeRequests.map(listVideoRequest => listVideosResponse(listVideoRequest, responses.get(listVideoRequest.subscription.channelId))));
  }
}

async function listVideos(listVideoRequest: ListVideoRequest): Promise<void> {
  const response = await request(listVideosRequest(listVideoRequest.playListItemListResponse));
  await listVideosResponse(listVideoRequest, response);
}

function listVideosRequest(playListItems: gapi.client.youtube.PlaylistItemListResponse): Request {
  return toRequest('/youtube/v3/videos', {
    method: 'GET',
    query: {
      part: 'id,snippet,liveStreamingDetails,contentDetails,statistics',
      fields: 'items(id,snippet(title,description,thumbnails/medium/url,publishedAt),liveStreamingDetails(actualStartTime,scheduledStartTime),contentDetails/duration,statistics(viewCount,likeCount,commentCount))',
      id: playListItems.items.map(item => item.snippet.resourceId.videoId).join(','),
      maxResults: '50',
    }
  });
}

async function listVideosResponse(listVideoRequest: ListVideoRequest, response: Response): Promise<void> {
  if (response.status === 304) return; // Not Modified
  if (!response.ok) throw response;
  const videos = await response.json();
  if (listVideoRequest.initial) {
    setUploads(listVideoRequest.subscription, listVideoRequest.playListItemListResponse, videos)
  } else {
    addUploads(listVideoRequest.subscription, listVideoRequest.playListItemListResponse, videos);
  }
}
