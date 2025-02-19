<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.ts';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { copyTextToClipboard } from '$lib/utils/clipboard.ts';
	import { Copy } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { RegistryRepo } from '$lib/models/repo.ts';
	import type { ImageTag } from '$lib/models/tag';

	export let image: string;
	export let tag: ImageTag;

	let dockerfileContents: string = tag.metadata?.dockerFile ?? 'Dockerfile Not Found';

	async function copyDockerfile() {
		copyTextToClipboard(dockerfileContents).then((success) => {
			if (success) {
				toast.success('Dockerfile Copied successfully');
			} else {
				toast.error('Failed to copy Dockerfile...');
			}
		});
	}
</script>

<Dialog.Root>
	<Dialog.Trigger class="{buttonVariants({ variant: 'outline' })} dockerButton">View Dockerfile</Dialog.Trigger>
	<Dialog.Content class="h-[75%] w-[1000px] max-w-[80%]">
		<Dialog.Header>
			<Dialog.Title>Dockerfile</Dialog.Title>
			<Dialog.Description class="font-light text-md">
				Viewing Dockerfile for <span class="font-bold">{image}:{tag.name}</span>
			</Dialog.Description>
		</Dialog.Header>
		<ScrollArea class="rounded-md border">
			<div class="relative">
				<pre class="flex text-sm font-mono leading-none">
					<!-- Line numbers -->
					<div class="py-1 pl-2 pr-4 text-gray-400 select-none border-r border-gray-700 bg-[#1e1e1e] w-[4rem]">
						{#each dockerfileContents.split('\n') as _, i}
							<span class="block text-right leading-[1px] text-xs">{i + 1}</span>
						{/each}
					</div>
					<!-- Code content -->
					<code class="py-1 px-6 bg-[#1e1e1e] text-[#d4d4d4] w-full overflow-x-auto">
						{#each dockerfileContents.split('\n') as line}
							<span class="block leading-[1px] font-bold">{line}</span>
						{/each}
					</code>
				</pre>
			</div>
		</ScrollArea>
		<Dialog.Footer>
			<Button onclick={copyDockerfile} variant="outline" class="dockerButton">
				<Copy />
				Copy Dockerfile
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
