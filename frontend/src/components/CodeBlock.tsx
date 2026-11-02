import { useEffect, useRef, type ReactNode } from 'react'

const TOKENS = new RegExp(
  [
    String.raw`(?<com>\/\/.*|\/\*[\s\S]*?\*\/)`,
    String.raw`(?<str>"(?:\\.|[^"\\])*")`,
    String.raw`(?<ann>@\w+)`,
    String.raw`(?<kw>\b(?:public|private|protected|class|interface|extends|implements|return|new|if|else|throw|throws|try|catch|switch|case|default|final|static|void|double|int|boolean|abstract|null|this|package|import)\b)`,
    String.raw`(?<num>\b\d+(?:\.\d+)?\b)`,
    String.raw`(?<type>\b[A-Z]\w*\b)`,
    String.raw`(?<fn>\b[a-z]\w*(?=\())`,
  ].join('|'),
  'g',
)

function realcar(linha: string): ReactNode[] {
  const out: ReactNode[] = []
  let ultimo = 0
  for (const m of linha.matchAll(TOKENS)) {
    const tipo = Object.entries(m.groups ?? {}).find(([, v]) => v !== undefined)?.[0]
    if (m.index > ultimo) out.push(linha.slice(ultimo, m.index))
    out.push(
      <span key={m.index} className={`tok-${tipo}`}>
        {m[0]}
      </span>,
    )
    ultimo = m.index + m[0].length
  }
  if (ultimo < linha.length) out.push(linha.slice(ultimo))
  return out
}

/** Remove `package`/`import` e linhas em branco repetidas para caber no slide. */
export function limparJava(fonte: string): string {
  return fonte
    .replace(/^\s*(package|import)\s.*;\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

interface CodeBlockProps {
  codigo: string
  arquivo?: string
  /** Linhas (1-based) a destacar. */
  destaque?: number[]
  cor?: string
  /** Linha (1-based) a manter visível quando o bloco tem rolagem. */
  foco?: number
  className?: string
}

export function CodeBlock({ codigo, arquivo, destaque = [], cor = 'var(--color-strategy)', foco, className = '' }: CodeBlockProps) {
  const linhas = codigo.split('\n')
  const pre = useRef<HTMLPreElement>(null)

  useEffect(() => {
    const el = pre.current
    const alvo = foco ? (el?.querySelector<HTMLElement>(`[data-linha="${foco}"]`) ?? null) : null
    if (!el || !alvo) return
    el.scrollTo({ top: alvo.offsetTop - el.clientHeight / 2, behavior: 'smooth' })
  }, [foco])
  return (
    <figure
      className={`overflow-hidden rounded-xl border border-line bg-[#0a0f1c] shadow-2xl shadow-black/40 ${className}`}
    >
      {arquivo && (
        <figcaption className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#f87171]/70" />
            <span className="size-2.5 rounded-full bg-[#fbbf24]/70" />
            <span className="size-2.5 rounded-full bg-[#34d399]/70" />
          </span>
          <span className="ml-2 truncate font-mono text-xs text-fg-muted">{arquivo}</span>
        </figcaption>
      )}
      <pre ref={pre} className="relative max-h-[52vh] overflow-auto py-3 font-mono text-[11.5px] leading-[1.35rem] sm:text-[12.5px] sm:leading-[1.45rem] xl:text-[13px]">
        <code>
          {linhas.map((linha, i) => {
            const ativa = destaque.includes(i + 1)
            return (
              <div
                key={i}
                data-linha={i + 1}
                className="flex pr-4"
                style={ativa ? { background: `color-mix(in srgb, ${cor} 12%, transparent)`, boxShadow: `inset 3px 0 0 ${cor}` } : undefined}
              >
                <span className="w-10 shrink-0 select-none pr-4 text-right text-fg-subtle/60" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="whitespace-pre text-[#e2e8f0]">{realcar(linha)}</span>
              </div>
            )
          })}
        </code>
      </pre>
    </figure>
  )
}
