// src/lib/services/db/types.ts

// Database records (raw database format)
export interface RepositoryRecord {
	id: number;
	name: string;
	last_synced: string;
}
