// src/lib/stores/syncStore.ts
import { writable } from 'svelte/store';

export const lastSyncTimestamp = writable<number>(Date.now());
export const isSyncing = writable<boolean>(false);

export function notifySyncComplete() {
	lastSyncTimestamp.set(Date.now());
	isSyncing.set(false);
}

export function startSync() {
	isSyncing.set(true);
}
