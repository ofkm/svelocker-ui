import { Logger } from '$lib/services/logger';
import { UserModel } from '$lib/services/database/models/user';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';

const logger = Logger.getInstance('LocalAuth');

/**
 * Initialize the local authentication service
 */
export async function initializeLocalAuth(): Promise<void> {
	try {
		// Check if we need to create a default admin user
		if (env.CREATE_DEFAULT_ADMIN === 'true') {
			const adminCount = UserModel.countAdmins();

			if (adminCount === 0) {
				// Create default admin user if none exists
				const user = UserModel.create({
					username: 'admin',
					password: 'admin', // This should be changed on first login
					email: 'admin@local',
					name: 'Administrator',
					isAdmin: true
				});

				if (user) {
					logger.info('Created default admin user. Please change the password immediately.');
				} else {
					logger.error('Failed to create default admin user.');
				}
			}
		}
	} catch (error) {
		logger.error('Error initializing local authentication:', error);
	}
}

/**
 * Authenticate a user with username and password
 */
export async function authenticateUser(username: string, password: string): Promise<ReturnType<typeof UserModel.authenticate>> {
	try {
		const user = UserModel.authenticate(username, password);
		return user;
	} catch (error) {
		logger.error('Error during authentication:', error);
		return null;
	}
}

/**
 * Create a user session after successful authentication
 */
export function createSession(user: ReturnType<typeof UserModel.authenticate>, cookies: Cookies): void {
	if (!user) return;

	// Create session with 1 day expiry
	const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

	cookies.set(
		'session',
		JSON.stringify({
			userId: user.id,
			username: user.username,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin,
			isAuthenticated: true,
			authMethod: 'local',
			expiresAt
		}),
		{
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Only secure in production
			maxAge: 60 * 60 * 24 // 1 day
		}
	);
}

/**
 * Get a user by ID
 */
export async function getUserById(id: string): Promise<ReturnType<typeof UserModel.getById>> {
	return UserModel.getById(id);
}
