import { RegistrySyncService } from '$lib/services/sync';
import { Logger } from '$lib/services/logger';
import { env } from '$env/dynamic/public';
import { initializeOIDC } from '$lib/services/auth/oidc';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

const logger = Logger.getInstance('ServerHooks');

// Initialize sync service when server starts
const syncService = RegistrySyncService.getInstance();
syncService.start();

export const handle: Handle = async ({ event, resolve }) => {
	// Initialize OIDC client on server start
	if (env.PUBLIC_OIDC_ENABLED === 'true') {
		await initializeOIDC();
	}

	// Get session from cookies
	const sessionCookie = event.cookies.get('session');
	if (sessionCookie) {
		try {
			const session = JSON.parse(sessionCookie);

			// Check if session is expired
			if (session.expiresAt && session.expiresAt * 1000 < Date.now()) {
				event.cookies.delete('session', { path: '/' });
				event.cookies.delete('access_token', { path: '/' });
				logger.info('Session expired, clearing cookies');
			} else {
				// Set the user in locals for use in server-side rendering
				event.locals.user = session;
				logger.debug('Valid session found for user', { userId: session.userId });
			}
		} catch (error) {
			// Invalid session cookie, clear it
			event.cookies.delete('session', { path: '/' });
			logger.error('Invalid session cookie, clearing');
		}
	}

	// Public routes that don't require authentication
	const publicRoutes = ['/auth/login', '/auth/callback', '/auth/error', '/auth/logout', '/auth/login/oidc'];

	// Check if current route is in the public routes
	const isPublicRoute = publicRoutes.some((route) => event.url.pathname === route || event.url.pathname.startsWith(route + '/'));

	// Force redirect to home if user is already authenticated and trying to access login page
	if (event.url.pathname === '/auth/login' && event.locals.user?.isAuthenticated) {
		logger.debug('User already authenticated, redirecting to home');
		throw redirect(302, '/');
	}

	// Protect all routes except public ones
	if (!isPublicRoute && !event.locals.user?.isAuthenticated) {
		logger.debug('Unauthenticated access attempt, redirecting to login', { path: event.url.pathname });
		throw redirect(302, '/auth/login');
	}

	// Add user data to the page store
	const response = await resolve(event);
	return response;
};
