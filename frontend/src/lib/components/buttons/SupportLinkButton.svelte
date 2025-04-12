<script lang="ts">
	interface Props {
		href: string;
		label: string;
		children?: import('svelte').Snippet;
	}

	let { href, label, children }: Props = $props();
</script>

<a {href} target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary/10 hover:bg-primary/20 text-primary h-9 px-4">
	{#if children}{@render children()}{:else}
		{label}
	{/if}
</a>
