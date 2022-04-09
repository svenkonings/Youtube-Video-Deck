<script lang="ts">
  import {flip} from "svelte/animate";
  import type {DndEvent} from "svelte-dnd-action";
  import {dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, TRIGGERS} from "svelte-dnd-action";
  import {editorVisible, settingsStore, subscriptionsStore} from "../util/stores";
  import PrimaryButton from "./components/PrimaryButton.svelte";
  import {writeSettings} from "../api/Drive";
  import type {SettingsEntry, SubscriptionEntry, SubscriptionGroupEntry} from "../types/SettingsEntry";
  import {isGroup, isSubscription} from "../types/SettingsEntry";

  let idCounter: number = 0;
  let subscriptionEntries: SubscriptionEntry[] = [];
  let filterEnabled = false;
  let filteredEntries = [];
  let settingsEntries: SettingsEntry[] = [];

  let groupNameInput: string = '';

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

  function addGroup() {
    if (groupNameInput !== '') {
      settingsEntries.push({id: idCounter++, name: groupNameInput, subscriptions: []});
      groupNameInput = '';
      settingsEntries = settingsEntries;
    }
  }

  const flipDurationMs = 300;
  let draggedEntry: SettingsEntry;

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
      if (groupSubscriptions.length === 1 && s.name === groupSubscriptions[0].title) {
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
    await writeSettings($settingsStore);
    $editorVisible = false;
  }

  function handleSubscriptionDndConsider(e: CustomEvent<DndEvent>): void {
    if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
      const index = subscriptionEntries.findIndex(s => s.id == e.detail.info.id);
      draggedEntry = subscriptionEntries[index];
      // Create a copy with a different id
      subscriptionEntries[index] = {...draggedEntry, id: idCounter++};
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
      draggedEntry = settingsEntries.find(s => s.id == e.detail.info.id);
    }
    settingsEntries = e.detail.items as SettingsEntry[];
  }

  function handleSettingsDndFinalize(e: CustomEvent<DndEvent>): void {
    settingsEntries = e.detail.items as SettingsEntry[];
    updateFilter();
  }

  function settingsDropDisabled(): boolean {
    if (isSubscription(draggedEntry)) {
      const channelId = draggedEntry.subscription.channelId;
      return settingsEntries.some(e => !e[SHADOW_ITEM_MARKER_PROPERTY_NAME] && isSubscription(e) && e.subscription.channelId === channelId);
    } else {
      return false;
    }
  }

  function removeSettingsEntry(entry: SettingsEntry): void {
    settingsEntries = settingsEntries.filter(s => s.id !== entry.id);
    updateFilter();
  }

  function handleGroupDndConsider(group: SubscriptionGroupEntry, e: CustomEvent<DndEvent>): void {
    if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
      draggedEntry = group.subscriptions.find(s => s.id == e.detail.info.id);
    }
    group.subscriptions = e.detail.items as SubscriptionEntry[];
    settingsEntries = settingsEntries;
  }

  function handleGroupDndFinalize(group: SubscriptionGroupEntry, e: CustomEvent<DndEvent>): void {
    group.subscriptions = e.detail.items as SubscriptionEntry[];
    settingsEntries = settingsEntries;
    updateFilter();
  }

  function groupDropDisabled(entry: SubscriptionGroupEntry): boolean {
    if (isSubscription(draggedEntry)) {
      const channelId = draggedEntry.subscription.channelId;
      return entry.subscriptions.some(s => !s[SHADOW_ITEM_MARKER_PROPERTY_NAME] && s.subscription.channelId === channelId);
    } else {
      return true;
    }
  }

  function removeGroupEntry(entry: SubscriptionGroupEntry, child: SubscriptionEntry): void {
    entry.subscriptions = entry.subscriptions.filter(s => s.id !== child.id);
    settingsEntries = settingsEntries;
    updateFilter();
  }

  function close(): void {
    $editorVisible = false
  }
</script>
<div class="fixed inset-0 z-10" class:fadeIn={$editorVisible} class:fadeOut={!$editorVisible} style="background-color: rgba(0, 0, 0, 0.8)">
  <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-max max-w-[40rem] bg-neutral-700 rounded-2xl">
    <div class="w-full h-12">
      <div class="pt-3 pl-2 float-left">
        <label>
          <input type="checkbox" value={filterEnabled} on:change={toggleFilter}/>
          Hide added subscriptions
        </label>
      </div>
      <div class="float-right m-1.5 pr-2">
        <input type="text" class="bg-neutral-800 p-1.5 rounded-l-2xl" bind:value={groupNameInput}><!--
     --><PrimaryButton class="rounded-l-none" on:click={addGroup}>Add group</PrimaryButton>
      </div>
    </div>
    <div class="w-full" style="height: calc(100% - 6rem)">
      <div class="inline-block m-1 bg-neutral-800 rounded-2xl" style="height: calc(100% - 0.5rem);">
        <div class="overflow-y-auto y-scroll m-2" style="height: calc(100% - 1rem);" use:dndzone={{
      items: filteredEntries,
      dropFromOthersDisabled: true,
      flipDurationMs
    }} on:consider={handleSubscriptionDndConsider} on:finalize={handleSubscriptionDndFinalize}>
          {#each filteredEntries as entry (entry.id)}
            <div class="w-[15rem] bg-neutral-700 m-2 p-2 rounded-2xl truncate" animate:flip={{duration:flipDurationMs}}>
              <img class="inline-block h-8 w-8 rounded-2xl" src={entry.subscription.thumbnailUrl} alt="" loading="lazy" width="88" height="88"/>
              <span title={entry.subscription.title}>{entry.subscription.title}</span>
            </div>
          {/each}
        </div>
      </div>
      <div class="inline-block m-1 bg-neutral-800 rounded-2xl" style="height: calc(100% - 0.5rem);">
        <div class="overflow-y-auto y-scroll m-2" style="height: calc(100% - 1rem);" use:dndzone={{
      items: settingsEntries,
      flipDurationMs,
      dropFromOthersDisabled: draggedEntry && settingsDropDisabled()
    }} on:consider={handleSettingsDndConsider} on:finalize={handleSettingsDndFinalize}>
          {#each settingsEntries as entry (entry.id)}
            <div class="w-[18rem] bg-neutral-700 m-2 p-2 rounded-2xl truncate" animate:flip={{duration:flipDurationMs}}>
              <span class="float-right" on:click={() => removeSettingsEntry(entry)}>x</span>
              {#if isSubscription(entry)}
                <img class="inline-block h-8 w-8 rounded-2xl" src={entry.subscription.thumbnailUrl} alt="" loading="lazy" width="88" height="88"/>
                <span title={entry.subscription.title}>{entry.subscription.title}</span>
              {:else if isGroup(entry)}
                <span title={entry.name}>{entry.name}</span>
                <div class="bg-neutral-500 mt-2 p-2 rounded-2xl" use:dndzone={{
              items: entry.subscriptions,
              flipDurationMs,
              dropFromOthersDisabled: draggedEntry && groupDropDisabled(entry)
            }} on:consider={e => handleGroupDndConsider(entry, e)} on:finalize={e => handleGroupDndFinalize(entry, e)}>
                  {#each entry.subscriptions as child (child.id)}
                    <div class="w-[15rem] bg-neutral-700 m-2 p-2 rounded-2xl truncate" animate:flip={{duration:flipDurationMs}}>
                      <span class="float-right" on:click={() => removeGroupEntry(entry, child)}>x</span>
                      <img class="inline-block h-8 w-8 rounded-2xl" src={child.subscription.thumbnailUrl} alt="" loading="lazy" width="88" height="88"/>
                      <span title={child.subscription.title}>{child.subscription.title}</span>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>
    <div class="w-full h-12">
      <PrimaryButton class="w-20 m-1 float-left" on:click={close}>Close</PrimaryButton>
      <PrimaryButton class="w-20 m-1 float-right" on:click={save}>Save</PrimaryButton>
    </div>
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
