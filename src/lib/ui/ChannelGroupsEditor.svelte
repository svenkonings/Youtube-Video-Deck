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

  type Props = {channelGroups: ChannelGroup[]};

  let {channelGroups = $bindable()}: Props = $props();

  let idCounter: number = 0;
  let subscriptionEntries: ChannelEntry[] | undefined = $state();
  let settingsEntries: SettingsEntry[] = $derived(channelGroups.map(c => SettingsEntry(nextId, c)));
  let searchInput: string = $state("");
  let hideAddedSubscriptions = $state(true);
  let filteredSubscriptions: ChannelEntry[] = $derived(
    filterSubscriptions(subscriptionEntries, settingsEntries, searchInput, hideAddedSubscriptions),
  );
  let groupNameInput: string = $state("");

  function nextId(): string {
    return (idCounter++).toString(10);
  }

  async function initSubscriptions(editorVisible: boolean): Promise<void> {
    // Only load subscriptions after opening editor
    if (editorVisible && subscriptionEntries === undefined) {
      const subscriptions = await loadSubscriptions();
      subscriptionEntries = subscriptions.map(s => ChannelEntry(nextId, s));
    }
  }

  async function loadSubscriptions(): Promise<Channel[]> {
    const response = await fetch("/api/subscriptions");
    if (!response.ok) throw await responseToErrorMessage(response);
    return await response.json();
  }

  function filterSubscriptions(
    subscriptionEntries: ChannelEntry[] | undefined,
    settingsEntries: SettingsEntry[],
    searchInput: string,
    hideAddedSubscriptions: boolean,
  ): ChannelEntry[] {
    if (subscriptionEntries === undefined) return [];

    let filteredSubscriptions = subscriptionEntries;

    // Filter based on added subscriptions
    if (hideAddedSubscriptions) {
      const enabledChannelIds = new Set(
        settingsEntries.flatMap(s => (isChannelEntry(s) ? [s.channelId] : s.channels.map(c => c.channelId))),
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
    try {
      channelGroups = settingsEntries.map(e => settingsEntryToChannelGroup(e));
      const response = await fetch("/api/settings", {
        method: "PUT",
        body: JSON.stringify({channelGroups}),
        headers: {"content-type": "application/json"},
      });
      if (!response.ok) throw await responseToErrorMessage(response);
      closeEditor();
    } finally {
      button.disabled = false;
    }
  }

  /*
   * Drag and drop code
   */

  const flipDurationMs = 300;
  let draggedEntry: SettingsEntry | undefined = $state();

  function handleSubscriptionDndConsider(e: CustomEvent<DndEvent>): void {
    if (
      subscriptionEntries &&
      e.detail.info.source === SOURCES.POINTER &&
      e.detail.info.trigger === TRIGGERS.DRAG_STARTED
    ) {
      const index = subscriptionEntries.findIndex(s => s.id === e.detail.info.id);
      draggedEntry = subscriptionEntries[index];
      // Create a copy with a different id
      subscriptionEntries[index] = {...draggedEntry, id: nextId()};
    }
  }

  function handleSettingsDndConsider(e: CustomEvent<DndEvent>): void {
    if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
      draggedEntry = settingsEntries.find(s => s.id === e.detail.info.id)!;
    }
    settingsEntries = e.detail.items as SettingsEntry[];
  }

  function handleSettingsDndFinalize(e: CustomEvent<DndEvent>): void {
    settingsEntries = e.detail.items as SettingsEntry[];
  }

  function settingsDropDisabled(): boolean {
    if (draggedEntry && isChannelEntry(draggedEntry)) {
      const channelId = draggedEntry.channelId;
      return settingsEntries.some(e => !isShadowItem(e) && isChannelEntry(e) && e.channelId === channelId);
    } else {
      return false;
    }
  }

  function removeSettingsEntry(entry: SettingsEntry): void {
    settingsEntries = settingsEntries.filter(s => s.id !== entry.id);
  }

  function handleGroupDndConsider(group: ChannelGroupEntry, e: CustomEvent<DndEvent>): void {
    if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
      draggedEntry = group.channels.find(c => c.id === e.detail.info.id);
    }
    group.channels = e.detail.items as ChannelEntry[];
  }

  function handleGroupDndFinalize(group: ChannelGroupEntry, e: CustomEvent<DndEvent>): void {
    group.channels = e.detail.items as ChannelEntry[];
  }

  function groupDropDisabled(entry: ChannelGroupEntry): boolean {
    if (draggedEntry && isChannelEntry(draggedEntry)) {
      const channelId = draggedEntry.channelId;
      return entry.channels.some(c => !isShadowItem(c) && c.channelId === channelId);
    } else {
      return true;
    }
  }

  function removeGroupEntry(entry: ChannelGroupEntry, child: ChannelEntry): void {
    entry.channels = entry.channels.filter(s => s.id !== child.id);
  }

  function keyClick(e: KeyboardEvent): boolean {
    return e.key === "Enter" || e.key === " ";
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
            {#await initSubscriptions(editorVisible)}
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
          <div class="y-scroll mb-2 h-[calc(100%-2rem)] w-full overflow-y-auto">
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
