import type google from "@googleapis/youtube";

type All<T> = {[P in keyof T]-?: All<NonNullable<T[P]>>};

export type YTSubscriptionListResponse = All<google.youtube_v3.Schema$SubscriptionListResponse>;
export type YTSubscription = All<google.youtube_v3.Schema$Subscription>;
/** These are for backwards compatibility only */
export type YTChannelListResponse = All<google.youtube_v3.Schema$ChannelListResponse>;
/** These are for backwards compatibility only */
export type YTChannel = All<google.youtube_v3.Schema$Channel>;
export type YTPlaylistItemListResponse = All<google.youtube_v3.Schema$PlaylistItemListResponse>;
export type YTVideoListResponse = All<google.youtube_v3.Schema$VideoListResponse>;
export type YTVideo = All<google.youtube_v3.Schema$Video>;
export type YTCommentThreadListResponse = All<google.youtube_v3.Schema$CommentThreadListResponse>;
export type YTCommentSnippet = All<google.youtube_v3.Schema$CommentSnippet>;
export type YTComment = All<google.youtube_v3.Schema$Comment>;
