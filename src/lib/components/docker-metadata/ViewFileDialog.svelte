<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog/index.ts";
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import { copyTextToClipboard } from '$lib/utils/clipboard.ts';
	import { Copy } from 'lucide-svelte';
	import { toast } from "svelte-sonner";
	import type { RegistryRepo } from '$lib/models/repo.ts';

	export let data: RegistryRepo[];
	export let image: string;
	export let tag: string;
	export let repoIndex: number;
	export let tagIndex: number;

	let dockerfileContents: string = data[repoIndex].images[tagIndex]?.metadata?.dockerFile ?? "Dockerfile Not Found";

	async function copyDockerfile() {
		copyTextToClipboard(dockerfileContents)
			.then(success => {
				if (success) {
					toast.success("Dockerfile Copied successfully");
				} else {
					toast.error("Failed to copy Dockerfile...")
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
			<Dialog.Description class="font-light text-md">
				Viewing Dockerfile for <span class="font-bold">{image}:{tag}</span>
			</Dialog.Description>
		</Dialog.Header>
		<ScrollArea>
			<pre class="whitespace-pre-wrap p-4 bg-slate-800 backdrop-blur-md text-white rounded-md">
				{dockerfileContents}
			</pre>
		</ScrollArea>
		<Dialog.Footer>
			<Button onclick={copyDockerfile} variant="default" class="dockerButton">
				<Copy />
				Copy Dockerfile
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>