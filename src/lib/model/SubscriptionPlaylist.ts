import type { PlaylistTypes } from "$lib/model/Settings";
import type { Video } from "$lib/model/Video";

export type SubscriptionPlaylist = {
  readonly playlistPrefix: string;
  videos: Video[];
  currentIndex: number;
  nextPageToken?: string | false;
};

export function SubscriptionPlaylist(playlistPrefix: string): SubscriptionPlaylist {
  return {
    playlistPrefix,
    videos: [],
    currentIndex: 0,
  };
}

export function playlistsFromSettings(playlistTypes: PlaylistTypes): SubscriptionPlaylist[] {
  const result = [];
  if (playlistTypes.videos && playlistTypes.liveStreams && playlistTypes.shorts) {
    result.push(SubscriptionPlaylist("UU"));
  } else {
    if (playlistTypes.videos) {
      result.push(SubscriptionPlaylist("UULF"));
    }
    if (playlistTypes.liveStreams) {
      result.push(SubscriptionPlaylist("UULV"));
    }
    if (playlistTypes.shorts) {
      result.push(SubscriptionPlaylist("UUSH"));
    }
  }
  if (playlistTypes.membersOnlyVideos && playlistTypes.membersOnlyLiveStreams && playlistTypes.membersOnlyShorts) {
    result.push(SubscriptionPlaylist("UUMO"));
  } else {
    if (playlistTypes.membersOnlyVideos) {
      result.push(SubscriptionPlaylist("UUMF"));
    }
    if (playlistTypes.membersOnlyLiveStreams) {
      result.push(SubscriptionPlaylist("UUMV"));
    }
    if (playlistTypes.membersOnlyShorts) {
      result.push(SubscriptionPlaylist("UUMS"));
    }
  }
  return result;
}
