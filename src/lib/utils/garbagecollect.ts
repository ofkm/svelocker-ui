// THIS IS STILL A WORK IN PROGRESS

import axios, { AxiosError } from 'axios';
import { platform } from 'os';
import { env } from '$env/dynamic/private';

export const DOCKER_CONFIG = {
	socketPath: env.DOCKER_SOCKET_PATH || (platform() === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock'),
	apiVersion: env.DOCKER_API_VERSION || 'v1.41'
} as const;

const DOCKER_API_VERSION = 'v1.41';
const DOCKER_SOCKET_WINDOWS = '//./pipe/docker_engine';
const DOCKER_SOCKET_LINUX = '/var/run/docker.sock';

// Determine platform-specific socket path
const DEFAULT_SOCKET = platform() === 'win32' ? DOCKER_SOCKET_WINDOWS : DOCKER_SOCKET_LINUX;

interface DockerExecConfig {
	containerName: string;
	command: string[];
	workingDir?: string;
}

interface DockerExecCreateResponse {
	Id: string;
	message?: string;
}

interface DockerExecInspectResponse {
	ExitCode: number;
	Running: boolean;
	Pid: number;
}

export class DockerService {
	private readonly baseUrl: string;
	private readonly socketPath: string;
	private readonly isWindows: boolean;

	constructor(socketPath: string = DEFAULT_SOCKET, apiVersion: string = DOCKER_API_VERSION) {
		this.socketPath = socketPath;
		this.isWindows = platform() === 'win32';
		this.baseUrl = this.isWindows ? `http://localhost/${apiVersion}` : `http://unix:${socketPath}:/${apiVersion}`;
	}

	private getAxiosConfig(headers: Record<string, string> = {}) {
		return {
			socketPath: this.socketPath,
			headers: {
				'Content-Type': 'application/json',
				...headers
			}
		};
	}

	private async createExec({ containerName, command, workingDir }: DockerExecConfig): Promise<string> {
		try {
			const response = await axios.post<DockerExecCreateResponse>(
				`${this.baseUrl}/containers/${containerName}/exec`,
				{
					AttachStdout: true,
					AttachStderr: true,
					Tty: false,
					WorkingDir: workingDir,
					Cmd: command
				},
				this.getAxiosConfig()
			);
			return response.data.Id;
		} catch (error) {
			if (error instanceof AxiosError) {
				throw new Error(`Docker API Error: ${error.response?.data?.message || error.message}`);
			}
			throw error;
		}
	}

	private async startExec(execId: string): Promise<void> {
		try {
			await axios.post(
				`${this.baseUrl}/exec/${execId}/start`,
				{
					Detach: false,
					Tty: false
				},
				{
					socketPath: this.socketPath,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		} catch (error) {
			if (error instanceof AxiosError) {
				throw new Error(`Failed to start exec instance: ${error.response?.data?.message || error.message}`);
			}
			throw error;
		}
	}

	private async inspectExec(execId: string): Promise<DockerExecInspectResponse> {
		try {
			const response = await axios.get<DockerExecInspectResponse>(`${this.baseUrl}/exec/${execId}/json`, {
				socketPath: this.socketPath
			});
			return response.data;
		} catch (error) {
			if (error instanceof AxiosError) {
				throw new Error(`Failed to inspect exec instance: ${error.response?.data?.message || error.message}`);
			}
			throw error;
		}
	}

	public async runGarbageCollection(): Promise<boolean> {
		try {
			// Create exec instance for garbage collection
			const execId = await this.createExec({
				containerName: 'registry',
				command: ['registry', 'garbage-collect', '/etc/docker/registry/config.yml']
			});

			// Start the exec instance
			await this.startExec(execId);

			// Wait for completion and check exit code
			const result = await this.inspectExec(execId);
			return result.ExitCode === 0;
		} catch (error) {
			console.error('Garbage collection failed:', error);
			return false;
		}
	}
}
