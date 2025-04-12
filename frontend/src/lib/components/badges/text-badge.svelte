<script lang="ts">
	export let text: string = '';
	export let variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'default';
	export let customClass: string = '';
	export let icon: any = null;

	// Map variants to styles
	const variantStyles = {
		default: 'bg-muted/70 text-foreground border-border/30',
		primary: 'bg-primary/10 text-primary border-primary/20',
		success: 'bg-green-100/90 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-green-300/50 dark:border-green-800/50',
		warning: 'bg-yellow-100/90 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-300/50 dark:border-yellow-800/50',
		danger: 'bg-red-100/90 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-300/50 dark:border-red-800/50',
		info: 'bg-blue-100/90 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-300/50 dark:border-blue-800/50'
	};

	const variantStyle = variantStyles[variant];
</script>

<div class="inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium whitespace-nowrap {variantStyle} {customClass}">
	{#if icon}
		<span class="mr-1.5">
			<svelte:component this={icon} size={12} />
		</span>
	{/if}
	<span>{text}</span>
</div>

<style>
	div {
		line-height: 1.2;
		letter-spacing: 0.01em;
	}
</style>
