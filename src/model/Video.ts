export class Video {
  public readonly title: string;
  public readonly description: string;
  public readonly publishedAt: string;
  public readonly thumbnailUrl: string;
  public readonly videoId: string;

  constructor(playlistItem: gapi.client.youtube.PlaylistItem) {
    this.title = playlistItem.snippet.title;
    this.description = playlistItem.snippet.description;
    this.publishedAt = playlistItem.snippet.publishedAt;
    this.thumbnailUrl = playlistItem.snippet.thumbnails.default.url;
    this.videoId = playlistItem.snippet.resourceId.videoId;
  }
}