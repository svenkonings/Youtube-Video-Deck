import {
  subscriptionFromSettings,
  SubscriptionSettings,
  type PlaylistPrefix,
  type Subscription,
} from "$lib/model/Subscription";
import type { Video } from "$lib/model/Video";
import type { PlayerInput } from "$lib/types/PlayerInput";
import type { VideosResponse } from "$lib/types/VideosResponse";
import { responseToErrorMessage } from "$lib/util/error";

export const maxPlaylistLength = 200;

export type SubscriptionGroupSettings = {
  name: string;
  expanded: boolean;
  subscriptions: SubscriptionSettings[];
  // These are for backwards compatibility only, subscriptionIds have been migrated to SubscriptionSettings
  subscriptionIds?: string[];
};

// Additional runtime properties not stored in settings
// Unique for every group, should be reset on update
export type SubscriptionGroup = SubscriptionGroupSettings & {
  subscriptions: Subscription[];
  videos: Video[]; // The merged list of videos from all active playlists
  playlistIndices: Map<string, number>; // Mapping from playlistId to the index of the next video to be merged
  groupPlaylist?: Pick<PlayerInput, "playlistId" | "customPlaylist">; // playlistId in case of sinlge playlist, custom list of video ids otherwise
};

export function SubscriptionGroupSettings(subscriptionGroup: SubscriptionGroup): SubscriptionGroupSettings {
  return {
    name: subscriptionGroup.name,
    expanded: subscriptionGroup.expanded,
    subscriptions: subscriptionGroup.subscriptions.map(SubscriptionSettings),
  };
}

export function SubscriptionGroup(name: string, expanded: boolean, subscriptions: Subscription[]): SubscriptionGroup {
  return {
    name,
    expanded,
    subscriptions,
    videos: [],
    playlistIndices: new Map<string, number>(),
    ...(subscriptions.length === 1 &&
      subscriptions[0].playlistPrefixes.length === 1 && {
        playlistId: subscriptions[0].playlistPrefixes[0] + subscriptions[0].id,
      }),
  };
}

export function subscriptionGroupFromSubscription(subscription: Subscription): SubscriptionGroup {
  return SubscriptionGroup(subscription.title, false, [subscription]);
}

export function subscriptionGroupFromSettings(
  subscriptionGroupSettings: SubscriptionGroupSettings,
  subscriptionMap: Map<string, Subscription>,
): SubscriptionGroup {
  return SubscriptionGroup(
    subscriptionGroupSettings.name,
    subscriptionGroupSettings.expanded,
    subscriptionGroupSettings.subscriptions.map(s => subscriptionFromSettings(s, subscriptionMap)),
  );
}

// Functions for loading videos and playlists

export function allVideosLoaded(subscriptionGroup: SubscriptionGroup): boolean {
  return subscriptionGroup.subscriptions.every((s: Subscription) =>
    s.playlistPrefixes.every(
      p =>
        subscriptionGroup.playlistIndices.get(p + s.id) === s.playlistCache[p].videos.length &&
        s.playlistCache[p].nextPageToken === false,
    ),
  );
}

export async function loadCustomPlaylist(subscriptionGroup: SubscriptionGroup): Promise<void> {
  if (subscriptionGroup.videos.length < maxPlaylistLength) {
    await loadMoreVideos(subscriptionGroup, maxPlaylistLength - subscriptionGroup.videos.length);
  }
  subscriptionGroup.groupPlaylist = {
    customPlaylist: subscriptionGroup.videos.slice(0, maxPlaylistLength).map(v => v.videoId),
  };
}

export async function loadMoreVideos(subscriptionGroup: SubscriptionGroup, maxAmount = 10): Promise<void> {
  for (let i = 0; i < maxAmount; i++) {
    let nextVideo: Video | undefined;
    let nextPlaylistId: string | undefined;
    let nextIndex: number | undefined;
    for (const subscription of subscriptionGroup.subscriptions) {
      for (const prefix of subscription.playlistPrefixes) {
        const playlistCache = subscription.playlistCache[prefix];
        const playlistId = prefix + subscription.id;
        const index = subscriptionGroup.playlistIndices.get(playlistId) ?? 0;
        if (index === playlistCache.videos.length) {
          if (playlistCache.nextPageToken === false) {
            continue;
          }
          await loadPlaylist(subscription, prefix, playlistCache.nextPageToken);
          if (index === playlistCache.videos.length) {
            playlistCache.nextPageToken = false;
            continue;
          }
        }
        const video = playlistCache.videos[index];
        if (nextVideo === undefined || video.publishedAt > nextVideo.publishedAt) {
          nextVideo = video;
          nextPlaylistId = playlistId;
          nextIndex = index;
        }
      }
    }
    if (nextVideo === undefined || nextPlaylistId === undefined || nextIndex === undefined) {
      break;
    }
    subscriptionGroup.videos.push(nextVideo);
    subscriptionGroup.playlistIndices.set(nextPlaylistId, nextIndex + 1);
  }
}

export async function loadPlaylist(
  subscription: Subscription,
  prefix: PlaylistPrefix,
  nextPageToken?: string,
): Promise<void> {
  const response = await fetch(
    "/api/videos?" +
      new URLSearchParams({
        channelTitle: subscription.title,
        playlistId: prefix + subscription.id,
        ...(nextPageToken && { pageToken: nextPageToken }),
      }),
  );
  if (!response.ok) throw await responseToErrorMessage(response);
  const videosResponse: VideosResponse = await response.json();
  const playlistCache = subscription.playlistCache[prefix];
  playlistCache.videos.push(...videosResponse.videos);
  playlistCache.nextPageToken = videosResponse.nextPageToken == null ? false : videosResponse.nextPageToken;
}
