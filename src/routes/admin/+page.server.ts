import { UserModel } from '$lib/services/database/models/user';
import { getDatabaseInfo } from '$lib/services/database';
import type { PageServerLoad } from './$types';
import { Logger } from '$lib/services/logger';
import fs from 'fs';
import { env } from '$env/dynamic/private';

const logger = Logger.getInstance('AdminDashboard');

export const load: PageServerLoad = async () => {
	try {
		// Get user counts
		const userCount = UserModel.count();
		const adminCount = UserModel.countAdmins();

		// Get database file size
		let databaseSize = '0 KB';
		try {
			const stats = fs.statSync(env.DB_PATH || 'test.db');
			databaseSize = formatBytes(stats.size);
		} catch (err) {
			logger.error('Failed to get database size:', err);
		}

		// For this example, we're adding some mock recent logs
		// In a real application, you would pull these from your logging system
		const recentLogs = [
			{
				message: 'Registry sync completed',
				timestamp: new Date(Date.now() - 1000 * 60 * 30).toLocaleString(),
				source: 'SyncService'
			},
			{
				message: 'User admin logged in',
				timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleString(),
				source: 'AuthService'
			},
			{
				message: 'Database backup completed',
				timestamp: new Date(Date.now() - 1000 * 60 * 120).toLocaleString(),
				source: 'BackupService'
			}
		];

		return {
			userCount,
			adminCount,
			databaseSize,
			lastLogin: recentLogs[1]?.timestamp || 'Never',
			recentLogs
		};
	} catch (error) {
		logger.error('Failed to load admin dashboard data:', error);
		return {
			error: 'Failed to load dashboard data'
		};
	}
};

// Helper function to format bytes to human-readable format
function formatBytes(bytes: number, decimals = 2) {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
