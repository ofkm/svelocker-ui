import { handleCallback } from '$lib/services/auth/oidc';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('OIDCCallback');

export const GET: RequestHandler = async ({ url, cookies }) => {
	let redirectUrl = '/'; // Default redirect URL is root
	try {
		const { userInfo, tokenSet } = await handleCallback(url, cookies);

		// Store user session
		cookies.set(
			'session',
			JSON.stringify({
				userId: userInfo.sub,
				name: userInfo.name,
				email: userInfo.email,
				picture: userInfo.picture,
				isAuthenticated: true,
				expiresAt: tokenSet.expires_at
			}),
			{
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV !== 'development', // Only secure in production
				maxAge: 60 * 60 * 24 // 1 day
			}
		);

		// Store access token securely
		if (tokenSet.access_token) {
			cookies.set('access_token', tokenSet.access_token, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV !== 'development', // Only secure in production
				maxAge: tokenSet.expires_in
			});
		}

		logger.info('Authentication successful, redirecting to dashboard');
	} catch (error) {
		logger.error('Authentication error:', error);
		redirectUrl = '/auth/error'; // Redirect to error page on failure
	}

	throw redirect(302, redirectUrl);
};
