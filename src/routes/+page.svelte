<script lang="ts">
    import Repo from '$lib/components/repo.svelte';

		interface RegistryRepos {
			repositories: string[];
		}

		let reposArray = [] as { name: string, image?: string  }[];

		async function parseDockerRegistryRepoJson(url: string): Promise<RegistryRepos> {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			const data = await response.json();
			return { repositories: data.repositories.map(repo => ({ name: repo })) };
		}

		// Call the function with the specified URL
		parseDockerRegistryRepoJson('https://kmcr.cc/v2/_catalog')
			.then(data => {
				reposArray = data.repositories;
				console.log(reposArray)
			})
			.catch(error => console.error('Error:', error));

</script>



<div class="flex min-h-screen w-full flex-col justify-between bg-muted/40">
	<Repo repos={reposArray} />
</div>


