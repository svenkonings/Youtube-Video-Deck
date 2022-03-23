import {Video} from "./Video";

export class Subscription {
  public readonly channelId: string;
  public readonly title: string;
  public readonly uploadsPlaylistId: string;
  public uploadsEtag?: string;
  public nextUploadPageToken?: string;
  public uploads: Video[];

  constructor(subscription: gapi.client.youtube.Subscription, channel: gapi.client.youtube.Channel) {
    this.channelId = subscription.snippet.resourceId.channelId;
    this.title = subscription.snippet.title;
    this.uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;
    this.uploads = [];
  }

  public addUploads(uploads: gapi.client.youtube.PlaylistItemListResponse): void {
    if (this.uploadsEtag == null) {
      this.uploadsEtag = uploads.etag;
    }
    this.nextUploadPageToken = uploads.nextPageToken;
    uploads.items.forEach(upload => this.uploads.push(new Video(upload)));
  }
}
