<script lang="ts">
	import CollapsibleCard from '$lib/components/dropdown-card.svelte';
	import RepoImage from '$lib/components/docker-metadata/RepoImage.svelte';

	export let repos;
</script>

<div class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
	{#each repos as repo}
		<CollapsibleCard id={repo.name} title={repo.name}>
			<RepoImage repo={repo.name} />
		</CollapsibleCard>
	{/each}
</div>
