export function convertTimeString(timeString: string): string | null {
	const date = new Date(timeString);

	if (isNaN(date.getTime())) {
		return null; // Invalid date
	}

	const formattedDate = date.toLocaleDateString();
	const formattedTime = date.toLocaleTimeString();

	return `${formattedDate} ${formattedTime}`;
}

// Format time difference for logging
export function formatTimeDiff(diffMs: number): string {
	if (diffMs < 1000) return `${diffMs}ms`;
	if (diffMs < 60000) return `${Math.round(diffMs / 1000)}s`;
	if (diffMs < 3600000) return `${Math.round(diffMs / 60000)}m`;
	return `${Math.round(diffMs / 3600000)}h`;
}
