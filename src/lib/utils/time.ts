export function convertTimeString(timeString: string): string | null {
	const date = new Date(timeString);

	if (isNaN(date.getTime())) {
		return null; // Invalid date
	}

	const formattedDate = date.toLocaleDateString();
	const formattedTime = date.toLocaleTimeString();

	return `${formattedDate} ${formattedTime}`;
}