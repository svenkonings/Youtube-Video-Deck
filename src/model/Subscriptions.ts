import {Subscription} from "./Subscription";
import type {SubscriptionsList} from "../types/SubscriptionsList";
import type {ChannelMap} from "../types/ChannelMap";

export class Subscriptions {
  public readonly etag: string;
  public readonly items: Subscription[];

  constructor(subscriptionsList: SubscriptionsList, channelMap: ChannelMap) {
    this.etag = subscriptionsList.etag;
    this.items = subscriptionsList.items.flatMap(subscriptions => subscriptions.map(subscription => {
      const channel = channelMap.get(subscription.snippet.resourceId.channelId);
      return new Subscription(subscription, channel);
    }));
  }
}
