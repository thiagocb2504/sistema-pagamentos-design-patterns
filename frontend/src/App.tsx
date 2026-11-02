import { MotionConfig } from 'motion/react'
import { CreditCard, Play, Presentation } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Deck } from './slides/Deck'
import { Simulador } from './Simulador'

type Rota = { tela: 'slides'; slide: number } | { tela: 'simulador' }

// #/slides/3 ou #/simulador — permite compartilhar o link de um slide específico.
function lerRota(): Rota {
  const hash = window.location.hash.replace(/^#\/?/, '')
  if (hash.startsWith('simulador')) return { tela: 'simulador' }
  const n = Number(hash.match(/^slides\/(\d+)/)?.[1] ?? 1)
  return { tela: 'slides', slide: Math.max(n - 1, 0) }
}

function useRota() {
  const [rota, setRota] = useState(lerRota)
  // Último slide visitado, para a aba "Apresentação" voltar de onde parou.
  const [ultimoSlide, setUltimoSlide] = useState(rota.tela === 'slides' ? rota.slide : 0)
  useEffect(() => {
    const onHash = () => {
      const r = lerRota()
      setRota(r)
      if (r.tela === 'slides') setUltimoSlide(r.slide)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const navegar = useCallback((r: Rota) => {
    window.location.hash = r.tela === 'simulador' ? '/simulador' : `/slides/${r.slide + 1}`
  }, [])
  return { rota, navegar, ultimoSlide }
}

export default function App() {
  const { rota, navegar, ultimoSlide } = useRota()

  const irParaSlide = useCallback((slide: number) => navegar({ tela: 'slides', slide }), [navegar])
  const abrirSimulador = useCallback(() => navegar({ tela: 'simulador' }), [navegar])

  const aba = (ativa: boolean) =>
    `inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${
      ativa ? 'bg-surface-2 text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
    }`

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-line/70 bg-bg px-4 py-2.5 sm:px-6">
          <a href="#/slides/1" className="flex items-center gap-2.5 rounded-md" aria-label="Sistema de Pagamentos — início">
            <span className="flex size-8 items-center justify-center rounded-lg bg-strategy/15 text-strategy">
              <CreditCard className="size-4.5" aria-hidden="true" />
            </span>
            <span className="hidden text-sm font-semibold sm:inline">
              Sistema de Pagamentos <span className="font-normal text-fg-subtle">· Design Patterns</span>
            </span>
          </a>
          <nav className="flex gap-1 rounded-lg border border-line bg-surface p-1" aria-label="Seções">
            <button
              type="button"
              className={aba(rota.tela === 'slides')}
              aria-current={rota.tela === 'slides' ? 'page' : undefined}
              onClick={() => irParaSlide(ultimoSlide)}
            >
              <Presentation className="size-4" aria-hidden="true" />
              Apresentação
            </button>
            <button
              type="button"
              className={aba(rota.tela === 'simulador')}
              aria-current={rota.tela === 'simulador' ? 'page' : undefined}
              onClick={abrirSimulador}
            >
              <Play className="size-4" aria-hidden="true" />
              Simulador
            </button>
          </nav>
        </header>

        <main className="min-h-0 flex-1">
          {rota.tela === 'slides' ? (
            <Deck indice={rota.slide} irPara={irParaSlide} abrirSimulador={abrirSimulador} />
          ) : (
            <Simulador />
          )}
        </main>
      </div>
    </MotionConfig>
  )
}
