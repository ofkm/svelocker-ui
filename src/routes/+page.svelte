<script lang="ts">
    import Repo from '$lib/components/repo.svelte';
		import axios from 'axios';

		//docker example
		// interface DockerImage {
		// 	name: string;
		// 	tags: { [key: string]: any };
		// }

		interface RegistryRepos {
			repositories: string[];
		}

		async function parseDockerRegistry(url: string) {
			try {
				const response = await axios.get(url);
				if (response.status !== 200) {
					throw new Error('Failed to fetch Docker Registry');
				}
				return JSON.parse(response.data) as RegistryRepos;
			} catch (error) {
				console.error(error);
				return [];
			}
		}

		const url = 'https://kmcr.cc/v2/_catalog';
		const dockerImages =  parseDockerRegistry(url);
		console.log(dockerImages)

		// async function main() {
		// 	const url = 'https://kmcr.cc/v2/_catalog';
		// 	const dockerImages = await parseDockerRegistry(url);
		// 	// console.log(dockerImages)
		// 	// // for (const image of dockerImages) {
		// 	// // 	const imageInfo: DockerImage = {
		// 	// // 		name: image.name,
		// 	// // 		tags: image.tags
		// 	// // 	};
		// 	// // 	console.log(JSON.stringify(imageInfo, null, 2));
		// 	// // }
		// }

		//

		// Get Catalog Repos
		// let data: RegistryRepos
		//
		// fetch('https://kmcr.cc/v2/_catalog')
		// 	.then(function(response) {
		// 		return response.json();
		// 	})
		// 	.then(function(myJson) {
		// 		console.log(myJson)
		// 		// data  = JSON.parse(myJson) as RegistryRepos;
		// 	});

		const repos = [
			// { name: 'docker.io', image: 'https://git.kmcr.cc', registryURL: "https://kmcr.cc/v2/_catalog"},
		];

		// data.repositories.forEach((repo) => {
		// 	console.log(repo)
		// 	// repos.push(
		// 	// 	{ name: repo, image: "caddy:latest" }
		// 	// );
		// });
		//

		// interface RegistryUIRepo {
		// 	name: string;
		// 	images: string[];
		// }
		//
		// interface RegistryRepos {
		// 	repositories: string[];
		// }



		// const jsonString = '{"repositories":["kmendell/pocket-id","ofkm/caddy","ofkm/pocket-id"]}';
		// const data: RegistryRepos = JSON.parse(jsonString);





</script>

<div class="flex min-h-screen w-full flex-col justify-between bg-muted/40">
	<Repo repos={repos} />
</div>


