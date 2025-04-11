<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { cn } from '$lib/utils';
	import { type Icon as IconType } from '@lucide/svelte';

	interface Props {
		icon: typeof IconType;
		label: string;
		// Allow null/undefined values with type assertions
		value: string | number | null | undefined;
	}

	let { icon, label, value }: Props = $props();

	// Format value to string for display
	let displayValue = $derived(value !== null && value !== undefined ? (typeof value === 'number' ? String(value) : value) : 'Unknown');

	// Check if the value contains "Unknown"
	let isUnknown = $derived(!value || String(value).includes('Unknown'));
</script>

<div class="bg-card/30 p-4 rounded-lg border border-border/50 transition-all hover:border-border/80">
	<Label for={label} class="font-medium text-muted-foreground flex items-center gap-2 pb-2">
		{@const SvelteComponent = icon}
		<SvelteComponent class="w-4 h-4 text-primary/70" />
		{label}
	</Label>
	<p class={cn('text-sm font-medium pb-1', isUnknown ? 'text-destructive/80' : 'text-foreground', isUnknown ? 'italic' : '')} id={label}>
		{displayValue}
	</p>
</div>
