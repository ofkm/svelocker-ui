// src/lib/utils/node-polyfills.js
// Simple polyfill for some Node.js built-ins in browser environments

// Only run in browser environment
if (typeof window !== 'undefined') {
	// Add minimal process polyfill
	window.process = window.process || {
		env: {},
		versions: { node: false },
		nextTick: (cb) => setTimeout(cb, 0)
	};

	// Add minimal Buffer polyfill if you need it
	if (!window.Buffer) {
		window.Buffer = {
			from: (data) => new TextEncoder().encode(data)
		};
	}
}

export default {};
