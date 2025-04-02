import { authenticateUser, createSession } from '$lib/services/auth/local';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('LocalLoginAction');

// Define the login schema
const loginSchema = z.object({
	username: z.string().min(1, { message: 'Username is required' }),
	password: z.string().min(1, { message: 'Password is required' })
});

// Define the type
type LoginSchema = typeof loginSchema;

export const load: PageServerLoad = async ({ locals }) => {
	// If user is already authenticated, redirect to home
	if (locals.user?.isAuthenticated) {
		throw redirect(302, '/');
	}

	// Create a form with empty values - use the zod adapter
	const form = await superValidate(zod(loginSchema));

	return { form };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		// Use the zod adapter here too
		const form = await superValidate(request, zod(loginSchema));

		// If form validation fails, return early with the validation errors
		if (!form.valid) {
			return fail(400, { form });
		}

		const { username, password } = form.data;

		try {
			logger.debug(`Local authentication attempt for user: ${username}`);

			const user = await authenticateUser(username, password);

			if (!user) {
				logger.debug(`Authentication failed for user: ${username}`);
				// Set a custom error message
				return fail(401, {
					form,
					error: 'Invalid username or password'
				});
			}

			// Create session
			createSession(user, cookies);
			logger.info(`User authenticated successfully: ${username}`);
		} catch (e) {
			logger.error('Unexpected error during login:', e);
			return fail(500, {
				form,
				error: 'An unexpected error occurred. Please try again.'
			});
		}

		// Important: Move redirect outside the try/catch
		throw redirect(303, '/');
	}
};
