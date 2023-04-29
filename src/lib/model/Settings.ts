import type { SubscriptionGroup } from "$lib/model/SubscriptionGroup";

export type Settings = {
  subscriptionGroups: SubscriptionGroupSettings[];
};

export type SubscriptionGroupSettings = {
  name: string;
  expanded: boolean;
  subscriptionIds: string[];
};

export function Settings(subscriptionGroups: SubscriptionGroup[] = []): Settings {
  return {
    subscriptionGroups: subscriptionGroups.map(SubscriptionGroupSettings),
  };
}

export function SubscriptionGroupSettings(subscriptionGroup: SubscriptionGroup): SubscriptionGroupSettings {
  return {
    name: subscriptionGroup.name,
    expanded: subscriptionGroup.expanded,
    subscriptionIds: subscriptionGroup.subscriptions.map(s => s.subscription.channelId),
  };
}
