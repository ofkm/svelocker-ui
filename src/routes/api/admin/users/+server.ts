import { UserModel } from '$lib/services/database/models/user';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('AdminUsersAPI');

// Create a new user
export const POST: RequestHandler = async ({ request, locals }) => {
	// Check if the user is authenticated and is an admin
	if (!locals.user?.isAuthenticated || !locals.user?.isAdmin) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	try {
		const userData = await request.json();

		// Validate required fields
		if (!userData.username || !userData.password) {
			return json({ message: 'Username and password are required' }, { status: 400 });
		}

		// Check if the username is already taken
		const existingUser = UserModel.getByUsername(userData.username);
		if (existingUser) {
			return json({ message: 'Username already exists' }, { status: 409 });
		}

		// Create the user
		const newUser = UserModel.create({
			username: userData.username,
			password: userData.password,
			email: userData.email,
			name: userData.name,
			isAdmin: userData.isAdmin || false
		});

		if (!newUser) {
			return json({ message: 'Failed to create user' }, { status: 500 });
		}

		logger.info('User created successfully', { username: userData.username, adminUser: locals.user.username });

		return json({
			id: newUser.id,
			username: newUser.username,
			email: newUser.email,
			name: newUser.name,
			isAdmin: newUser.isAdmin,
			createdAt: newUser.createdAt
		});
	} catch (error) {
		logger.error('Error creating user:', error);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
};
