import type { SubscriptionSettings } from "$lib/model/Settings";
import { playlistsFromSettings, type SubscriptionPlaylist } from "$lib/model/SubscriptionPlaylist";
import type { YTSubscription } from "$lib/types/google";

export type Subscription = {
  readonly id: string;
  readonly title: string;
  readonly thumbnailUrl: string;
  playlists: SubscriptionPlaylist[];
};

export function Subscription(subscription: YTSubscription): Subscription {
  return {
    id: subscription.snippet.resourceId.channelId.substring(2), // Channel IDs are prefixed with UC
    title: subscription.snippet.title,
    thumbnailUrl: subscription.snippet.thumbnails.default.url,
    playlists: [],
  };
}

export function subscriptionFromSettings(
  subscriptionSettings: SubscriptionSettings,
  subscriptionMap: Map<string, Subscription>,
): Subscription {
  return {
    ...(subscriptionMap.get(subscriptionSettings.id) as Subscription),
    playlists: playlistsFromSettings(subscriptionSettings.playlistTypes),
  };
}
