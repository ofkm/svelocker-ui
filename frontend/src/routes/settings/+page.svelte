<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Separator } from '$lib/components/ui/separator';
	import { Database, LifeBuoy } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import SyncButton from '$lib/components/buttons/SyncButton.svelte';
	import { version as currentVersion } from '$app/environment';
	import SupportLinkButton from '$lib/components/buttons/SupportLinkButton.svelte';
	import { enhance } from '$app/forms';
	import { AppConfigService } from '$lib/services/app-config-service';

	let { data }: { data: PageData } = $props();

	// Initialize syncInterval as a string since Select values are strings
	let syncInterval = $state(data.syncInterval?.toString() || '5');
	let formElement: HTMLFormElement | undefined = $state();

	const configService = AppConfigService.getInstance();

	async function handleSyncIntervalChange(value: string) {
		if (value) {
			try {
				await configService.updateSyncInterval(parseInt(value, 10));
				syncInterval = value; // Update the local state
				toast.success('Sync interval updated successfully');
			} catch (error) {
				toast.error('Failed to update sync interval');
				console.error('Error updating sync interval:', error);
			}
		}
	}

	function resetSettings() {
		// We'll use the server action to reset settings
		// The form submission will trigger the server-side resetSettings action
		const resetForm = document.getElementById('reset-settings-form') as HTMLFormElement;
		if (resetForm) {
			resetForm.requestSubmit();
			toast.success('Settings reset to defaults');
		}
	}
</script>

<svelte:head>
	<title>Settings | {data.appConfig.registryName || 'Svelocker'}</title>
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
							<Select.Root type="single" bind:value={syncInterval} onValueChange={handleSyncIntervalChange}>
								<Select.Trigger class="w-[140px]" aria-label="Sync Interval">
									{syncInterval === '60' ? '1 hour' : `${syncInterval} minutes`}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="5">5 minutes</Select.Item>
									<Select.Item value="15">15 minutes</Select.Item>
									<Select.Item value="30">30 minutes</Select.Item>
									<Select.Item value="60">60 minutes</Select.Item>
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
					<CardTitle>About</CardTitle>
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
					<p class="text-sm text-muted-foreground mt-1">{data.appConfig.registryUrl || 'Not configured'}</p>
				</div>

				<div>
					<h3 class="font-medium">Support Links</h3>
					<div class="mt-2 flex flex-wrap gap-2">
						<SupportLinkButton href="https://github.com/ofkm/svelocker-ui/wiki" label="Documentation" />
						<SupportLinkButton href="https://github.com/ofkm/svelocker-ui/issues/new?assignees=&labels=bug&projects=&template=bug.yml&title=+Bug:" label="Report Issue" />
						<SupportLinkButton href="https://github.com/ofkm/svelocker-ui/issues/new?assignees=&labels=feature&projects=&template=feature.yml&title=+Feature:" label="Request a Feature" />
					</div>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
