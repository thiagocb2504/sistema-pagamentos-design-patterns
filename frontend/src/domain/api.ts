import type { ResultadoExecucao } from './pagamentos'

// A API Spring Boot (src/main/java/.../api). Pode ser trocada com VITE_API_URL.
const URL_CONFIGURADA = import.meta.env.VITE_API_URL as string | undefined
const BASE = URL_CONFIGURADA ?? 'http://localhost:8080'

/**
 * Só tenta a API quando a página também está rodando localmente (ou quando a
 * URL foi configurada). Na versão publicada no GitHub Pages não há backend, e
 * chamar localhost a partir de um site público faz o navegador pedir permissão
 * de acesso à rede local ao visitante.
 */
export const API_ACESSIVEL =
  URL_CONFIGURADA !== undefined || ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)

export interface PedidoPagamento {
  cliente: string
  valor: number
  metodo: string
  saldoDisponivel: number
}

/** Versão do Java da API, ou null se ela não estiver no ar. */
export async function statusApi(): Promise<string | null> {
  if (!API_ACESSIVEL) return null
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
