import { sha256 } from './crypto';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('OCIManifest');

export async function filterAttestationManifests(manifestJson: string): Promise<string> {
	try {
		const manifest = JSON.parse(manifestJson);

		if (manifest.manifests) {
			// Filter out attestation manifests
			manifest.manifests = manifest.manifests.filter((m: any) => !m.annotations?.['vnd.docker.reference.type']);

			// Ensure deterministic ordering
			manifest.manifests.sort((a: any, b: any) => a.digest.localeCompare(b.digest));
		}

		// Ensure deterministic JSON stringification
		return JSON.stringify(manifest, null, 2);
	} catch (error) {
		logger.error('Error filtering attestation manifests:', error);
		// Return original JSON if there's an error
		return manifestJson;
	}
}

export async function calculateSha256(content: string): Promise<string> {
	try {
		// Remove all whitespace and newlines for consistent hashing
		const normalized = content.replace(/\s/g, '');
		const hash = await sha256(normalized);
		return `sha256:${hash}`;
	} catch (error) {
		logger.error('Error calculating SHA256:', error);
		// Return a fallback string in case of error to prevent cascading failures
		return `sha256:error-calculating-hash-${Date.now()}`;
	}
}

export async function generateManifestDigest(manifest: any): Promise<string> {
	try {
		const manifestJson = JSON.stringify(manifest);
		// Replace direct crypto usage with our utility
		const hash = await sha256(manifestJson);
		return `sha256:${hash}`;
	} catch (error) {
		logger.error('Error generating manifest digest:', error);
		// Return a fallback string in case of error
		return `sha256:error-generating-digest-${Date.now()}`;
	}
}
