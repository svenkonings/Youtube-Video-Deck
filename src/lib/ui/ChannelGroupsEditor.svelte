<svelte:options runes />

<script module lang="ts">
  import {hideChannels, showChannels} from "$lib/ui/ChannelGroups.svelte";

  let editorVisible: boolean = $state(false);

  export function openEditor(): void {
    hideChannels(); // Hiding channels improves drag-and-drop performance
    editorVisible = true;
  }

  export function isEditorVisible(): boolean {
    return editorVisible;
  }

  export function closeEditor(): void {
    editorVisible = false;
    showChannels();
  }
</script>

<script lang="ts">
  import type {Channel} from "$lib/model/Channel";
  import type {ChannelGroup} from "$lib/model/ChannelGroup";
  import {
    ChannelEntry,
    ChannelGroupEntry,
    isChannelEntry,
    isChannelGroupEntry,
    SettingsEntry,
    settingsEntryToChannelGroup,
  } from "$lib/model/SettingsEntry";
  import Center from "$lib/ui/components/Center.svelte";
  import PrimaryButton from "$lib/ui/components/PrimaryButton.svelte";
  import Spinner from "$lib/ui/components/Spinner.svelte";
  import {responseToErrorMessage} from "$lib/util/error";
  import {fade} from "$lib/util/fade.svelte";
  import {trapFocus} from "$lib/util/trapFocus.svelte";

  import {faCircle, faCompressAlt, faExpandAlt, faTimesCircle, faUsers} from "@fortawesome/free-solid-svg-icons";
  import {onDestroy} from "svelte";
  import {
    dragHandle,
    dragHandleZone,
    SHADOW_ITEM_MARKER_PROPERTY_NAME,
    SOURCES,
    TRIGGERS,
    type DndEvent,
  } from "svelte-dnd-action";
  import Fa, {FaLayers} from "svelte-fa";
  import {flip} from "svelte/animate";
  import {tweened} from "svelte/motion";

  type Props = {channelGroups: ChannelGroup[]};

  let {channelGroups = $bindable()}: Props = $props();

  let idCounter: number = 0;
  let subscriptionEntries: ChannelEntry[] = $state()!;
  let settingsEntries: SettingsEntry[] = $state()!;
  let searchInput: string = $state("");
  let hideAddedSubscriptions = $state(true);
  let filteredSubscriptions: ChannelEntry[] = $derived(
    filterSubscriptions(subscriptionEntries, searchInput, hideAddedSubscriptions),
  );
  let groupNameInput: string = $state("");

  function nextId(): string {
    return (idCounter++).toString(10);
  }

  async function initEntries(editorVisible: boolean): Promise<void> {
    // Only load subscriptions after opening editor
    if (!editorVisible) return;

    if (subscriptionEntries === undefined) {
      const subscriptions = await loadSubscriptions();
      subscriptionEntries = subscriptions.map(s => ChannelEntry(nextId, s));
    }
    if (settingsEntries === undefined) {
      settingsEntries = channelGroups.map(c => SettingsEntry(nextId, c));
    }
  }

  async function loadSubscriptions(): Promise<Channel[]> {
    const response = await fetch("/api/subscriptions");
    if (!response.ok) throw await responseToErrorMessage(response);
    return await response.json();
  }

  function filterSubscriptions(
    subscriptionEntries: ChannelEntry[] | undefined,
    searchInput: string,
    hideAddedSubscriptions: boolean,
  ): ChannelEntry[] {
    if (subscriptionEntries === undefined) return [];

    let filteredSubscriptions = subscriptionEntries;

    // Filter based on added subscriptions
    if (hideAddedSubscriptions) {
      const enabledChannelIds = new Set(
        settingsEntries?.flatMap(s => (isChannelEntry(s) ? [s.channelId] : s.channels.map(c => c.channelId))),
      );
      filteredSubscriptions = filteredSubscriptions.filter(s => !enabledChannelIds.has(s.channelId));
    }

    // Filter based on search
    const search = searchInput.trim().toLowerCase();
    if (search.length > 0) {
      filteredSubscriptions = filteredSubscriptions.filter(s => s.title.toLowerCase().includes(search));
    }

    return filteredSubscriptions;
  }

  function updateFilter() {
    filteredSubscriptions = filterSubscriptions(subscriptionEntries, searchInput, hideAddedSubscriptions);
  }

  function addGroup() {
    const groupName = groupNameInput.trim();
    if (groupName !== "") {
      settingsEntries.push({id: nextId(), name: groupName, expanded: true, channels: []});
      groupNameInput = "";
    }
  }

  async function save(e: MouseEvent): Promise<void> {
    const button = e.target as HTMLButtonElement;
    button.disabled = true;
    channelGroups = settingsEntries.map(e => settingsEntryToChannelGroup(e));
    const response = await fetch("/api/settings", {
      method: "PUT",
      body: JSON.stringify({channelGroups}),
      headers: {"content-type": "application/json"},
    });
    if (!response.ok) throw await responseToErrorMessage(response);
    closeEditor();
    button.disabled = false;
  }

  /*
   * Drag and drop code
   */

  const flipDurationMs = 300;
  let draggedEntry: SettingsEntry | undefined = $state();

  function handleSubscriptionDndConsider(e: CustomEvent<DndEvent>): void {
    console.log("handleSubscriptionDndConsider", e);
    if (e.detail.info.source === SOURCES.POINTER && e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
      const index = subscriptionEntries.findIndex(s => s.id === e.detail.info.id);
      draggedEntry = subscriptionEntries[index];
      // Create a copy with a different id
      subscriptionEntries[index] = {...draggedEntry, id: nextId()};
      updateFilter();
      startAutoScroll();
    }
  }

  function handleSettingsDndConsider(e: CustomEvent<DndEvent>): void {
    console.log("handleSettingsDndConsider", e);
    if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
      draggedEntry = settingsEntries.find(s => s.id === e.detail.info.id)!;
      startAutoScroll();
    }
    settingsEntries = e.detail.items as SettingsEntry[];
  }

  function handleSettingsDndFinalize(e: CustomEvent<DndEvent>): void {
    console.log("handleSettingsDndFinalize", e);
    settingsEntries = e.detail.items as SettingsEntry[];
    updateFilter();
  }

  function settingsDropDisabled(): boolean {
    console.log("settingsDropDisabled");
    if (draggedEntry && isChannelEntry(draggedEntry)) {
      const channelId = draggedEntry.channelId;
      return settingsEntries.some(e => !isShadowItem(e) && isChannelEntry(e) && e.channelId === channelId);
    } else {
      return false;
    }
  }

  function removeSettingsEntry(entry: SettingsEntry): void {
    console.log("removeSettingsEntry", entry);
    settingsEntries = settingsEntries.filter(s => s.id !== entry.id);
    updateFilter();
  }

  function handleGroupDndConsider(group: ChannelGroupEntry, e: CustomEvent<DndEvent>): void {
    console.log("handleGroupDndConsider", group, e);
    if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
      draggedEntry = group.channels.find(c => c.id === e.detail.info.id);
      startAutoScroll();
    }
    group.channels = e.detail.items as ChannelEntry[];
  }

  function handleGroupDndFinalize(group: ChannelGroupEntry, e: CustomEvent<DndEvent>): void {
    console.log("handleGroupDndFinalize", group, e);
    group.channels = e.detail.items as ChannelEntry[];
    updateFilter();
  }

  function groupDropDisabled(entry: ChannelGroupEntry): boolean {
    console.log("groupDropDisabled", entry);
    if (draggedEntry && isChannelEntry(draggedEntry)) {
      const channelId = draggedEntry.channelId;
      return entry.channels.some(c => !isShadowItem(c) && c.channelId === channelId);
    } else {
      return true;
    }
  }

  function removeGroupEntry(entry: ChannelGroupEntry, child: ChannelEntry): void {
    console.log("removeGroupEntry", entry, child);
    entry.channels = entry.channels.filter(s => s.id !== child.id);
    updateFilter();
  }

  function keyClick(e: KeyboardEvent): boolean {
    console.log("keyClick", e);
    return e.key === "Enter" || e.key === " ";
  }

  /*
   * Auto-scroll code
   */

  let deckElement: HTMLDivElement;
  let deckBounds: DOMRect;
  const scrollOffset = 32;
  const duration = 100;
  const autoScroll = tweened(0, {duration: 2 * duration});
  let autoScrollInterval: NodeJS.Timeout | string | number | undefined;
  let autoScrollSyncTimeout: NodeJS.Timeout | string | number | undefined;

  onDestroy(autoScroll.subscribe(value => deckElement && (deckElement.scrollTop = value)));

  function startAutoScroll(): void {
    if (!autoScrollInterval) {
      deckBounds = deckElement.getBoundingClientRect();
      autoScrollInterval = setInterval(updateAutoScroll, duration);
    }
  }

  function updateAutoScroll(): void {
    const draggedElement = document.getElementById("dnd-action-dragged-el");
    if (draggedElement) {
      const top =
        parseFloat(draggedElement.style.top.slice(0, -2)) +
        parseFloat(draggedElement.style.transform.split(", ")[1].slice(0, -2));
      const bottom = top + parseFloat(draggedElement.style.height.slice(0, -2));
      if (bottom + scrollOffset >= deckBounds.bottom) {
        autoScroll.update(value => clampToContainer(value + bottom + scrollOffset - deckBounds.bottom));
      } else if (top - scrollOffset <= deckBounds.top) {
        autoScroll.update(value => clampToContainer(value + top - scrollOffset - deckBounds.top));
      }
    } else {
      clearInterval(autoScrollInterval);
      autoScrollInterval = undefined;
    }
  }

  function clampToContainer(value: number): number {
    return Math.max(0, Math.min(value, deckElement.scrollHeight - deckElement.clientHeight));
  }

  function autoScrollSync(): void {
    clearTimeout(autoScrollSyncTimeout);
    autoScrollSyncTimeout = setTimeout(() => {
      autoScroll.set(deckElement.scrollTop, {duration: 0});
    }, duration);
  }

  function isShadowItem(obj: object): boolean {
    return (
      SHADOW_ITEM_MARKER_PROPERTY_NAME in obj &&
      typeof obj[SHADOW_ITEM_MARKER_PROPERTY_NAME] === "boolean" &&
      obj[SHADOW_ITEM_MARKER_PROPERTY_NAME]
    );
  }
</script>

<div
  class="fixed inset-0 z-10 hidden bg-black/80"
  {@attach fade(() => editorVisible)}
  {@attach trapFocus(() => editorVisible)}>
  <div
    class="x-scroll absolute inset-y-0 left-1/2 w-full max-w-160 -translate-x-1/2 overflow-x-auto rounded-2xl bg-neutral-700">
    <div class="h-full w-full min-w-82">
      <div class="h-24 w-full">
        <Center>
          <div class="min-w-56">
            <p class="font-extrabold">Deck Editor</p>
            <div class="relative m-1 h-8 w-full">
              <input
                class="h-8 w-full rounded-2xl bg-neutral-600 pr-7 pb-0.5 pl-2"
                type="text"
                bind:value={searchInput}
                placeholder="Search subscriptions..."
                aria-label="Search subscriptions" />
              <button
                type="button"
                class="absolute right-2 h-8 cursor-pointer"
                onclick={() => (searchInput = "")}
                onkeydown={e => keyClick(e) && (searchInput = "")}>
                <Fa icon={faTimesCircle} />
              </button>
            </div>
            <label class="block">
              <input type="checkbox" bind:checked={hideAddedSubscriptions} />
              Hide added subscriptions
            </label>
          </div>
        </Center>
      </div>
      <div class="h-[calc(100%-9rem)] w-full">
        <div class="m-1 inline-block h-[calc(100%-0.5rem)] w-[calc(50%-0.65rem)] min-w-38 rounded-xl bg-neutral-800">
          <div class="h-6 w-full">
            <Center>Subscriptions</Center>
          </div>
          <div class="y-scroll mb-2 h-[calc(100%-2rem)] w-full overflow-y-auto">
            {#await initEntries(editorVisible)}
              <Center><Spinner /></Center>
            {:then}
              <div
                class="mx-0.5 h-max min-h-[calc(100%-0.5rem)] w-[calc(100%-4px)] rounded-xl"
                aria-label="Subscriptions"
                use:dragHandleZone={{items: filteredSubscriptions, dropFromOthersDisabled: true, flipDurationMs}}
                onconsider={handleSubscriptionDndConsider}>
                {#each filteredSubscriptions as subscription (subscription.id)}
                  <div
                    class="m-1 w-[calc(100%-0.5rem)] rounded-2xl bg-neutral-700 p-0.5"
                    aria-label={subscription.title}
                    animate:flip={{duration: flipDurationMs}}>
                    <img
                      use:dragHandle
                      class="inline-block h-8 w-8 rounded-2xl align-top"
                      src={subscription.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      width="88"
                      height="88"
                      aria-label="Drag-handle" />
                    <span
                      class="inline-block h-8 w-[calc(100%-2.5rem)] truncate pt-1 align-top"
                      title={subscription.title}>{subscription.title}</span>
                  </div>
                {/each}
              </div>
            {/await}
          </div>
        </div>
        <div class="m-1 inline-block h-[calc(100%-0.5rem)] w-[calc(50%-0.65rem)] min-w-38 rounded-xl bg-neutral-800">
          <div class="h-6 w-full">
            <Center>Deck</Center>
          </div>
          <div
            class="y-scroll mb-2 h-[calc(100%-2rem)] w-full overflow-y-auto"
            bind:this={deckElement}
            onscroll={autoScrollSync}>
            {#if settingsEntries === undefined}
              <Center><Spinner /></Center>
            {:else}
              <div
                class="mx-0.5 h-max min-h-[calc(100%-0.5rem)] w-[calc(100%-4px)] rounded-xl"
                aria-label="Deck"
                use:dragHandleZone={{
                  items: settingsEntries,
                  dropFromOthersDisabled: draggedEntry && settingsDropDisabled(),
                  flipDurationMs,
                }}
                onconsider={handleSettingsDndConsider}
                onfinalize={handleSettingsDndFinalize}>
                {#each settingsEntries as entry (entry.id)}
                  <div
                    class="m-1 w-[calc(100%-0.5rem)] rounded-2xl bg-neutral-700 p-0.5"
                    aria-label={isChannelEntry(entry) ? entry.title : entry.name}
                    animate:flip={{duration: flipDurationMs}}>
                    {#if isChannelEntry(entry)}
                      <img
                        use:dragHandle
                        class="inline-block h-8 w-8 rounded-2xl align-top"
                        src={entry.thumbnailUrl}
                        alt=""
                        loading="lazy"
                        width="88"
                        height="88"
                        aria-label="Drag-handle" />
                      <span class="inline-block h-8 w-[calc(100%-4rem)] truncate pt-1 align-top" title={entry.title}
                        >{entry.title}</span>
                      <button
                        type="button"
                        class="float-right -ml-8 h-8 w-8 cursor-pointer px-2"
                        aria-label="Remove"
                        onclick={() => removeSettingsEntry(entry)}
                        onkeydown={e => keyClick(e) && removeSettingsEntry(entry)}>
                        <Fa icon={faTimesCircle} />
                      </button>
                    {:else if isChannelGroupEntry(entry)}
                      <span
                        use:dragHandle
                        class="inline-block h-8 w-8 rounded-2xl bg-neutral-600 align-top"
                        aria-label="drag-handle">
                        <FaLayers size="2x" class="-mx-1">
                          <Fa icon={faCircle} color="rgb(82 82 82)" />
                          <Fa icon={faUsers} scale={0.5} />
                        </FaLayers>
                      </span>
                      <input
                        bind:value={entry.name}
                        class="h-8 w-[calc(100%-6rem)] rounded-2xl bg-neutral-600 px-2 pb-0.5 align-top" />
                      <div class="float-right -ml-16 inline-block h-8 w-16">
                        <button
                          type="button"
                          class="h-8 w-8 cursor-pointer px-2"
                          aria-label={entry.expanded ? "Collapse" : "Expand"}
                          onclick={() => (entry.expanded = !entry.expanded)}
                          onkeydown={e => keyClick(e) && (entry.expanded = !entry.expanded)}>
                          <Fa icon={entry.expanded ? faCompressAlt : faExpandAlt} />
                        </button>
                        <button
                          type="button"
                          class="float-right h-8 w-8 cursor-pointer px-2"
                          aria-label="Remove"
                          onclick={() => removeSettingsEntry(entry)}
                          onkeydown={e => keyClick(e) && removeSettingsEntry(entry)}>
                          <Fa icon={faTimesCircle} />
                        </button>
                      </div>
                      {#if entry.expanded}
                        <div
                          class="mt-1 w-full rounded-2xl bg-neutral-500 py-0.5"
                          aria-label={entry.name + " subscriptions"}
                          use:dragHandleZone={{
                            items: entry.channels,
                            dropFromOthersDisabled: draggedEntry && groupDropDisabled(entry),
                            flipDurationMs,
                          }}
                          onconsider={e => handleGroupDndConsider(entry, e)}
                          onfinalize={e => handleGroupDndFinalize(entry, e)}>
                          {#each entry.channels as child (child.id)}
                            <div
                              class="m-1 w-[calc(100%-0.5rem)] rounded-2xl bg-neutral-700 p-0.5"
                              aria-label={child.title}
                              animate:flip={{duration: flipDurationMs}}>
                              <img
                                use:dragHandle
                                class="inline-block h-8 w-8 rounded-2xl align-top"
                                src={child.thumbnailUrl}
                                alt=""
                                loading="lazy"
                                width="88"
                                height="88"
                                aria-label="drag-handle" />
                              <span
                                class="inline-block h-8 w-[calc(100%-4rem)] truncate pt-1 align-top"
                                title={child.title}>{child.title}</span>
                              <button
                                type="button"
                                class="float-right -ml-8 h-8 w-8 cursor-pointer px-2"
                                aria-label="Remove"
                                onclick={() => removeGroupEntry(entry, child)}
                                onkeydown={e => keyClick(e) && removeGroupEntry(entry, child)}>
                                <Fa icon={faTimesCircle} />
                              </button>
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
                {:else}
                  <div class="w-[calc(100%-0.5rem)] m-1">
                    <p class="w-full text-center text-neutral-300">
                      Drag and drop subscriptions by dragging the channel image
                    </p>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
      <div class="h-12 w-full">
        <PrimaryButton class="float-left m-1 w-20" onclick={closeEditor}>Close</PrimaryButton>
        <div class="m-1 inline-block w-[calc(100%-11.5rem)]">
          <input
            type="text"
            class="w-[calc(100%-6rem)] rounded-l-2xl bg-neutral-800 p-1.5"
            bind:value={groupNameInput} /><!--
       --><PrimaryButton class="w-24 rounded-l-none" onclick={addGroup}
            >Add group</PrimaryButton>
        </div>
        <PrimaryButton class="float-right m-1 w-20" onclick={save}>Save</PrimaryButton>
      </div>
    </div>
  </div>
</div>
