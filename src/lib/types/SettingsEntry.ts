import type { Subscription } from "$lib/model/Subscription";

export type SubscriptionEntry = {
  id: number;
  name: string;
  subscription: Subscription;
};

export type SubscriptionGroupEntry = {
  id: number;
  name: string;
  expanded: boolean;
  subscriptions: SubscriptionEntry[];
};

export type SettingsEntry = SubscriptionEntry | SubscriptionGroupEntry;

export function isSubscription(entry: SettingsEntry): entry is SubscriptionEntry {
  return "subscription" in entry;
}

export function isGroup(entry: SettingsEntry): entry is SubscriptionGroupEntry {
  return "subscriptions" in entry;
}
