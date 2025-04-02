import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('Logout');

export const GET: RequestHandler = async ({ cookies, locals }) => {
	// Clear all auth cookies
	cookies.delete('session', { path: '/' });
	cookies.delete('access_token', { path: '/' });
	cookies.delete('auth_state', { path: '/' });
	cookies.delete('auth_code_verifier', { path: '/' });
	cookies.delete('auth_nonce', { path: '/' });

	logger.info('User logged out successfully', { userId: locals.user?.userId });

	throw redirect(302, '/auth/login');
};
