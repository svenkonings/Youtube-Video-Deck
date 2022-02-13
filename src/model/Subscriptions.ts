import {Subscription} from "./Subscription";

export class Subscriptions {
  public readonly etag: string;
  public readonly items: Subscription[];

  constructor(subscriptions: gapi.client.youtube.SubscriptionListResponse, channelMap: Map<string, gapi.client.youtube.Channel>) {
    this.etag = subscriptions.etag;
    this.items = subscriptions.items.map(subscription => {
      const channel = channelMap.get(subscription.snippet.resourceId.channelId);
      return new Subscription(subscription, channel);
    });
  }

  public addSubscriptions(subscriptions: Subscriptions): void {
    this.items.push(...subscriptions.items)
  }
}
