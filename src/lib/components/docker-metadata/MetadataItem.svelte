<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { type Icon as IconType } from 'lucide-svelte';

	export let icon: IconType;
	export let label: string;
	export let value: string;
</script>

<div>
	<Label for={label} class="font-light text-muted-foreground flex items-center gap-2 pb-2">
		<svelte:component this={icon} class="w-5 h-5" />
		{label}
	</Label>
	<p class="text-sm font-semibold pb-2" id={label}>
		{value}
	</p>
</div>
