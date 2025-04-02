<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { LogOut, User } from 'lucide-svelte';

	$: user = $page.data.user;

	function handleLogout() {
		goto('/auth/logout');
	}
</script>

{#if user?.isAuthenticated}
	<div class="flex items-center gap-2">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class="flex items-center gap-2 h-9 px-2 rounded-md hover:bg-muted transition-colors">
				<Avatar.Root class="size-7">
					{#if user.picture}
						<Avatar.Image src={user.picture} alt={user.name || 'User'} />
					{/if}
					<Avatar.Fallback class="bg-primary/10 text-primary font-medium text-sm">
						{user.name?.[0] || 'U'}
					</Avatar.Fallback>
				</Avatar.Root>
				<span class="hidden md:block text-sm font-medium truncate max-w-[120px]">
					{user.name || user.email || 'User'}
				</span>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-48">
				<DropdownMenu.Label>{user.email || 'Authenticated User'}</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item class="cursor-pointer">
						<User class="mr-2 h-4 w-4" />
						<span>Profile</span>
					</DropdownMenu.Item>
					<DropdownMenu.Item class="cursor-pointer" onclick={handleLogout}>
						<LogOut class="mr-2 h-4 w-4" />
						<span>Logout</span>
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
{/if}
