import {Video} from "./Video";

export type Subscription = {
  readonly channelId: string;
  readonly title: string;
  readonly thumbnail: string;
  readonly uploadsPlaylistId: string;
  uploadsEtag?: string;
  nextUploadPageToken?: string;
  uploads: Video[];
};

export function Subscription(subscription: gapi.client.youtube.Subscription, channel: gapi.client.youtube.Channel): Subscription {
  return {
    channelId: subscription.snippet.resourceId.channelId,
    title: subscription.snippet.title,
    thumbnail: subscription.snippet.thumbnails.default.url,
    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
    uploads: [],
  };
}

export function addUploads(subscription: Subscription, uploads: gapi.client.youtube.PlaylistItemListResponse): void {
  if (subscription.uploadsEtag == null) {
    subscription.uploadsEtag = uploads.etag;
  }
  subscription.nextUploadPageToken = uploads.nextPageToken;
  uploads.items.forEach(upload => subscription.uploads.push(Video(upload)));
}

export function clearUploads(subscription: Subscription) {
  subscription.uploadsEtag = null;
  subscription.nextUploadPageToken = null;
  subscription.uploads = [];
}
