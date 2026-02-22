import type { Comment } from "$lib/model/Comment";
import type { YTVideo } from "$lib/types/google";

export type Video = {
  readonly videoId: string;
  readonly channelTitle: string;
  readonly title: string;
  readonly description: string;
  readonly thumbnailUrl: string;
  readonly publishedAt: string;
  readonly duration: string;
  readonly viewCount: string;
  readonly likeCount: string;
  readonly commentCount: string;
  comments?: Comment[]; // Comments are loaded separately (undefined = not yet loaded)
};

export function Video(video: YTVideo): Video {
  return {
    videoId: video.id,
    channelTitle: video.snippet.channelTitle,
    title: video.snippet.title,
    description: video.snippet.description,
    thumbnailUrl: video.snippet.thumbnails.medium.url,
    publishedAt:
      video.liveStreamingDetails?.actualStartTime ||
      video.liveStreamingDetails?.scheduledStartTime ||
      video.snippet.publishedAt,
    duration: video.contentDetails.duration,
    viewCount: video.statistics.viewCount,
    likeCount: video.statistics.likeCount,
    commentCount: video.statistics.commentCount,
  };
}
