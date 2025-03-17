// src/lib/utils/node-polyfills.js
// Simple polyfill for some Node.js built-ins in browser environments

// Add type declarations at the top of the file
declare global {
	interface Window {
		process: any;
		Buffer: {
			from: (data: string) => Uint8Array;
		};
	}
}

// Only run in browser environment
if (typeof window !== 'undefined') {
	window.process = window.process || {
		env: {},
		versions: { node: false },
		nextTick: (cb: () => void) => setTimeout(cb, 0)
	};

	if (!window.Buffer) {
		window.Buffer = {
			from: (data: string): Uint8Array => new TextEncoder().encode(data)
		};
	}
}

export default {};
