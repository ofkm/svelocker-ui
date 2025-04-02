import { authenticateUser, createSession } from '$lib/services/auth/local';
import { error, json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('LocalLogin');

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const formData = await request.formData();
		const username = formData.get('username')?.toString();
		const password = formData.get('password')?.toString();

		if (!username || !password) {
			logger.warn('Missing username or password in login attempt');
			return json({ success: false, message: 'Username and password are required' }, { status: 400 });
		}

		logger.debug(`Local authentication attempt for user: ${username}`);

		const user = await authenticateUser(username, password);

		if (!user) {
			logger.debug(`Authentication failed for user: ${username}`);
			return json({ success: false, message: 'Invalid username or password' }, { status: 401 });
		}

		// Create session
		createSession(user, cookies);
		logger.info(`User authenticated successfully: ${username}`);

		// Use return redirect instead of throw redirect
		return json({ success: true, redirectTo: '/' });
	} catch (e) {
		logger.error('Unexpected error during login:', e);
		return json({ success: false, message: 'An unexpected error occurred' }, { status: 500 });
	}
};
