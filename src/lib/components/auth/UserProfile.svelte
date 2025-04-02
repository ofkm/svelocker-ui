<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { LogOut, User, Shield } from 'lucide-svelte';

	$: user = $page.data.user;

	function handleLogout() {
		goto('/auth/logout');
	}

	function handleAdminRoute() {
		goto('/admin');
	}

	// Generate initials for the avatar fallback
	$: initials = user?.name
		? user.name
				.split(' ')
				.map((n: string) => n[0])
				.join('')
				.toUpperCase()
				.substring(0, 2)
		: user?.username?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || 'U';
</script>

{#if user?.isAuthenticated}
	<div class="flex items-center gap-2">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class="flex items-center gap-2 h-9 px-2 rounded-md hover:bg-muted transition-colors">
				<Avatar.Root class="size-7">
					{#if user.picture}
						<Avatar.Image src={user.picture} alt={user.name || user.username || 'User'} />
					{:else}
						<Avatar.Fallback class="bg-primary/10 text-primary font-medium text-sm">
							{initials}
						</Avatar.Fallback>
					{/if}
				</Avatar.Root>
				<span class="hidden md:block text-sm font-medium truncate max-w-[120px]">
					{user.name || user.username || user.email || 'User'}
				</span>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-48">
				<DropdownMenu.Label>
					{#if user.email}
						{user.email}
					{:else if user.username}
						{user.username}
					{:else}
						Authenticated User
					{/if}
					{#if user.isAdmin}
						<span class="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Admin</span>
					{/if}
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<User class="mr-2 h-4 w-4" />
						<span>Profile</span>
					</DropdownMenu.Item>
					{#if user.isAdmin}
						<DropdownMenu.Item onclick={handleAdminRoute}>
							<Shield class="mr-2 h-4 w-4" />
							<span>Admin</span>
						</DropdownMenu.Item>
					{/if}
					<DropdownMenu.Item onclick={handleLogout}>
						<LogOut class="mr-2 h-4 w-4" />
						<span>Logout</span>
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
{/if}
