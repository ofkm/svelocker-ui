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

<div class="bg-card/30 p-4 rounded-lg border border-border/50 transition-all hover:border-border/80">
	<Label for={label} class="font-medium text-muted-foreground flex items-center gap-2 pb-2">
		<svelte:component this={icon} class="w-4 h-4 text-primary/70" />
		{label}
	</Label>
	<p class={cn('text-sm font-medium pb-1', isUnknown ? 'text-destructive/80' : 'text-foreground', isUnknown ? 'italic' : '')} id={label}>
		{displayValue}
	</p>
</div>
