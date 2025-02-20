type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export class Logger {
	private static instance: Logger;
	private serviceName: string;
	private readonly logLevels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

	private constructor(serviceName: string) {
		this.serviceName = serviceName;
	}

	public static getInstance(serviceName: string): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger(serviceName);
		}
		return Logger.instance;
	}

	private formatTimestamp(): string {
		const now = new Date();
		return now.toLocaleString('en-US', {
			timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});
	}

	private formatMessage(level: LogLevel, message: string): string {
		const timestamp = this.formatTimestamp();
		return `[${timestamp}] [${level}] [${this.serviceName}] ${message}`;
	}

	public debug(message: string, ...args: any[]): void {
		if (process.env.NODE_ENV !== 'production') {
			console.debug(this.formatMessage('DEBUG', message), ...args);
		}
	}

	public info(message: string, ...args: any[]): void {
		console.info(this.formatMessage('INFO', message), ...args);
	}

	public warn(message: string, ...args: any[]): void {
		console.warn(this.formatMessage('WARN', message), ...args);
	}

	public error(message: string, error?: any): void {
		console.error(this.formatMessage('ERROR', message), error || '');
	}
}
