<script lang="ts">
  import type { Settings } from "$lib/model/Settings";
  import type { Subscription } from "$lib/model/Subscription";
  import {
    isGroup,
    isSubscription,
    type SettingsEntry,
    type SubscriptionEntry,
    type SubscriptionGroupEntry,
  } from "$lib/types/SettingsEntry";
  import Center from "$lib/ui/components/Center.svelte";
  import PrimaryButton from "$lib/ui/components/PrimaryButton.svelte";
  import { responseToErrorMessage } from "$lib/util/error";
  import { fade } from "$lib/util/fade";
  import { trapFocus } from "$lib/util/trapFocus";

  import { faCircle, faCompressAlt, faExpandAlt, faTimesCircle, faUsers } from "@fortawesome/free-solid-svg-icons";
  import { getContext, onDestroy } from "svelte";
  import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, SOURCES, TRIGGERS, type DndEvent } from "svelte-dnd-action";
  import { Fa, FaLayers } from "svelte-fa";
  import { flip } from "svelte/animate";
  import { tweened } from "svelte/motion";
  import type { Writable } from "svelte/store";

  /*
   * General code
   */
  export let subscriptions: Subscription[];
  export let subscriptionMap: Map<string, Subscription>;

  const settingsStore: Writable<Settings> = getContext("settingsStore");
  const editorVisible: Writable<boolean | undefined> = getContext("editorVisible");

  $: if ($editorVisible) {
    load();
  }

  function close(): void {
    $editorVisible = false;
  }

  /*
   * Subscriptions and settings management
   */

  let idCounter: number = 0;
  let subscriptionEntries: SubscriptionEntry[] = [];
  let filterEnabled = true;
  let filteredEntries: SubscriptionEntry[] = [];
  let settingsEntries: SettingsEntry[] = [];
  let searchInput: string = "";
  let groupNameInput: string = "";

  function updateFilter() {
    if (filterEnabled) {
      const enabledChannels = new Set(
        settingsEntries.flatMap(e =>
          isGroup(e) ? e.subscriptions.map(s => s.subscription.channelId) : [e.subscription.channelId],
        ),
      );
      filteredEntries = subscriptionEntries.filter(e => !enabledChannels.has(e.subscription.channelId));
    } else {
      filteredEntries = subscriptionEntries;
    }
    searchInput = searchInput.trim();
    if (searchInput.length > 0) {
      filteredEntries = filteredEntries.filter(e => e.name.toLowerCase().includes(searchInput.toLowerCase()));
    }
  }

  $: if (searchInput) {
    updateFilter();
  }

  function addGroup() {
    if (groupNameInput !== "") {
      settingsEntries.push({ id: idCounter++, name: groupNameInput, expanded: true, subscriptions: [] });
      groupNameInput = "";
      settingsEntries = settingsEntries;
    }
  }

  function load(): void {
    idCounter = 0;
    subscriptionEntries = subscriptions.map(s => ({
      id: idCounter++,
      name: s.title,
      subscription: s,
    }));
    settingsEntries = $settingsStore.subscriptionGroups.map(s => {
      const groupSubscriptions = s.subscriptionIds.map(id => subscriptionMap.get(id) as Subscription);
      if (groupSubscriptions.length === 1 && s.name === groupSubscriptions[0].title) {
        return {
          id: idCounter++,
          name: s.name,
          subscription: groupSubscriptions[0],
        };
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
        };
      }
    });
    updateFilter();
  }

  async function save(e: MouseEvent): Promise<void> {
    const button = e.target as HTMLButtonElement;
    button.disabled = true;
    $settingsStore.subscriptionGroups = settingsEntries.map(entry => ({
      name: entry.name,
      expanded: isGroup(entry) && entry.expanded,
      subscriptionIds: isGroup(entry)
        ? entry.subscriptions.map(s => s.subscription.channelId)
        : [entry.subscription.channelId],
    }));
    const response = await fetch("/api/settings", {
      method: "PUT",
      body: JSON.stringify($settingsStore),
      headers: {
        "content-type": "application/json",
      },
    });
    if (!response.ok) throw await responseToErrorMessage(response);
    $editorVisible = false;
    button.disabled = false;
  }

  /*
   * Drag and drop code
   */

  const flipDurationMs = 300;
  let draggedEntry: SettingsEntry;
  let dragDisabled = true;

  function handleSubscriptionDndConsider(e: CustomEvent<DndEvent>): void {
    if (e.detail.info.source === SOURCES.POINTER && e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
      const index = subscriptionEntries.findIndex(s => s.id === Number(e.detail.info.id));
      draggedEntry = subscriptionEntries[index];
      // Create a copy with a different id
      subscriptionEntries[index] = { ...draggedEntry, id: idCounter++ };
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
      draggedEntry = settingsEntries.find(s => s.id === Number(e.detail.info.id)) as SettingsEntry;
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
      return settingsEntries.some(e => !isShadowItem(e) && isSubscription(e) && e.subscription.channelId === channelId);
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
      draggedEntry = group.subscriptions.find(s => s.id === Number(e.detail.info.id)) as SettingsEntry;
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
      return entry.subscriptions.some(s => !isShadowItem(s) && s.subscription.channelId === channelId);
    } else {
      return true;
    }
  }

  function removeGroupEntry(entry: SubscriptionGroupEntry, child: SubscriptionEntry): void {
    entry.subscriptions = entry.subscriptions.filter(s => s.id !== child.id);
    settingsEntries = settingsEntries;
    updateFilter();
  }

  function startDrag(e: UIEvent): void {
    e.preventDefault();
    dragDisabled = false;
  }

  function handleKeyDown(e: KeyboardEvent): void {
    if (keyClick(e) && dragDisabled) dragDisabled = false;
  }

  function keyClick(e: KeyboardEvent): boolean {
    return e.key === "Enter" || e.key === " ";
  }

  /*
   * Auto-scroll code
   */

  let deckElement: HTMLDivElement;
  let deckBounds: DOMRect;
  const scrollOffset = 32;
  const duration = 100;
  const autoScroll = tweened(0, { duration: 2 * duration });
  let autoScrollInterval: number | undefined;
  let autoScrollSyncTimeout: number;

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
      autoScroll.set(deckElement.scrollTop, { duration: 0 });
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
  class="fixed inset-0 z-10 bg-black/80"
  use:fade={{ visible: !!$editorVisible, initial: false }}
  use:trapFocus={!!$editorVisible}
>
  <div
    class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[40rem] bg-neutral-700 rounded-2xl overflow-x-auto x-scroll"
  >
    <div class="min-w-[20.5rem] w-full h-full">
      <div class="w-full h-24">
        <Center>
          <div class="min-w-[14rem]">
            <p class="font-extrabold">Deck Editor</p>
            <div class="relative w-full h-8 m-1">
              <input
                class="w-full h-8 pl-2 pr-7 pb-0.5 bg-neutral-600 rounded-2xl"
                type="text"
                bind:value={searchInput}
                placeholder="Search subscriptions..."
                aria-label="Search subscriptions"
                tabindex={dragDisabled ? 0 : -1}
              />
              <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <span
                class="absolute right-2 h-8 cursor-pointer"
                on:click={() => (searchInput = "")}
                on:keydown={e => keyClick(e) && (searchInput = "")}
                tabindex={dragDisabled ? 0 : -1}
              >
                <Fa icon={faTimesCircle} translateY={0.5} />
              </span>
            </div>
            <label class="block">
              <input
                type="checkbox"
                bind:checked={filterEnabled}
                on:change={updateFilter}
                tabindex={dragDisabled ? 0 : -1}
              />
              Hide added subscriptions
            </label>
          </div>
        </Center>
      </div>
      <div class="w-full h-[calc(100%-9rem)]">
        <div
          class="inline-block w-[calc(50%-0.65rem)] min-w-[9.5rem] h-[calc(100%-0.5rem)] m-1 bg-neutral-800 rounded-xl"
        >
          <div class="w-full h-6">
            <Center>Subscriptions</Center>
          </div>
          <div class="w-full h-[calc(100%-2rem)] overflow-y-auto y-scroll mb-2">
            <div
              class="w-[calc(100%-4px)] h-max min-h-[calc(100%-0.5rem)] mx-[2px] rounded-xl"
              aria-label="Subscriptions"
              use:dndzone={{
                items: filteredEntries,
                dropFromOthersDisabled: true,
                dragDisabled,
                flipDurationMs,
              }}
              on:consider={handleSubscriptionDndConsider}
              on:finalize={handleSubscriptionDndFinalize}
            >
              {#each filteredEntries as entry (entry.id)}
                <div
                  class="w-[calc(100%-0.5rem)] bg-neutral-700 m-1 p-0.5 rounded-2xl"
                  aria-label={entry.name}
                  animate:flip={{ duration: flipDurationMs }}
                >
                  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                  <img
                    class="inline-block h-8 w-8 rounded-2xl align-top"
                    src={entry.subscription.thumbnailUrl}
                    alt=""
                    loading="lazy"
                    width="88"
                    height="88"
                    tabindex={dragDisabled ? 0 : -1}
                    aria-label="Drag-handle"
                    style={dragDisabled ? "cursor: grab" : "cursor: grabbing"}
                    on:mousedown={startDrag}
                    on:touchstart={startDrag}
                    on:keydown={handleKeyDown}
                  />
                  <span
                    class="inline-block w-[calc(100%-2.5rem)] h-8 pt-1 align-top truncate"
                    title={entry.subscription.title}>{entry.subscription.title}</span
                  >
                </div>
              {/each}
            </div>
          </div>
        </div>
        <div
          class="inline-block w-[calc(50%-0.65rem)] min-w-[9.5rem] h-[calc(100%-0.5rem)] m-1 bg-neutral-800 rounded-xl"
        >
          <div class="w-full h-6">
            <Center>Deck</Center>
          </div>
          <div
            class="w-full h-[calc(100%-2rem)] overflow-y-auto y-scroll mb-2"
            bind:this={deckElement}
            on:scroll={autoScrollSync}
          >
            <div
              class="w-[calc(100%-4px)] h-max min-h-[calc(100%-0.5rem)] mx-[2px] rounded-xl"
              aria-label="Deck"
              use:dndzone={{
                items: settingsEntries,
                dropFromOthersDisabled: draggedEntry && settingsDropDisabled(),
                dragDisabled,
                flipDurationMs,
              }}
              on:consider={handleSettingsDndConsider}
              on:finalize={handleSettingsDndFinalize}
            >
              {#each settingsEntries as entry (entry.id)}
                <div
                  class="w-[calc(100%-0.5rem)] bg-neutral-700 m-1 p-0.5 rounded-2xl"
                  aria-label={entry.name}
                  animate:flip={{ duration: flipDurationMs }}
                >
                  {#if isSubscription(entry)}
                    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                    <img
                      class="inline-block h-8 w-8 rounded-2xl align-top"
                      src={entry.subscription.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      width="88"
                      height="88"
                      tabindex={dragDisabled ? 0 : -1}
                      aria-label="Drag-handle"
                      style={dragDisabled ? "cursor: grab" : "cursor: grabbing"}
                      on:mousedown={startDrag}
                      on:touchstart={startDrag}
                      on:keydown={handleKeyDown}
                    />
                    <span
                      class="inline-block w-[calc(100%-4rem)] h-8 pt-1 align-top truncate"
                      title={entry.subscription.title}>{entry.subscription.title}</span
                    >
                    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <span
                      class="inline-block float-right h-8 w-8 px-2 -ml-8 cursor-pointer"
                      aria-label="Remove"
                      on:click={() => removeSettingsEntry(entry)}
                      on:keydown={e => keyClick(e) && removeSettingsEntry(entry)}
                      tabindex={dragDisabled ? 0 : -1}
                    >
                      <Fa icon={faTimesCircle} translateY={0.5} />
                    </span>
                  {:else if isGroup(entry)}
                    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <span
                      class="inline-block h-8 w-8 rounded-2xl bg-neutral-600 align-top"
                      tabindex={dragDisabled ? 0 : -1}
                      aria-label="drag-handle"
                      style={dragDisabled ? "cursor: grab" : "cursor: grabbing"}
                      on:mousedown={startDrag}
                      on:touchstart={startDrag}
                      on:keydown={handleKeyDown}
                    >
                      <FaLayers size="2x" class="-mx-1">
                        <Fa icon={faCircle} color="rgb(82 82 82)" />
                        <Fa icon={faUsers} scale={0.5} />
                      </FaLayers>
                    </span>
                    <input
                      bind:value={entry.name}
                      class="w-[calc(100%-6rem)] h-8 px-2 pb-0.5 bg-neutral-600 align-top rounded-2xl"
                      tabindex={dragDisabled ? 0 : -1}
                    />
                    <div class="inline-block float-right h-8 w-16 -ml-16">
                      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                      <!-- svelte-ignore a11y-no-static-element-interactions -->
                      <span
                        class="inline-block h-8 w-8 px-2 cursor-pointer"
                        aria-label={entry.expanded ? "Collapse" : "Expand"}
                        on:click={() => (entry.expanded = !entry.expanded)}
                        on:keydown={e => keyClick(e) && (entry.expanded = !entry.expanded)}
                        tabindex={dragDisabled ? 0 : -1}
                      >
                        <Fa icon={entry.expanded ? faCompressAlt : faExpandAlt} translateY={0.5} />
                      </span>
                      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                      <!-- svelte-ignore a11y-no-static-element-interactions -->
                      <span
                        class="inline-block float-right h-8 w-8 px-2 cursor-pointer"
                        aria-label="Remove"
                        on:click={() => removeSettingsEntry(entry)}
                        on:keydown={e => keyClick(e) && removeSettingsEntry(entry)}
                        tabindex={dragDisabled ? 0 : -1}
                      >
                        <Fa icon={faTimesCircle} translateY={0.5} />
                      </span>
                    </div>
                    {#if entry.expanded}
                      <div
                        class="w-full bg-neutral-500 mt-1 py-0.5 rounded-2xl"
                        aria-label={entry.name + " subscriptions"}
                        use:dndzone={{
                          items: entry.subscriptions,
                          dropFromOthersDisabled: draggedEntry && groupDropDisabled(entry),
                          dragDisabled,
                          flipDurationMs,
                        }}
                        on:consider={e => handleGroupDndConsider(entry, e)}
                        on:finalize={e => handleGroupDndFinalize(entry, e)}
                      >
                        {#each entry.subscriptions as child (child.id)}
                          <div
                            class="w-[calc(100%-0.5rem)] bg-neutral-700 m-1 p-0.5 rounded-2xl"
                            aria-label={child.name}
                            animate:flip={{ duration: flipDurationMs }}
                          >
                            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                            <img
                              class="inline-block h-8 w-8 rounded-2xl align-top"
                              src={child.subscription.thumbnailUrl}
                              alt=""
                              loading="lazy"
                              width="88"
                              height="88"
                              tabindex={dragDisabled ? 0 : -1}
                              aria-label="drag-handle"
                              style={dragDisabled ? "cursor: grab" : "cursor: grabbing"}
                              on:mousedown={startDrag}
                              on:touchstart={startDrag}
                              on:keydown={handleKeyDown}
                            />
                            <span
                              class="inline-block w-[calc(100%-4rem)] h-8 pt-1 align-top truncate"
                              title={child.subscription.title}>{child.subscription.title}</span
                            >
                            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <span
                              class="inline-block float-right h-8 w-8 px-2 -ml-8 cursor-pointer"
                              aria-label="Remove"
                              on:click={() => removeGroupEntry(entry, child)}
                              on:keydown={e => keyClick(e) && removeGroupEntry(entry, child)}
                              tabindex={dragDisabled ? 0 : -1}
                            >
                              <Fa icon={faTimesCircle} translateY={0.5} />
                            </span>
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
          </div>
        </div>
      </div>
      <div class="w-full h-12">
        <PrimaryButton class="w-20 m-1 float-left" on:click={close} tabindex={dragDisabled ? 0 : -1}
          >Close</PrimaryButton
        >
        <div class="inline-block w-[calc(100%-11.5rem)] m-1">
          <input
            type="text"
            class="w-[calc(100%-6rem)] bg-neutral-800 p-1.5 rounded-l-2xl"
            bind:value={groupNameInput}
            tabindex={dragDisabled ? 0 : -1}
          /><!--
       --><PrimaryButton
            class="w-24 rounded-l-none"
            on:click={addGroup}
            tabindex={dragDisabled ? 0 : -1}>Add group</PrimaryButton
          >
        </div>
        <PrimaryButton class="w-20 m-1 float-right" on:click={save} tabindex={dragDisabled ? 0 : -1}>Save</PrimaryButton
        >
      </div>
    </div>
  </div>
</div>
