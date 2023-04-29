import type { Video } from "$lib/model/Video";
import type { Channel, YTSubscription } from "$lib/types/google";

export type Subscription = {
  readonly channelId: string;
  readonly title: string;
  readonly thumbnailUrl: string;
  readonly uploadsPlaylistId: string;
  nextUploadPageToken?: string | false;
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
