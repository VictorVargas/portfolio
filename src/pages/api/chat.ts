import type { APIRoute } from 'astro';
import { env } from '../../env';

export const prerender = false;

type ChatMessage = {
	role: 'user' | 'assistant' | 'system';
	content: string;
};

const SSE_PASSTHROUGH_HEADERS = {
	'Content-Type': 'text/event-stream',
	'Cache-Control': 'no-cache, no-transform',
	Connection: 'keep-alive',
	'X-Accel-Buffering': 'no',
} as const;

export const POST: APIRoute = async ({ request }) => {
	let body: { messages?: ChatMessage[]; conversation_id?: string; stream?: boolean };
	try {
		body = await request.json();
	} catch {
		return new Response('invalid json', { status: 400 });
	}

	const messages = body.messages;
	if (!Array.isArray(messages) || messages.length === 0) {
		return new Response('messages required', { status: 400 });
	}
	for (const m of messages) {
		if (
			!m ||
			typeof m !== 'object' ||
			typeof m.content !== 'string' ||
			!['user', 'assistant', 'system'].includes(m.role as string)
		) {
			return new Response('invalid message shape', { status: 400 });
		}
	}

	let upstream: Response;
	try {
		upstream = await fetch(`${env.CHAT_BOT_URL}/api/chat`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				messages,
				stream: body.stream ?? true,
				...(body.conversation_id ? { conversation_id: body.conversation_id } : {}),
			}),
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'upstream unreachable';
		return new Response(
			`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`,
			{ status: 502, headers: { 'Content-Type': 'text/event-stream' } }
		);
	}

	if (!upstream.ok || !upstream.body) {
		const status = upstream.status || 502;
		const text = await upstream.text().catch(() => 'upstream error');
		return new Response(text, { status });
	}

	const transform = new TransformStream<Uint8Array, Uint8Array>();
	const writer = transform.writable.getWriter();
	const reader = upstream.body.getReader();

	(async () => {
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				await writer.write(value);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'stream error';
			await writer.write(new TextEncoder().encode(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`));
		} finally {
			await writer.close();
			reader.releaseLock();
		}
	})();

	return new Response(transform.readable, { headers: SSE_PASSTHROUGH_HEADERS });
};
