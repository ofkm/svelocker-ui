import { db } from '../connection';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('UserModel');
const BCRYPT_ROUNDS = 12; // Higher is more secure but slower

export interface User {
	id: string;
	username: string;
	email?: string;
	name?: string;
	isAdmin: boolean;
	createdAt: number;
}

export interface UserRecord {
	id: string;
	username: string;
	password_hash: string;
	email: string | null;
	name: string | null;
	is_admin: number;
	created_at: number;
}

export class UserModel {
	// Get a user by ID
	static getById(id: string): User | null {
		try {
			const user = db.prepare('SELECT id, username, email, name, is_admin, created_at FROM users WHERE id = ?').get(id) as UserRecord | undefined;

			if (!user) return null;

			return {
				id: user.id,
				username: user.username,
				email: user.email || undefined,
				name: user.name || undefined,
				isAdmin: Boolean(user.is_admin),
				createdAt: user.created_at
			};
		} catch (error) {
			logger.error('Error getting user by ID:', error);
			return null;
		}
	}

	// Get a user by username
	static getByUsername(username: string): User | null {
		try {
			const user = db.prepare('SELECT id, username, email, name, is_admin, created_at FROM users WHERE username = ?').get(username) as UserRecord | undefined;

			if (!user) return null;

			return {
				id: user.id,
				username: user.username,
				email: user.email || undefined,
				name: user.name || undefined,
				isAdmin: Boolean(user.is_admin),
				createdAt: user.created_at
			};
		} catch (error) {
			logger.error('Error getting user by username:', error);
			return null;
		}
	}

	// Create a new user
	static create(userData: { username: string; password: string; email?: string; name?: string; isAdmin?: boolean }): User | null {
		try {
			const id = crypto.randomUUID();
			// Hash password with bcrypt (includes salt automatically)
			const passwordHash = bcrypt.hashSync(userData.password, BCRYPT_ROUNDS);
			const now = Date.now();

			db.prepare(
				`INSERT INTO users (id, username, password_hash, email, name, is_admin, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`
			).run(id, userData.username, passwordHash, userData.email || null, userData.name || null, userData.isAdmin ? 1 : 0, now);

			return {
				id,
				username: userData.username,
				email: userData.email,
				name: userData.name,
				isAdmin: Boolean(userData.isAdmin),
				createdAt: now
			};
		} catch (error) {
			logger.error('Error creating user:', error);
			return null;
		}
	}

	// Authenticate a user
	static authenticate(username: string, password: string): User | null {
		try {
			const user = db.prepare('SELECT id, username, password_hash, email, name, is_admin, created_at FROM users WHERE username = ?').get(username) as (UserRecord & { password_hash: string }) | undefined;

			if (!user) return null;

			// Compare password with bcrypt
			const isValid = bcrypt.compareSync(password, user.password_hash);

			if (!isValid) {
				return null;
			}

			return {
				id: user.id,
				username: user.username,
				email: user.email || undefined,
				name: user.name || undefined,
				isAdmin: Boolean(user.is_admin),
				createdAt: user.created_at
			};
		} catch (error) {
			logger.error('Error authenticating user:', error);
			return null;
		}
	}

	// Update a user
	static update(
		id: string,
		userData: {
			email?: string;
			name?: string;
			isAdmin?: boolean;
		}
	): boolean {
		try {
			const updateFields = [];
			const params = [];

			if (userData.email !== undefined) {
				updateFields.push('email = ?');
				params.push(userData.email);
			}
			if (userData.name !== undefined) {
				updateFields.push('name = ?');
				params.push(userData.name);
			}
			if (userData.isAdmin !== undefined) {
				updateFields.push('is_admin = ?');
				params.push(userData.isAdmin ? 1 : 0);
			}

			if (updateFields.length === 0) {
				return true; // Nothing to update
			}

			params.push(id); // Add ID for the WHERE clause

			const result = db.prepare(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`).run(...params);

			return result.changes > 0;
		} catch (error) {
			logger.error('Error updating user:', error);
			return false;
		}
	}

	// Change password
	static changePassword(id: string, newPassword: string): boolean {
		try {
			// Hash password with bcrypt
			const passwordHash = bcrypt.hashSync(newPassword, BCRYPT_ROUNDS);

			const result = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id);

			return result.changes > 0;
		} catch (error) {
			logger.error('Error changing password:', error);
			return false;
		}
	}

	// Delete a user
	static delete(id: string): boolean {
		try {
			const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
			return result.changes > 0;
		} catch (error) {
			logger.error('Error deleting user:', error);
			return false;
		}
	}

	// Count users
	static count(): number {
		return (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
	}

	// Count admin users
	static countAdmins(): number {
		return (db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 1').get() as { count: number }).count;
	}
}
