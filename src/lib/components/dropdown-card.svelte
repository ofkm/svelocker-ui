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
		defaultExpanded = false,
		children
	}: {
		id: string;
		title: string;
		description?: string;
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

<Card.Root>
	<Card.Header class="cursor-pointer rounded-lg" onclick={toggleExpanded}>
		<div data-testid="repository-row" class="flex items-center justify-between">
			<div>
				<div class="flex flex-wrap items-center gap-2">
					<Card.Title>
						{title}
					</Card.Title>
					{#if title === 'library'}
						<Badge variant="outline" class="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 h-6 min-w-35 px-4 text-sm justify-center">
							<span class="text-xs font-medium">Default Namespace</span>
						</Badge>
					{/if}
				</div>
				{#if description}
					<Card.Description>{description}</Card.Description>
				{/if}
			</div>
			<Button class="ml-10 h-8 p-3 shrink-0" variant="ghost" aria-label="Expand card">
				<LucideChevronDown class={cn('h-5 w-5 transition-transform duration-200', expanded && 'rotate-180 transform')} />
			</Button>
		</div>
	</Card.Header>
	{#if expanded}
		<div transition:slide={{ duration: 200 }}>
			<Card.Content class="">
				{@render children()}
			</Card.Content>
		</div>
	{/if}
</Card.Root>
