import {Subscription} from "./Subscription";
import type {SubscriptionsList} from "../types/SubscriptionsList";
import type {ChannelMap} from "../types/ChannelMap";

export const subscriptionsModelVersion = 2;

export type Subscriptions = {
  etag: string;
  items: Subscription[];
  version: number;
};

export function Subscriptions(subscriptionsList: SubscriptionsList, channelMap: ChannelMap): Subscriptions {
  return {
    etag: subscriptionsList.etag,
    items: subscriptionsList.items.flatMap(subscriptions => subscriptions.map(subscription => {
      const channel = channelMap.get(subscription.snippet.resourceId.channelId);
      return Subscription(subscription, channel);
    })),
    version: subscriptionsModelVersion,
  };
}
