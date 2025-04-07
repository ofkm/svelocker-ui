<!-- src/lib/components/docker-metadata/LayerVisualization.svelte -->
<script lang="ts">
	import { formatSize } from '$lib/utils/formatting';
	import type { ImageLayer } from '$lib/types/api.old/manifest';
	import { Progress } from '$lib/components/ui/progress';
	import * as Card from '$lib/components/ui/card';

	interface Props {
		layers?: ImageLayer[];
	}

	let { layers = [] }: Props = $props();

	// Calculate total size with safety check
	let totalSize = $derived(Array.isArray(layers) && layers.length > 0 ? layers.reduce((sum, layer) => sum + (typeof layer.size === 'number' ? layer.size : 0), 0) : 0);

	// Calculate percentage for each layer with safety check
	let layersWithPercentage = $derived(
		Array.isArray(layers) && layers.length > 0 && totalSize > 0
			? layers.map((layer) => ({
					...layer,
					percentage: ((typeof layer.size === 'number' ? layer.size : 0) / totalSize) * 100
				}))
			: []
	);
</script>

<div class="flex flex-col gap-2 col-span-2">
	<h3 class="text-sm font-medium border-b pb-1 mb-1">Layer Composition</h3>

	{#if Array.isArray(layers) && layers.length > 0 && totalSize > 0}
		<!-- Layer Bar Visualization -->
		<div class="w-full h-6 bg-muted rounded-md overflow-hidden flex">
			{#each layersWithPercentage as layer, i}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div class="h-full cursor-pointer transition-all hover:brightness-110" style="width: {layer.percentage}%; background-color: hsl({360 * (i / layers.length)}, 70%, 50%)" title="{formatSize(layer.size)} - {layer.digest?.substring(7, 19) || 'unknown'}"></div>
			{/each}
		</div>

		<div class="text-xs text-muted-foreground">
			Total size: {formatSize(totalSize)}
		</div>

		<!-- Layer Details -->
		<div class="space-y-1.5 mt-2">
			{#each layersWithPercentage as layer, i}
				<div class="flex items-center justify-between border-b border-border/40 pb-1 text-xs">
					<div class="flex items-center gap-1.5">
						<div class="w-3 h-3 rounded-full" style="background-color: hsl({360 * (i / layers.length)}, 70%, 50%)"></div>
						<span class="font-mono">{layer.digest?.substring(7, 19) || 'unknown'}</span>
					</div>
					<div class="text-right">
						{formatSize(layer.size)} ({layer.percentage.toFixed(1)}%)
					</div>
				</div>
				<div class="w-full bg-muted h-1.5 rounded-full overflow-hidden mb-2">
					<div class="bg-primary h-full rounded-full" style="width: {layer.percentage}%;"></div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-sm text-muted-foreground italic py-2">No layer information available</div>
	{/if}
</div>
