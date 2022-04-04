import type {Writable} from "svelte/store";
import {writable} from "svelte/store";
import type {PersistentStore} from "@macfja/svelte-persistent-store";
import {indexedDBStorage, persist} from "@macfja/svelte-persistent-store";
import type {Subscriptions} from "../model/Subscriptions";
import type {PlayerInput} from "../types/PlayerInput";
import type {Settings} from "../model/Settings";

export const subscriptionsStore: PersistentStore<Subscriptions> = persist(writable(), indexedDBStorage(), 'subscriptions');
export const settingsStore: Writable<Settings> = writable();

export const editorVisible: Writable<boolean> = writable(false);
export const playerStore: Writable<PlayerInput> = writable();
