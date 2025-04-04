<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Separator } from '$lib/components/ui/separator';
	import { Database, RotateCcw, LifeBuoy } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { env } from '$env/dynamic/public';
	import SyncButton from '$lib/components/buttons/SyncButton.svelte';
	import { version as currentVersion } from '$app/environment';
	import { getConfigValue, setConfigValue, resetAllConfig, syncAllConfigFromServer } from '$lib/services/client-config';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	// Initialize syncInterval from client storage, falling back to server data or default
	let syncInterval = $state(getConfigValue('sync_interval', data.settings?.sync_interval || '5'));
	let formElement: HTMLFormElement | undefined = $state();

	onMount(() => {
		// Sync settings from server to client storage on component mount if available
		if (data.settings) {
			syncAllConfigFromServer(data.settings);
			// Re-read from potentially updated client storage after sync
			syncInterval = getConfigValue('sync_interval', data.settings.sync_interval || '5');
		} else {
			// Ensure we have a value even if server data is missing
			syncInterval = getConfigValue('sync_interval', '5');
		}
	});

	function handleSyncIntervalChange(value: string | undefined) {
		if (value !== undefined && value !== syncInterval) {
			// Only trigger if value actually changed
			syncInterval = value;
			setConfigValue('sync_interval', syncInterval);
			const displayValue = syncInterval === '60' ? '1 hour' : `${syncInterval} minutes`;
			toast.success(`Sync interval changed to ${displayValue}`);

			// Submit the form programmatically using the reference
			if (formElement) {
				const hiddenValueInput = formElement.querySelector('input[name="value"]') as HTMLInputElement;
				if (hiddenValueInput) {
					hiddenValueInput.value = syncInterval;
				}
				formElement.requestSubmit();
			}
		}
	}

	function resetSettings() {
		resetAllConfig();
		syncInterval = '5'; // Reset state variable
		toast.success('Settings reset to defaults');
		// Submit the reset form if needed by server logic
		const resetForm = document.getElementById('reset-settings-form') as HTMLFormElement;
		if (resetForm) resetForm.requestSubmit();
	}
</script>

<svelte:head>
	<title>Settings | {env.PUBLIC_REGISTRY_NAME || 'Svelocker'}</title>
	<meta name="description" content="Manage application settings" />
</svelte:head>

<div class="container mx-auto py-6 space-y-6 pt-20">
	<div class="flex flex-col gap-2">
		<h1 class="text-3xl font-bold tracking-tight">Settings</h1>
		<p class="text-muted-foreground">Manage your application preferences and registry configurations.</p>
	</div>

	<Separator />

	<div class="grid gap-6 md:grid-cols-2">
		<Card>
			<CardHeader>
				<div class="flex items-center gap-2">
					<Database size={18} class="text-muted-foreground" />
					<CardTitle>Registry Sync</CardTitle>
				</div>
				<CardDescription>Configure how the application syncs with your registry</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div>
							<Label for="sync-interval" class="text-base">Sync Interval</Label>
							<p class="text-sm text-muted-foreground">How often to check for registry changes</p>
						</div>
						<form method="POST" action="?/updateSetting" use:enhance bind:this={formElement}>
							<input type="hidden" name="key" value="sync_interval" />
							<Select.Root type="single" value={syncInterval} onValueChange={handleSyncIntervalChange}>
								<Select.Trigger class="w-[140px]" aria-label="Sync Interval">
									{syncInterval === '60' ? '1 hour' : `${syncInterval} minutes`}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="5" label="5 minutes">5 minutes</Select.Item>
									<Select.Item value="15" label="15 minutes">15 minutes</Select.Item>
									<Select.Item value="30" label="30 minutes">30 minutes</Select.Item>
									<Select.Item value="60" label="1 hour">1 hour</Select.Item>
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="value" value={syncInterval} />
						</form>
					</div>

					<div class="flex items-center justify-between">
						<div>
							<Label for="force-sync" class="text-base">Force Full Sync</Label>
							<p class="text-sm text-muted-foreground">Sync all registry data now</p>
						</div>
						<SyncButton />
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<div class="flex items-center gap-2">
					<LifeBuoy size={18} class="text-muted-foreground" />
					<CardTitle>Support</CardTitle>
				</div>
				<CardDescription>Support options and application information</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div>
					<h3 class="font-medium">About</h3>
					<p class="text-sm text-muted-foreground mt-1">Svelocker UI v{currentVersion}</p>
				</div>

				<div>
					<h3 class="font-medium">Registry</h3>
					<p class="text-sm text-muted-foreground mt-1">{env.PUBLIC_REGISTRY_URL || 'Not configured'}</p>
				</div>

				<div>
					<h3 class="font-medium">Support Links</h3>
					<div class="mt-1 grid grid-cols-3 gap-2">
						<a href="https://github.com/ofkm/svelocker-ui" target="_blank" rel="noopener noreferrer" class="text-sm text-primary hover:underline">Documentation</a>
						<a href="https://github.com/ofkm/svelocker-ui/issues/new?assignees=&labels=bug&projects=&template=bug.yml&title=+Bug:" target="_blank" rel="noopener noreferrer" class="text-sm text-primary hover:underline">Report Issue</a>
						<a href="https://github.com/ofkm/svelocker-ui/issues/new?assignees=&labels=feature&projects=&template=feature.yml&title=+Feature:" target="_blank" rel="noopener noreferrer" class="text-sm text-primary hover:underline">Request a Feature</a>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card class="col-span-2">
			<CardHeader>
				<div class="flex items-center gap-2">
					<RotateCcw size={18} class="text-muted-foreground" />
					<CardTitle>Reset</CardTitle>
				</div>
				<CardDescription>Reset application settings to default values</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<p class="text-sm text-muted-foreground">This will reset all your preferences to their default values. This cannot be undone.</p>
			</CardContent>
			<CardFooter>
				<form method="POST" action="?/resetSettings" use:enhance on:submit|preventDefault={resetSettings} id="reset-settings-form">
					<Button variant="destructive" size="sm" type="submit">Reset All Settings</Button>
				</form>
			</CardFooter>
		</Card>
	</div>
</div>
