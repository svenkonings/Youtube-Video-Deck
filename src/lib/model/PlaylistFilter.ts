import {Playlist} from "$lib/model/Playlist";

/**
 * A filter for which types of upload playlists to enable.
 */
export type PlaylistFilter = {
  videos: boolean;
  liveStreams: boolean;
  shorts: boolean;
  membersOnlyVideos: boolean;
  membersOnlyLiveStreams: boolean;
  membersOnlyShorts: boolean;
};

/**
 * Create a playlist filter by converting a list of playlists to the corresponding filter.
 * @param playlists the list of playlists
 * @returns the resulting filter
 */
export function PlaylistFilter(playlists: Playlist[]): PlaylistFilter {
  const playlistFilter: PlaylistFilter = {
    videos: false,
    liveStreams: false,
    shorts: false,
    membersOnlyVideos: false,
    membersOnlyLiveStreams: false,
    membersOnlyShorts: false,
  };
  for (const playlist of playlists) {
    if (playlist.playlistPrefix === "UU") {
      playlistFilter.videos = true;
      playlistFilter.liveStreams = true;
      playlistFilter.shorts = true;
    } else if (playlist.playlistPrefix === "UULF") {
      playlistFilter.videos = true;
    } else if (playlist.playlistPrefix === "UULV") {
      playlistFilter.liveStreams = true;
    } else if (playlist.playlistPrefix === "UUSH") {
      playlistFilter.shorts = true;
    } else if (playlist.playlistPrefix === "UUMO") {
      playlistFilter.membersOnlyVideos = true;
      playlistFilter.membersOnlyLiveStreams = true;
      playlistFilter.membersOnlyShorts = true;
    } else if (playlist.playlistPrefix === "UUMF") {
      playlistFilter.membersOnlyVideos = true;
    } else if (playlist.playlistPrefix === "UUMV") {
      playlistFilter.membersOnlyLiveStreams = true;
    } else if (playlist.playlistPrefix === "UUMS") {
      playlistFilter.membersOnlyShorts = true;
    }
  }
  return playlistFilter;
}

/**
 * Create a list of playlists based on the upload playlists enabled in this playlist filter.
 * @param playlistFilter the playlist filter
 * @returns the list of playlists
 */
export function playlistFilterToPlaylists(playlistFilter: PlaylistFilter): Playlist[] {
  const playlists: Playlist[] = [];
  if (playlistFilter.videos && playlistFilter.liveStreams && playlistFilter.shorts) {
    playlists.push(Playlist("UU"));
  } else {
    if (playlistFilter.videos) {
      playlists.push(Playlist("UULF"));
    }
    if (playlistFilter.liveStreams) {
      playlists.push(Playlist("UULV"));
    }
    if (playlistFilter.shorts) {
      playlists.push(Playlist("UUSH"));
    }
  }
  if (playlistFilter.membersOnlyVideos && playlistFilter.membersOnlyLiveStreams && playlistFilter.membersOnlyShorts) {
    playlists.push(Playlist("UUMO"));
  } else {
    if (playlistFilter.membersOnlyVideos) {
      playlists.push(Playlist("UUMF"));
    }
    if (playlistFilter.membersOnlyLiveStreams) {
      playlists.push(Playlist("UUMV"));
    }
    if (playlistFilter.membersOnlyShorts) {
      playlists.push(Playlist("UUMS"));
    }
  }
  return playlists;
}
