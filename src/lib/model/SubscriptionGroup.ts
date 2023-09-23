import type { Subscription } from "$lib/model/Subscription";
import type { Video } from "$lib/model/Video";
import type { PlayerInput } from "$lib/types/PlayerInput";
import type { VideosResponse } from "$lib/types/VideosResponse";
import { responseToErrorMessage } from "$lib/util/error";

const maxPlaylistLength = 200;

export type SubscriptionGroup = {
  name: string;
  expanded: boolean;
  subscriptions: GroupSubscription[];
  videos: Video[];
  playlist?: PlayerInput;
};

export type GroupSubscription = {
  subscription: Subscription;
  uploadIndex: number;
};

export async function SubscriptionGroup(
  name: string,
  expanded: boolean,
  subscriptions: Subscription[],
): Promise<SubscriptionGroup> {
  const subscriptionGroup = {
    name: name,
    expanded: expanded,
    subscriptions: subscriptions.map(subscription => ({
      subscription: subscription,
      uploadIndex: 0,
    })),
    videos: [],
    ...(subscriptions.length === 1 && { playlistId: subscriptions[0].uploadsPlaylistId }),
  };
  await loadMoreVideos(subscriptionGroup);
  return subscriptionGroup;
}

export function SubscriptionGroupChild(subscription: Subscription): SubscriptionGroup {
  const videos = subscription.uploads.slice(0, 10);
  return {
    name: subscription.title,
    expanded: false,
    subscriptions: [
      {
        subscription: subscription,
        uploadIndex: videos.length,
      },
    ],
    videos: videos,
    playlist: { playlistId: subscription.uploadsPlaylistId },
  };
}

export async function loadCustomPlaylist(subscriptionGroup: SubscriptionGroup): Promise<void> {
  if (subscriptionGroup.videos.length < maxPlaylistLength) {
    await loadMoreVideos(subscriptionGroup, maxPlaylistLength - subscriptionGroup.videos.length);
  }
  subscriptionGroup.playlist = {
    customPlaylist: subscriptionGroup.videos.slice(0, maxPlaylistLength).map(v => v.videoId),
  };
}

export async function loadMoreVideos(subscriptionGroup: SubscriptionGroup, maxAmount = 10): Promise<void> {
  for (let i = 0; i < maxAmount; i++) {
    let nextVideo: Video | undefined;
    let nextSubscription: GroupSubscription | undefined;
    for (const groupSubscription of subscriptionGroup.subscriptions) {
      if (groupSubscription.uploadIndex === groupSubscription.subscription.uploads.length) {
        if (groupSubscription.subscription.nextUploadPageToken === false) continue;
        await loadUploads(groupSubscription.subscription);
      }
      const video = groupSubscription.subscription.uploads[groupSubscription.uploadIndex];
      if (!nextVideo || video.publishedAt > nextVideo.publishedAt) {
        nextVideo = video;
        nextSubscription = groupSubscription;
      }
    }
    if (!nextVideo || !nextSubscription) break;
    subscriptionGroup.videos.push(nextVideo);
    nextSubscription.uploadIndex++;
  }
}

export async function loadUploads(subscription: Subscription): Promise<void> {
  const response = await fetch(
    "/api/videos?" +
      new URLSearchParams({
        channelTitle: subscription.title,
        playlistId: subscription.uploadsPlaylistId,
        ...(subscription.nextUploadPageToken && { pageToken: subscription.nextUploadPageToken }),
      }),
  );
  if (!response.ok) throw await responseToErrorMessage(response);
  const videosResponse: VideosResponse = await response.json();
  subscription.nextUploadPageToken = videosResponse.nextPageToken;
  subscription.uploads.push(...videosResponse.videos);
}

export function allVideosLoaded(subscriptionGroup: SubscriptionGroup): boolean {
  return subscriptionGroup.subscriptions.every(
    s => s.uploadIndex === s.subscription.uploads.length && !s.subscription.nextUploadPageToken,
  );
}
