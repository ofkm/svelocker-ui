<script>
	// import Card from "./Card.svelte";
	import CollapsibleCard from '$lib/components/dropdown-card.svelte';

	export let repos;
</script>

<!--{#each Object.entries(repos) as [repo, images]}-->

<!--	<h1 class="poppins text-3xl font-bold mb-4 pb-5 pt-5">{}</h1>-->
	<div class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
		{#each repos as repo}
		<CollapsibleCard id="repo" title={repo.name} description="This is a Docker Registry repo.">
			<!-- List how tags from https://kmcr.cc/v2/ofkm/caddy/tags/list -->
			<p class="poppins text-md font-bold mb-4">This is where a image would be haha</p>
		</CollapsibleCard>
		<!--{#each categoryApps as app}-->
		<!--	<Card app={app} />-->
		<!--{/each}-->
{/each}
	</div>
