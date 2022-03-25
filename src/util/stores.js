import {writable} from "svelte/store";
import {indexedDBStorage, persist} from "@macfja/svelte-persistent-store";

export const subscriptions = persist(writable(), indexedDBStorage(), 'subscriptions');

export const videoIdStore = writable();
export const playlistIdStore = writable();
