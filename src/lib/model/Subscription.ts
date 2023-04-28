import type { Video } from "$lib/model/Video";
import type { Channel, YTSubscription } from "$lib/types/google";

export type Subscription = {
  readonly channelId: string;
  readonly title: string;
  readonly thumbnailUrl: string;
  readonly uploadsPlaylistId: string;
  // uploadsEtag?: string;
  nextUploadPageToken?: string;
  uploads: Video[];
};

export function Subscription(subscription: YTSubscription, channel: Channel): Subscription {
  return {
    channelId: subscription.snippet.resourceId.channelId,
    title: subscription.snippet.title,
    thumbnailUrl: subscription.snippet.thumbnails.default.url,
    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
    uploads: [],
  };
}

// export function setUploads(
//   subscription: Subscription,
//   playListItems: PlaylistItemListResponse,
//   videos: VideoListResponse
// ): void {
//   subscription.uploadsEtag = playListItems.etag;
//   subscription.nextUploadPageToken = playListItems.nextPageToken;
//   subscription.uploads = videos.items.map(upload => Video(upload, subscription));
// }

// export function addUploads(
//   subscription: Subscription,
//   playListItems: PlaylistItemListResponse,
//   videos: VideoListResponse
// ): void {
//   subscription.nextUploadPageToken = playListItems.nextPageToken;
//   videos.items.forEach(upload => subscription.uploads.push(Video(upload, subscription)));
// }