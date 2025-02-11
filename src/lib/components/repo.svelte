<script>
	// import Card from "./Card.svelte";
	import CollapsibleCard from '$lib/components/dropdown-card.svelte';
	import { list } from '$lib/utils/tags.ts'
	import { Badge } from '$lib/components/ui/badge/index';

	export let repos;

	let tagsArray = [];

	list()
		.then(image => {
			tagsArray = image.tags;
		})
		.catch(error => console.error('Error:', error));

	// console.log(list())

</script>

	<div class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
		{#each repos as repo}
		<CollapsibleCard id="repo" title={repo.name} description="This is a Docker Registry repo.">
			{#each tagsArray as tag}
				{#if tag.name === "latest"}
					<Badge class='mr-5 poppins text-green-500' variant='secondary'>{tag.name}</Badge>
				{:else}
					<Badge class='mr-5 poppins' variant='outline'>{tag.name}</Badge>
				{/if}

			{/each}
		</CollapsibleCard>
{/each}
	</div>
