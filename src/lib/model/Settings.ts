import { SubscriptionGroupSettings, type SubscriptionGroup } from "$lib/model/SubscriptionGroup";

export type Settings = {
  subscriptionGroups: SubscriptionGroupSettings[];
};

export function Settings(subscriptionGroups: SubscriptionGroup[] = []): Settings {
  return {
    subscriptionGroups: subscriptionGroups.map(SubscriptionGroupSettings),
  };
}
