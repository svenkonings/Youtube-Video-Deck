import type {Subscription} from "../model/Subscription";

export type ListVideoRequest = {
  subscription: Subscription;
  playListItemListResponse: gapi.client.youtube.PlaylistItemListResponse;
  initial: boolean;
}
