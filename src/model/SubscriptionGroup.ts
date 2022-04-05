import type {Subscription} from "./Subscription";
import type {Video} from "./Video";
import {listPlaylistItems} from "../api/YouTube";
import type {PlayerInput} from "../types/PlayerInput";

export type SubscriptionGroup = {
  name: string;
  subscriptions: GroupSubscription[];
  videos: Video[]
}

export type GroupSubscription = {
  subscription: Subscription;
  uploadIndex: number;
}

export async function SubscriptionGroup(name: string, subscriptions: Subscription[]): Promise<SubscriptionGroup> {
  const subscriptionGroup = {
    name: name,
    subscriptions: subscriptions.map(subscription => ({
      subscription: subscription,
      uploadIndex: 0,
    })),
    videos: [],
  }
  await loadMoreVideos(subscriptionGroup);
  return subscriptionGroup;
}

export function addSubscription(subscriptionGroup: SubscriptionGroup, subscription: Subscription): void {
  subscriptionGroup.subscriptions.push({
    subscription: subscription,
    uploadIndex: 0,
  });
}

export function removeSubscription(subscriptionGroup: SubscriptionGroup, subscription: Subscription): void {
  const index = subscriptionGroup.subscriptions.findIndex(g => g.subscription.channelId === subscription.channelId);
  if (index >= 0) {
    removeSubscriptionByIndex(subscriptionGroup, index);
  }
}

export function removeSubscriptionByIndex(subscriptionGroup: SubscriptionGroup, index: number): void {
  subscriptionGroup.subscriptions.splice(index, 1);
}

export async function reloadVideos(subscriptionGroup: SubscriptionGroup): Promise<void> {
  subscriptionGroup.subscriptions.forEach(s => s.uploadIndex = 0);
  subscriptionGroup.videos = [];
  await loadMoreVideos(subscriptionGroup);
}

export async function getPlaylist(subscriptionGroup: SubscriptionGroup): Promise<PlayerInput> {
  if (subscriptionGroup.subscriptions.length === 1) {
    return {playlistId: subscriptionGroup.subscriptions[0].subscription.uploadsPlaylistId};
  } else {
    if (subscriptionGroup.videos.length < 200) {
      await loadMoreVideos(subscriptionGroup, 200 - subscriptionGroup.videos.length);
    }
    return {customPlaylist: subscriptionGroup.videos.slice(0, 200).map(v => v.videoId)};
  }
}

export async function loadMoreVideos(subscriptionGroup: SubscriptionGroup, maxAmount = 10): Promise<void> {
  for (let i = 0; i < maxAmount; i++) {
    let nextVideo: Video;
    let nextSubscription: GroupSubscription;
    for (const groupSubscription of subscriptionGroup.subscriptions) {
      if (groupSubscription.uploadIndex === groupSubscription.subscription.uploads.length) {
        if (!groupSubscription.subscription.nextUploadPageToken) continue;
        await listPlaylistItems(groupSubscription.subscription);
      }
      const video = groupSubscription.subscription.uploads[groupSubscription.uploadIndex];
      if (!nextVideo || video.publishedAt > nextVideo.publishedAt) {
        nextVideo = video;
        nextSubscription = groupSubscription;
      }
    }
    if (!nextVideo || !nextSubscription) break;
    nextVideo.channelTitle = nextSubscription.subscription.title;
    subscriptionGroup.videos.push(nextVideo);
    nextSubscription.uploadIndex++;
  }
}
