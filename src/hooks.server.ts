import { RegistrySyncService } from '$lib/services/sync';
import { Logger } from '$lib/services/logger';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import { initializeOIDC } from '$lib/services/auth/oidc';
import { initializeLocalAuth } from '$lib/services/auth/local';
import { db, UserModel } from '$lib/services/database';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

const logger = Logger.getInstance('ServerHooks');

// Initialize services when server starts
const syncService = RegistrySyncService.getInstance();
syncService.start();

// Initialize local authentication - make sure LOCAL_AUTH_ENABLED exists
const isLocalAuthEnabled = privateEnv.LOCAL_AUTH_ENABLED === 'true';
logger.info('Local auth enabled:', { enabled: isLocalAuthEnabled });

// Initialize local authentication
(async () => {
	try {
		// Set up local auth if enabled
		if (isLocalAuthEnabled) {
			await initializeLocalAuth();
			logger.info('Local authentication initialized');

			// Log count of existing users
			const userCount = UserModel.count();
			const adminCount = UserModel.countAdmins();
			logger.info(`Users in database: ${userCount} (${adminCount} admins)`);
		}
	} catch (error) {
		logger.error('Failed to initialize local authentication:', error);
	}
})();

export const handle: Handle = async ({ event, resolve }) => {
	// Initialize OIDC client on server start if enabled
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

				// For local auth sessions, verify the user still exists in the database
				if (session.authMethod === 'local' && session.userId) {
					const userExists = UserModel.getById(session.userId);
					if (!userExists) {
						logger.warn('Session references non-existent user, invalidating', { userId: session.userId });
						event.cookies.delete('session', { path: '/' });
						event.locals.user = undefined;
					}
				}

				if (event.locals.user) {
					logger.debug('Valid session found for user', {
						userId: session.userId,
						authMethod: session.authMethod
					});
				}
			}
		} catch (error) {
			// Invalid session cookie, clear it
			event.cookies.delete('session', { path: '/' });
			logger.error('Invalid session cookie, clearing', error);
		}
	}

	// Public routes that don't require authentication
	const publicRoutes = ['/auth/login', '/auth/callback', '/auth/error', '/auth/logout', '/auth/login/oidc', '/auth/login/local'];

	// Check if current route is in the public routes
	const isPublicRoute = publicRoutes.some((route) => event.url.pathname === route || event.url.pathname.startsWith(route + '/'));

	// Check if we have valid authentication options - use the variable we defined above
	const hasAuthOptions = env.PUBLIC_OIDC_ENABLED === 'true' || isLocalAuthEnabled;

	// Skip auth checks if no auth methods are configured
	if (!hasAuthOptions && !event.url.pathname.startsWith('/auth/')) {
		logger.debug('No authentication methods configured, skipping auth check');
	}
	// Force redirect to home if user is already authenticated and trying to access login page
	else if (event.url.pathname === '/auth/login' && event.locals.user?.isAuthenticated) {
		logger.debug('User already authenticated, redirecting to home');
		throw redirect(302, '/');
	}
	// Protect all routes except public ones when auth is configured
	else if (hasAuthOptions && !isPublicRoute && !event.locals.user?.isAuthenticated) {
		logger.debug('Unauthenticated access attempt, redirecting to login', {
			path: event.url.pathname
		});
		throw redirect(302, '/auth/login');
	}

	// Add user data to load function context
	const response = await resolve(event);
	return response;
};
