import { createHash } from 'crypto';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('OCIManifest');

export async function filterAttestationManifests(manifestJson: string): Promise<string> {
	const manifest = JSON.parse(manifestJson);

	if (manifest.manifests) {
		// Filter out attestation manifests
		manifest.manifests = manifest.manifests.filter((m: any) => !m.annotations?.['vnd.docker.reference.type']);

		// Ensure deterministic ordering
		manifest.manifests.sort((a: any, b: any) => a.digest.localeCompare(b.digest));
	}

	// Ensure deterministic JSON stringification
	return JSON.stringify(manifest, null, 2);
}

export async function calculateSha256(content: string): Promise<string> {
	try {
		const hash = createHash('sha256');
		// Remove all whitespace and newlines for consistent hashing
		const normalized = content.replace(/\s/g, '');
		hash.update(normalized);
		return `sha256:${hash.digest('hex')}`;
	} catch (error) {
		logger.error('Error calculating SHA256:', error);
		throw error;
	}
}
