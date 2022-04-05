<script lang="ts">
  import {flip} from "svelte/animate";
  import type {DndEvent} from "svelte-dnd-action";
  import {dndzone, TRIGGERS} from "svelte-dnd-action";
  import {editorVisible, settingsStore, subscriptionsStore} from "../util/stores";
  import type {Subscription} from "../model/Subscription";
  import PrimaryButton from "./components/PrimaryButton.svelte";
  import {writeSettings} from "../api/Drive";

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

  function isSubscription(entry: SettingsEntry): entry is SubscriptionEntry {
    return 'subscription' in entry;
  }

  function isGroup(entry: SettingsEntry): entry is SubscriptionGroupEntry {
    return 'subscriptions' in entry;
  }

  let idCounter: number = 0;
  let subscriptionEntries: SubscriptionEntry[] = [];
  let settingsEntries: SettingsEntry[] = [];

  let filterEnabled = false;
  let filteredEntries = [];

  function toggleFilter(): void {
    filterEnabled = !filterEnabled;
    updateFilter();
  }

  function updateFilter() {
    if (filterEnabled) {
      const enabledChannels = new Set(settingsEntries.flatMap(e => isGroup(e) ? e.subscriptions.map(s => s.subscription.channelId) : [e.subscription.channelId]));
      filteredEntries = subscriptionEntries.filter(e => !enabledChannels.has(e.subscription.channelId));
    } else {
      filteredEntries = subscriptionEntries;
    }
  }

  const flipDurationMs = 300;
  let dropFromOthersDisabled = false;

  $: if ($editorVisible) {
    load();
  }

  function load(): void {
    const subscriptions = $subscriptionsStore.items;
    const subscriptionGroups = $settingsStore.subscriptionGroups;
    idCounter = 0;
    subscriptionEntries = subscriptions.map(s => ({
      id: idCounter++,
      name: s.title,
      subscription: s,
    }));
    updateFilter();
    const subscriptionMap = new Map(subscriptions.map(s => [s.channelId, s]));
    settingsEntries = subscriptionGroups.map(s => {
      const groupSubscriptions = s.subscriptionIds.map(id => subscriptionMap.get(id));
      if (groupSubscriptions.length === 1) {
        return {
          id: idCounter++,
          name: s.name,
          subscription: groupSubscriptions[0],
        }
      } else {
        return {
          id: idCounter++,
          name: s.name,
          subscriptions: groupSubscriptions.map(subscription => ({
            id: idCounter++,
            name: subscription.title,
            subscription: subscription,
          })),
        }
      }
    });
  }

  async function save(): Promise<void> {
    $settingsStore.subscriptionGroups = settingsEntries.map(entry => ({
      name: entry.name,
      subscriptionIds: isGroup(entry) ? entry.subscriptions.map(s => s.subscription.channelId) : [entry.subscription.channelId],
    }));
    // TODO: Display loading
    await writeSettings($settingsStore);
    $editorVisible = false;
  }

  function handleSubscriptionDndConsider(e: CustomEvent<DndEvent>): void {
    if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
      dropFromOthersDisabled = false;
      // Create a copy with a different id
      const index = subscriptionEntries.findIndex(s => s.id == e.detail.info.id);
      subscriptionEntries[index] = {...subscriptionEntries[index], id: idCounter++};
      updateFilter();
    } else {
      filteredEntries = filteredEntries;
    }
  }

  function handleSubscriptionDndFinalize(e: CustomEvent<DndEvent>): void {
    filteredEntries = filteredEntries;
  }

  function handleSettingsDndConsider(e: CustomEvent<DndEvent>): void {
    if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
      dropFromOthersDisabled = !settingsEntries.find(s => s.id == e.detail.info.id)['subscription'];
    }
    settingsEntries = e.detail.items as SettingsEntry[];
  }

  function handleSettingsDndFinalize(e: CustomEvent<DndEvent>): void {
    settingsEntries = e.detail.items as SettingsEntry[];
    updateFilter();
  }

  function handleGroupDndConsider(group: SubscriptionGroupEntry, e: CustomEvent<DndEvent>): void {
    if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
      dropFromOthersDisabled = false;
    }
    group.subscriptions = e.detail.items as SubscriptionEntry[];
    settingsEntries = settingsEntries;
  }

  function handleGroupDndFinalize(group: SubscriptionGroupEntry, e: CustomEvent<DndEvent>): void {
    group.subscriptions = e.detail.items as SubscriptionEntry[];
    settingsEntries = settingsEntries;
    updateFilter();
  }

  function close(): void {
    $editorVisible = false
  }
</script>
<div class="fixed top-0 bottom-0 left-0 right-0 z-10" class:fadeIn={$editorVisible} class:fadeOut={!$editorVisible} style="background-color: rgba(0, 0, 0, 0.8)">
  <div class="w-full h-12">
    <PrimaryButton class="w-28 m-1" on:click={toggleFilter}>{filterEnabled ? 'Disable' : 'Enable'} filter</PrimaryButton>
  </div>
  <div class="w-full" style="height: calc(100% - 6rem)">
    <div class="inline-block w-1/2 float-left h-full align-top overflow-y-auto" use:dndzone={{items: filteredEntries, dropFromOthersDisabled: true, flipDurationMs}} on:consider={handleSubscriptionDndConsider} on:finalize={handleSubscriptionDndFinalize}>
      {#each filteredEntries as entry (entry.id)}
        <div animate:flip={{duration:flipDurationMs}}>
          <p>{entry.subscription.title}</p>
        </div>
      {/each}
    </div>
    <div class="inline-block w-1/2 float-right h-full align-top overflow-y-auto" use:dndzone={{items: settingsEntries, flipDurationMs}} on:consider={handleSettingsDndConsider} on:finalize={handleSettingsDndFinalize}>
      {#each settingsEntries as entry (entry.id)}
        <div animate:flip={{duration:flipDurationMs}}>
          <span class="float-right" on:click={() => {settingsEntries = settingsEntries.filter(s => s.id !== entry.id); updateFilter();}}>X</span>
          {#if entry.subscription}
            <p>{entry.subscription.title}</p>
          {:else if entry.subscriptions}
            <p>{entry.name}</p>
            <div class="bg-neutral-500" use:dndzone={{items: entry.subscriptions, flipDurationMs, dropFromOthersDisabled}} on:consider={e => handleGroupDndConsider(entry, e)} on:finalize={e => handleGroupDndFinalize(entry, e)}>
              {#each entry.subscriptions as child (child.id)}
                <div animate:flip={{duration:flipDurationMs}}>
                  <span class="float-right" on:click={() => {entry.subscriptions = entry.subscriptions.filter(s => s.id !== child.id); settingsEntries = settingsEntries; updateFilter();}}>X</span>
                  <p>{child.subscription?.title}</p>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
  <div class="w-full h-12">
    <PrimaryButton class="w-20 m-1" on:click={save}>Save</PrimaryButton>
    <PrimaryButton class="w-20 m-1" on:click={close}>Close</PrimaryButton>
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
