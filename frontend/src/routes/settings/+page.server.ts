import type { PageServerLoad } from './$types';
import { AppConfigService } from '$lib/services/app-config-service';

export const load: PageServerLoad = async () => {
	const configService = AppConfigService.getInstance();
	const syncInterval = await configService.getSyncInterval();

	return {
		syncInterval
	};
};
