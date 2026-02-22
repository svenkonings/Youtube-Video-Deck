import type {ChannelGroup} from "$lib/model/ChannelGroup";

/**
 * The settings for the logged in user.
 * The settings contain the channel groups the user has configured.
 */
export type Settings = {
  /** The channel groups that should be displayed on the deck */
  channelGroups: ChannelGroup[];
  /**
   * These are for backwards compatibility only,
   * subscriptionGroups have been migrated to channelGroups.
   */
  subscriptionGroups?: SubscriptionGroupSettings[];
};

/**
 * These are for backwards compatibility only,
 * SubscriptionGroupSettings have been migrated to ChannelGroup.
 */
export type SubscriptionGroupSettings = {name: string; expanded: boolean; subscriptionIds: string[]};

/**
 * Create settings based on the provided channel groups.
 * @param channelGroups the provided channel groups, empty by default
 * @returns the created settings
 */
export function Settings(channelGroups: ChannelGroup[] = []): Settings {
  return {channelGroups};
}
