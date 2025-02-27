<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let syncing = false;

	async function triggerSync() {
		syncing = true;
		try {
			const response = await fetch('/api/sync', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ fullSync: false }) // Specify full sync if needed
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				toast.error('Failed to sync Registry', {
					description: errorData.message || 'Unknown error occurred'
				});
				throw new Error('Sync failed');
			} else {
				toast.success('Registry Synced successfully');
			}
		} catch (error) {
			console.error('Failed to sync:', error);
		} finally {
			syncing = false;
		}
	}
</script>

<Button onclick={triggerSync} disabled={syncing}>
	{#if syncing}
		<Loader2 class="mr-2 h-4 w-4 animate-spin" />
		<span>Syncing...</span>
	{:else}
		<span>Sync Now</span>
	{/if}
</Button>
