<script lang="ts">
  import {onDestroy} from "svelte";
  import {flip} from "svelte/animate";
  import type {DndEvent} from "svelte-dnd-action";
  import {dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, TRIGGERS} from "svelte-dnd-action";
  import {editorStore, settingsStore, subscriptionsStore} from "../util/stores";
  import type {Subscription} from "../model/Subscription";
  import PrimaryButton from "./components/PrimaryButton.svelte";

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

  const flipDurationMs = 300;
  let dropFromOthersDisabled = false;

  function load(): void {
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

  function save(): void {
    $settingsStore.subscriptionGroups = settingsEntries.map(entry => {
      if (entry['subscriptions']) {
        return {
          name: entry.name,
          subscriptionIds: (entry as SubscriptionGroupEntry).subscriptions.map(s => s.subscription.channelId),
        }
      } else {
        return {
          name: entry.name,
          subscriptionIds: [(entry as SubscriptionEntry).subscription.channelId],
        }
      }
    });
    editorVisible = false;
  }

  function handleSubscriptionDndConsider(e: CustomEvent<DndEvent>) {
    if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
      dropFromOthersDisabled = false;
      // Create a copy
      const index = subscriptionEntries.findIndex(s => s.id == e.detail.info.id);
      e.detail.items = e.detail.items.filter(i => !i[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
      e.detail.items.splice(index, 0, {...subscriptionEntries[index], id: idCounter++});
      subscriptionEntries = e.detail.items as SubscriptionEntry[];
    } else {
      subscriptionEntries = subscriptionEntries;
    }
  }

  function handleSubscriptionDndFinalize(e: CustomEvent<DndEvent>) {
    subscriptionEntries = subscriptionEntries;
  }

  function handleSettingsDndConsider(e: CustomEvent<DndEvent>) {
    if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
      dropFromOthersDisabled = !settingsEntries.find(s => s.id == e.detail.info.id)['subscription'];
    }
    settingsEntries = e.detail.items as SettingsEntry[];
  }

  function handleSettingsDndFinalize(e: CustomEvent<DndEvent>) {
    settingsEntries = e.detail.items as SettingsEntry[];
  }

  function handleGroupDndConsider(group: SubscriptionGroupEntry, e: CustomEvent<DndEvent>) {
    if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
      dropFromOthersDisabled = false;
    }
    group.subscriptions = e.detail.items as SubscriptionEntry[];
    settingsEntries = settingsEntries;
  }

  function handleGroupDndFinalize(group: SubscriptionGroupEntry, e: CustomEvent<DndEvent>) {
    group.subscriptions = e.detail.items as SubscriptionEntry[];
    settingsEntries = settingsEntries;
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
  <div class="inline-block w-1/3 h-full align-top overflow-y-auto" use:dndzone={{items: subscriptionEntries, dropFromOthersDisabled: true, flipDurationMs}} on:consider={handleSubscriptionDndConsider} on:finalize={handleSubscriptionDndFinalize}>
    {#each subscriptionEntries as entry (entry.id)}
      <div animate:flip={{duration:flipDurationMs}}>
        <p>{entry.name}</p>
      </div>
    {/each}
  </div>
  <div class="inline-block w-1/3 h-full align-top overflow-y-auto" use:dndzone={{items: settingsEntries, flipDurationMs}} on:consider={handleSettingsDndConsider} on:finalize={handleSettingsDndFinalize}>
    {#each settingsEntries as entry (entry.id)}
      <div animate:flip={{duration:flipDurationMs}}>
        {#if entry.subscription}
          <p>{entry.subscription.title}</p>
        {:else if entry.subscriptions}
          <p>{entry.name}</p>
          <div class="bg-neutral-500" use:dndzone={{items: entry.subscriptions, flipDurationMs, dropFromOthersDisabled}} on:consider={e => handleGroupDndConsider(entry, e)} on:finalize={e => handleGroupDndFinalize(entry, e)}>
            {#each entry.subscriptions as child (child.id)}
              <div animate:flip={{duration:flipDurationMs}}>
                <p>{child.subscription?.title}</p>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
  <PrimaryButton class="w-20 m-1" on:click={save}>Save</PrimaryButton>
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
