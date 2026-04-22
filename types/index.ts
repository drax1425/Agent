export type AgentId = 'marketing' | 'dev' | 'coach' | 'ideas';

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  emoji: string;
  color: string;
  colorLight: string;
  borderClass: string;
  bgClass: string;
  systemPrompt: string;
}

export interface Message {
  id: string;
  agent_id: AgentId;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatRequest {
  agentId: AgentId;
  messages: { role: 'user' | 'assistant'; content: string }[];
  content: string;
}
