<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { LogIn, GithubIcon } from 'lucide-svelte';

	const isOidcEnabled = env.PUBLIC_OIDC_ENABLED === 'true';
	const registryName = env.PUBLIC_REGISTRY_NAME || 'Registry Explorer';

	function handleLogin() {
		goto('/auth/login/oidc');
	}
</script>

<svelte:head>
	<title>Login | {registryName}</title>
</svelte:head>

<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
	<Card class="w-full max-w-md shadow-lg border-border/60 bg-card/90 backdrop-blur-sm">
		<CardHeader class="text-center space-y-2">
			<div class="mx-auto mb-2">
				<img src="/img/svelocker.png" class="h-16 w-16 mx-auto shadow-sm rounded-xl" alt="Svelocker Logo" />
			</div>
			<h1 class="text-2xl font-semibold tracking-tight">SveLocker UI</h1>
			<p class="text-sm text-muted-foreground">Sign in to access {registryName}</p>
		</CardHeader>

		<CardContent class="space-y-4 py-4">
			{#if isOidcEnabled}
				<Button onclick={handleLogin} class="w-full flex items-center justify-center gap-2 font-medium">
					<LogIn class="h-4 w-4" />
					Sign in with OIDC
				</Button>
			{:else}
				<div class="bg-muted/50 rounded-md p-4 text-center text-muted-foreground">
					<p>OIDC authentication is not configured.</p>
					<p class="text-xs mt-1">Set PUBLIC_OIDC_ENABLED=true in your environment variables.</p>
				</div>
			{/if}
		</CardContent>

		<div class="px-6 pb-2">
			<Separator />
		</div>

		<CardFooter class="flex flex-col space-y-4 pt-2">
			<div class="text-xs text-center text-muted-foreground">
				<p>A container registry exploration UI</p>
				<a href="https://github.com/ofkm/svelocker-ui" target="_blank" rel="noreferrer" class="inline-flex items-center gap-1 text-primary hover:underline mt-1">
					<GithubIcon class="h-3 w-3" />
					GitHub Repository
				</a>
			</div>
		</CardFooter>
	</Card>
</div>
