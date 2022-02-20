import {Video} from "./Video";

export class Subscription {
  public readonly title: string;
  public readonly description: string;
  public readonly uploadsPlaylistId: string;
  public uploadsEtag?: string;
  public nextUploadPageToken?: string;
  public uploads: Video[];

  constructor(subscription: gapi.client.youtube.Subscription, channel: gapi.client.youtube.Channel) {
    this.title = subscription.snippet.title;
    this.description = subscription.snippet.description;
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
