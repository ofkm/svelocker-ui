<script lang="ts">
	import { Gauge, Users, Database, Clock, Activity } from 'lucide-svelte';
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	export let data;

	const stats = [
		{
			title: 'Total Users',
			value: data.userCount || 0,
			description: 'Registered user accounts',
			icon: Users,
			color: 'text-blue-500',
			link: '/admin/users'
		},
		{
			title: 'Admin Users',
			value: data.adminCount || 0,
			description: 'Users with admin privileges',
			icon: Gauge,
			color: 'text-indigo-500',
			link: '/admin/users'
		},
		{
			title: 'Database Size',
			value: data.databaseSize || '0 KB',
			description: 'Current SQLite DB size',
			icon: Database,
			color: 'text-emerald-500'
		},
		{
			title: 'Last Login',
			value: data.lastLogin || 'Never',
			description: 'Most recent user login',
			icon: Clock,
			color: 'text-amber-500'
		}
	];
</script>

<svelte:head>
	<title>Admin Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-semibold tracking-tight">Admin Dashboard</h2>
		<p class="text-muted-foreground">Overview and management of your SveLocker UI instance</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat}
			<Card>
				<CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
					<CardTitle class="text-sm font-medium">
						{stat.title}
					</CardTitle>
					<div class={`${stat.color} bg-background p-2 rounded-full`}>
						<svelte:component this={stat.icon} class="h-4 w-4" />
					</div>
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{stat.value}</div>
					<p class="text-xs text-muted-foreground">{stat.description}</p>
				</CardContent>
				{#if stat.link}
					<CardFooter class="pt-1">
						<Button variant="ghost" size="sm" href={stat.link} class="ml-auto">View</Button>
					</CardFooter>
				{/if}
			</Card>
		{/each}
	</div>

	<Card>
		<CardHeader>
			<CardTitle>System Status</CardTitle>
			<CardDescription>Current status of your SveLocker UI services</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div class="flex items-center justify-between border-b pb-2">
					<div class="flex items-center gap-2">
						<div class="size-3 rounded-full bg-green-500"></div>
						<span>Registry Connection</span>
					</div>
					<span class="text-sm text-green-500 font-medium">Online</span>
				</div>
				<div class="flex items-center justify-between border-b pb-2">
					<div class="flex items-center gap-2">
						<div class="size-3 rounded-full bg-green-500"></div>
						<span>Database</span>
					</div>
					<span class="text-sm text-green-500 font-medium">Healthy</span>
				</div>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="size-3 rounded-full bg-green-500"></div>
						<span>Authentication</span>
					</div>
					<span class="text-sm text-green-500 font-medium">Active</span>
				</div>
			</div>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>Recent Activity</CardTitle>
			<CardDescription>System events from the last 24 hours</CardDescription>
		</CardHeader>
		<CardContent>
			{#if data.recentLogs && data.recentLogs.length > 0}
				<div class="space-y-4">
					{#each data.recentLogs as log}
						<div class="flex gap-3 items-start border-b pb-3 last:border-b-0 last:pb-0">
							<div class="p-1.5 rounded-full bg-muted">
								<Activity class="h-3.5 w-3.5" />
							</div>
							<div>
								<p class="text-sm font-medium">{log.message}</p>
								<div class="flex gap-3 mt-1">
									<p class="text-xs text-muted-foreground">{log.timestamp}</p>
									<p class="text-xs">{log.source}</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-6 text-muted-foreground">
					<p>No recent activity</p>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>
