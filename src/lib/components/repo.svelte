<script>
	// import Card from "./Card.svelte";
	import CollapsibleCard from '$lib/components/dropdown-card.svelte';
	import { list } from '$lib/utils/tags.ts'
	import { badgeVariants } from "$lib/components/ui/badge/index.js";
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Sheet from "$lib/components/ui/sheet";
	import { Input } from "$lib/components/ui/input/index.ts";
	import { Label } from "$lib/components/ui/label/index.ts";

	export let repos;

	let tagsArray = [];

	list()
		.then(image => {
			tagsArray = image.tags;
		})
		.catch(error => console.error('Error:', error));

</script>

<div class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
		{#each repos as repo}
		<CollapsibleCard id={repo.name} title={repo.name}>
			{#each tagsArray as tag}
				{#if tag.name === "latest"}
<!--					<a id="badgeLinkLatest" href="/tags/{repo.name}/{tag.name}" class={badgeVariants({ variant: "secondary" })}>{tag.name}</a>-->
					<Sheet.Root>
						<Sheet.Trigger class="{buttonVariants({ variant: 'secondary' })} badgeLinkLatest">
							{tag.name}
						</Sheet.Trigger>
						<Sheet.Content side="right">
							<Sheet.Header>
								<Sheet.Title>{tag.name}</Sheet.Title>
								<Sheet.Description>
									sha256:hashsumhere
								</Sheet.Description>
							</Sheet.Header>
							<div class="grid gap-4 py-4">
								<div class="grid grid-cols-4 items-center gap-4">
									<Label for="name" class="text-right">Name</Label>
									<Input id="name" value="Pedro Duarte" class="col-span-3" />
								</div>
								<div class="grid grid-cols-4 items-center gap-4">
									<Label for="username" class="text-right">Username</Label>
									<Input id="username" value="@peduarte" class="col-span-3" />
								</div>
							</div>
							<Sheet.Footer>
								<Sheet.Close class={buttonVariants({ variant: "outline" })}
								>Delete</Sheet.Close
								>
							</Sheet.Footer>
						</Sheet.Content>
					</Sheet.Root>
				{:else}
					<Sheet.Root>
						<Sheet.Trigger class={buttonVariants({ variant: "secondary" })}
						>{tag.name}</Sheet.Trigger
						>
						<Sheet.Content side="right">
							<Sheet.Header>
								<Sheet.Title>Edit profile</Sheet.Title>
								<Sheet.Description>
									Make changes to your profile here. Click save when you're done.
								</Sheet.Description>
							</Sheet.Header>
							<div class="grid gap-4 py-4">
								<div class="grid grid-cols-4 items-center gap-4">
									<Label for="name" class="text-right">Name</Label>
									<Input id="name" value="Pedro Duarte" class="col-span-3" />
								</div>
								<div class="grid grid-cols-4 items-center gap-4">
									<Label for="username" class="text-right">Username</Label>
									<Input id="username" value="@peduarte" class="col-span-3" />
								</div>
							</div>
							<Sheet.Footer>
								<Sheet.Close class={buttonVariants({ variant: "outline" })}
								>Save changes</Sheet.Close
								>
							</Sheet.Footer>
						</Sheet.Content>
					</Sheet.Root>
<!--					<a id="badgeLink" href="/tags/{repo.name}/{tag.name}" class={badgeVariants({ variant: "secondary" })}>{tag.name}</a>-->
				{/if}
			{/each}
		</CollapsibleCard>
	{/each}
</div>
