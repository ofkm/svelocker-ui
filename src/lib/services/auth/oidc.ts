import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { Logger } from '$lib/services/logger';
import type { Cookies } from '@sveltejs/kit';
import * as client from 'openid-client';

const logger = Logger.getInstance('OIDCAuth');
let oidcConfig: any = null;

export async function initializeOIDC(): Promise<any | null> {
	if (!publicEnv.PUBLIC_OIDC_ENABLED || publicEnv.PUBLIC_OIDC_ENABLED !== 'true') {
		logger.info('OIDC authentication is disabled');
		return null;
	}

	if (oidcConfig) return oidcConfig;

	try {
		logger.info('Initializing OIDC client configuration');

		// Using discovery to configure the client
		oidcConfig = await client.discovery(new URL(publicEnv.PUBLIC_OIDC_ISSUER), publicEnv.PUBLIC_OIDC_CLIENT_ID, env.OIDC_CLIENT_SECRET);

		return oidcConfig;
	} catch (error) {
		logger.error('Error initializing OIDC client:', error);
		return null;
	}
}

export async function getAuthUrl(cookies: Cookies): Promise<string | null> {
	const config = await initializeOIDC();
	if (!config) return null;

	// Use PKCE for security
	const code_verifier = client.randomPKCECodeVerifier();
	const code_challenge = await client.calculatePKCECodeChallenge(code_verifier);

	// Generate state for additional security
	const state = client.randomState();

	// Generate nonce for additional security
	const nonce = client.randomState();

	// Store values in cookies for later verification
	cookies.set('auth_code_verifier', code_verifier, {
		path: '/',
		httpOnly: true,
		secure: publicEnv.PUBLIC_DEBUG !== 'true', // Set secure to false in debug mode
		maxAge: 600
	});
	cookies.set('auth_state', state, {
		path: '/',
		httpOnly: true,
		secure: publicEnv.PUBLIC_DEBUG !== 'true', // Set secure to false in debug mode
		maxAge: 600
	});
	cookies.set('auth_nonce', nonce, {
		path: '/',
		httpOnly: true,
		secure: publicEnv.PUBLIC_DEBUG !== 'true', // Set secure to false in debug mode
		maxAge: 600
	});

	const scopes = publicEnv.PUBLIC_OIDC_SCOPES?.split(' ') || ['openid', 'profile', 'email'];
	const redirect_uri = publicEnv.PUBLIC_OIDC_REDIRECT_URI;

	const parameters: Record<string, string> = {
		redirect_uri,
		scope: scopes.join(' '),
		code_challenge,
		code_challenge_method: 'S256',
		state,
		nonce
	};

	// Build authorization URL
	const redirectTo = client.buildAuthorizationUrl(config, parameters);
	logger.debug('Generated Auth URL', { url: redirectTo.href, state, code_verifier, nonce });
	return redirectTo.href;
}

export async function handleCallback(url: URL, cookies: Cookies) {
	const config = await initializeOIDC();
	if (!config) throw new Error('OIDC client not initialized');

	const code_verifier = cookies.get('auth_code_verifier');
	const state = cookies.get('auth_state');
	const nonce = cookies.get('auth_nonce');

	logger.debug('Callback received', { url: url.toString(), state, code_verifier });

	if (!code_verifier) throw new Error('Missing code_verifier cookie');
	if (!state) throw new Error('Missing state cookie');
	if (!nonce) throw new Error('Missing nonce cookie');

	let userInfo = null;
	let sub: string | undefined;
	let access_token: string | undefined;

	try {
		// Exchange authorization code for tokens
		const tokens = await client.authorizationCodeGrant(config, url, {
			pkceCodeVerifier: code_verifier,
			expectedState: state,
			redirect_uri: publicEnv.PUBLIC_OIDC_REDIRECT_URI, // Ensure redirect_uri is passed
			expectedNonce: nonce,
			idTokenExpected: true
		});

		logger.info('Token response received');
		logger.debug('Token response', tokens);

		access_token = tokens.access_token;

		// Extract claims from the ID token
		const claims = tokens.claims();
		logger.debug('ID Token Claims', claims);
		sub = claims?.sub;

		if (!sub) {
			throw new Error('Subject (sub) claim is missing in ID token');
		}

		// Fetch user info
		try {
			userInfo = await client.fetchUserInfo(config, access_token, sub);
			logger.info('User Info Response', userInfo);
		} catch (userInfoError) {
			logger.error('Error fetching user info:', userInfoError);
		}

		return {
			userInfo,
			tokenSet: tokens
		};
	} catch (error) {
		logger.error('Error processing OIDC callback:', error);
		throw error;
	}
}
