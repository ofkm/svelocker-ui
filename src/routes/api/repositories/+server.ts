import { getRepositories, getDatabaseInfo } from '$lib/services/database';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '5');
	const search = url.searchParams.get('search') || '';

	try {
		// Get database info
		const dbInfo = getDatabaseInfo();

		// Get repositories with pagination and search
		const result = await getRepositories({ page, limit, search });

		return json({
			...result,
			dbInfo
		});
	} catch (error) {
		console.error('Failed to fetch repositories:', error);
		return json({ error: 'Failed to fetch repositories' }, { status: 500 });
	}
}
