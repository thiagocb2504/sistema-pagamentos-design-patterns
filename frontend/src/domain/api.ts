import type { ResultadoExecucao } from './pagamentos'

// A API Spring Boot (src/main/java/.../api). Pode ser trocada com VITE_API_URL.
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8080'

export interface PedidoPagamento {
  cliente: string
  valor: number
  metodo: string
  saldoDisponivel: number
}

/** Versão do Java da API, ou null se ela não estiver no ar. */
export async function statusApi(): Promise<string | null> {
  try {
    const r = await fetch(`${BASE}/api/pagamentos/status`, { signal: AbortSignal.timeout(2000) })
    if (!r.ok) return null
    const corpo = (await r.json()) as { java: string }
    return corpo.java
  } catch {
    return null
  }
}

export async function processarNoJava(pedido: PedidoPagamento): Promise<ResultadoExecucao> {
  const r = await fetch(`${BASE}/api/pagamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pedido),
    signal: AbortSignal.timeout(5000),
  })
  if (!r.ok) throw new Error(`API respondeu ${r.status}`)
  const corpo = (await r.json()) as ResultadoExecucao & { motivo: string | null; falhouEm: string | null }
  return { ...corpo, motivo: corpo.motivo ?? undefined, falhouEm: corpo.falhouEm ?? undefined }
}
