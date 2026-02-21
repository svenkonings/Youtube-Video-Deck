import type { Subscription } from "$lib/model/Subscription";
import type { SubscriptionGroup } from "$lib/model/SubscriptionGroup";
import type { SubscriptionPlaylist } from "$lib/model/SubscriptionPlaylist";

export type Settings = {
  subscriptionGroups: SubscriptionGroupSettings[];
};

export type SubscriptionGroupSettings = {
  name: string;
  expanded: boolean;
  subscriptions: SubscriptionSettings[];
  // These are for backwards compatibility only, subscriptionIds have been migrated to SubscriptionSettings
  subscriptionIds?: string[];
};

export type SubscriptionSettings = {
  id: string;
  playlistTypes: PlaylistTypes;
};

export type PlaylistTypes = {
  videos: boolean;
  liveStreams: boolean;
  shorts: boolean;
  membersOnlyVideos: boolean;
  membersOnlyLiveStreams: boolean;
  membersOnlyShorts: boolean;
};

export function Settings(subscriptionGroups: SubscriptionGroup[] = []): Settings {
  return {
    subscriptionGroups: subscriptionGroups.map(SubscriptionGroupSettings),
  };
}

export function SubscriptionGroupSettings(subscriptionGroup: SubscriptionGroup): SubscriptionGroupSettings {
  return {
    name: subscriptionGroup.name,
    expanded: subscriptionGroup.expanded,
    subscriptions: subscriptionGroup.subscriptions.map(SubscriptionSettings),
  };
}

export function SubscriptionSettings(subscription: Subscription): SubscriptionSettings {
  return {
    id: subscription.id,
    playlistTypes: PlaylistTypes(subscription.playlists),
  };
}

export function PlaylistTypes(playlists: SubscriptionPlaylist[]): PlaylistTypes {
  let videos = false;
  let liveStreams = false;
  let shorts = false;
  let membersOnlyVideos = false;
  let membersOnlyLiveStreams = false;
  let membersOnlyShorts = false;
  for (const playlist of playlists) {
    if (playlist.playlistPrefix === "UU") {
      videos = true;
      liveStreams = true;
      shorts = true;
    } else if (playlist.playlistPrefix === "UULF") {
      videos = true;
    } else if (playlist.playlistPrefix === "UULV") {
      liveStreams = true;
    } else if (playlist.playlistPrefix === "UUSH") {
      shorts = true;
    } else if (playlist.playlistPrefix === "UUMO") {
      membersOnlyVideos = true;
      membersOnlyLiveStreams = true;
      membersOnlyShorts = true;
    } else if (playlist.playlistPrefix === "UUMF") {
      membersOnlyVideos = true;
    } else if (playlist.playlistPrefix === "UUMV") {
      membersOnlyLiveStreams = true;
    } else if (playlist.playlistPrefix === "UUMS") {
      membersOnlyShorts = true;
    }
  }
  return {
    videos,
    liveStreams,
    shorts,
    membersOnlyVideos,
    membersOnlyLiveStreams,
    membersOnlyShorts,
  };
}

// These are for backwards compatibility only, subscriptionIds have been migrated to SubscriptionSettings
export function subscriptionSettingsFromId(subscriptionId: string): SubscriptionSettings {
  return {
    id: subscriptionId.substring(2), // Channel IDs are prefixed with UC
    playlistTypes: {
      videos: true,
      liveStreams: true,
      shorts: true,
      membersOnlyVideos: false,
      membersOnlyLiveStreams: false,
      membersOnlyShorts: false,
    },
  };
}
