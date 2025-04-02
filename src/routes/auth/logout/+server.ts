import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	// Clear all authentication cookies
	cookies.delete('session', { path: '/' });
	cookies.delete('access_token', { path: '/' });

	throw redirect(302, '/');
};
