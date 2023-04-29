import type google from "@googleapis/youtube";

type All<T> = {
  [P in keyof T]-?: All<NonNullable<T[P]>>;
};

export type SubscriptionListResponse = All<google.youtube_v3.Schema$SubscriptionListResponse>;
export type YTSubscription = All<google.youtube_v3.Schema$Subscription>;
export type ChannelListResponse = All<google.youtube_v3.Schema$ChannelListResponse>;
export type Channel = All<google.youtube_v3.Schema$Channel>;
export type PlaylistItemListResponse = All<google.youtube_v3.Schema$PlaylistItemListResponse>;
export type VideoListResponse = All<google.youtube_v3.Schema$VideoListResponse>;
export type YTVideo = All<google.youtube_v3.Schema$Video>;
