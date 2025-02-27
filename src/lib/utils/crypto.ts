// src/lib/utils/crypto-util.ts
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('Crypto');

/**
 * Calculate SHA256 hash
 * Works in both browser and server environments
 */
export async function sha256(content: string): Promise<string> {
	try {
		// Check if we're in a browser environment
		if (typeof window !== 'undefined') {
			// Use Web Crypto API in the browser
			const msgBuffer = new TextEncoder().encode(content);
			const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
		}
		// Server-side environment
		else {
			// Dynamically import Node's crypto module (only on server)
			const { createHash } = await import('crypto');
			return createHash('sha256').update(content).digest('hex');
		}
	} catch (error) {
		logger.error('SHA256 calculation error:', error);
		return `error-calculating-hash-${Date.now()}`;
	}
}
