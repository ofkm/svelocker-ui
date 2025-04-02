<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
	<div class="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
		<div class="text-center">
			<h1 class="text-2xl font-bold text-red-600 dark:text-red-400">Authentication Error</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-300">There was a problem authenticating with your identity provider.</p>
		</div>

		<div class="flex justify-center mt-6">
			<button on:click={() => goto('/')} class="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"> Return to Home </button>
		</div>
	</div>
</div>
