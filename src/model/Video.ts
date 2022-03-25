export type Video = {
  readonly title: string;
  readonly description: string;
  readonly publishedAt: string;
  readonly thumbnailUrl: string;
  readonly videoId: string;
};

export function Video(playlistItem: gapi.client.youtube.PlaylistItem): Video {
  return {
    title: playlistItem.snippet.title,
    description: playlistItem.snippet.description.substring(0, 313), // Maximum length measured by maximum number of | characters displayed
    publishedAt: playlistItem.snippet.publishedAt,
    thumbnailUrl: playlistItem.snippet.thumbnails.medium.url,
    videoId: playlistItem.snippet.resourceId.videoId,
  };
}
