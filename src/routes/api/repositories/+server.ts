import { db } from '$lib/services/db';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '5');
	const search = url.searchParams.get('search') || '';

	const offset = (page - 1) * limit;

	// Search query
	const searchTerm = `%${search}%`;

	try {
		// Get paginated repositories with search and include ALL tags
		const repositories = db
			.prepare(
				`
      SELECT r.id, r.name, 
        (
          SELECT json_group_array(
            json_object(
              'name', i.name,
              'fullName', i.fullName,
              'tags', (
                SELECT json_group_array(
                  json_object(
                    'name', t.name,
                    'digest', t.digest,
                    'metadata', (
                      SELECT json_object(
                        'created_at', tm.created_at,
                        'os', tm.os,
                        'architecture', tm.architecture,
                        'author', tm.author,
                        'dockerFile', tm.dockerFile,
                        'exposedPorts', tm.exposedPorts,
                        'totalSize', tm.totalSize,
                        'workDir', tm.workDir,
                        'command', tm.command,
                        'contentDigest', tm.contentDigest,
                        'entrypoint', tm.entrypoint,
                        'isOCI', tm.isOCI,
                        'indexDigest', tm.indexDigest
                      )
                      FROM tag_metadata tm
                      WHERE tm.tag_id = t.id
                    )
                  )
                )
                FROM tags t
                WHERE t.image_id = i.id
                ORDER BY t.name = 'latest' DESC, t.name ASC
              )
            )
          )
          FROM images i
          WHERE i.repository_id = r.id
          AND (i.name LIKE ? OR i.fullName LIKE ?)
        ) as images
      FROM repositories r
      WHERE r.name LIKE ?
      ORDER BY r.name ASC
      LIMIT ? OFFSET ?
    `
			)
			.all(searchTerm, searchTerm, searchTerm, limit, offset);

		// Get total count for pagination
		const totalCount = db
			.prepare(
				`
      SELECT COUNT(*) as count
      FROM repositories r
      WHERE r.name LIKE ?
    `
			)
			.get(searchTerm).count;

		// Parse JSON arrays from SQLite
		const formattedRepos = repositories.map((repo) => ({
			...repo,
			images: JSON.parse(repo.images || '[]')
		}));

		return json({
			repositories: formattedRepos,
			totalCount,
			page,
			limit
		});
	} catch (error) {
		console.error('Database query error:', error);
		return json({ error: 'Failed to retrieve repositories', repositories: [], totalCount: 0 }, { status: 500 });
	}
}
