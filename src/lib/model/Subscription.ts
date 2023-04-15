import type { All } from "$lib/util/types";

import type google from "@googleapis/youtube";

// import {Video} from "./Video";

export type Subscription = {
  readonly channelId: string;
  readonly title: string;
  readonly thumbnailUrl: string;
  readonly uploadsPlaylistId: string;
  // uploadsEtag?: string;
  // nextUploadPageToken?: string;
  // uploads: Video[];
};

export function Subscription(
  subscription: All<google.youtube_v3.Schema$Subscription>,
  channel: All<google.youtube_v3.Schema$Channel>
): Subscription {
  return {
    channelId: subscription.snippet.resourceId.channelId,
    title: subscription.snippet.title,
    thumbnailUrl: subscription.snippet.thumbnails.default.url,
    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
    // uploads: [],
  };
}

// export function setUploads(subscription: Subscription, playListItems: gapi.client.youtube.PlaylistItemListResponse, videos: gapi.client.youtube.VideoListResponse): void {
//   subscription.uploadsEtag = playListItems.etag;
//   subscription.nextUploadPageToken = playListItems.nextPageToken;
//   subscription.uploads = videos.items.map(upload => Video(upload, subscription))
// }

// export function addUploads(subscription: Subscription, playListItems: gapi.client.youtube.PlaylistItemListResponse, videos: gapi.client.youtube.VideoListResponse): void {
//   subscription.nextUploadPageToken = playListItems.nextPageToken;
//   videos.items.forEach(upload => subscription.uploads.push(Video(upload, subscription)));
// }
