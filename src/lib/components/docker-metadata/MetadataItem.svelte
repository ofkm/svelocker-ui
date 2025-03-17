<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import type { ComponentType } from 'svelte';
	import { cn } from '$lib/utils';

	export let icon: ComponentType;
	export let label: string;
	// Allow null/undefined values with type assertions
	export let value: string | number | null | undefined;

	// Format value to string for display
	$: displayValue = value !== null && value !== undefined ? (typeof value === 'number' ? String(value) : value) : 'Unknown';

	// Check if the value contains "Unknown"
	$: isUnknown = !value || String(value).includes('Unknown');
</script>

<div>
	<Label for={label} class="font-light text-muted-foreground flex items-center gap-2 pb-2">
		<svelte:component this={icon} class="w-5 h-5" />
		{label}
	</Label>
	<p class={cn('text-sm font-semibold pb-2', isUnknown ? 'text-destructive' : '')} id={label}>
		{displayValue}
	</p>
</div>
