import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('UniversalCrypto');

/**
 * Platform-agnostic SHA-256 implementation
 * Works in both Node.js and browser environments
 */
export async function sha256(input: string): Promise<string> {
	try {
		// Browser environment
		if (typeof window !== 'undefined') {
			const msgBuffer = new TextEncoder().encode(input);
			const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
		}
		// Node.js environment
		else {
			// Use dynamic import to avoid static analysis issues
			const nodeCrypto = await dynamicImportCrypto();
			return nodeCrypto.createHash('sha256').update(input).digest('hex');
		}
	} catch (error) {
		logger.error('SHA-256 hash error:', error);
		// Return fallback hash in case of error (for resilience)
		return `error-hash-${Date.now()}`;
	}
}

/**
 * Dynamic import of the crypto module to prevent bundler issues
 */
async function dynamicImportCrypto() {
	try {
		// First try with node: prefix
		return await import('node:crypto');
	} catch (error) {
		try {
			// Fallback to regular import
			return await import('crypto');
		} catch (fallbackError) {
			logger.error('Failed to load Node.js crypto module:', fallbackError);
			throw new Error('Crypto module not available');
		}
	}
}
