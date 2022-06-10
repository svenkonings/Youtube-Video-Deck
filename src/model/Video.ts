export type Video = {
  readonly videoId: string;
  readonly title: string;
  readonly description: string;
  readonly thumbnailUrl: string;
  readonly publishedAt: string;
  readonly duration: string;
  readonly viewCount: string;
  readonly likeCount: string;
  readonly commentCount: string;
  channelTitle?: string;
};

export function Video(video: gapi.client.youtube.Video): Video {
  return {
    videoId: video.id,
    title: video.snippet.title,
    description: video.snippet.description.substring(0, 275), // Maximum length measured by maximum number of | characters displayed
    thumbnailUrl: video.snippet.thumbnails.medium.url,
    publishedAt: video.liveStreamingDetails?.actualStartTime || video.liveStreamingDetails?.scheduledStartTime || video.snippet.publishedAt,
    duration: video.contentDetails.duration,
    viewCount: video.statistics.viewCount,
    likeCount: video.statistics.likeCount,
    commentCount: video.statistics.commentCount,
  };
}
