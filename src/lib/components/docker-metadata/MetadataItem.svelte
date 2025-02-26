<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import type { ComponentType } from 'svelte';
	import { cn } from '$lib/utils';

	export let icon: ComponentType;
	export let label: string;
	export let value: string;

	// Check if the value contains "Unknown"
	$: isUnknown = value?.includes('Unknown');
</script>

<div>
	<Label for={label} class="font-light text-muted-foreground flex items-center gap-2 pb-2">
		<svelte:component this={icon} class="w-5 h-5" />
		{label}
	</Label>
	<p class={cn('text-sm font-semibold pb-2', isUnknown ? 'text-destructive' : '')} id={label}>
		{value}
	</p>
</div>
