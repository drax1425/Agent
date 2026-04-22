'use client';

import type { Agent } from '@/types';

interface Props {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  messageCounts: Record<string, number>;
}

export default function Sidebar({
  agents,
  selectedAgent,
  onSelectAgent,
  messageCounts,
}: Props) {
  return (
    <aside className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🤖</span>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
            Drax Agent Hub
          </h1>
        </div>
        <p className="text-xs text-gray-400 ml-7">Your personal AI assistants</p>
      </div>

      {/* Agent list */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
          Agents
        </p>
        {agents.map((agent) => {
          const isActive = selectedAgent?.id === agent.id;
          const count = messageCounts[agent.id] ?? 0;

          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-150 group ${
                isActive
                  ? `${agent.bgClass} border-2 ${agent.borderClass}`
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: isActive ? agent.color + '20' : '#F3F4F6' }}
                >
                  {agent.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-semibold text-sm ${
                        isActive ? 'text-gray-900' : 'text-gray-700'
                      }`}
                    >
                      {agent.name}
                    </span>
                    {count > 0 && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                        style={{ backgroundColor: agent.color }}
                      >
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{agent.role}</p>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-300 text-center">Powered by Claude Opus 4.7</p>
      </div>
    </aside>
  );
}
