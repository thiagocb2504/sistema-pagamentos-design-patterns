import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SLIDES } from './slides'

interface DeckProps {
  indice: number
  irPara: (indice: number) => void
  abrirSimulador: () => void
}

export function Deck({ indice, irPara, abrirSimulador }: DeckProps) {
  const total = SLIDES.length
  const atual = Math.min(Math.max(indice, 0), total - 1)
  const anterior = useRef(atual)
  const direcao = atual >= anterior.current ? 1 : -1
  useEffect(() => {
    anterior.current = atual
  }, [atual])

  const [telaCheia, setTelaCheia] = useState(false)
  const palco = useRef<HTMLDivElement>(null)

  const avancar = useCallback(() => irPara(Math.min(atual + 1, total - 1)), [atual, irPara, total])
  const voltar = useCallback(() => irPara(Math.max(atual - 1, 0)), [atual, irPara])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement
      if (alvo.closest('input, textarea, select, [contenteditable]')) return
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault()
        avancar()
      } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        voltar()
      } else if (e.key === 'Home') irPara(0)
      else if (e.key === 'End') irPara(total - 1)
      else if (e.key.toLowerCase() === 'f') alternarTelaCheia()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    const onChange = () => setTelaCheia(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  function alternarTelaCheia() {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void palco.current?.requestFullscreen()
  }

  // Swipe no celular
  const toque = useRef<number | null>(null)

  const Slide = SLIDES[atual].componente

  return (
    <div ref={palco} className="bg-grid relative flex h-full flex-col bg-bg">
      <div className="h-1 w-full bg-line/50" role="presentation">
        <motion.div
          className="h-full bg-strategy"
          initial={false}
          animate={{ width: `${((atual + 1) / total) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <section
        className="relative flex-1 overflow-hidden"
        aria-roledescription="carrossel"
        aria-label="Apresentação"
        onTouchStart={(e) => (toque.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (toque.current === null) return
          const dx = e.changedTouches[0].clientX - toque.current
          if (Math.abs(dx) > 60) (dx < 0 ? avancar : voltar)()
          toque.current = null
        }}
      >
        <AnimatePresence mode="wait" custom={direcao} initial={false}>
          <motion.article
            key={atual}
            custom={direcao}
            variants={{
              entrar: (d: number) => ({ opacity: 0, x: d * 48 }),
              centro: { opacity: 1, x: 0 },
              sair: (d: number) => ({ opacity: 0, x: d * -32 }),
            }}
            initial="entrar"
            animate="centro"
            exit="sair"
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 overflow-y-auto"
            aria-roledescription="slide"
            aria-label={`${atual + 1} de ${total}: ${SLIDES[atual].titulo}`}
          >
            <div className="mx-auto flex min-h-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-8 lg:px-12">
              <Slide abrirSimulador={abrirSimulador} />
            </div>
          </motion.article>
        </AnimatePresence>
      </section>

      <nav
        className="flex items-center justify-between gap-3 border-t border-line/70 bg-bg/80 px-4 py-3 backdrop-blur sm:px-6"
        aria-label="Navegação dos slides"
      >
        <button
          type="button"
          onClick={voltar}
          disabled={atual === 0}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <div className="flex items-center gap-4">
          <ol className="hidden items-center gap-1 md:flex">
            {SLIDES.map((s, i) => (
              <li key={s.titulo}>
                <button
                  type="button"
                  onClick={() => irPara(i)}
                  className="group flex h-11 cursor-pointer items-center px-1"
                  aria-label={`Ir para o slide ${i + 1}: ${s.titulo}`}
                  aria-current={i === atual ? 'step' : undefined}
                  title={s.titulo}
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      i === atual ? 'w-7 bg-strategy' : 'w-1.5 bg-fg-subtle/50 group-hover:bg-fg-muted'
                    }`}
                  />
                </button>
              </li>
            ))}
          </ol>
          <span className="font-mono text-xs tabular-nums text-fg-subtle" aria-live="polite">
            {String(atual + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={alternarTelaCheia}
            className="hidden size-11 cursor-pointer items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg sm:inline-flex"
            aria-label={telaCheia ? 'Sair da tela cheia' : 'Tela cheia (F)'}
            title={telaCheia ? 'Sair da tela cheia' : 'Tela cheia (F)'}
          >
            {telaCheia ? <Minimize className="size-4" aria-hidden="true" /> : <Maximize className="size-4" aria-hidden="true" />}
          </button>
        </div>

        <button
          type="button"
          onClick={avancar}
          disabled={atual === total - 1}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg bg-strategy px-4 text-sm font-semibold text-[#0b1120] transition-[filter,opacity] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Próximo slide"
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </nav>
    </div>
  )
}
