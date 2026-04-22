"""
CyberSec Professor — An AI cybersecurity assistant powered by Claude.

Acts as a knowledgeable, ethical cybersecurity professor and assistant.
Helps with: vulnerability research, pentest methodology, CTF challenges,
code security review, and security education.
"""

from __future__ import annotations

import json
import os
import sys

import anthropic
from dotenv import load_dotenv
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.prompt import Prompt
from rich.rule import Rule
from rich.theme import Theme

from tools import TOOL_DEFINITIONS, dispatch_tool

load_dotenv()

# ── Rich console setup ────────────────────────────────────────────────────────

custom_theme = Theme(
    {
        "professor": "bold cyan",
        "user": "bold green",
        "tool": "bold yellow",
        "error": "bold red",
        "info": "dim white",
    }
)
console = Console(theme=custom_theme)

# ── System prompt ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """Eres el **Profesor CyberSec**, un experto en ciberseguridad con más de 20 años de experiencia en:

- Penetration Testing y Red Team operations
- Análisis de vulnerabilidades y gestión de riesgos
- Seguridad en aplicaciones web (OWASP Top 10)
- Forensia digital e Incident Response
- CTF (Capture The Flag) competitions
- Seguridad en redes y sistemas
- Criptografía aplicada
- DevSecOps y Secure Software Development Lifecycle

## Tu personalidad y rol

Eres un **profesor y asistente** que:
- Explica conceptos complejos de forma clara, pedagógica y estructurada
- Siempre enseña el "por qué" detrás de cada vulnerabilidad o técnica
- Usa analogías y ejemplos del mundo real para facilitar la comprensión
- Es entusiasta y motivador — la ciberseguridad es fascinante
- Habla en el idioma del usuario (español si escribe en español)
- Adapta la profundidad técnica al nivel del estudiante

## Ética y responsabilidad (CRÍTICO)

- **Siempre** enfatizas la importancia de la autorización escrita antes de cualquier prueba
- Ayudas con técnicas ofensivas **únicamente** en contextos autorizados: CTF, laboratorios propios, pentests con contrato firmado
- Para sitios en producción externos, solo orientas sobre cómo obtener autorización y qué herramientas/metodologías usar con ella
- No generas exploits funcionales para sistemas en producción sin autorización verificada
- Promueves el Bug Bounty como canal ético para reportar vulnerabilidades

## Cómo respondes

- Estructuras tus respuestas con markdown: títulos, listas, bloques de código
- Cuando explicas una vulnerabilidad, siempre cubres: qué es, cómo funciona, cómo detectarla, cómo prevenirla
- Cuando das ejemplos de payloads, los contextualizas claramente como educativos
- Recomendas recursos adicionales cuando es relevante (OWASP, HackTheBox, TryHackMe, PortSwigger Web Academy)
- Usas tus herramientas disponibles para proveer información estructurada y confiable

## Herramientas disponibles

Tienes acceso a herramientas especializadas que debes usar cuando corresponda:
- `get_owasp_info`: para consultas sobre OWASP Top 10
- `get_vulnerability_info`: para información técnica de vulnerabilidades específicas
- `get_pentest_methodology`: para metodologías de pentesting
- `get_tools`: para recomendar herramientas de seguridad
- `analyze_code_snippet`: para revisar código en busca de vulnerabilidades

Cuando el usuario haga preguntas que estas herramientas pueden responder mejor, úsalas."""

# ── Agent core ────────────────────────────────────────────────────────────────

MAX_TOKENS = 8096
MODEL = "claude-sonnet-4-6"


def run_agent_turn(client: anthropic.Anthropic, messages: list[dict]) -> str:
    """
    Execute one agent turn with potential multi-step tool use.
    Returns the final text response.
    """
    while True:
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPT,
            tools=TOOL_DEFINITIONS,
            messages=messages,
        )

        # Collect all text from this response for display
        response_text_parts = []

        # Check for tool use
        tool_calls = [block for block in response.content if block.type == "tool_use"]

        if not tool_calls:
            # Final text response
            for block in response.content:
                if hasattr(block, "text"):
                    response_text_parts.append(block.text)
            return "".join(response_text_parts)

        # Process tool calls
        tool_results = []
        for tool_call in tool_calls:
            console.print(
                f"\n[tool]  Consultando herramienta: {tool_call.name}[/tool]",
                highlight=False,
            )
            result = dispatch_tool(tool_call.name, tool_call.input)
            tool_results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": tool_call.id,
                    "content": result,
                }
            )

        # Append assistant message and tool results to conversation
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})


# ── CLI loop ──────────────────────────────────────────────────────────────────

WELCOME_BANNER = """
# Profesor CyberSec — Asistente de Ciberseguridad

Hola! Soy tu **Profesor CyberSec**, tu asistente especializado en ciberseguridad.

Puedo ayudarte con:
- **Vulnerabilidades**: XSS, SQLi, SSRF, IDOR, LFI, XXE, CSRF...
- **OWASP Top 10**: explicaciones detalladas y ejemplos
- **Metodología de Pentesting**: fases, herramientas, reportes
- **Revisión de código**: análisis de seguridad de snippets
- **CTF & Labs**: orientación para Capture The Flag
- **Herramientas**: nmap, Burp Suite, sqlmap, gobuster...
- **Teoría y conceptos**: criptografía, redes, forense digital

> **Recuerda**: Toda prueba de seguridad debe realizarse solo en sistemas para los
> que tienes autorización escrita del propietario.

Escribe `salir` o `exit` para terminar. Escribe `limpiar` para nueva conversación.
"""


def main() -> None:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        console.print(
            "[error]Error: ANTHROPIC_API_KEY no encontrada.[/error]\n"
            "Crea un archivo .env con tu clave API o exporta la variable de entorno:\n"
            "  export ANTHROPIC_API_KEY=sk-ant-...",
        )
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    messages: list[dict] = []

    console.print(Markdown(WELCOME_BANNER))
    console.print(Rule(style="cyan"))

    while True:
        try:
            user_input = Prompt.ask("\n[user]Tú[/user]").strip()
        except (EOFError, KeyboardInterrupt):
            console.print("\n\n[info]Hasta luego! Sigue aprendiendo y hackea éticamente.[/info]")
            break

        if not user_input:
            continue

        if user_input.lower() in {"salir", "exit", "quit", "bye"}:
            console.print("\n[info]Hasta luego! Sigue aprendiendo y hackea éticamente.[/info]")
            break

        if user_input.lower() in {"limpiar", "clear", "reset", "nueva conversacion"}:
            messages = []
            console.clear()
            console.print(Markdown(WELCOME_BANNER))
            console.print(Rule(style="cyan"))
            continue

        messages.append({"role": "user", "content": user_input})

        try:
            console.print()
            with console.status("[professor]Profesor CyberSec está pensando...[/professor]", spinner="dots"):
                response_text = run_agent_turn(client, messages)

            messages.append({"role": "assistant", "content": response_text})

            console.print(Panel(
                Markdown(response_text),
                title="[professor]Profesor CyberSec[/professor]",
                border_style="cyan",
                padding=(1, 2),
            ))

        except anthropic.AuthenticationError:
            console.print("[error]Error de autenticación: verifica tu ANTHROPIC_API_KEY[/error]")
        except anthropic.RateLimitError:
            console.print("[error]Límite de tasa alcanzado. Espera un momento e intenta de nuevo.[/error]")
        except anthropic.APIError as exc:
            console.print(f"[error]Error de API: {exc}[/error]")
        except Exception as exc:
            console.print(f"[error]Error inesperado: {exc}[/error]")


if __name__ == "__main__":
    main()
