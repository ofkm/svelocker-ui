import { UserModel } from '$lib/services/database/models/user';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('AdminUserAPI');

// Update a user
export const PUT: RequestHandler = async ({ request, params, locals }) => {
	// Check if the user is authenticated and is an admin
	if (!locals.user?.isAuthenticated || !locals.user?.isAdmin) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const userId = params.id;

	try {
		// Check if the user exists
		const existingUser = UserModel.getById(userId);
		if (!existingUser) {
			return json({ message: 'User not found' }, { status: 404 });
		}

		const userData = await request.json();

		// Update user basic info
		UserModel.update(userId, {
			email: userData.email,
			name: userData.name,
			isAdmin: userData.isAdmin
		});

		// Update password if provided
		if (userData.password) {
			UserModel.changePassword(userId, userData.password);
		}

		// Get the updated user
		const updatedUser = UserModel.getById(userId);

		logger.info('User updated successfully', { userId, adminUser: locals.user.username });

		return json({
			id: updatedUser.id,
			username: updatedUser.username,
			email: updatedUser.email,
			name: updatedUser.name,
			isAdmin: updatedUser.isAdmin,
			createdAt: updatedUser.createdAt
		});
	} catch (error) {
		logger.error('Error updating user:', error);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
};

// Delete a user
export const DELETE: RequestHandler = async ({ params, locals }) => {
	// Check if the user is authenticated and is an admin
	if (!locals.user?.isAuthenticated || !locals.user?.isAdmin) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const userId = params.id;

	try {
		// Check if the user exists
		const existingUser = UserModel.getById(userId);
		if (!existingUser) {
			return json({ message: 'User not found' }, { status: 404 });
		}

		// Prevent deleting self
		if (userId === locals.user.userId) {
			return json({ message: 'Cannot delete your own account' }, { status: 400 });
		}

		// Delete the user
		const result = UserModel.delete(userId);
		if (!result) {
			return json({ message: 'Failed to delete user' }, { status: 500 });
		}

		logger.info('User deleted successfully', { userId, username: existingUser.username, adminUser: locals.user.username });

		return json({ message: 'User deleted successfully' });
	} catch (error) {
		logger.error('Error deleting user:', error);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
};
