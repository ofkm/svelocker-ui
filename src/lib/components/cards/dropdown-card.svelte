<script lang="ts">
	import { cn } from '$lib/utils/style';
	import { LucideChevronDown } from 'lucide-svelte';
	import { onMount, type Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import { Button } from './ui/button';
	import * as Card from './ui/card';
	import { Badge } from '$lib/components/ui/badge';

	let {
		id,
		title,
		description,
		lastSynced,
		defaultExpanded = false,
		children
	}: {
		id: string;
		title: string;
		description?: string;
		lastSynced?: string;
		defaultExpanded?: boolean;
		children: Snippet;
	} = $props();

	let expanded = $state(defaultExpanded);

	function loadExpandedState() {
		const state = JSON.parse(localStorage.getItem('collapsible-cards-expanded') || '{}');
		expanded = state[id] || false;
	}

	function saveExpandedState() {
		const state = JSON.parse(localStorage.getItem('collapsible-cards-expanded') || '{}');
		state[id] = expanded;
		localStorage.setItem('collapsible-cards-expanded', JSON.stringify(state));
	}

	function toggleExpanded() {
		expanded = !expanded;
		saveExpandedState();
	}

	onMount(() => {
		if (defaultExpanded) {
			saveExpandedState();
		}
		loadExpandedState();
	});
</script>

<Card.Root class="overflow-hidden transition-all duration-200 hover:shadow-md">
	<Card.Header class="cursor-pointer rounded-t-lg bg-card/90 hover:bg-card/70 transition-colors" onclick={toggleExpanded}>
		<div data-testid="repository-row" class="flex items-center justify-between">
			<div>
				<div class="flex flex-wrap items-center gap-2">
					<Card.Title class="text-lg tracking-tight">
						{title}
					</Card.Title>
					{#if title === 'library'}
						<Badge variant="outline" class="bg-blue-100/90 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800/70 px-3 py-0.5 text-xs font-medium rounded-full">Default Namespace</Badge>
					{/if}
				</div>
				{#if description || lastSynced}
					<Card.Description>
						{description || ''}
						{#if lastSynced}
							<div class="flex items-center gap-1.5 mt-1">
								<span class="inline-block w-2 h-2 rounded-full bg-primary/30"></span>
								<span class="text-xs text-muted-foreground">{lastSynced}</span>
							</div>
						{/if}
					</Card.Description>
				{/if}
			</div>
			<Button class="ml-10 h-8 w-8 p-0 shrink-0 rounded-full" variant="ghost" aria-label="Expand card">
				<LucideChevronDown class={cn('h-4 w-4 transition-transform duration-300 ease-in-out', expanded && 'rotate-180 transform')} />
			</Button>
		</div>
	</Card.Header>
	{#if expanded}
		<div transition:slide={{ duration: 200, easing: (t) => 1 - Math.pow(1 - t, 3) }}>
			<Card.Content class="pt-4">
				{@render children()}
			</Card.Content>
		</div>
	{/if}
</Card.Root>
