<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import type { User } from '$lib/types/db/models';

	const dispatch = createEventDispatcher<{
		userCreated: User;
		cancel: void;
	}>();

	// Form data structure that follows the User type structure
	let formData = {
		username: '',
		password: '', // Password is only for form (not in User type)
		email: undefined as string | undefined,
		name: undefined as string | undefined,
		isAdmin: false
	};

	let isSubmitting = false;
	let errors: Record<string, string> = {};

	async function handleSubmit() {
		// Reset errors
		errors = {};

		// Basic form validation
		if (!formData.username) errors.username = 'Username is required';
		if (!formData.password) errors.password = 'Password is required';
		if (formData.password && formData.password.length < 6) errors.password = 'Password must be at least 6 characters';

		// If there are validation errors, don't submit
		if (Object.keys(errors).length > 0) {
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/admin/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: formData.username,
					password: formData.password,
					email: formData.email || undefined,
					name: formData.name || undefined,
					isAdmin: formData.isAdmin
				})
			});

			if (response.ok) {
				const newUser = (await response.json()) as User;
				dispatch('userCreated', newUser);
			} else {
				const error = await response.json();
				toast.error(`Failed to create user: ${error.message}`);
			}
		} catch (error) {
			toast.error(`Failed to create user: ${error instanceof Error ? error.message : String(error)}`);
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
			<div class="space-y-2">
				<Label for="username" class={errors.username ? 'text-destructive' : ''}>Username *</Label>
				<Input id="username" bind:value={formData.username} class={errors.username ? 'border-destructive' : ''} placeholder="Enter username" />
				{#if errors.username}
					<p class="text-xs text-destructive">{errors.username}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="password" class={errors.password ? 'text-destructive' : ''}>Password *</Label>
				<Input id="password" type="password" bind:value={formData.password} class={errors.password ? 'border-destructive' : ''} placeholder="Enter password" />
				{#if errors.password}
					<p class="text-xs text-destructive">{errors.password}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="email">Email Address</Label>
				<Input id="email" type="email" bind:value={formData.email} placeholder="Enter email address" />
			</div>

			<div class="space-y-2">
				<Label for="name">Display Name</Label>
				<Input id="name" bind:value={formData.name} placeholder="Enter display name" />
			</div>

			<div class="flex items-center space-x-2 pt-2">
				<Checkbox id="isAdmin" bind:checked={formData.isAdmin} />
				<Label for="isAdmin">Admin User</Label>
			</div>
		</div>
	</div>

	<Dialog.Footer>
		<Button type="button" variant="outline" onclick={handleCancel}>Cancel</Button>
		<Button type="submit" disabled={isSubmitting}>
			{#if isSubmitting}
				<span class="animate-spin mr-2">⟳</span>
			{/if}
			Create User
		</Button>
	</Dialog.Footer>
</form>
