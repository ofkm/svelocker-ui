declare global {
	namespace NodeJS {
		interface ProcessEnv {
			REGISTRY_URL: string;
		}
	}
}

export {};