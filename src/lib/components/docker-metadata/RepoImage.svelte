<script lang="ts">
	import type { ImageTag } from '$lib/models/tag.ts';
	import { getDockerTagsNew } from '$lib/utils/tags.ts';
	import { env } from '$env/dynamic/public'
	import MetadataDrawer from '$lib/components/docker-metadata/MetadataDrawer.svelte';
	import type { PageData } from '../../../routes/$types';

	let tagsArray: ImageTag[] = [];

	export let data: PageData;
	export let repoIndex: number;

	// getDockerTagsNew(env.PUBLIC_REGISTRY_URL, data.repos.repositories[repoIndex].name)
	// 	.then((repoImage) => {
	// 		tagsArray = repoImage.tags;
	// 	})
	// 	.catch((error) => console.error('Error fetching repo images:', error));

	console.log(data.repos.repositories);
</script>

<!--{#each tagsArray as tag, index}-->
{#each data.repos.repositories[repoIndex].images as tag}
	{#if tag.name === 'latest'}
		<MetadataDrawer tag={tag} repo={data.repos.repositories[repoIndex].name} isLatest={true} />
	{:else}
		<MetadataDrawer tag={tag} repo={data.repos.repositories[repoIndex].name} isLatest={false} />
	{/if}
{/each}
