import type {Video} from "$lib/model/Video";

/**
 * A cache for the retrieved videos of a playlist.
 */
export type PlaylistCache = {
  /** The videos that have been retrieved */
  videos: Video[];
  /**
   * The token to retrieve the next page of videos.
   * @type {undefined} = first request
   * @type {string} = more videos available
   * @type {false} = no more videos
   */
  nextPageToken?: string | false;
};

/**
 * Create a new empty playlist cache.
 * @returns the created cache
 */
export function PlaylistCache(): PlaylistCache {
  return {videos: []};
}
