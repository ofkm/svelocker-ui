import { toast } from 'svelte-sonner';

export async function copyTextToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (error) {
		console.error('Failed to copy text: ', error);
		return false;
	}
}

export async function copyDockerRunCommand(imageFullName: string, tagName: string, registryURL: string): Promise<void> {
	let registryHost = '';
	try {
		const url = new URL(registryURL);
		registryHost = url.host;
	} catch (e) {
		// Fallback if URL parsing fails
		registryHost = registryURL.replace(/^https?:\/\//, '');
	}

	const dockerRunCmd = `docker run ${registryHost}/${imageFullName}:${tagName}`;

	copyTextToClipboard(dockerRunCmd).then((success) => {
		if (success) {
			toast.success('Docker Run command copied to clipboard');
		} else {
			toast.error('Failed to copy Docker Run command');
		}
	});
}
