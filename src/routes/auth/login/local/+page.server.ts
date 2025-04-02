import { authenticateUser, createSession } from '$lib/services/auth/local';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'formsnap';
import { loginSchema } from '$lib/schemas/auth';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('LocalLoginAction');

export const load = async () => {
	const form = await superValidate(loginSchema);

	return { form };
};

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, loginSchema);

		// Validate form
		if (!form.valid) {
			return fail(400, { form });
		}

		const { username, password } = form.data;

		try {
			logger.debug(`Local authentication attempt for user: ${username}`);

			const user = await authenticateUser(username, password);

			if (!user) {
				logger.debug(`Authentication failed for user: ${username}`);
				form.errors._errors = ['Invalid username or password'];
				return fail(401, { form });
			}

			// Create session
			createSession(user, cookies);
			logger.info(`User authenticated successfully: ${username}`);

			// Redirect to home
			throw redirect(303, '/');
		} catch (e) {
			if (e instanceof Response) {
				throw e;
			}

			logger.error('Unexpected error during login:', e);
			form.errors._errors = ['An unexpected error occurred. Please try again.'];
			return fail(500, { form });
		}
	}
};
