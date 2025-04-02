import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('AdminLayout');

export const load: LayoutServerLoad = async ({ locals }) => {
	// Check if the user is authenticated and is an admin
	if (!locals.user?.isAuthenticated) {
		logger.debug('Unauthenticated user attempted to access admin area');
		throw redirect(302, '/auth/login');
	}

	if (!locals.user?.isAdmin) {
		logger.warn('Non-admin user attempted to access admin area', { username: locals.user.username });
		throw redirect(302, '/');
	}

	return {
		user: locals.user
	};
};
