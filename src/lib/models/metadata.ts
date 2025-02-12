export type ImageMetadata = {
	created: string;
	os: string;
	architecture: string;
	author?: string;
	configDigest: string;
};

// const metadata = {
// 	created: config.created,  // Creation timestamp
// 	os: config.os,            // OS type
// 	architecture: config.architecture, // CPU architecture
// 	author: config.author,    // Image author (if available)
// 	dockerVersion: config.docker_version, // Docker version used
// 	history: config.history?.map((entry: any) => entry.created_by), // Commands used
// };
