import { useState, useRef, useEffect, type KeyboardEvent, type ReactNode } from 'react';

type Role = 'user' | 'assistant';

interface ChatMessage {
	id: string;
	role: Role;
	content: string;
}

type InlineToken =
	| { kind: 'text'; value: string }
	| { kind: 'bold'; value: string }
	| { kind: 'italic'; value: string }
	| { kind: 'code'; value: string }
	| { kind: 'link'; value: string; href: string };

function tokenizeInline(text: string): InlineToken[] {
	const tokens: InlineToken[] = [];
	let i = 0;
	while (i < text.length) {
		const rest = text.slice(i);
		let m: RegExpMatchArray | null;
		if ((m = rest.match(/^\*\*([^*]+)\*\*/))) {
			tokens.push({ kind: 'bold', value: m[1] });
			i += m[0].length;
			continue;
		}
		if ((m = rest.match(/^\*([^*\n]+)\*/))) {
			tokens.push({ kind: 'italic', value: m[1] });
			i += m[0].length;
			continue;
		}
		if ((m = rest.match(/^`([^`\n]+)`/))) {
			tokens.push({ kind: 'code', value: m[1] });
			i += m[0].length;
			continue;
		}
		if ((m = rest.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/))) {
			tokens.push({ kind: 'link', value: m[1], href: m[2] });
			i += m[0].length;
			continue;
		}
		const last = tokens[tokens.length - 1];
		if (last && last.kind === 'text') last.value += text[i];
		else tokens.push({ kind: 'text', value: text[i] });
		i++;
	}
	return tokens;
}

function renderInline(text: string): ReactNode[] {
	const out: ReactNode[] = [];
	const tokens = tokenizeInline(text);
	tokens.forEach((token, tokenIdx) => {
		if (token.kind === 'text') {
			const segments = token.value.split('\n');
			segments.forEach((segment, segIdx) => {
				if (segIdx > 0) out.push(<br key={`br-${tokenIdx}-${segIdx}`} />);
				if (segment) out.push(segment);
			});
			return;
		}
		switch (token.kind) {
			case 'bold':
				out.push(
					<strong
						key={`t-${tokenIdx}`}
						className="font-bold text-text-primary"
					>
						{token.value}
					</strong>
				);
				break;
			case 'italic':
				out.push(
					<em
						key={`t-${tokenIdx}`}
						className="italic text-text-secondary"
					>
						{token.value}
					</em>
				);
				break;
			case 'code':
				out.push(
					<code
						key={`t-${tokenIdx}`}
						className="rounded border border-neutral-800 bg-bg-primary px-1.5 py-0.5 font-mono text-xs text-accent"
					>
						{token.value}
					</code>
				);
				break;
			case 'link':
				out.push(
					<a
						key={`t-${tokenIdx}`}
						href={token.href}
						target="_blank"
						rel="noopener noreferrer"
						className="font-medium text-accent underline-offset-2 hover:underline"
					>
						{token.value}
					</a>
				);
				break;
		}
	});
	return out;
}

function renderMessage(text: string): ReactNode {
	const lines = text.split('\n');
	const blocks: ReactNode[] = [];
	let listBuffer: ReactNode[] = [];
	let listType: 'ul' | 'ol' | null = null;

	const flushList = () => {
		if (listBuffer.length === 0) return;
		if (listType === 'ol') {
			blocks.push(
				<ol
					key={`ol-${blocks.length}`}
					className="my-1 list-decimal space-y-1.5 pl-6 marker:font-mono marker:text-accent marker:text-sm"
				>
					{listBuffer}
				</ol>
			);
		} else {
			blocks.push(
				<ul
					key={`ul-${blocks.length}`}
					className="my-1 list-disc space-y-1.5 pl-6 marker:text-accent"
				>
					{listBuffer}
				</ul>
			);
		}
		listBuffer = [];
		listType = null;
	};

	lines.forEach((rawLine, lineIdx) => {
		const line = rawLine.replace(/\s+$/, '');

		if (line.trim() === '') {
			flushList();
			return;
		}

		const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
		if (headingMatch) {
			flushList();
			const level = headingMatch[1].length;
			const content = renderInline(headingMatch[2]);
			const className =
				level === 1
					? 'mt-3 border-l-4 border-accent pl-3 text-lg font-bold tracking-tight text-accent'
					: level === 2
						? 'mt-3 border-b border-neutral-800 pb-1 text-base font-bold text-accent'
						: level === 3
							? 'mt-2 text-sm font-semibold uppercase tracking-wider text-accent'
							: 'mt-1 text-xs font-semibold uppercase tracking-wider text-accent/70';
			const key = `h-${lineIdx}`;
			if (level === 1) blocks.push(<h1 key={key} className={className}>{content}</h1>);
			else if (level === 2) blocks.push(<h2 key={key} className={className}>{content}</h2>);
			else if (level === 3) blocks.push(<h3 key={key} className={className}>{content}</h3>);
			else blocks.push(<h4 key={key} className={className}>{content}</h4>);
			return;
		}

		if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
			flushList();
			blocks.push(
				<hr
					key={`hr-${lineIdx}`}
					className="my-2 border-t border-neutral-700"
				/>
			);
			return;
		}

		const ulMatch = line.match(/^\s*[-*+]\s+(.+)$/);
		if (ulMatch) {
			if (listType !== 'ul') flushList();
			listType = 'ul';
			listBuffer.push(
				<li key={`li-${listBuffer.length}`}>{renderInline(ulMatch[1])}</li>
			);
			return;
		}

		const olMatch = line.match(/^\s*\d+\.\s+(.+)$/);
		if (olMatch) {
			if (listType !== 'ol') flushList();
			listType = 'ol';
			listBuffer.push(
				<li key={`li-${listBuffer.length}`}>{renderInline(olMatch[1])}</li>
			);
			return;
		}

		flushList();
		blocks.push(
			<p key={`p-${lineIdx}`} className="leading-relaxed text-text-secondary">
				{renderInline(line)}
			</p>
		);
	});

	flushList();
	return blocks;
}

interface Props {
	onSources?: (documents: string[]) => void;
	onUserMessage?: () => void;
	placeholder?: string;
	collapsed?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
	{
		id: 'intro',
		role: 'assistant',
		content:
			"Hi! I'm Rony. Ask me about Victor's projects — what he's built, the tech stack, or design decisions.",
	},
];

type StreamEvent =
	| { type: 'start'; conversation_id: string }
	| { type: 'chunk'; content: string }
	| { type: 'sources'; documents: string[] }
	| { type: 'compaction' }
	| { type: 'done'; usage?: { input_tokens: number; output_tokens: number } }
	| { type: 'error'; error: string }
	| { type: 'unknown' };

function parseFrame(frame: string): { event: string | null; data: string } | null {
	const trimmed = frame.replace(/\r\n/g, '\n').trim();
	if (!trimmed) return null;
	let event: string | null = null;
	let data = '';
	for (const line of trimmed.split('\n')) {
		if (line.startsWith('event:')) {
			event = line.slice(6).trim();
		} else if (line.startsWith('data:')) {
			data += (data ? '\n' : '') + line.slice(5).trim();
		}
	}
	return { event, data };
}

function decodeEvent(payload: unknown): StreamEvent {
	if (!payload || typeof payload !== 'object') return { type: 'unknown' };
	const p = payload as Record<string, unknown>;
	switch (p.type) {
		case 'start':
		case 'chunk':
		case 'sources':
		case 'compaction':
		case 'done':
		case 'error':
			return p as StreamEvent;
		default:
			return { type: 'unknown' };
	}
}

export default function Chat({ onSources, onUserMessage, placeholder, collapsed = false }: Props) {
	const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
	const [input, setInput] = useState('');
	const [isStreaming, setIsStreaming] = useState(false);
	const [streamStatus, setStreamStatus] = useState<'thinking' | 'compacting' | null>(null);
	const [error, setError] = useState<string | null>(null);
	const conversationIdRef = useRef<string | undefined>(undefined);
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
	}, [messages]);

	const send = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		const trimmed = input.trim();
		if (!trimmed || isStreaming) return;

		const userMsg: ChatMessage = {
			id: `user-${Date.now()}`,
			role: 'user',
			content: trimmed,
		};
		const assistantId = `assistant-${Date.now()}`;
		const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '' };

		setMessages((prev) => [
			...prev.filter((message) => message.content.trim().length > 0),
			userMsg,
			assistantMsg,
		]);
		setInput('');
		setError(null);
		setIsStreaming(true);
		setStreamStatus('thinking');
		onUserMessage?.();

		abortRef.current = new AbortController();

		try {
			const resp = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: [...messages, userMsg]
						.filter((message) => message.content.trim().length > 0)
						.map((message) => ({
							role: message.role,
							content: message.content,
						})),
					stream: true,
					...(conversationIdRef.current
						? { conversation_id: conversationIdRef.current }
						: {}),
				}),
				signal: abortRef.current.signal,
			});

			if (!resp.ok || !resp.body) {
				const text = await resp.text().catch(() => `${resp.status} ${resp.statusText}`);
				throw new Error(text || `HTTP ${resp.status}`);
			}

			const reader = resp.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });

				let sep = buffer.indexOf('\n\n');
				while (sep !== -1) {
					const frame = buffer.slice(0, sep);
					buffer = buffer.slice(sep + 2);
					const parsed = parseFrame(frame);
					if (parsed?.data) {
						try {
							const payload = JSON.parse(parsed.data);
							const evt = decodeEvent(payload);
							switch (evt.type) {
								case 'start':
									conversationIdRef.current = evt.conversation_id;
									break;
								case 'chunk':
									setStreamStatus('thinking');
									setMessages((prev) =>
										prev.map((m) =>
											m.id === assistantId
												? { ...m, content: m.content + evt.content }
												: m
										)
									);
									break;
								case 'compaction':
									setStreamStatus('compacting');
									break;
								case 'sources':
									onSources?.(evt.documents);
									break;
								case 'error':
									setStreamStatus(null);
									setError(evt.error);
									break;
							}
						} catch {
							// ignore malformed frames
						}
					}
					sep = buffer.indexOf('\n\n');
				}
			}
		} catch (err) {
			if ((err as Error).name !== 'AbortError') {
				setError((err as Error).message);
			}
		} finally {
			setMessages((prev) =>
				prev.filter((message) => message.id !== assistantId || message.content.trim().length > 0)
			);
			setIsStreaming(false);
			setStreamStatus(null);
			abortRef.current = null;
		}
	};

	const stop = () => {
		abortRef.current?.abort();
	};

	const recallLastPrompt = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== 'ArrowUp' || input.length > 0) return;
		for (let index = messages.length - 1; index >= 0; index--) {
			if (messages[index].role === 'user') {
				event.preventDefault();
				setInput(messages[index].content);
				return;
			}
		}
	};

	return (
		<section className="flex flex-col rounded-lg border border-neutral-800 bg-bg-secondary">
			<header
				className={
					collapsed
						? 'flex items-center justify-between px-5 py-3 sm:px-6 sm:py-4'
						: 'flex items-center justify-between border-b border-neutral-800 px-5 py-3'
				}
			>
				<div className="flex items-center gap-2">
					<span className="inline-block h-2 w-2 rounded-full bg-success" aria-hidden />
					<p className="font-mono text-sm text-text-primary">
						Rony <span className="text-text-secondary">— Victor's assistant</span>
					</p>
				</div>
			</header>

			{!collapsed && (
				<div
					ref={scrollRef}
					className="h-[420px] space-y-3 overflow-y-auto px-6 py-5 sm:h-[480px] sm:px-8 sm:py-6"
					role="log"
					aria-live="polite"
				>
					{messages.map((m) => (
						<div
							key={m.id}
							className={
								m.role === 'user'
									? 'flex justify-end'
									: 'flex justify-start'
							}
						>
							<div
								className={
									m.role === 'user'
										? 'max-w-[85%] rounded-lg bg-accent/15 px-4 py-2 text-sm text-text-primary'
										: 'max-w-[85%] space-y-2 rounded-lg bg-bg-tertiary px-4 py-2 text-sm leading-relaxed text-text-primary'
								}
							>
								{m.content ? renderMessage(m.content) : (
									<span className="inline-flex items-center gap-2 text-text-secondary" role="status">
										<span className="inline-flex gap-1" aria-hidden>
											<span className="animate-pulse">●</span>
											<span className="animate-pulse [animation-delay:120ms]">●</span>
											<span className="animate-pulse [animation-delay:240ms]">●</span>
										</span>
										<span>{streamStatus === 'compacting' ? 'Optimizing context…' : 'Thinking…'}</span>
									</span>
								)}
							</div>
						</div>
					))}
					{error && (
						<p className="rounded bg-error/15 px-3 py-2 font-mono text-xs text-error">
							{error}
						</p>
					)}
				</div>
			)}

			<form
				onSubmit={send}
				className={
					collapsed
						? 'flex items-center gap-3 px-5 py-4 sm:gap-4 sm:px-6 sm:py-5'
						: 'flex items-center gap-2 border-t border-neutral-800 px-5 py-3'
				}
			>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={recallLastPrompt}
					placeholder={
						placeholder ??
						(collapsed
							? 'Ask Rony about any project…'
							: 'Ask about a project…')
					}
					disabled={isStreaming}
					className={
						collapsed
							? 'flex-1 rounded bg-bg-tertiary px-4 py-3 text-base text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60 sm:px-5 sm:py-4 sm:text-lg'
							: 'flex-1 rounded bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60'
					}
				/>
				{isStreaming ? (
					<button
						type="button"
						onClick={stop}
						className="rounded border border-error px-3 py-2 font-mono text-xs text-error transition hover:bg-error/10"
					>
						Stop
					</button>
				) : (
					<button
						type="submit"
						disabled={!input.trim()}
						className="rounded border border-accent px-3 py-2 font-mono text-xs text-accent transition hover:bg-accent/10 disabled:opacity-40"
					>
						Send
					</button>
				)}
			</form>
		</section>
	);
}
