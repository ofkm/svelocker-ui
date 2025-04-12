<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { RefreshCw } from 'lucide-svelte';
	import { startSync, isSyncing, notifySyncComplete } from '$lib/stores/sync-store';
	import { env } from '$env/dynamic/public';

	let isLoading = false;
	const baseUrl = env.PUBLIC_BACKEND_URL || 'http://localhost:8080';

	async function handleSync() {
		if (isLoading) return;

		isLoading = true;
		startSync();

		try {
			const response = await fetch(`${baseUrl}/api/v1/sync`, {
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error('Sync failed');
			}

			// Notify that sync is complete
			notifySyncComplete();
		} catch (error) {
			console.error('Failed to sync registry:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<Button variant="outline" size="sm" onclick={handleSync} disabled={isLoading} class="gap-1">
	<RefreshCw size={16} class="opacity-70 {isLoading ? 'animate-spin' : ''}" />
	Sync Registry
</Button>
