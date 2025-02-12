<script lang="ts">
	// import Card from "./Card.svelte";
	import CollapsibleCard from '$lib/components/dropdown-card.svelte';
	import RepoImage from '$lib/components/docker-metadata/RepoImage.svelte';
	// import { getDockerTagsNew } from '$lib/utils/tags.ts'

	//Models
	import type { ImageTag } from '$lib/models/tag.ts';
	//

	export let repos;

	// let tagsArray: ImageTag[] = [];

	// getDockerTagsNew('https://kmcr.cc', 'ofkm/caddy')
	// 	.then((repoImage) =>  {
	// 		tagsArray = repoImage.tags
	// 		repos.tags = repoImage.tags
	// 	})
	// 	.catch((error) => console.error("Error fetching repo images:", error));

	// const fetchTags = async (repo: string)  => {
	// 	const tags = await repoSpecificRun(repo.name);
	// 	repo.tags = tags;
	// }
	//
	// function repoSpecificRun(repo: string): ImageTag[] {
	// 	await getDockerTagsNew('https://kmcr.cc', repo)
	// 		.then((repoImage) =>  {
	// 			return repoImage.tags
	// 		})
	// 		.catch((error) => console.error("Error fetching repo images:", error));
	// }
</script>

<div class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
	{#each repos as repo}
		<CollapsibleCard id={repo.name} title={repo.name}>
			<RepoImage repo={repo.name} />
		</CollapsibleCard>
	{/each}
</div>
