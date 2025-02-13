<script lang="ts">
	import type { ImageTag } from '$lib/models/tag.ts';
	import { getDockerTagsNew } from '$lib/utils/tags.ts';
	import { env } from '$env/dynamic/public'
	import MetadataDrawer from '$lib/components/docker-metadata/MetadataDrawer.svelte';
	import type { PageData } from '../../../routes/$types';

	let tagsArray: ImageTag[] = [];

	export let repo;
	export let data: PageData;

	getDockerTagsNew(env.PUBLIC_REGISTRY_URL, repo)
		.then((repoImage) => {
			tagsArray = repoImage.tags;
		})
		.catch((error) => console.error('Error fetching repo images:', error));

	console.log(data.repos.repositories);
</script>

{#each tagsArray as tag}
	{#if tag.name === 'latest'}
		<MetadataDrawer tag={tag} repo={repo} isLatest={true} />
	{:else}
		<MetadataDrawer tag={tag} repo={repo} isLatest={false} />
	{/if}
{/each}
