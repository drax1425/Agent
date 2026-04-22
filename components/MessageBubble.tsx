import type { Agent, Message } from '@/types';

interface Props {
  message: Message;
  agent: Agent;
  isStreaming?: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, agent, isStreaming }: Props) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end gap-2 group">
        <div className="flex flex-col items-end gap-1 max-w-[70%]">
          <div className="px-4 py-3 bg-blue-600 text-white rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity px-1">
            {formatTime(message.created_at)}
          </span>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shadow-sm mt-auto">
          A
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 group">
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base shadow-sm mt-auto"
        style={{ backgroundColor: agent.color + '15', border: `1.5px solid ${agent.color}30` }}
      >
        {agent.emoji}
      </div>
      <div className="flex flex-col items-start gap-1 max-w-[75%]">
        <div className="px-4 py-3 bg-white rounded-2xl rounded-tl-sm text-sm leading-relaxed text-gray-800 shadow-sm border border-gray-100">
          <p className="whitespace-pre-wrap">
            {message.content}
            {isStreaming && (
              <span className="inline-block w-0.5 h-[1em] ml-0.5 bg-gray-400 animate-pulse align-middle" />
            )}
          </p>
        </div>
        {!isStreaming && (
          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity px-1">
            {agent.name} · {formatTime(message.created_at)}
          </span>
        )}
      </div>
    </div>
  );
}
