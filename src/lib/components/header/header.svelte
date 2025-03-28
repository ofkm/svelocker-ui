<script lang="ts">
	import { version as currentVersion } from '$app/environment';
	import { Github, HomeIcon, ExternalLink, Moon, Sun } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { mode } from 'mode-watcher';
	import { env } from '$env/dynamic/public';

	// Toggle theme function
	function toggleTheme() {
		$mode = $mode === 'dark' ? 'light' : 'dark';
	}
</script>

<header class="w-full border-b border-border/40 bg-background/95 backdrop-blur-sm fixed top-0 z-40">
	<div class="flex w-full items-center justify-between h-16 max-w-[95%] mx-auto">
		<div class="flex items-center">
			<a href="/" class="flex items-center gap-2 hover:opacity-90 transition-opacity">
				<img src="/img/svelocker.png" class="h-9 w-9 shadow-sm" alt="Svelocker Logo" />
				<div class="flex flex-col">
					<span class="text-lg font-semibold tracking-tight">Svelocker UI</span>
					<span class="text-xs text-muted-foreground -mt-1 hidden md:block">
						{env.PUBLIC_REGISTRY_NAME || 'Registry Explorer'}
					</span>
				</div>
			</a>
		</div>

		<div class="flex items-center gap-3">
			<a href="/" class="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted/50" aria-label="Home">
				<HomeIcon size={18} />
			</a>

			<Button variant="ghost" size="icon" onclick={toggleTheme} class="text-muted-foreground hover:text-foreground" aria-label="Toggle theme">
				{#if $mode === 'dark'}
					<Sun size={18} />
				{:else}
					<Moon size={18} />
				{/if}
			</Button>

			<a href="https://github.com/kmendell/svelocker-ui" class="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors" target="_blank" rel="noopener noreferrer">
				<Github size={14} />
				<span>v{currentVersion}</span>
				<ExternalLink size={12} class="opacity-70" />
			</a>
		</div>
	</div>
</header>

<!-- Add padding to make room for the fixed header -->
<div class="h-16"></div>
