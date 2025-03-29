/**
 * Types representing Docker/OCI manifest structures and responses
 */

// Basic manifest structure for Docker Image Manifest V2 Schema 2
export interface DockerManifestV2 {
	schemaVersion: number;
	mediaType: string;
	config: {
		mediaType: string;
		size: number;
		digest: string;
	};
	layers: Array<{
		mediaType: string;
		size: number;
		digest: string;
	}>;
}

// OCI Image Manifest
export interface OCIManifest {
	schemaVersion: number;
	mediaType: string;
	config: {
		mediaType: string;
		size: number;
		digest: string;
	};
	layers: Array<{
		mediaType: string;
		size: number;
		digest: string;
	}>;
	annotations?: Record<string, string>;
}

// OCI Image Index
export interface OCIImageIndex {
	schemaVersion: number;
	mediaType: string;
	manifests: Array<{
		mediaType: string;
		size: number;
		digest: string;
		platform?: {
			architecture: string;
			os: string;
			variant?: string;
		};
		annotations?: Record<string, string>;
	}>;
	annotations?: Record<string, string>;
}

// Image Config (used for both Docker and OCI)
export interface ImageConfig {
	architecture: string;
	os: string;
	created: string;
	author?: string;
	config?: {
		Hostname?: string;
		Domainname?: string;
		User?: string;
		Env?: string[];
		Cmd?: string[];
		Entrypoint?: string[];
		WorkingDir?: string;
		Labels?: Record<string, string>;
		ExposedPorts?: Record<string, {}>;
		Volumes?: Record<string, {}>;
	};
	history?: Array<{
		created: string;
		created_by: string;
		empty_layer?: boolean;
	}>;
	rootfs?: {
		type: string;
		diff_ids: string[];
	};
}

// Combined type for any manifest format
export type ManifestType = DockerManifestV2 | OCIManifest | OCIImageIndex;

// Type for manifest API responses with headers
export interface ManifestResponse {
	manifest: ManifestType;
	headers: {
		'docker-content-digest'?: string;
		'content-type'?: string;
	};
}
