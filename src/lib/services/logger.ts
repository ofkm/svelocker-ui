import { env } from '$env/dynamic/public';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export class Logger {
	private static instances: Map<string, Logger> = new Map();
	private serviceName: string;
	private readonly logLevels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

	private constructor(serviceName: string) {
		this.serviceName = serviceName;
	}

	public static getInstance(serviceName: string): Logger {
		if (!this.instances.has(serviceName)) {
			this.instances.set(serviceName, new Logger(serviceName));
		}
		return this.instances.get(serviceName)!;
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

	// Check if debug mode is enabled
	private isDebugEnabled(): boolean {
		// Check both browser and server environment variables
		return (typeof process !== 'undefined' && (process.env.DEBUG === 'true' || process.env.PUBLIC_DEBUG === 'true')) || (typeof env !== 'undefined' && env.PUBLIC_DEBUG === 'true');
	}

	public debug(message: string, ...args: any[]): void {
		// Only log if debug is enabled
		if (this.isDebugEnabled()) {
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
