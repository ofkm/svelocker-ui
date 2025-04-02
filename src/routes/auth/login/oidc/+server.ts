import { getAuthUrl } from '$lib/services/auth/oidc';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	const authUrl = await getAuthUrl(cookies);

	if (!authUrl) {
		throw redirect(302, '/auth/login');
	}

	throw redirect(302, authUrl);
};
