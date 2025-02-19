import { json } from '@sveltejs/kit';
import { RegistrySyncService } from '$lib/services/sync';

export async function POST() {
	try {
		await RegistrySyncService.getInstance().syncNow();
		return json({ success: true });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return json({ success: false, error: errorMessage }, { status: 500 });
	}
}
