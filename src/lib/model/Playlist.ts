/**
 * A playlist belongs to a channel.
 * A playlist for uploaded content consists of a prefix for a channel ID.
 *
 * TODO: Add playlists with custom playlist IDs.
 */
export type Playlist = {
  readonly playlistPrefix: PlaylistPrefix;
};

/**
 * Prefix for a channel ID to get a playlist of uploaded content.
 */
export type PlaylistPrefix =
  | "UU" // Videos + livestreams + shorts
  | "UULF" // Videos
  | "UULV" // Livestreams
  | "UUSH" // Shorts
  | "UUMO" // Member videos + livestreams + shorts
  | "UUMF" // Member videos
  | "UUMV" // Member livestreams
  | "UUMS"; // Member shorts

/**
 * Create a playlist from a prefix.
 * @param playlistPrefix the playlist prefix to use
 * @returns the created playlist
 */
export function Playlist(playlistPrefix: PlaylistPrefix) {
  return { playlistPrefix };
}
