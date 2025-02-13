<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog/index.ts";
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import { fetchDockerfile } from '$lib/utils/manifest.ts';
	import { env } from '$env/dynamic/public'
	import { copyTextToClipboard } from '$lib/utils/clipboard.ts';
	import { Copy } from 'lucide-svelte';

	export let image: string;
	export let tag: string;

	let dockerfileContents: string;

	function normalizeDockerfile(dockerfile: string): string {
		// Split into lines and filter out empty lines
		const lines = dockerfile.split("\n").filter(line => line.trim().length > 0);

		if (lines.length === 0) return ""; // Return empty string if no content

		// Find the smallest leading whitespace indentation
		const minIndent = Math.min(
			...lines
				.map(line => line.match(/^(\s*)/)?.[1].length ?? 0)
		);

		// Remove the minimum indentation from each line
		return lines.map(line => line.slice(minIndent)).join("\n");
	}

	fetchDockerfile(env.PUBLIC_REGISTRY_URL, image, tag)
		.then((dockerfile) => {
			dockerfileContents = normalizeDockerfile(dockerfile);
		})
		.catch((error) => console.error('Error fetching repo images:', error));

	async function copyDockerfile() {
		copyTextToClipboard(dockerfileContents)
			.then(success => {
				if (success) {
					console.log("Text copied successfully!");
				} else {
					console.log("Failed to copy text.");
				}
			});
	}
</script>

<Dialog.Root>
	<Dialog.Trigger class="{buttonVariants({ variant: 'outline' })} dockerButton">
		View Dockerfile
	</Dialog.Trigger>
	<Dialog.Content class="h-[75%] w-[1000px] max-w-[80%]">
		<Dialog.Header>
			<Dialog.Title>Dockerfile</Dialog.Title>
			<Dialog.Description>
				Viewing Dockerfile for {image}:{tag}
			</Dialog.Description>
		</Dialog.Header>
		<ScrollArea>
			<pre class="whitespace-pre-wrap p-4 bg-slate-800 backdrop-blur-md text-white rounded-md">
				{dockerfileContents}
			</pre>
		</ScrollArea>
		<Dialog.Footer>
			<Button onclick={copyDockerfile()} variant="default" class="dockerButton">
				<Copy />
				Copy Dockerfile
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>