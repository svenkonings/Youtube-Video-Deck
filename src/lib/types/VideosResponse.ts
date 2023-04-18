import type { Video } from "$lib/model/Video";

export type VideosResponse = {
  videos: Video[];
  nextPageToken?: string;
};
