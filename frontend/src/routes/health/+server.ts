import { json } from '@sveltejs/kit';

export async function GET() {
	return json({ status: 'HEALTHY' }, { status: 200 });
}
