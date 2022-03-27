import type {SubscriptionGroup} from "./SubscriptionGroup";

export type Settings = {
  subscriptionGroups: SubscriptionGroupSettings[];
}

export type SubscriptionGroupSettings = {
  name: string,
  subscriptionIds: string[]
}

export function Settings(subscriptionGroups: SubscriptionGroup[] = []): Settings {
  return {
    subscriptionGroups: subscriptionGroups.map(subscriptionGroup => {
      return {
        name: subscriptionGroup.name,
        subscriptionIds: subscriptionGroup.subscriptions.map(s => s.subscription.channelId),
      }
    }),
  }
}
