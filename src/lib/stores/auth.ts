import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export type UserSession = {
	userId: string;
	name: string | null;
	email: string | null;
	picture?: string;
	isAuthenticated: boolean;
	expiresAt?: number;
};

export const userSession: Writable<UserSession | null> = writable(null);

export function isAuthenticated(): boolean {
	let authenticated = false;
	userSession.subscribe((session) => {
		if (!session) return;

		authenticated = session.isAuthenticated && (!session.expiresAt || session.expiresAt * 1000 > Date.now());
	})();

	return authenticated;
}
