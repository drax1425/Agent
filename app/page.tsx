'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatPanel from '@/components/ChatPanel';
import { AGENTS_LIST } from '@/lib/agents';
import { createBrowserClient } from '@/lib/supabase';
import type { Agent, AgentId, Message } from '@/types';

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCounts, setMessageCounts] = useState<Record<string, number>>({});

  // Load message counts for sidebar badges
  useEffect(() => {
    async function loadCounts() {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from('agent_conversations')
        .select('agent_id');

      if (data) {
        const counts: Record<string, number> = {};
        for (const row of data) {
          counts[row.agent_id] = (counts[row.agent_id] ?? 0) + 1;
        }
        setMessageCounts(counts);
      }
    }
    loadCounts();
  }, []);

  const loadHistory = useCallback(async (agentId: AgentId) => {
    const supabase = createBrowserClient();
    const { data } = await supabase
      .from('agent_conversations')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: true })
      .limit(100);

    setMessages((data as Message[]) ?? []);
  }, []);

  async function handleSelectAgent(agent: Agent) {
    setSelectedAgent(agent);
    setStreamingContent('');
    await loadHistory(agent.id);
  }

  async function handleSendMessage(content: string) {
    if (!selectedAgent || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      agent_id: selectedAgent.id,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingContent('');

    // Build history to send (last 30 messages for context, excluding the new one)
    const historyForApi = messages
      .slice(-30)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          messages: historyForApi,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamingContent(accumulated);
      }

      // Commit final message to local state
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        agent_id: selectedAgent.id,
        role: 'assistant',
        content: accumulated,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update badge count
      setMessageCounts((prev) => ({
        ...prev,
        [selectedAgent.id]: (prev[selectedAgent.id] ?? 0) + 2,
      }));
    } catch (err) {
      console.error('[handleSendMessage]', err);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        agent_id: selectedAgent.id,
        role: 'assistant',
        content: '⚠️ Something went wrong. Please try again.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  }

  async function handleClearHistory() {
    if (!selectedAgent) return;
    setMessages([]);
    setMessageCounts((prev) => ({ ...prev, [selectedAgent.id]: 0 }));

    const supabase = createBrowserClient();
    await supabase
      .from('agent_conversations')
      .delete()
      .eq('agent_id', selectedAgent.id);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        agents={AGENTS_LIST}
        selectedAgent={selectedAgent}
        onSelectAgent={handleSelectAgent}
        messageCounts={messageCounts}
      />
      <ChatPanel
        agent={selectedAgent}
        messages={messages}
        streamingContent={streamingContent}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
