<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { PlusCircle, Pencil, Trash2, Search, Shield, User as UserIcon, MoreHorizontal } from 'lucide-svelte';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import UserCreateForm from '$lib/components/admin/UserCreateForm.svelte';
	import UserEditForm from '$lib/components/admin/UserEditForm.svelte';
	import TextBadge from '$lib/components/badges/text-badge.svelte';
	import type { User } from '$lib/types/db/models';

	let { data } = $props();

	let users: User[] = $state(data.users || []);
	let searchQuery = $state('');
	let showCreateUserDialog = $state(false);
	let showEditUserDialog = $state(false);
	let userToEdit: User | null = $state(null);
	let showDeleteConfirmDialog = $state(false);
	let userToDelete: User | null = $state(null);

	let filteredUsers = $derived(users.filter((user) => user.username?.toLowerCase().includes(searchQuery.toLowerCase()) || user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || user.email?.toLowerCase().includes(searchQuery.toLowerCase())));

	function handleEditUser(user: User): void {
		userToEdit = user;
		showEditUserDialog = true;
	}

	function handleDeleteUser(user: User): void {
		userToDelete = user;
		showDeleteConfirmDialog = true;
	}

	function closeCreateUserDialog(): void {
		showCreateUserDialog = false;
	}

	function closeEditUserDialog(): void {
		showEditUserDialog = false;
		userToEdit = null;
	}

	function closeDeleteConfirmDialog(): void {
		showDeleteConfirmDialog = false;
		userToDelete = null;
	}

	async function confirmDeleteUser(): Promise<void> {
		if (!userToDelete) return;

		try {
			const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				const deletedUserId = userToDelete.id;
				const deletedUsername = userToDelete.username;
				toast.success(`User ${deletedUsername} deleted successfully`);
				users = users.filter((u) => u.id !== deletedUserId);
			} else {
				const error = await response.json();
				toast.error(`Failed to delete user: ${error.message}`);
			}
		} catch (error) {
			toast.error(`Failed to delete user: ${error instanceof Error ? error.message : String(error)}`);
		} finally {
			closeDeleteConfirmDialog();
		}
	}

	async function handleUserCreated(event: CustomEvent<User>): Promise<void> {
		users = [...users, event.detail];
		closeCreateUserDialog();
		toast.success(`User ${event.detail.username} created successfully`);
	}

	async function handleUserUpdated(event: CustomEvent<User>): Promise<void> {
		const updatedUser = event.detail;
		users = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
		closeEditUserDialog();
		toast.success(`User ${updatedUser.username} updated successfully`);
	}

	// Generate initials for avatar
	function getInitials(user: User): string {
		if (user.name) {
			return user.name
				.split(' ')
				.map((n) => n[0])
				.join('')
				.toUpperCase()
				.substring(0, 2);
		}

		return user.username?.substring(0, 2).toUpperCase() || user.email?.substring(0, 2).toUpperCase() || 'U';
	}
</script>

<svelte:head>
	<title>User Management | Admin Panel</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
		<div>
			<h2 class="text-2xl font-semibold tracking-tight">User Management</h2>
			<p class="text-muted-foreground">Manage user accounts and permissions</p>
		</div>

		<Button onclick={() => (showCreateUserDialog = true)} class="w-full md:w-auto">
			<PlusCircle class="mr-2 h-4 w-4" />
			Create User
		</Button>
	</div>

	<Separator />

	<div class="flex items-center justify-between gap-4">
		<div class="relative max-w-sm">
			<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
			<Input type="search" placeholder="Search users..." class="pl-8 w-[300px]" bind:value={searchQuery} />
		</div>

		<Badge variant="outline">{filteredUsers.length} Users</Badge>
	</div>

	<div class="border rounded-md">
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>User</TableHead>
					<TableHead>Username</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Role</TableHead>
					<TableHead class="w-[100px]">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if filteredUsers.length === 0}
					<TableRow>
						<TableCell colspan={5} class="h-24 text-center">No users found.</TableCell>
					</TableRow>
				{:else}
					{#each filteredUsers as user (user.id)}
						<TableRow>
							<TableCell class="font-medium">
								<div class="flex items-center gap-3">
									<Avatar.Root class="h-8 w-8">
										{#if user.picture}
											<Avatar.Image src={user.picture} alt={user.name || user.username} />
										{:else}
											<Avatar.Fallback class="bg-primary/10 text-primary font-medium text-sm">
												{getInitials(user)}
											</Avatar.Fallback>
										{/if}
									</Avatar.Root>
									<span>{user.name || user.username}</span>
								</div>
							</TableCell>
							<TableCell>{user.username}</TableCell>
							<TableCell>{user.email || '-'}</TableCell>
							<TableCell>
								{#if user.isAdmin}
									<TextBadge text="Admin" variant="primary" icon={Shield} />
								{:else}
									<TextBadge text="User" variant="default" icon={UserIcon} />
								{/if}
							</TableCell>
							<TableCell>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										<Button variant="ghost" size="sm" class="h-8 w-8 p-0">
											<MoreHorizontal class="h-4 w-4" />
											<span class="sr-only">Open menu</span>
										</Button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Label>Actions</DropdownMenu.Label>
										<DropdownMenu.Separator />
										<DropdownMenu.Item class="cursor-pointer" onclick={() => handleEditUser(user)}>
											<Pencil class="mr-2 h-4 w-4" />
											Edit
										</DropdownMenu.Item>
										<DropdownMenu.Item class="cursor-pointer text-destructive focus:text-destructive" onclick={() => handleDeleteUser(user)}>
											<Trash2 class="mr-2 h-4 w-4" />
											Delete
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</TableCell>
						</TableRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
	</div>
</div>

<!-- Create User Dialog -->
<Dialog.Root bind:open={showCreateUserDialog}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Create New User</Dialog.Title>
			<Dialog.Description>Create a new user account. All fields marked with * are required.</Dialog.Description>
		</Dialog.Header>

		<UserCreateForm on:userCreated={handleUserCreated} on:cancel={closeCreateUserDialog} />
	</Dialog.Content>
</Dialog.Root>

<!-- Edit User Dialog -->
<Dialog.Root bind:open={showEditUserDialog}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Edit User</Dialog.Title>
			<Dialog.Description>Edit user details and permissions.</Dialog.Description>
		</Dialog.Header>

		{#if userToEdit}
			<UserEditForm user={userToEdit} on:userUpdated={handleUserUpdated} on:cancel={closeEditUserDialog} />
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={showDeleteConfirmDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Confirm Deletion</Dialog.Title>
			<Dialog.Description>Are you sure you want to delete this user? This action cannot be undone.</Dialog.Description>
		</Dialog.Header>

		{#if userToDelete}
			<div class="py-3">
				<div class="flex items-center gap-3 p-3 rounded-md border">
					<Avatar.Root class="h-10 w-10">
						{#if userToDelete.picture}
							<Avatar.Image src={userToDelete.picture} alt={userToDelete.name || userToDelete.username} />
						{:else}
							<Avatar.Fallback class="bg-primary/10 text-primary font-medium text-sm">
								{getInitials(userToDelete)}
							</Avatar.Fallback>
						{/if}
					</Avatar.Root>
					<div>
						<p class="font-medium">{userToDelete.name || userToDelete.username}</p>
						<p class="text-sm text-muted-foreground">{userToDelete.email || userToDelete.username}</p>
					</div>
				</div>
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={closeDeleteConfirmDialog}>Cancel</Button>
			<Button variant="destructive" onclick={confirmDeleteUser}>Delete</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
