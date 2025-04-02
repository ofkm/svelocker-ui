<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { LogIn, GithubIcon, User } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';

	const isOidcEnabled = env.PUBLIC_OIDC_ENABLED === 'true';
	const registryName = env.PUBLIC_REGISTRY_NAME || 'Registry Explorer';
	let showLocalAuth = false;

	function handleOidcLogin() {
		goto('/auth/login/oidc');
	}

	function toggleLocalAuth() {
		showLocalAuth = !showLocalAuth;
	}

	// Initialize superForm with error handling
	const { form, errors, enhance, submitting } = superForm($page.data.form, {
		onError(event) {
			// Check if there's a server-side error message
			if (event.result.error) {
				toast.error(event.result.error);
			} else {
				// Otherwise check for validation errors
				const firstError = Object.values(event.result.data.form.errors).find((error) => error !== null);
				if (firstError) {
					toast.error(firstError);
				} else {
					toast.error('Login failed');
				}
			}
		},
		resetForm: false
	});
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
			{#if !showLocalAuth}
				{#if isOidcEnabled}
					<Button onclick={handleOidcLogin} class="w-full flex items-center justify-center gap-2 font-medium">
						<LogIn class="h-4 w-4" />
						Sign in with OIDC
					</Button>
				{:else}
					<div class="bg-muted/50 rounded-md p-4 text-center text-muted-foreground">
						<p>OIDC authentication is not configured.</p>
						<p class="text-xs mt-1">Set PUBLIC_OIDC_ENABLED=true in your environment variables.</p>
					</div>
				{/if}

				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<span class="w-full border-t"></span>
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span class="bg-card px-2 text-muted-foreground">Or</span>
					</div>
				</div>

				<Button variant="outline" onclick={toggleLocalAuth} class="w-full flex items-center justify-center gap-2">
					<User class="h-4 w-4" />
					Sign in with username & password
				</Button>
			{:else}
				<form method="POST" use:enhance>
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="username" class={$errors.username ? 'text-destructive' : ''}>Username</Label>
							<Input id="username" name="username" type="text" bind:value={$form.username} class={$errors.username ? 'border-destructive' : ''} autocomplete="username" />
							{#if $errors.username}
								<p class="text-xs text-destructive mt-1">{$errors.username}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="password" class={$errors.password ? 'text-destructive' : ''}>Password</Label>
							<Input id="password" name="password" type="password" bind:value={$form.password} class={$errors.password ? 'border-destructive' : ''} autocomplete="current-password" />
							{#if $errors.password}
								<p class="text-xs text-destructive mt-1">{$errors.password}</p>
							{/if}
						</div>

						<Button type="submit" class="w-full" disabled={$submitting}>
							{#if $submitting}
								<span class="animate-spin mr-2">⟳</span>
							{/if}
							Sign in
						</Button>
					</div>
				</form>

				<div class="text-center mt-4">
					<button type="button" on:click={toggleLocalAuth} class="text-sm text-primary hover:underline"> Use other sign-in options </button>
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
