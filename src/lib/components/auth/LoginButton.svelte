<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { goto } from '$app/navigation';

	export let className = '';

	const isOidcEnabled = env.PUBLIC_OIDC_ENABLED === 'true';

	function handleLogin() {
		goto('/auth/login');
	}
</script>

{#if isOidcEnabled}
	<button on:click={handleLogin} class={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${className}`}> Login </button>
{/if}
