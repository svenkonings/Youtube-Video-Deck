import type { SubscriptionGroupSettings } from "$lib/model/Settings";
import { subscriptionFromSettings, type Subscription } from "$lib/model/Subscription";
import type { SubscriptionPlaylist } from "$lib/model/SubscriptionPlaylist";
import type { Video } from "$lib/model/Video";
import type { PlayerInput } from "$lib/types/PlayerInput";
import type { VideosResponse } from "$lib/types/VideosResponse";
import { responseToErrorMessage } from "$lib/util/error";

const maxPlaylistLength = 200;

export type SubscriptionGroup = {
  name: string;
  expanded: boolean;
  subscriptions: Subscription[];
  videos: Video[];
  playlist?: PlayerInput;
};

export function SubscriptionGroup(name: string, expanded: boolean, subscriptions: Subscription[]): SubscriptionGroup {
  return {
    name,
    expanded,
    subscriptions,
    videos: [],
    ...(subscriptions.length === 1 &&
      subscriptions[0].playlists.length === 1 && {
        playlistId: subscriptions[0].playlists[0].playlistPrefix + subscriptions[0].id,
      }),
  };
}

export function SubscriptionGroupChild(subscription: Subscription): SubscriptionGroup {
  return {
    name: subscription.title,
    expanded: false,
    subscriptions: [subscription],
    videos: [],
    ...(subscription.playlists.length === 1 && {
      playlistId: subscription.playlists[0].playlistPrefix + subscription.id,
    }),
  };
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
    let nextPlaylist: SubscriptionPlaylist | undefined;
    for (const subscription of subscriptionGroup.subscriptions) {
      for (const playlist of subscription.playlists) {
        if (playlist.currentIndex === playlist.videos.length) {
          if (playlist.nextPageToken === false) {
            continue;
          }
          await loadPlaylist(subscription, playlist);
        }
        if (
          !nextPlaylist ||
          playlist.videos[playlist.currentIndex].publishedAt >
            nextPlaylist.videos[nextPlaylist.currentIndex].publishedAt
        ) {
          nextPlaylist = playlist;
        }
      }
    }
    if (!nextPlaylist) {
      break;
    }
    subscriptionGroup.videos.push(nextPlaylist.videos[nextPlaylist.currentIndex++]);
  }
}

export async function loadPlaylist(subscription: Subscription, playlist: SubscriptionPlaylist): Promise<void> {
  const response = await fetch(
    "/api/videos?" +
      new URLSearchParams({
        channelTitle: subscription.title,
        playlistId: playlist.playlistPrefix + subscription.id,
        ...(playlist.nextPageToken && { pageToken: playlist.nextPageToken }),
      }),
  );
  if (!response.ok) throw await responseToErrorMessage(response);
  const videosResponse: VideosResponse = await response.json();
  playlist.videos.push(...videosResponse.videos);
  playlist.nextPageToken = videosResponse.nextPageToken == null ? false : videosResponse.nextPageToken;
}

export function allVideosLoaded(subscriptionGroup: SubscriptionGroup): boolean {
  return subscriptionGroup.subscriptions.every(s =>
    s.playlists.every(p => p.currentIndex === p.videos.length && p.nextPageToken === false),
  );
}
