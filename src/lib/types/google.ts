import type google from "@googleapis/youtube";

type All<T> = {
  [P in keyof T]-?: All<NonNullable<T[P]>>;
};

export type SubscriptionListResponse = All<google.youtube_v3.Schema$SubscriptionListResponse>;
export type YTSubscription = All<google.youtube_v3.Schema$Subscription>;
export type PlaylistItemListResponse = All<google.youtube_v3.Schema$PlaylistItemListResponse>;
export type VideoListResponse = All<google.youtube_v3.Schema$VideoListResponse>;
export type YTVideo = All<google.youtube_v3.Schema$Video>;
export type CommentThreadListResponse = All<google.youtube_v3.Schema$CommentThreadListResponse>;
export type CommentSnippet = All<google.youtube_v3.Schema$CommentSnippet>;
export type YTComment = All<google.youtube_v3.Schema$Comment>;
