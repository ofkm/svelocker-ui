import { env } from '$env/dynamic/public';

export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3
}

type LogLevelKey = keyof typeof LogLevel;

export class Logger {
	private static instances: Map<string, Logger> = new Map();
	private serviceName: string;
	private minimumLevel: LogLevel;

	private constructor(serviceName: string) {
		this.serviceName = serviceName;
		// Use PUBLIC_LOG_LEVEL or default to 'INFO'
		const configLevel = (env.PUBLIC_LOG_LEVEL as LogLevelKey) || 'INFO';
		this.minimumLevel = LogLevel[configLevel] ?? LogLevel.INFO;
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
		return `[${timestamp}] [${LogLevel[level]}] [${this.serviceName}] ${message}`;
	}

	// Logging methods check against minimumLevel
	public debug(message: string, ...args: any[]): void {
		if (LogLevel.DEBUG >= this.minimumLevel) {
			console.debug(this.formatMessage(LogLevel.DEBUG, message), ...args);
		}
	}

	public info(message: string, ...args: any[]): void {
		if (LogLevel.INFO >= this.minimumLevel) {
			console.info(this.formatMessage(LogLevel.INFO, message), ...args);
		}
	}

	public warn(message: string, ...args: any[]): void {
		if (LogLevel.WARN >= this.minimumLevel) {
			console.warn(this.formatMessage(LogLevel.WARN, message), ...args);
		}
	}

	public error(message: string, error?: any): void {
		if (LogLevel.ERROR >= this.minimumLevel) {
			console.error(this.formatMessage(LogLevel.ERROR, message), error || '');
		}
	}
}
