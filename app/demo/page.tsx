'use client';

import { useState, useEffect, useRef } from 'react';

const AGENTS = [
  {
    id: 'marketing',
    name: 'Drax Marketing',
    role: 'Expert CMO',
    emoji: '📢',
    color: '#7C3AED',
    borderClass: 'border-purple-400',
    bgClass: 'bg-purple-50',
    conversation: [
      {
        role: 'user',
        content: '¿Cómo puedo conseguir los primeros 50 restaurantes en GoCartaYa?',
      },
      {
        role: 'assistant',
        content:
          'Para los primeros 50 restaurantes, te recomiendo esta secuencia:\n\n**Semana 1-2: Barrio piloto**\nElige 1 barrio (Ñuñoa, Providencia o Bellavista). Ve puerta a puerta con tablet en mano, muestra el QR en vivo. Ofrece 3 meses gratis a cambio de testimonio en video.\n\n**Semana 3-4: Efecto red**\nCada restaurant que entras, pídele que te recomiende al del lado. Los dueños de restorán se conocen entre sí — usa eso.\n\n**Canal digital paralelo:**\n- Facebook Groups: "Restoranes de Santiago" — publica casos de éxito semanales\n- Instagram Reels: "Cómo funciona un menú QR" — 30 segundos, sin palabras\n\n**Meta realista:** 50 en 6 semanas con 2 horas/día de outreach.',
      },
      {
        role: 'user',
        content: '¿Qué precio le pongo al plan Pro?',
      },
      {
        role: 'assistant',
        content:
          'Para Chile, el pricing óptimo del plan Pro está entre **$9.990 y $14.990 CLP/mes**.\n\nMi recomendación: **$12.990/mes** (≈$13 USD).\n\n**Por qué funciona:**\n- Menos de lo que gastan en una impresión de menú cada 3 meses\n- Por debajo del umbral psicológico de $15.000\n- Anual a $119.900 = 2 meses gratis → impulsa conversión a largo plazo\n\nOfrece factura electrónica — muchos restoranes lo necesitan para descontar IVA.',
      },
    ],
  },
  {
    id: 'dev',
    name: 'Drax Dev',
    role: 'Senior Full Stack Developer',
    emoji: '💻',
    color: '#2563EB',
    borderClass: 'border-blue-400',
    bgClass: 'bg-blue-50',
    conversation: [
      {
        role: 'user',
        content: '¿Cómo implemento streaming con Anthropic en Next.js 14?',
      },
      {
        role: 'assistant',
        content:
          'Aquí el patrón completo para Next.js 14 App Router:\n\n```typescript\n// app/api/chat/route.ts\nexport async function POST(req: Request) {\n  const { messages } = await req.json();\n\n  const stream = new ReadableStream({\n    async start(controller) {\n      const anthropicStream = anthropic.messages.stream({\n        model: "claude-opus-4-7",\n        max_tokens: 8096,\n        thinking: { type: "adaptive" },\n        messages,\n      });\n\n      for await (const event of anthropicStream) {\n        if (\n          event.type === "content_block_delta" &&\n          event.delta.type === "text_delta"\n        ) {\n          controller.enqueue(\n            new TextEncoder().encode(event.delta.text)\n          );\n        }\n      }\n      controller.close();\n    },\n  });\n\n  return new Response(stream, {\n    headers: { "Content-Type": "text/plain; charset=utf-8" },\n  });\n}\n```\n\nEn el cliente:\n```typescript\nconst reader = res.body!.getReader();\nconst decoder = new TextDecoder();\nlet text = "";\nwhile (true) {\n  const { done, value } = await reader.read();\n  if (done) break;\n  text += decoder.decode(value, { stream: true });\n  setStreamingContent(text);\n}\n```',
      },
    ],
  },
  {
    id: 'coach',
    name: 'Drax Coach',
    role: 'Productivity & Life Coach',
    emoji: '🎯',
    color: '#059669',
    borderClass: 'border-emerald-400',
    bgClass: 'bg-emerald-50',
    conversation: [
      {
        role: 'user',
        content: 'Tengo solo 2 horas hoy, trabajo en el café de 8am a 4pm. ¿Qué hago?',
      },
      {
        role: 'assistant',
        content:
          'Con 2 horas post-trabajo (4pm-6pm) y energía limitada, una sola tarea:\n\n**Hoy: landing page de GoCartaYa con copy de conversión real.**\n\nPor qué esto:\n- No requiere código complejo\n- Tiene impacto directo en ventas\n- Puedes hacerlo con energía media\n\n**4:00 - 4:15** → Revisar 3 competidores latinoamericanos, anotar qué dicen\n**4:15 - 5:30** → Escribir y ajustar el copy de hero + features + pricing\n**5:30 - 6:00** → Deploy y comparte en 1 grupo de restoranes\n\nNo abras Twitter. No "planifiques". Ejecuta esto.\n\n¿Tienes la landing ya montada o partes de cero?',
      },
      {
        role: 'user',
        content: 'Ya la tengo, solo necesito mejorar el copy',
      },
      {
        role: 'assistant',
        content:
          'Perfecto. Entonces tienes 2 horas reales de trabajo.\n\n**Bloque único (sin breaks):**\nAbre la landing, abre un doc en blanco, reescribe de corrido:\n\n1. **Headline** — debe decir QUÉ ES + PARA QUIÉN en 8 palabras máximo\n2. **Subheadline** — el problema que resuelve en 1 línea\n3. **3 features** — beneficio, no función ("Pedidos por WhatsApp sin app" > "Integración WhatsApp")\n4. **CTA** — activo y específico ("Crea tu menú QR gratis" > "Empezar")\n\nDeploya sin perfeccionarlo. Lo que está publicado hoy vale más que lo perfecto mañana.',
      },
    ],
  },
  {
    id: 'ideas',
    name: 'Drax Ideas',
    role: 'Product Strategist',
    emoji: '💡',
    color: '#D97706',
    borderClass: 'border-amber-400',
    bgClass: 'bg-amber-50',
    conversation: [
      {
        role: 'user',
        content: '¿Qué SaaS podría construir para el mercado chileno en 2 semanas?',
      },
      {
        role: 'assistant',
        content:
          '3 ideas validables en 2 semanas con tu stack (Next.js + Supabase + FastAPI):\n\n**1. Turno Fácil** ⭐ (máximo potencial)\nAgendamiento para peluquerías y centros de estética. El mercado es enorme, el pain es real (WhatsApp manual), y la competencia es Reservo (caro) o nada.\n- MVP: landing + calendario + recordatorio WhatsApp vía API\n- Precio: $4.990/mes\n- Validación: 10 peluquerías en Ñuñoa\n\n**2. BolePyme**\nGenerador de boletas electrónicas para independientes. Mucho más simple que el SII, conectado a su API.\n- Pain: el portal del SII es horrible\n- Modelo: $2.990/mes o pago por boleta\n\n**3. StockChico**\nControl de inventario para minimarkets y almacenes. Excel en la nube con alertas WhatsApp.\n- 70k almacenes en Chile sin software\n- Precio: $5.990/mes\n\n¿Cuál te genera más curiosidad? Te digo exactamente cómo validarlo esta semana.',
      },
    ],
  },
];

const TYPING_SPEED = 18;

type AgentType = (typeof AGENTS)[0];
type MessageType = { role: string; content: string };

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({
  message,
  agent,
  isStreaming,
}: {
  message: MessageType & { time: Date };
  agent: AgentType;
  isStreaming?: boolean;
}) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end gap-2 group">
        <div className="flex flex-col items-end gap-1 max-w-[70%]">
          <div className="px-4 py-3 bg-blue-600 text-white rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity px-1">
            {formatTime(message.time)}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shadow-sm mt-auto flex-shrink-0">
          A
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 group">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-base shadow-sm mt-auto flex-shrink-0"
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
            {agent.name} · {formatTime(message.time)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentType>(AGENTS[0]);
  const [visibleMessages, setVisibleMessages] = useState<(MessageType & { time: Date })[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [messageCounts] = useState<Record<string, number>>({
    marketing: 6,
    dev: 2,
    coach: 4,
    ideas: 2,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimers() {
    if (streamRef.current) clearTimeout(streamRef.current);
    if (autoRef.current) clearTimeout(autoRef.current);
  }

  function selectAgent(agent: AgentType) {
    clearTimers();
    setSelectedAgent(agent);
    setVisibleMessages([]);
    setStreamingContent('');
    setIsStreaming(false);
    setMsgIndex(0);
  }

  // Auto-play the conversation turn by turn
  useEffect(() => {
    const conv = selectedAgent.conversation;
    if (msgIndex >= conv.length) return;

    const msg = conv[msgIndex];

    if (msg.role === 'user') {
      autoRef.current = setTimeout(() => {
        setVisibleMessages((prev) => [...prev, { ...msg, time: new Date() }]);
        setMsgIndex((i) => i + 1);
      }, msgIndex === 0 ? 600 : 1200);
    } else {
      // stream the assistant response
      autoRef.current = setTimeout(() => {
        const fullText = msg.content;
        let charIdx = 0;
        setIsStreaming(true);
        setStreamingContent('');

        function typeNext() {
          charIdx += Math.ceil(Math.random() * 3) + 1;
          const chunk = fullText.slice(0, charIdx);
          setStreamingContent(chunk);

          if (charIdx < fullText.length) {
            streamRef.current = setTimeout(typeNext, TYPING_SPEED);
          } else {
            setIsStreaming(false);
            setStreamingContent('');
            setVisibleMessages((prev) => [...prev, { ...msg, time: new Date() }]);
            setMsgIndex((i) => i + 1);
          }
        }

        typeNext();
      }, 700);
    }

    return () => clearTimers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msgIndex, selectedAgent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages, streamingContent]);

  const allDone = msgIndex >= selectedAgent.conversation.length && !isStreaming;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Demo badge */}
      <div className="fixed top-3 right-3 z-50 bg-black text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg opacity-80">
        DEMO — vista previa
      </div>

      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🤖</span>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Drax Agent Hub</h1>
          </div>
          <p className="text-xs text-gray-400 ml-7">Your personal AI assistants</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
            Agents
          </p>
          {AGENTS.map((agent) => {
            const isActive = selectedAgent.id === agent.id;
            const count = messageCounts[agent.id] ?? 0;

            return (
              <button
                key={agent.id}
                onClick={() => selectAgent(agent)}
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
                          {count}
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

        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-300 text-center">Powered by Claude Opus 4.7</p>
        </div>
      </aside>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col bg-gray-50 min-h-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: selectedAgent.color + '15' }}
            >
              {selectedAgent.emoji}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{selectedAgent.name}</h2>
              <p className="text-xs text-gray-400">{selectedAgent.role}</p>
            </div>
            {isStreaming && (
              <div className="flex gap-1 ml-2">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ backgroundColor: selectedAgent.color, animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => selectAgent(selectedAgent)}
            className="text-xs text-gray-400 hover:text-blue-500 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Repetir demo
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {visibleMessages.length === 0 && !streamingContent && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-4xl mb-3">{selectedAgent.emoji}</div>
              <p className="text-gray-500 font-medium">{selectedAgent.name} is ready</p>
              <p className="text-sm text-gray-400 mt-1">
                La conversación comenzará automáticamente…
              </p>
            </div>
          )}

          {visibleMessages.map((msg, i) => (
            <MessageBubble key={i} message={msg} agent={selectedAgent} />
          ))}

          {streamingContent && (
            <MessageBubble
              message={{ role: 'assistant', content: streamingContent, time: new Date() }}
              agent={selectedAgent}
              isStreaming
            />
          )}

          {allDone && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => selectAgent(selectedAgent)}
                className="text-xs px-4 py-2 rounded-full border text-gray-500 hover:bg-gray-100 transition-colors"
              >
                ↺ Ver demo otra vez
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Fake input */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex gap-3 items-end">
            <div className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400 select-none">
              Message {selectedAgent.name}… (demo — no interactivo)
            </div>
            <button
              disabled
              className="px-5 py-3 rounded-xl text-white text-sm font-semibold opacity-40 cursor-not-allowed flex-shrink-0 shadow-sm"
              style={{ backgroundColor: selectedAgent.color }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
