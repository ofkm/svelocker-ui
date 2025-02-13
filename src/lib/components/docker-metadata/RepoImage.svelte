<script lang="ts">
	import type { ImageTag } from '$lib/models/tag.ts';
	import { getDockerTagsNew } from '$lib/utils/tags.ts';
	import { env } from '$env/dynamic/public'
	import MetadataDrawer from '$lib/components/docker-metadata/MetadataDrawer.svelte';
	import type { PageData } from '../../../routes/$types';

	export let data: PageData;
	export let repoIndex: number;

	console.log(data.repos.repositories);
</script>

{#each data.repos.repositories[repoIndex].images as tag, tagIndex}
	{#if tag.name === 'latest'}
		<MetadataDrawer tag={tag} repo={data.repos.repositories[repoIndex].name} repoIndex={repoIndex} tagIndex={tagIndex} isLatest={true} data={data} />
	{:else}
		<MetadataDrawer tag={tag} repo={data.repos.repositories[repoIndex].name} repoIndex={repoIndex} tagIndex={tagIndex} isLatest={false} data={data} />
	{/if}
{/each}
