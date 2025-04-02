import { UserModel } from '$lib/services/database/models/user';
import type { PageServerLoad } from './$types';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('AdminUsersPage');

export const load: PageServerLoad = async () => {
	try {
		// Get all users from the database
		const users = UserModel.getAllUsers();

		return {
			users: users.map((user) => ({
				id: user.id,
				username: user.username,
				email: user.email,
				name: user.name,
				isAdmin: user.isAdmin,
				createdAt: user.createdAt
			}))
		};
	} catch (error) {
		logger.error('Failed to load users:', error);
		return {
			users: [],
			error: 'Failed to load users'
		};
	}
};
