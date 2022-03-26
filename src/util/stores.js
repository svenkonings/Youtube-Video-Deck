import {writable} from "svelte/store";
import {indexedDBStorage, persist} from "@macfja/svelte-persistent-store";

export const subscriptionsStore = persist(writable(), indexedDBStorage(), 'subscriptions');

export const playerStore = writable();
