/// <reference types="vite/client" />

// Ensure TypeScript knows about the browser's crypto API
interface Window {
	crypto: {
		subtle: {
			digest(algorithm: string, data: BufferSource): Promise<ArrayBuffer>;
		};
		getRandomValues<T extends ArrayBufferView>(buffer: T): T;
	};
}
