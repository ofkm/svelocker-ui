<script>
	// import Card from "./Card.svelte";
	import CollapsibleCard from '$lib/components/dropdown-card.svelte';
	import { list } from '$lib/utils/tags.ts'
	import { badgeVariants } from "$lib/components/ui/badge/index.js";

	export let repos;

	let tagsArray = [];

	list()
		.then(image => {
			tagsArray = image.tags;
		})
		.catch(error => console.error('Error:', error));

</script>

<div class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
		{#each repos as repo}
		<CollapsibleCard id="repo" title={repo.name}>
			{#each tagsArray as tag}
				{#if tag.name === "latest"}
					<a id="badgeLinkLatest" href="/tags/{repo.name}/{tag.name}" class={badgeVariants({ variant: "secondary" })}>{tag.name}</a>
				{:else}
					<a id="badgeLink" href="/tags/{repo.name}/{tag.name}" class={badgeVariants({ variant: "secondary" })}>{tag.name}</a>
				{/if}
			{/each}
		</CollapsibleCard>
	{/each}
</div>
