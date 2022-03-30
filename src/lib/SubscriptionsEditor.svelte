<script lang="ts">
  import {onDestroy} from "svelte";
  import {dndzone} from "svelte-dnd-action";
  import {editorStore, settingsStore, subscriptionsStore} from "../util/stores";
  import type {Subscription} from "../model/Subscription";

  type SubscriptionEntry = {
    id: number;
    name: string;
    subscription: Subscription;
  }

  type SubscriptionGroupEntry = {
    id: number;
    name: string;
    subscriptions: SubscriptionEntry[];
  }

  type SettingsEntry = SubscriptionEntry | SubscriptionGroupEntry;

  let editorVisible = false;

  let idCounter: number = 0;
  let subscriptionEntries: SubscriptionEntry[] = [];
  let settingsEntries: SettingsEntry[] = [];

  function load() {
    const subscriptions = $subscriptionsStore.items;
    const subscriptionGroups = $settingsStore.subscriptionGroups;
    idCounter = 0;
    subscriptionEntries = subscriptions.map(s => ({
      id: idCounter++,
      name: s.title,
      subscription: s,
    }));
    const subscriptionMap = new Map(subscriptions.map(s => [s.channelId, s]));
    settingsEntries = subscriptionGroups.map(s => {
      if (s.subscriptionIds.length === 1) {
        return {
          id: idCounter++,
          name: s.name,
          subscription: subscriptionMap.get(s.subscriptionIds[0]) as Subscription,
        }
      } else {
        return {
          id: idCounter++,
          name: s.name,
          subscriptions: s.subscriptionIds.map(id => {
            const subscription = subscriptionMap.get(id) as Subscription;
            return {
              id: idCounter++,
              name: subscription.title,
              subscription: subscription,
            }
          }),
        }
      }
    });
  }

  onDestroy(editorStore.subscribe((input: boolean) => {
    if (input) {
      editorStore.set(null);
      load();
      editorVisible = true;
    }
  }))
</script>
<!--TODO: Extract to components-->
<div class="fixed top-0 bottom-0 left-0 right-0 z-10" class:fadeIn={editorVisible} class:fadeOut="{!editorVisible}" style="background-color: rgba(0, 0, 0, 0.8)" on:click|self={() => editorVisible = false}>
  <div class="inline-block w-1/3 h-full align-top overflow-y-auto" use:dndzone={{items: subscriptionEntries, dropFromOthersDisabled: true}}>
    {#each subscriptionEntries as entry (entry.id)}
      <div>
        <p>{entry.name}</p>
      </div>
    {/each}
  </div>
  <div class="inline-block w-1/3 h-full align-top overflow-y-auto" use:dndzone={{items: settingsEntries}}>
    {#each settingsEntries as entry (entry.id)}
      <div>
        {#if entry.subscription}
          <p>{entry.subscription.title}</p>
        {:else if entry.subscriptions}
          <p>{entry.name}</p>
          <div class="bg-neutral-500" use:dndzone={{items: entry.subscriptions}}>
            {#each entry.subscriptions as child (child.id)}
              <div>
                <p>{child.subscription.title}</p>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
<style>
  .fadeIn {
    visibility: visible;
    opacity: 1;
    transition: visibility 0s linear 0s, opacity 300ms;
  }

  .fadeOut {
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s linear 300ms, opacity 300ms;
  }
</style>
