import type {Channel} from "$lib/model/Channel";

/** A group of channels. */
export type ChannelGroup = {
  /** The name of the group */
  name: string;
  /** Whether the group should be displayed expanded or collapsed */
  expanded: boolean;
  /** The channels of this group */
  channels: Channel[];
};

/**
 * Create a group of channels.
 * @param name the name of the group
 * @param expanded whether the group should be displayed expanded or collapsed
 * @param channels the channels of this group
 * @returns the created group
 */
export function ChannelGroup(name: string, expanded: boolean, channels: Channel[]): ChannelGroup {
  return {name, expanded, channels};
}

/**
 * Create a channel group based on a single channel.
 * The name will be the channel title and the group will be initialized as collapsed.
 * @param channel the channel to base this group on
 * @returns the created group
 */
export function channelGroupFromChannel(channel: Channel): ChannelGroup {
  return ChannelGroup(channel.title, false, [channel]);
}
