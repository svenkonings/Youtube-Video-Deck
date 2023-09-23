<script lang="ts">
  import type { Settings } from "$lib/model/Settings";
  import type { Subscription } from "$lib/model/Subscription";
  import { SubscriptionGroup } from "$lib/model/SubscriptionGroup";
  import SubscriptionOverview from "$lib/ui/SubscriptionOverview.svelte";
  import Center from "$lib/ui/components/Center.svelte";
  import HorizontalScroll from "$lib/ui/components/HorizontalScroll.svelte";
  import Spinner from "$lib/ui/components/Spinner.svelte";
  import { fade } from "$lib/util/fade";

  import { getContext, onDestroy } from "svelte";
  import type { Writable } from "svelte/store";

  export let subscriptionMap: Map<string, Subscription>;

  const settingsStore: Writable<Settings> = getContext("settingsStore");
  const editorVisible: Writable<boolean | undefined> = getContext("editorVisible");

  let subscriptionGroups: SubscriptionGroup[] | undefined = undefined;

  onDestroy(
    settingsStore.subscribe(
      async settings =>
        (subscriptionGroups = await Promise.all(
          settings.subscriptionGroups.map(s =>
            SubscriptionGroup(
              s.name,
              s.expanded,
              s.subscriptionIds.map(id => subscriptionMap.get(id) as Subscription),
            ),
          ),
        )),
    ),
  );
</script>

{#if subscriptionGroups === undefined}
  <Center>
    <Spinner />
  </Center>
{:else if subscriptionGroups.length === 0}
  <Center>
    <p>No subscriptions to display</p>
    <br />
    <p>Click the "Edit" button to add subscriptions</p>
  </Center>
{:else}
  <div class="w-full h-[calc(100%-6px)]" use:fade={{ visible: !$editorVisible, initial: true }}>
    <HorizontalScroll>
      <div class="w-max h-full">
        {#each subscriptionGroups as subscriptionGroup, index}
          <SubscriptionOverview {subscriptionGroup} {index} />
        {/each}
      </div>
    </HorizontalScroll>
  </div>
{/if}
