import type { Video } from "$lib/model/Video";
import type { YTSubscription } from "$lib/types/google";

export const playlistPrefixes = [
  "UU", // Videos + livestreams + shorts
  "UULF", // Videos
  "UULV", // Livestreams
  "UUSH", // Shorts
  "UUMO", // Member videos + livestreams + shorts
  "UUMF", // Member videos
  "UUMV", // Member livestreams
  "UUMS", // Member shorts
] as const;

export type PlaylistPrefix = (typeof playlistPrefixes)[number];

export type SubscriptionSettings = {
  readonly id: string; // The channel ID without the UC prefix
  playlistPrefixes: PlaylistPrefix[]; // List of prefixes, playlistId = prefix + id
};

// Additional runtime properties not stored in settings
// Same for every subscription group, can be cached
export type Subscription = SubscriptionSettings & {
  readonly title: string;
  readonly thumbnailUrl: string;
  playlistCache: PlaylistCache; // Cache for every playlist of the channel
};

export type PlaylistCache = { [Prefix in PlaylistPrefix]: CachedPlaylist };

export type CachedPlaylist = {
  videos: Video[]; // The videos that have been retrieved
  nextPageToken?: string | false; // undefined = first request, string = more videos available, false = no more videos
};

export function SubscriptionSettings(subscription: Subscription): SubscriptionSettings {
  return { id: subscription.id, playlistPrefixes: subscription.playlistPrefixes };
}

// These are for backwards compatibility only, subscriptionIds have been migrated to SubscriptionSettings
export function subscriptionSettingsFromId(subscriptionId: string): SubscriptionSettings {
  return {
    id: subscriptionId.substring(2), // Channel IDs are prefixed with UC
    playlistPrefixes: ["UU"], // The default uploads playlist
  };
}

export function Subscription(subscription: YTSubscription): Subscription {
  return {
    id: subscription.snippet.resourceId.channelId.substring(2), // Channel IDs are prefixed with UC
    playlistPrefixes: [], // No active playlists, will be overwritten when retrieving subscriptions from settings
    title: subscription.snippet.title,
    thumbnailUrl: subscription.snippet.thumbnails.default.url,
    playlistCache: PlaylistCache(),
  };
}

export function subscriptionFromSettings(
  subscriptionSettings: SubscriptionSettings,
  subscriptionMap: Map<string, Subscription>,
): Subscription {
  return {
    ...(subscriptionMap.get(subscriptionSettings.id) as Subscription),
    playlistPrefixes: subscriptionSettings.playlistPrefixes,
  };
}

export function PlaylistCache(): PlaylistCache {
  return Object.fromEntries(playlistPrefixes.map(prefix => [prefix, CachedPlaylist()])) as PlaylistCache;
}

export function CachedPlaylist(): CachedPlaylist {
  return { videos: [] };
}
