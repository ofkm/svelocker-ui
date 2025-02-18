<script lang="ts">
	import { version as currentVersion } from '$app/environment';
	import { Github } from 'lucide-svelte';
</script>

<header class="w-full border-b flex">
	<div class="flex w-full items-center justify-between px-4 md:px-10">
		<div class="flex h-16 items-center">
			<img src="/img/svelocker.png" class="mr-3 h-8 w-8" style="border-radius: 50%;" alt="Logo" />
			<p class="text-lg font-bold">Svelocker UI</p>
		</div>
		<div class="sm:flex items-center gap-4 hidden">
			<a href="https://github.com/kmendell/svelocker-ui" class="duration-200 font-bold text-muted-foreground hover:text-blue-400 no-underline flex items-center gap-2" target={'_blank'}>
				<Github size={20} />
				<p class="">v{currentVersion}</p>
			</a>
		</div>
	</div>
</header>
