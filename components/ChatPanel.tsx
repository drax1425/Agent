'use client';

import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import type { Agent, Message } from '@/types';

interface Props {
  agent: Agent | null;
  messages: Message[];
  streamingContent: string;
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onClearHistory: () => void;
}

export default function ChatPanel({
  agent,
  messages,
  streamingContent,
  isLoading,
  onSendMessage,
  onClearHistory,
}: Props) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
    }
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading || !agent) return;
    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  // Welcome screen
  if (!agent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Drax Agent Hub</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Select one of your AI assistants from the sidebar to start a conversation. Each agent
            has deep context about your products and goals.
          </p>
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { emoji: '📢', name: 'Marketing', desc: 'Growth & content strategy' },
              { emoji: '💻', name: 'Dev', desc: 'Code & architecture help' },
              { emoji: '🎯', name: 'Coach', desc: 'Focus & accountability' },
              { emoji: '💡', name: 'Ideas', desc: 'Product opportunities' },
            ].map((a) => (
              <div key={a.name} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-2xl mb-1">{a.emoji}</div>
                <div className="font-semibold text-sm text-gray-800">{a.name}</div>
                <div className="text-xs text-gray-500">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: agent.color + '15' }}
          >
            {agent.emoji}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{agent.name}</h2>
            <p className="text-xs text-gray-400">{agent.role}</p>
          </div>
          {isLoading && (
            <div className="flex gap-1 ml-2">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ backgroundColor: agent.color, animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onClearHistory}
          className="text-xs text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
        >
          Clear history
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && !streamingContent && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="text-4xl mb-3">{agent.emoji}</div>
            <p className="text-gray-500 font-medium">{agent.name} is ready</p>
            <p className="text-sm text-gray-400 mt-1">
              Ask me anything about {agent.role.toLowerCase()}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} agent={agent} />
        ))}

        {streamingContent && (
          <MessageBubble
            message={{
              id: 'streaming',
              agent_id: agent.id,
              role: 'assistant',
              content: streamingContent,
              created_at: new Date().toISOString(),
            }}
            agent={agent}
            isStreaming
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agent.name}… (Enter to send, Shift+Enter for newline)`}
            rows={1}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 resize-none text-sm leading-relaxed disabled:opacity-50 disabled:bg-gray-50 transition-shadow"
            style={{ maxHeight: '180px' }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
            style={{ backgroundColor: agent.color }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
