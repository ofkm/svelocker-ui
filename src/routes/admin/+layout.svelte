<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import { Home, Users, Settings, Shield, ChevronLeft, ChevronRight, Menu } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	// Sidebar state
	let isSidebarCollapsed = $state(false);
	let isSmallScreen = $state(false);
	let isSidebarOpen = $state(true);

	// Check screen size on mount and resize
	onMount(() => {
		checkScreenSize();
		window.addEventListener('resize', checkScreenSize);
		return () => window.removeEventListener('resize', checkScreenSize);
	});

	function checkScreenSize() {
		isSmallScreen = window.innerWidth < 1024;
		if (isSmallScreen && isSidebarOpen) {
			isSidebarOpen = false;
		} else if (!isSmallScreen && !isSidebarOpen) {
			isSidebarOpen = true;
		}
	}

	function toggleSidebar() {
		if (isSmallScreen) {
			isSidebarOpen = !isSidebarOpen;
		} else {
			isSidebarCollapsed = !isSidebarCollapsed;
		}
	}

	function closeSidebarIfSmall() {
		if (isSmallScreen) {
			isSidebarOpen = false;
		}
	}

	const adminMenu = [
		{ href: '/admin', label: 'Dashboard', icon: Home },
		{ href: '/admin/users', label: 'Users', icon: Users },
		{ href: '/admin/settings', label: 'Settings', icon: Settings }
	];

	// Determine if current page is in admin section
	let currentRoute = $derived(page.url.pathname);
	let registryName = $derived(env.PUBLIC_REGISTRY_NAME || 'Registry');

	// Use fixed widths instead of dynamic calculations
	let sidebarContentWidth = $derived(isSidebarCollapsed ? 64 : 256);
</script>

<!-- Mobile overlay when sidebar is open -->
{#if isSmallScreen && isSidebarOpen}
	<button type="button" class="fixed inset-0 w-full h-full bg-background/80 backdrop-blur-sm z-30 border-0" onclick={toggleSidebar} onkeydown={(e) => e.key === 'Escape' && toggleSidebar()} aria-label="Close sidebar" transition:fade={{ duration: 200 }}></button>
{/if}

<!-- Mobile Header -->
<div class="sticky top-0 z-20 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
	<div class="flex h-16 items-center px-4">
		<Button variant="ghost" size="icon" onclick={toggleSidebar} class="lg:hidden">
			<Menu class="h-5 w-5" />
			<span class="sr-only">Toggle menu</span>
		</Button>
		<div class="flex items-center gap-2 ml-4">
			<Shield class="h-5 w-5 text-primary" />
			<h1 class="text-lg font-medium">Admin Panel</h1>
		</div>
	</div>
</div>

<div class="flex min-h-[calc(100vh-4rem)] relative">
	<!-- Admin Sidebar -->
	<aside class={cn('fixed z-40 h-[calc(100vh-4rem)] border-r', 'transition-all duration-300 ease-in-out', isSmallScreen ? 'shadow-xl' : 'shadow-sm', isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0', isSidebarCollapsed ? 'w-16' : 'w-64')} transition:fly={{ x: isSmallScreen ? -300 : 0, duration: 200 }}>
		<div class={cn('h-full flex flex-col bg-sidebar', 'border-r border-border/60')}>
			<!-- Sidebar header -->
			<div class="p-4 flex items-center justify-center border-b border-border/60">
				<div class={cn('flex items-center gap-2 overflow-hidden', isSidebarCollapsed && 'justify-center w-full')}>
					<Shield class="h-5 w-5 text-primary flex-shrink-0" />
					{#if !isSidebarCollapsed}
						<h1 class="text-lg font-medium whitespace-nowrap">Admin Panel</h1>
					{/if}
				</div>
			</div>

			<!-- Sidebar navigation -->
			<nav class="p-2 space-y-1 flex-1 overflow-y-auto">
				{#each adminMenu as item}
					<a href={item.href} onclick={closeSidebarIfSmall} class={cn('flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors', 'hover:bg-sidebar-accent/50 hover:text-sidebar-foreground', isSidebarCollapsed ? 'justify-center' : 'gap-3', currentRoute === item.href ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/80')} title={item.label}>
						<item.icon class="h-4 w-4 flex-shrink-0" />
						{#if !isSidebarCollapsed}
							<span class="text-center">{item.label}</span>
						{/if}
					</a>
				{/each}
			</nav>

			<!-- Bottom button with fixed width -->
			<div class="border-t border-border/60 mt-auto">
				<div class="p-4">
					<Button variant="outline" size={isSidebarCollapsed ? 'icon' : 'sm'} class={cn('w-full flex', isSidebarCollapsed ? 'justify-center' : 'justify-start items-center')} href="/">
						<ChevronLeft class={cn('h-4 w-4 flex-shrink-0', !isSidebarCollapsed && 'mr-2')} />
						{#if !isSidebarCollapsed}
							<span class="truncate text-center">Return to Registry</span>
							<!-- <span class="truncate text-center">Return to {registryName}</span> -->
						{/if}
					</Button>
				</div>
			</div>
		</div>

		<!-- Toggle button positioned outside the sidebar -->
		<Button variant="outline" size="icon" onclick={toggleSidebar} class={cn('absolute top-4 -right-4 h-8 w-8 rounded-full border shadow-sm z-50 bg-background hidden lg:flex items-center justify-center')}>
			{#if isSidebarCollapsed}
				<ChevronRight class="h-4 w-4" />
			{:else}
				<ChevronLeft class="h-4 w-4" />
			{/if}
		</Button>
	</aside>

	<!-- Main Content -->
	<main class={cn('flex-1 transition-all duration-300 ease-in-out', isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64', 'pt-16 lg:pt-0')}>
		<div class="container p-4 md:p-6 mx-auto max-w-7xl">
			{@render children?.()}
		</div>
	</main>
</div>
