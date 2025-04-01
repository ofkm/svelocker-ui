<script lang="ts">
	import { onMount } from 'svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Copy } from '@lucide/svelte';
	import { copyTextToClipboard } from '$lib/utils/ui';
	import { toast } from 'svelte-sonner';

	// Props - add new stickyLineNumbers option
	interface Props {
		dockerfile: string | null | undefined;
		maxHeight?: string;
		showLineNumbers?: boolean;
		stickyLineNumbers?: boolean;
		highlightLines?: number[];
		theme?: 'light' | 'dark' | 'auto';
		showCopyButton?: boolean;
	}

	let { dockerfile = null, showLineNumbers = true, stickyLineNumbers = true, highlightLines = [], showCopyButton = true }: Props = $props();

	// Local state
	let lines = $state<string[]>([]);
	let copied = $state(false);

	onMount(() => {
		if (dockerfile) {
			lines = dockerfile.split('\n');
		}

		// Apply syntax highlighting
		applyHighlighting();
	});

	function copyDockerfile() {
		if (!dockerfile) return;

		copyTextToClipboard(dockerfile).then((success) => {
			if (success) {
				copied = true;
				toast.success('Dockerfile Copied successfully');
				setTimeout(() => {
					copied = false;
				}, 2000);
			} else {
				toast.error('Failed to copy Dockerfile...');
			}
		});
	}

	function highlightLine(line: string): string {
		// Handle comments
		if (line.trim().startsWith('#')) {
			return `<span class="comment">${line}</span>`;
		}

		// Match Dockerfile instructions
		const instructions = ['FROM', 'RUN', 'CMD', 'LABEL', 'MAINTAINER', 'EXPOSE', 'ENV', 'ADD', 'COPY', 'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL', 'HEALTHCHECK', 'SHELL'];

		for (const instruction of instructions) {
			// Look for instruction at the beginning of the trimmed line
			if (line.trim().startsWith(instruction)) {
				// Find the actual position of the instruction in the original line
				const instructionPos = line.indexOf(instruction);

				// Get any leading whitespace
				const leadingWhitespace = line.substring(0, instructionPos);

				// Get the part after the instruction, preserving original spacing
				const remaining = line.substring(instructionPos + instruction.length);

				return `${leadingWhitespace}<span class="instruction">${instruction}</span>${remaining}`;
			}
		}

		return line;
	}

	function applyHighlighting() {
		if (!dockerfile) return;

		lines = dockerfile.split('\n').map((line) => line || ' '); // Convert empty lines to space
	}
</script>

<div class="dockerfile-viewer" style="height: 100%; width: 100%;">
	{#if showCopyButton}
		<button class="copy-button" onclick={copyDockerfile} aria-label="Copy Dockerfile">
			<Copy class="h-4 w-4" />
			<span>{copied ? 'Copied!' : 'Copy'}</span>
		</button>
	{/if}

	<div class="editor-container">
		{#if dockerfile && lines.length > 0}
			<div class="editor">
				{#if showLineNumbers}
					<div class="line-numbers" class:sticky={stickyLineNumbers}>
						{#each lines as _, i}
							<div class="line-number">{i + 1}</div>
						{/each}
					</div>
				{/if}

				<div class="content">
					<div class="code-container">
						{#each lines as line, i}
							<div class="line" class:highlighted={highlightLines.includes(i + 1)}>
								{@html highlightLine(line)}
							</div>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<div class="empty">
				<p>No Dockerfile content available.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.dockerfile-viewer {
		position: relative;
		font-family: 'Inter', 'Fira Code', 'Menlo', monospace;
		/* Remove border, border-radius, shadow, background */
		display: flex;
		flex-direction: column;
		color: var(--editor-text, hsl(var(--foreground)));
		/* Remove max-height - use 100% height instead */
	}

	.editor-container {
		width: 100%;
		height: 100%;
		overflow-x: auto; /* Enable horizontal scrolling */
	}

	.editor {
		display: flex;
		min-height: 100%;
		min-width: fit-content; /* Important for horizontal scrolling */
	}

	.line-numbers {
		flex: 0 0 auto;
		background-color: var(--line-numbers-bg, hsl(var(--muted) / 0.5));
		user-select: none;
		border-right: 1px solid var(--line-numbers-border, hsl(var(--border) / 0.5));
		display: flex;
		flex-direction: column;
		padding: 0;
		z-index: 2;
		/* Remove position: sticky from here */
	}

	/* Add a new class for sticky behavior */
	.line-numbers.sticky {
		position: sticky;
		left: 0; /* Keep line numbers visible when scrolling horizontally */
	}

	.line-number {
		padding: 0 10px;
		color: var(--line-number-color, hsl(var(--muted-foreground)));
		font-size: 0.85em;
		height: var(--line-height, 1.6rem); /* Slightly increased for readability */
		line-height: var(--line-height, 1.6rem);
		display: flex;
		align-items: center;
		justify-content: flex-end;
		opacity: 0.8; /* Slightly more subtle */
	}

	.content {
		flex: 1;
		padding: 0;
		overflow-x: visible; /* Allow content to expand horizontally */
		width: calc(100% - 50px); /* Adjust based on line numbers width */
	}

	.code-container {
		display: flex;
		flex-direction: column;
		min-width: fit-content; /* Ensure it expands to fit content */
	}

	.line {
		padding: 0 14px; /* Slightly more padding */
		white-space: pre;
		height: var(--line-height, 1.6rem);
		line-height: var(--line-height, 1.6rem);
		display: flex;
		align-items: center;
	}

	.highlighted {
		background-color: var(--highlight-line-bg, hsl(var(--primary) / 0.05));
		border-left: 2px solid var(--highlight-line-border, hsl(var(--primary) / 0.7));
	}

	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100px;
		color: var(--empty-color, hsl(var(--muted-foreground)));
		font-style: italic;
	}

	.copy-button {
		position: absolute;
		top: 8px;
		right: 8px;
		display: flex;
		align-items: center;
		gap: 4px;
		background-color: var(--button-bg, hsl(var(--secondary) / 0.5));
		color: var(--button-color, hsl(var(--secondary-foreground)));
		border: 1px solid var(--button-border, hsl(var(--border) / 0.5));
		border-radius: 4px;
		padding: 4px 8px;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s ease;
		z-index: 10;
		opacity: 0.9;
		backdrop-filter: blur(4px);
	}

	.copy-button:hover {
		background-color: var(--button-hover-bg, hsl(var(--secondary) / 0.7));
		opacity: 1;
	}

	/* Syntax Highlighting - More subtle, modern colors */
	:global(.dockerfile-viewer .instruction) {
		color: var(--instruction-color, hsl(var(--primary) / 0.9));
		font-weight: 600;
	}

	:global(.dockerfile-viewer .args) {
		color: var(--args-color, hsl(var(--foreground) / 0.8));
	}

	:global(.dockerfile-viewer .comment) {
		color: var(--comment-color, hsl(var(--muted-foreground) / 0.9));
		font-style: italic;
	}
</style>
