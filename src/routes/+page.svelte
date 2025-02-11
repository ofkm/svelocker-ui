<script lang="ts">
    import Repo from '$lib/components/repo.svelte';

		interface RegistryRepos {
			repositories: string[];
		}

		const reposArray = [

		];

		function parseDockerRegistryRepoJson(url: string): RegistryRepos {
			const response = fetch(url);
			// const json = response.json();
			console.log(response.body)
			const repos: RegistryRepos = response;


			// repos.repositories.forEach((repo) => {
			// 	// reposArray.push(
			// 	// 	{ name: repo, image: "caddy:latest" }
			// 	// );
			// 	console.log(reposArray)
			// });

			return repos;
		}



		parseDockerRegistryRepoJson('https://kmcr.cc/v2/_catalog');

</script>



<div class="flex min-h-screen w-full flex-col justify-between bg-muted/40">
	<Repo repos={reposArray} />
</div>


