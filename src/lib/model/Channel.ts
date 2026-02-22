import { Playlist } from "$lib/model/Playlist";
import type { YTSubscription } from "$lib/types/google";

/**
 * A channel consists of channel information and a list of playlists.
 */
export type Channel = {
  /** The Channel ID without the UC prefix */
  readonly channelId: string;
  /** The title of the channel */
  readonly title: string;
  /** The default thumbnail of the channel */
  readonly thumbnailUrl: string;
  /** The playlists for this channel */
  playlists: Playlist[];
};

/**
 * Create a channel from a YouTube subscription.
 * @param subscription the YouTube subscription
 * @returns the created channel
 */
export function Channel(subscription: YTSubscription): Channel {
  return {
    channelId: subscription.snippet.resourceId.channelId.substring(2), // Channel IDs are prefixed with UC
    title: subscription.snippet.title,
    thumbnailUrl: subscription.snippet.thumbnails.default.url,
    playlists: [Playlist("UU")], // The default uploads playlist
  };
}

/**
 * Create a copy of the provided channel.
 * Creates a new array for the playlists to avoid sharing changes.
 * @param channel the channel to copy
 * @returns the copied channel
 */
export function copyChannel(channel: Channel): Channel {
  return {
    channelId: channel.channelId,
    title: channel.title,
    thumbnailUrl: channel.thumbnailUrl,
    playlists: [...channel.playlists],
  };
}
