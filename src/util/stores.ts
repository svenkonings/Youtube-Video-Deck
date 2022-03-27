import type {Writable} from "svelte/store";
import {writable} from "svelte/store";
import type {PersistentStore} from "@macfja/svelte-persistent-store";
import {indexedDBStorage, persist} from "@macfja/svelte-persistent-store";
import type {Subscriptions} from "../model/Subscriptions";
import type {PlayerInput} from "../types/PlayerInput";

export const subscriptionsStore: PersistentStore<Subscriptions> = persist(writable(), indexedDBStorage(), 'subscriptions');

export const playerStore: Writable<PlayerInput> = writable();
