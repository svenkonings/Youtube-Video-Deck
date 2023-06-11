import type { CommentSnippet, CommentThreadListResponse, YTComment } from "$lib/types/google";

export type Comment = {
  readonly authorDisplayName: string;
  readonly authorProfileImageUrl: string;
  readonly authorChannelUrl: string;
  readonly textDisplay: string;
  readonly likeCount: number;
  readonly publishedAt: string;
  readonly updatedAt?: string;
  readonly replies: Comment[];
};

export function Comments(commentThreads: CommentThreadListResponse): Comment[] {
  return commentThreads.items.map(commentThread =>
    Comment(commentThread.snippet.topLevelComment.snippet, commentThread.replies?.comments)
  );
}

export function Comment(snippet: CommentSnippet, replies?: YTComment[]): Comment {
  return {
    authorDisplayName: snippet.authorDisplayName,
    authorProfileImageUrl: snippet.authorProfileImageUrl,
    authorChannelUrl: snippet.authorChannelUrl,
    textDisplay: snippet.textDisplay,
    likeCount: snippet.likeCount,
    publishedAt: snippet.publishedAt,
    updatedAt: snippet.updatedAt !== snippet.publishedAt ? snippet.updatedAt : undefined,
    replies: replies ? replies.map(reply => Comment(reply.snippet)) : [],
  };
}
