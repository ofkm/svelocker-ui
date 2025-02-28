export * from './time';

/**
 * Extract repository name from full path
 */
export function extractRepoName(fullRepoPath: string, defaultName: string = ''): string {
	return fullRepoPath.split('/').pop() || defaultName;
}

/**
 * Extracts the namespace from a full repository name
 * @param fullName Full repository name (e.g., 'namespace/image' or 'image')
 * @returns Namespace string or 'library' for root-level images
 */
export function getNamespace(fullName: string): string {
	if (!fullName?.includes('/')) {
		return 'library'; // Use 'library' as default namespace like Docker Hub
	}
	return fullName.split('/')[0];
}
