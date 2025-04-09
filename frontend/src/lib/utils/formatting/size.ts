import type { ImageLayer } from '$lib/types';

export function formatSize(bytes: number): string {
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	let i = 0;
	while (bytes >= 1024 && i < units.length - 1) {
		bytes /= 1024;
		i++;
	}
	return `${bytes.toFixed(2)} ${units[i]}`;
}

export function getTotalLayerSize(layers: ImageLayer[]): number {
	return Array.isArray(layers) && layers.length > 0 ? layers.reduce((sum, layer) => sum + (typeof layer.size === 'number' ? layer.size : 0), 0) : 0;
}
