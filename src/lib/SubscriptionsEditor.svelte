<script lang="ts">
  import {flip} from "svelte/animate";
  import type {DndEvent} from "svelte-dnd-action";
  import {dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, SOURCES, TRIGGERS} from "svelte-dnd-action";
  import {editorVisible, settingsStore, subscriptionsStore} from "../util/stores";
  import PrimaryButton from "./components/PrimaryButton.svelte";
  import {writeSettings} from "../api/Drive";
  import type {SettingsEntry, SubscriptionEntry, SubscriptionGroupEntry} from "../types/SettingsEntry";
  import {isGroup, isSubscription} from "../types/SettingsEntry";
  import Center from "./components/Center.svelte";
  import {tweened} from "svelte/motion";
  import {onDestroy} from "svelte";
  import Fa from "svelte-fa/src/fa.svelte";
  import FaLayers from "svelte-fa/src/fa-layers.svelte";
  import {faCircle, faCompressAlt, faExpandAlt, faTimesCircle, faUsers} from "@fortawesome/free-solid-svg-icons";
  import {fade} from "../util/fade";
  import {trapFocus} from "../util/trapFocus";

  /*
   * General code
   */

  $: if ($editorVisible) {
    load();
  }

  function close(): void {
    $editorVisible = false
  }

  /*
   * Subscriptions and settings management
   */

  let idCounter: number = 0;
  let subscriptionEntries: SubscriptionEntry[] = [];
  let filterEnabled = true;
  let filteredEntries = [];
  let settingsEntries: SettingsEntry[] = [];
  let groupNameInput: string = '';

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
      settingsEntries.push({id: idCounter++, name: groupNameInput, expanded: true, subscriptions: []});
      groupNameInput = '';
      settingsEntries = settingsEntries;
    }
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
          expanded: s.expanded,
          subscriptions: groupSubscriptions.map(subscription => ({
            id: idCounter++,
            name: subscription.title,
            subscription: subscription,
          })),
        }
      }
    });
    updateFilter();
  }

  async function save(): Promise<void> {
    const settings = $settingsStore;
    settings.subscriptionGroups = settingsEntries.map(entry => ({
      name: entry.name,
      expanded: isGroup(entry) && entry.expanded,
      subscriptionIds: isGroup(entry) ? entry.subscriptions.map(s => s.subscription.channelId) : [entry.subscription.channelId],
    }));
    $settingsStore = settings;
    await writeSettings(settings);
    $editorVisible = false;
  }

  /*
   * Drag and drop code
   */

  const flipDurationMs = 300;
  let draggedEntry: SettingsEntry
  let dragDisabled = true;

  function handleSubscriptionDndConsider(e: CustomEvent<DndEvent>): void {
    if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
      const index = subscriptionEntries.findIndex(s => s.id == e.detail.info.id);
      draggedEntry = subscriptionEntries[index];
      // Create a copy with a different id
      subscriptionEntries[index] = {...draggedEntry, id: idCounter++};
      updateFilter();
      startAutoScroll();
    } else {
      if (e.detail.info.source === SOURCES.KEYBOARD && e.detail.info.trigger === TRIGGERS.DRAG_STOPPED) {
        dragDisabled = true;
      }
      filteredEntries = filteredEntries;
    }
  }

  function handleSubscriptionDndFinalize(e: CustomEvent<DndEvent>): void {
    if (e.detail.info.source === SOURCES.POINTER) {
      dragDisabled = true;
    }
    filteredEntries = filteredEntries;
  }

  function handleSettingsDndConsider(e: CustomEvent<DndEvent>): void {
    if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
      draggedEntry = settingsEntries.find(s => s.id == e.detail.info.id);
      startAutoScroll();
    } else if (e.detail.info.source === SOURCES.KEYBOARD && e.detail.info.trigger === TRIGGERS.DRAG_STOPPED) {
      dragDisabled = true;
    }
    settingsEntries = e.detail.items as SettingsEntry[];
  }

  function handleSettingsDndFinalize(e: CustomEvent<DndEvent>): void {
    if (e.detail.info.source === SOURCES.POINTER) {
      dragDisabled = true;
    }
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
      startAutoScroll();
    } else if (e.detail.info.source === SOURCES.KEYBOARD && e.detail.info.trigger === TRIGGERS.DRAG_STOPPED) {
      dragDisabled = true;
    }
    group.subscriptions = e.detail.items as SubscriptionEntry[];
    settingsEntries = settingsEntries;
  }

  function handleGroupDndFinalize(group: SubscriptionGroupEntry, e: CustomEvent<DndEvent>): void {
    if (e.detail.info.source === SOURCES.POINTER) {
      dragDisabled = true;
    }
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

  function startDrag(e: UIEvent) {
    e.preventDefault();
    dragDisabled = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if ((e.key === "Enter" || e.key === " ") && dragDisabled) dragDisabled = false;
  }

  /*
   * Auto-scroll code
   */

  let deckElement: HTMLDivElement;
  let deckBounds: DOMRect;
  const scrollOffset = 32;
  const duration = 100;
  const autoScroll = tweened(0, {duration: 2 * duration});
  let autoScrollInterval: any;
  let autoScrollSyncTimeout: any;

  onDestroy(autoScroll.subscribe(value => deckElement && (deckElement.scrollTop = value)));

  function startAutoScroll() {
    if (!autoScrollInterval) {
      deckBounds = deckElement.getBoundingClientRect();
      autoScrollInterval = setInterval(updateAutoScroll, duration);
    }
  }

  function updateAutoScroll(): void {
    const draggedElement = document.getElementById('dnd-action-dragged-el');
    if (draggedElement) {
      const top = parseFloat(draggedElement.style.top.slice(0, -2)) + parseFloat(draggedElement.style.transform.split(', ')[1].slice(0, -2));
      const bottom = top + parseFloat(draggedElement.style.height.slice(0, -2));
      if (bottom + scrollOffset >= deckBounds.bottom) {
        autoScroll.update(value => clampToContainer(value + bottom + scrollOffset - deckBounds.bottom));
      } else if (top - scrollOffset <= deckBounds.top) {
        autoScroll.update(value => clampToContainer(value + top - scrollOffset - deckBounds.top));
      }
    } else {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  }

  function clampToContainer(value: number): number {
    return Math.max(0, Math.min(value, deckElement.scrollHeight - deckElement.clientHeight));
  }

  function autoScrollSync(): void {
    clearTimeout(autoScrollSyncTimeout);
    autoScrollSyncTimeout = setTimeout(() => {
      autoScroll.set(deckElement.scrollTop, {duration: 0})
    }, duration);
  }
</script>
<div class="fixed inset-0 z-10 bg-black/80" use:fade={{visible: $editorVisible, initial: false}} use:trapFocus={$editorVisible}>
  <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[40rem] bg-neutral-700 rounded-2xl overflow-x-auto x-scroll">
    <div class="min-w-[20.5rem] w-full h-full">
      <div class="w-full h-16">
        <Center>
          <div class="min-w-[14rem]">
            <p class="font-extrabold">Deck Editor</p>
            <label>
              <input type="checkbox" bind:checked={filterEnabled} on:change={updateFilter}/>
              Hide added subscriptions
            </label>
          </div>
        </Center>
      </div>
      <div class="w-full h-[calc(100%-7rem)]">
        <div class="inline-block w-[calc(50%-0.65rem)] min-w-[9.5rem] h-[calc(100%-0.5rem)] m-1 bg-neutral-800 rounded-xl">
          <div class="w-full h-6">
            <Center>Subscriptions</Center>
          </div>
          <div class="w-full h-[calc(100%-2rem)] overflow-y-auto y-scroll mb-2">
            <div class="w-[calc(100%-4px)] h-max mx-[2px] rounded-xl" use:dndzone={{
              items: filteredEntries,
              dropFromOthersDisabled: true,
              dragDisabled,
              flipDurationMs
            }} on:consider={handleSubscriptionDndConsider} on:finalize={handleSubscriptionDndFinalize}>
              {#each filteredEntries as entry (entry.id)}
                <div class="w-[calc(100%-0.5rem)] bg-neutral-700 m-1 p-0.5 rounded-2xl" animate:flip={{duration:flipDurationMs}}>
                  <img class="inline-block h-8 w-8 rounded-2xl align-top"
                       src={entry.subscription.thumbnailUrl}
                       alt=""
                       loading="lazy"
                       width="88"
                       height="88"
                       tabindex={dragDisabled? 0 : -1}
                       aria-label="drag-handle"
                       style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
                       on:mousedown={startDrag}
                       on:touchstart={startDrag}
                       on:keydown={handleKeyDown}/>
                  <span class="inline-block w-[calc(100%-2.5rem)] h-8 pt-1 align-top truncate" title={entry.subscription.title}>{entry.subscription.title}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
        <div class="inline-block w-[calc(50%-0.65rem)] min-w-[9.5rem] h-[calc(100%-0.5rem)] m-1 bg-neutral-800 rounded-xl">
          <div class="w-full h-6">
            <Center>Deck</Center>
          </div>
          <div class="w-full h-[calc(100%-2rem)] overflow-y-auto y-scroll mb-2" bind:this={deckElement} on:scroll={autoScrollSync}>
            <div class="w-[calc(100%-4px)] h-max mx-[2px] rounded-xl" use:dndzone={{
              items: settingsEntries,
              dropFromOthersDisabled: draggedEntry && settingsDropDisabled(),
              dragDisabled,
              flipDurationMs,
            }} on:consider={handleSettingsDndConsider} on:finalize={handleSettingsDndFinalize}>
              {#each settingsEntries as entry (entry.id)}
                <div class="w-[calc(100%-0.5rem)] bg-neutral-700 m-1 p-0.5 rounded-2xl truncate" animate:flip={{duration:flipDurationMs}}>
                  {#if isSubscription(entry)}
                    <span class="inline-block float-right h-8 w-8 px-2 -ml-8 cursor-pointer" on:click={() => removeSettingsEntry(entry)}>
                      <Fa icon={faTimesCircle} translateY={0.5}/>
                    </span>
                    <img class="inline-block h-8 w-8 rounded-2xl align-top"
                         src={entry.subscription.thumbnailUrl}
                         alt=""
                         loading="lazy"
                         width="88"
                         height="88"
                         tabindex={dragDisabled? 0 : -1}
                         aria-label="drag-handle"
                         style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
                         on:mousedown={startDrag}
                         on:touchstart={startDrag}
                         on:keydown={handleKeyDown}/>
                    <span class="inline-block w-[calc(100%-4rem)] h-8 pt-1 align-top truncate" title={entry.subscription.title}>{entry.subscription.title}</span>
                  {:else if isGroup(entry)}
                    <span class="inline-block float-right h-8 w-8 px-2 cursor-pointer" on:click={() => removeSettingsEntry(entry)}>
                      <Fa icon={faTimesCircle} translateY={0.5}/>
                    </span>
                    <span class="inline-block float-right h-8 w-8 px-2 -ml-16 cursor-pointer" on:click={() => entry.expanded = !entry.expanded}>
                      <Fa icon={entry.expanded ? faCompressAlt : faExpandAlt} translateY={0.5}/>
                    </span>
                    <span class="inline-block h-8 w-8 rounded-2xl bg-neutral-600 align-top"
                          tabindex={dragDisabled? 0 : -1}
                          aria-label="drag-handle"
                          style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
                          on:mousedown={startDrag}
                          on:touchstart={startDrag}
                          on:keydown={handleKeyDown}>
                      <FaLayers size="2x" class="-mx-1">
                        <Fa icon={faCircle} color="rgb(82 82 82)"/>
                        <Fa icon={faUsers} scale={0.5}/>
                      </FaLayers>
                    </span>
                    <input bind:value={entry.name} class="w-[calc(100%-6rem)] h-8 px-2 pb-0.5 bg-neutral-600 align-top rounded-2xl"/>
                    {#if entry.expanded}
                      <div class="w-full bg-neutral-500 mt-1 py-0.5 rounded-2xl" use:dndzone={{
                        items: entry.subscriptions,
                        dropFromOthersDisabled: draggedEntry && groupDropDisabled(entry),
                        dragDisabled,
                        flipDurationMs,
                      }} on:consider={e => handleGroupDndConsider(entry, e)} on:finalize={e => handleGroupDndFinalize(entry, e)}>
                        {#each entry.subscriptions as child (child.id)}
                          <div class="w-[calc(100%-0.5rem)] bg-neutral-700 m-1 p-0.5 rounded-2xl truncate" animate:flip={{duration:flipDurationMs}}>
                            <span class="inline-block float-right h-8 w-8 px-2 -ml-8 cursor-pointer" on:click={() => removeGroupEntry(entry, child)}>
                              <Fa icon={faTimesCircle} translateY={0.5}/>
                            </span>
                            <img class="inline-block h-8 w-8 rounded-2xl align-top"
                                 src={child.subscription.thumbnailUrl}
                                 alt=""
                                 loading="lazy"
                                 width="88"
                                 height="88"
                                 tabindex={dragDisabled? 0 : -1}
                                 aria-label="drag-handle"
                                 style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
                                 on:mousedown={startDrag}
                                 on:touchstart={startDrag}
                                 on:keydown={handleKeyDown}/>
                            <span class="inline-block w-[calc(100%-4rem)] h-8 pt-1 align-top truncate" title={child.subscription.title}>{child.subscription.title}</span>
                          </div>
                        {:else}
                          <div class="w-[calc(100%-0.5rem)] h-8 m-1.5">
                            <p class="w-full pt-1 text-center text-neutral-300">Drop subscriptions to add</p>
                          </div>
                        {/each}
                      </div>
                    {/if}
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
      <div class="w-full h-12">
        <PrimaryButton class="w-20 m-1 float-left" on:click={close}>Close</PrimaryButton>
        <div class="inline-block w-[calc(100%-11.5rem)] m-1">
          <input type="text" class="w-[calc(100%-6rem)] bg-neutral-800 p-1.5 rounded-l-2xl" bind:value={groupNameInput}/><!--
       --><PrimaryButton class="w-24 rounded-l-none" on:click={addGroup}>Add group</PrimaryButton>
        </div>
        <PrimaryButton class="w-20 m-1 float-right" on:click={save}>Save</PrimaryButton>
      </div>
    </div>
  </div>
</div>
