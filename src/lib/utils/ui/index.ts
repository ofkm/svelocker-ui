/**
 * UI Utilities Index
 *
 * This file re-exports all UI-related utility functions to provide a centralized
 * import location. Import from '$lib/utils/ui' to access all UI utilities.
 */

// Re-export clipboard utilities
export * from './clipboard';

// Add any standalone UI utility functions here
export function truncateText(text: string, maxLength: number): string {
	if (!text) return '';
	return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}
