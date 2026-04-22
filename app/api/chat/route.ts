import Anthropic from '@anthropic-ai/sdk';
import { createServerClient } from '@/lib/supabase';
import { AGENTS } from '@/lib/agents';
import type { NextRequest } from 'next/server';
import type { ChatRequest } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  let body: ChatRequest;

  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { agentId, messages, content } = body;

  const agent = AGENTS[agentId];
  if (!agent) {
    return new Response('Invalid agentId', { status: 400 });
  }

  if (!content?.trim()) {
    return new Response('Empty message', { status: 400 });
  }

  const supabase = createServerClient();

  // Persist user message before streaming
  await supabase.from('agent_conversations').insert({
    agent_id: agentId,
    role: 'user',
    content: content.trim(),
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';

      try {
        const anthropicMessages = [
          ...messages,
          { role: 'user' as const, content: content.trim() },
        ];

        const anthropicStream = anthropic.messages.stream({
          model: 'claude-opus-4-7',
          max_tokens: 8096,
          thinking: { type: 'adaptive' },
          output_config: { effort: 'high' },
          system: [
            {
              type: 'text',
              text: agent.systemPrompt,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: anthropicMessages,
        });

        for await (const event of anthropicStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            fullText += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        // Persist completed assistant response
        if (fullText) {
          await supabase.from('agent_conversations').insert({
            agent_id: agentId,
            role: 'assistant',
            content: fullText,
          });
        }

        controller.close();
      } catch (err) {
        console.error('[chat/route] stream error:', err);
        const errMsg = err instanceof Error ? err.message : 'Stream error';
        controller.enqueue(encoder.encode(`\n\n⚠️ Error: ${errMsg}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
