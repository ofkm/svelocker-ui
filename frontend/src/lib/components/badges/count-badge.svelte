<script lang="ts">
	export let count: number;
	export let label: string = 'tags';
	export let variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' = 'default';
	export let customClass: string = '';

	// Map variants to styles
	const variantStyles = {
		default: 'bg-muted/70 text-foreground border-border/30',
		primary: 'bg-primary/10 text-primary border-primary/20',
		success: 'bg-green-100/90 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-green-300/50 dark:border-green-800/50',
		warning: 'bg-yellow-100/90 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-300/50 dark:border-yellow-800/50',
		danger: 'bg-red-100/90 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-300/50 dark:border-red-800/50'
	};

	const variantStyle = variantStyles[variant];
</script>

<div class="inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium {variantStyle} {customClass}">
	<span class="font-semibold">{count}</span>
	<span class="ml-2.5">&nbsp;{label}</span>
</div>
