import {Video} from "./Video";

export type Subscription = {
  readonly channelId: string;
  readonly title: string;
  readonly thumbnailUrl: string;
  readonly uploadsPlaylistId: string;
  uploadsEtag?: string;
  nextUploadPageToken?: string;
  uploads: Video[];
};

export function Subscription(subscription: gapi.client.youtube.Subscription, channel: gapi.client.youtube.Channel): Subscription {
  return {
    channelId: subscription.snippet.resourceId.channelId,
    title: subscription.snippet.title,
    thumbnailUrl: subscription.snippet.thumbnails.default.url,
    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
    uploads: [],
  };
}

export function setUploads(subscription: Subscription, playListItems: gapi.client.youtube.PlaylistItemListResponse, videos: gapi.client.youtube.VideoListResponse): void {
  subscription.uploadsEtag = playListItems.etag;
  subscription.nextUploadPageToken = playListItems.nextPageToken;
  subscription.uploads = videos.items.map(Video)
}

export function addUploads(subscription: Subscription, playListItems: gapi.client.youtube.PlaylistItemListResponse, videos: gapi.client.youtube.VideoListResponse): void {
  subscription.nextUploadPageToken = playListItems.nextPageToken;
  videos.items.forEach(upload => subscription.uploads.push(Video(upload)));
}
