<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import type { User } from '$lib/types/db/models';

	export let user: User;

	const dispatch = createEventDispatcher<{
		userUpdated: User;
		cancel: void;
	}>();

	// Form data structure that follows the User type structure
	let formData = {
		email: user.email || (undefined as string | undefined),
		name: user.name || (undefined as string | undefined),
		isAdmin: user.isAdmin || false,
		changePassword: false,
		newPassword: ''
	};

	let isSubmitting = false;
	let errors: Record<string, string> = {};

	async function handleSubmit() {
		// Reset errors
		errors = {};

		// Password validation if changing password
		if (formData.changePassword && !formData.newPassword) errors.password = 'Password is required';
		if (formData.changePassword && formData.newPassword.length < 6) errors.password = 'Password must be at least 6 characters';

		// If there are validation errors, don't submit
		if (Object.keys(errors).length > 0) {
			return;
		}

		isSubmitting = true;

		try {
			const updateData: {
				email: string | undefined;
				name: string | undefined;
				isAdmin: boolean;
				password?: string;
			} = {
				email: formData.email || undefined,
				name: formData.name || undefined,
				isAdmin: formData.isAdmin
			};

			// Only include password if changing it
			if (formData.changePassword && formData.newPassword) {
				updateData.password = formData.newPassword;
			}

			const response = await fetch(`/api/admin/users/${user.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(updateData)
			});

			if (response.ok) {
				const updatedUser = (await response.json()) as User;
				dispatch('userUpdated', updatedUser);
			} else {
				const error = await response.json();
				toast.error(`Failed to update user: ${error.message}`);
			}
		} catch (error) {
			toast.error(`Failed to update user: ${error instanceof Error ? error.message : String(error)}`);
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
	<div class="space-y-4 py-2">
		<div class="grid grid-cols-1 gap-4">
			<div class="bg-muted/40 rounded-md p-3 text-sm">
				<span class="font-medium">Username:</span>
				{user.username}
			</div>

			<div class="space-y-2">
				<Label for="email">Email Address</Label>
				<Input id="email" type="email" bind:value={formData.email} placeholder="Enter email address" />
			</div>

			<div class="space-y-2">
				<Label for="name">Display Name</Label>
				<Input id="name" bind:value={formData.name} placeholder="Enter display name" />
			</div>

			<div class="flex items-center space-x-2">
				<Checkbox id="isAdmin" bind:checked={formData.isAdmin} />
				<Label for="isAdmin">Admin User</Label>
			</div>

			<div class="pt-2">
				<div class="flex items-center space-x-2 mb-3">
					<Checkbox id="changePassword" bind:checked={formData.changePassword} />
					<Label for="changePassword">Change Password</Label>
				</div>

				{#if formData.changePassword}
					<div class="space-y-2">
						<Label for="newPassword" class={errors.password ? 'text-destructive' : ''}>New Password</Label>
						<Input id="newPassword" type="password" bind:value={formData.newPassword} class={errors.password ? 'border-destructive' : ''} placeholder="Enter new password" />
						{#if errors.password}
							<p class="text-xs text-destructive">{errors.password}</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<Dialog.Footer>
		<Button type="button" variant="outline" onclick={handleCancel}>Cancel</Button>
		<Button type="submit" disabled={isSubmitting}>
			{#if isSubmitting}
				<span class="animate-spin mr-2">⟳</span>
			{/if}
			Save Changes
		</Button>
	</Dialog.Footer>
</form>
