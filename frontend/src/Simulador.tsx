import { AnimatePresence, motion } from 'motion/react'
import { CircleCheck, CircleHelp, CircleX, Coffee, FileCode, LoaderCircle, Play, RotateCcw, Terminal } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { METODOS, PADROES } from './components/padroes'
import { processarNoJava, statusApi } from './domain/api'
import { Pagamento, processarPagamento, type LinhaLog, type ResultadoExecucao } from './domain/pagamentos'

const INTERVALO_MS = 280

interface Etapa {
  id: string
  nome: string
  classe: string
  padrao: keyof typeof PADROES
  /** Linha de log que indica que a etapa concluiu. */
  concluida: (l: LinhaLog) => boolean
  /** Valor de `falhouEm` que corresponde a esta etapa. */
  falha?: string
}

const ETAPAS_BASE: Etapa[] = [
  { id: 'valor', nome: 'Valor', classe: 'ValorValidator', padrao: 'chain', concluida: (l) => l.origem === 'ValorValidator', falha: 'ValorValidator' },
  { id: 'cliente', nome: 'Cliente', classe: 'ClienteValidator', padrao: 'chain', concluida: (l) => l.origem === 'ClienteValidator', falha: 'ClienteValidator' },
  { id: 'saldo', nome: 'Saldo', classe: 'SaldoValidator', padrao: 'chain', concluida: (l) => l.origem === 'SaldoValidator', falha: 'SaldoValidator' },
  { id: 'factory', nome: 'Factory', classe: 'PagamentoFactory', padrao: 'factory', concluida: (l) => l.origem === 'PagamentoFactory', falha: 'PagamentoFactory' },
  {
    id: 'strategy',
    nome: 'Strategy',
    classe: 'MetodoPagamento',
    padrao: 'strategy',
    concluida: (l) => l.padrao === 'strategy',
  },
]

const ETAPA_ADAPTER: Etapa = {
  id: 'adapter',
  nome: 'Adapter',
  classe: 'PayPalAdapter',
  padrao: 'adapter',
  concluida: (l) => l.padrao === 'adapter',
}

const CENARIOS = [
  { nome: 'Aprovado', cliente: 'Thiago Brito', valor: '400', saldo: '500', metodo: 'CARTAO' },
  { nome: 'Via PayPal', cliente: 'Ana Souza', valor: '120.5', saldo: '500', metodo: 'PAYPAL' },
  { nome: 'Saldo insuficiente', cliente: 'Thiago Brito', valor: '750', saldo: '500', metodo: 'PIX' },
  { nome: 'Valor zero', cliente: 'Thiago Brito', valor: '0', saldo: '500', metodo: 'BOLETO' },
  { nome: 'Sem cliente', cliente: '', valor: '80', saldo: '500', metodo: 'PIX' },
  { nome: 'Método inválido', cliente: 'Thiago Brito', valor: '50', saldo: '500', metodo: 'CRIPTO' },
] as const

type Motor = 'java' | 'typescript'

type Status = 'ocioso' | 'rodando' | 'ok' | 'falha' | 'pulado'

const corPadrao = (p: LinhaLog['padrao']) => (p === 'sistema' ? 'var(--color-fg-muted)' : PADROES[p].cor)

export function Simulador() {
  const [cliente, setCliente] = useState<string>(CENARIOS[0].cliente)
  const [valor, setValor] = useState<string>(CENARIOS[0].valor)
  const [saldo, setSaldo] = useState<string>(CENARIOS[0].saldo)
  const [metodo, setMetodo] = useState<string>(CENARIOS[0].metodo)

  const [resultado, setResultado] = useState<ResultadoExecucao | null>(null)
  // Fotografia do método usado na última execução, para a UI não mudar se o usuário editar o formulário depois.
  const [execucao, setExecucao] = useState<{ n: number; metodo: string; motor: Motor }>({ n: 0, metodo: '', motor: 'java' })
  const [visiveis, setVisiveis] = useState(0)
  const [motor, setMotor] = useState<Motor>('java')
  /** Versão do Java da API; null = fora do ar, undefined = verificando. */
  const [javaVersao, setJavaVersao] = useState<string | null | undefined>(undefined)
  const [aguardandoApi, setAguardandoApi] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const terminal = useRef<HTMLDivElement>(null)
  const ids = { cliente: useId(), valor: useId(), saldo: useId() }

  const rodando = aguardandoApi || (resultado !== null && visiveis < resultado.linhas.length)
  const terminou = resultado !== null && !rodando

  useEffect(() => () => window.clearInterval(timer.current), [])

  useEffect(() => {
    void statusApi().then((v) => {
      setJavaVersao(v)
      if (!v) setMotor('typescript')
    })
  }, [])

  async function escolherMotor(m: Motor) {
    setAviso(null)
    if (m === 'java' && !javaVersao) {
      setJavaVersao(undefined)
      const v = await statusApi()
      setJavaVersao(v)
      if (!v) {
        setAviso('A API Java não respondeu em localhost:8080. Suba o backend e tente de novo.')
        return
      }
    }
    setMotor(m)
  }

  useEffect(() => {
    terminal.current?.scrollTo({ top: terminal.current.scrollHeight, behavior: 'smooth' })
  }, [visiveis])

  async function executar(e?: FormEvent) {
    e?.preventDefault()
    window.clearInterval(timer.current)
    setAviso(null)

    const pedido = {
      cliente,
      valor: Number(valor.replace(',', '.')) || 0,
      metodo,
      saldoDisponivel: Number(saldo.replace(',', '.')) || 0,
    }
    const local = () => processarPagamento(new Pagamento(pedido.cliente, pedido.valor, pedido.metodo), pedido.saldoDisponivel)

    let r: ResultadoExecucao
    let usado: Motor = motor
    if (motor === 'java') {
      setAguardandoApi(true)
      try {
        r = await processarNoJava(pedido)
      } catch {
        // API caiu no meio do caminho: segue com o porte em TypeScript.
        r = local()
        usado = 'typescript'
        setMotor('typescript')
        setJavaVersao(null)
        setAviso('A API Java não respondeu — esta execução rodou em TypeScript.')
      } finally {
        setAguardandoApi(false)
      }
    } else {
      r = local()
    }

    setResultado(r)
    setExecucao((e) => ({ n: e.n + 1, metodo, motor: usado }))
    setVisiveis(0)
    timer.current = window.setInterval(() => {
      setVisiveis((v) => {
        if (v + 1 >= r.linhas.length) window.clearInterval(timer.current)
        return v + 1
      })
    }, INTERVALO_MS)
  }

  function limpar() {
    window.clearInterval(timer.current)
    setResultado(null)
    setVisiveis(0)
  }

  function aplicarCenario(c: (typeof CENARIOS)[number]) {
    setCliente(c.cliente)
    setValor(c.valor)
    setSaldo(c.saldo)
    setMetodo(c.metodo)
    limpar()
  }

  const metodoEtapas = resultado ? execucao.metodo : metodo
  const etapas = metodoEtapas === 'PAYPAL' ? [...ETAPAS_BASE, ETAPA_ADAPTER] : ETAPAS_BASE
  const linhasVisiveis = resultado?.linhas.slice(0, visiveis) ?? []

  const statusDe = (etapa: Etapa, i: number): Status => {
    if (!resultado) return 'ocioso'
    if (linhasVisiveis.some(etapa.concluida)) return 'ok'
    if (terminou && !resultado.aprovado) {
      const idxFalha = etapas.findIndex((et) => et.falha === resultado.falhouEm)
      if (i === idxFalha) return 'falha'
      if (i > idxFalha) return 'pulado'
    }
    const primeiraPendente = etapas.findIndex((et) => !linhasVisiveis.some(et.concluida))
    return i === primeiraPendente && rodando ? 'rodando' : 'ocioso'
  }

  const metodoValido = METODOS.some((m) => m.codigo === metodo)
  const campo =
    'min-h-11 w-full rounded-lg border border-line bg-bg px-3 text-[15px] text-fg placeholder:text-fg-subtle transition-colors hover:border-fg-subtle focus:border-strategy focus:outline-none'

  return (
    <div className="bg-grid h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Simulador de pagamentos</h1>
          <p className="mt-2 max-w-2xl text-fg-muted">
            Executa o código Java de verdade pela API Spring Boot — ou o porte em TypeScript, se o backend estiver
            desligado. Mude os dados e veja cada padrão agir.
          </p>
        </header>

        <div className="grid grid-cols-1 [&>*]:min-w-0 gap-6 lg:grid-cols-[380px_1fr]">
          {/* ── Formulário ── */}
          <form onSubmit={executar} className="space-y-5 rounded-2xl border border-line bg-surface/80 p-5 backdrop-blur" noValidate>
            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-subtle">Executar com</legend>
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-bg p-1">
                {(
                  [
                    ['java', 'Java · Spring', Coffee],
                    ['typescript', 'TypeScript', FileCode],
                  ] as const
                ).map(([m, rotulo, Icone]) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => void escolherMotor(m)}
                    aria-pressed={motor === m}
                    className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors ${
                      motor === m ? 'bg-surface-2 text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
                    }`}
                  >
                    <Icone className="size-4" aria-hidden="true" />
                    {rotulo}
                    {m === 'java' && (
                      <span
                        className={`size-1.5 rounded-full ${javaVersao ? 'bg-ok' : javaVersao === null ? 'bg-err' : 'animate-pulse bg-fg-subtle'}`}
                        aria-label={javaVersao ? 'API no ar' : javaVersao === null ? 'API fora do ar' : 'verificando API'}
                      />
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-fg-subtle" aria-live="polite">
                {aviso ??
                  (motor === 'java'
                    ? 'Chama o código Java de verdade pela API.'
                    : 'Usa o porte em TypeScript, sem precisar do backend.')}
              </p>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-subtle">Cenários prontos</legend>
              <div className="flex flex-wrap gap-1.5">
                {CENARIOS.map((c) => (
                  <button
                    key={c.nome}
                    type="button"
                    onClick={() => aplicarCenario(c)}
                    className="min-h-9 cursor-pointer rounded-full border border-line px-3 text-xs font-medium text-fg-muted transition-colors hover:border-strategy/60 hover:text-fg"
                  >
                    {c.nome}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor={ids.cliente} className="mb-1.5 block text-sm font-medium">
                Cliente
              </label>
              <input id={ids.cliente} className={campo} value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nome do cliente" autoComplete="off" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={ids.valor} className="mb-1.5 block text-sm font-medium">
                  Valor (R$)
                </label>
                <input id={ids.valor} className={`${campo} font-mono tabular-nums`} value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" />
              </div>
              <div>
                <label htmlFor={ids.saldo} className="mb-1.5 block text-sm font-medium">
                  Saldo disponível
                </label>
                <input id={ids.saldo} className={`${campo} font-mono tabular-nums`} value={saldo} onChange={(e) => setSaldo(e.target.value)} inputMode="decimal" aria-describedby={`${ids.saldo}-ajuda`} />
              </div>
            </div>
            <p id={`${ids.saldo}-ajuda`} className="-mt-3 text-xs text-fg-subtle">
              Usado pelo <span className="font-mono">SaldoValidator</span>.
            </p>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">Método de pagamento</legend>
              <div className="grid grid-cols-2 gap-2">
                {METODOS.map((m) => {
                  const Icone = m.icone
                  const sel = metodo === m.codigo
                  return (
                    <label
                      key={m.codigo}
                      className={`flex min-h-12 cursor-pointer items-center gap-2.5 rounded-lg border px-3 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-strategy ${
                        sel ? 'border-strategy bg-strategy/10 text-fg' : 'border-line text-fg-muted hover:border-fg-subtle'
                      }`}
                    >
                      <input type="radio" name="metodo" value={m.codigo} checked={sel} onChange={() => setMetodo(m.codigo)} className="sr-only" />
                      <Icone className={`size-5 ${sel ? 'text-strategy' : ''}`} aria-hidden="true" />
                      {m.nome}
                    </label>
                  )
                })}
              </div>
              {!metodoValido && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-factory">
                  <CircleHelp className="size-3.5" aria-hidden="true" />
                  Método “{metodo}” selecionado — a Factory vai rejeitá-lo.
                </p>
              )}
            </fieldset>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={rodando}
                className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-strategy px-5 text-sm font-bold text-[#0b1120] transition-[filter,opacity] hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
              >
                {rodando ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
                {rodando ? 'Processando…' : 'Processar pagamento'}
              </button>
              <button
                type="button"
                onClick={limpar}
                disabled={!resultado}
                className="inline-flex size-12 cursor-pointer items-center justify-center rounded-lg border border-line text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Limpar execução"
                title="Limpar"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
              </button>
            </div>
          </form>

          {/* ── Execução ── */}
          <div className="flex min-w-0 flex-col gap-6">
            <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Etapas da execução">
              {etapas.map((et, i) => {
                const st = statusDe(et, i)
                const cor = PADROES[et.padrao].cor
                const Icone = PADROES[et.padrao].icone
                return (
                  <motion.li
                    key={et.id}
                    layout
                    className="relative rounded-xl border bg-surface p-3 transition-colors duration-300"
                    style={{
                      borderColor: st === 'ok' ? cor : st === 'falha' ? 'var(--color-err)' : st === 'rodando' ? `color-mix(in srgb, ${cor} 60%, transparent)` : 'var(--color-line)',
                      background: st === 'ok' ? `color-mix(in srgb, ${cor} 10%, var(--color-surface))` : st === 'falha' ? 'color-mix(in srgb, var(--color-err) 10%, var(--color-surface))' : undefined,
                      opacity: st === 'pulado' ? 0.35 : 1,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <Icone className="size-4" style={{ color: cor }} aria-hidden="true" />
                      <StatusIcone status={st} />
                    </div>
                    <div className="mt-2 text-sm font-semibold">{et.nome}</div>
                    <div className="truncate font-mono text-[10.5px] text-fg-subtle" title={et.classe}>
                      {et.classe}
                    </div>
                    <span className="sr-only">
                      {{ ocioso: 'aguardando', rodando: 'em execução', ok: 'concluída', falha: 'falhou', pulado: 'não executada' }[st]}
                    </span>
                  </motion.li>
                )
              })}
            </ol>

            <section className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-[#070b15]" aria-label="Saída do console">
              <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
                <Terminal className="size-4 text-fg-subtle" aria-hidden="true" />
                <span className="truncate font-mono text-xs text-fg-muted">
                  {(resultado ? execucao.motor : motor) === 'java'
                    ? `POST localhost:8080/api/pagamentos${javaVersao ? ` · Java ${javaVersao.split('+')[0]}` : ''}`
                    : 'pagamentos.ts · executando no navegador'}
                </span>
              </div>
              <div ref={terminal} className="flex-1 overflow-y-auto p-4 font-mono text-[12.5px] leading-6 sm:text-[13px]" aria-live="polite">
                {!resultado && (
                  <p className="text-fg-subtle">
                    <span className="text-strategy">$</span> aguardando execução… escolha um cenário e clique em{' '}
                    <span className="text-fg-muted">Processar pagamento</span>.
                  </p>
                )}
                <AnimatePresence initial={false}>
                  {linhasVisiveis.map((l, i) => (
                    <motion.div
                      key={`${execucao.n}-${i}`}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col pb-1 sm:flex-row sm:gap-3 sm:pb-0"
                    >
                      <span className="shrink-0 truncate text-[11px] leading-5 sm:w-40 sm:text-right sm:leading-6" style={{ color: corPadrao(l.padrao) }}>
                        {l.origem}
                      </span>
                      <span className={`min-w-0 break-words ${l.nivel === 'sucesso' ? 'text-ok' : l.nivel === 'erro' ? 'text-err' : 'text-[#cbd5e1]'}`}>
                        {l.mensagem}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {rodando && (
                  <div className="flex h-6 items-center gap-3" aria-hidden="true">
                    <span className="hidden w-40 shrink-0 sm:block" />
                    <span className="h-4 w-2 animate-pulse bg-fg-muted" />
                  </div>
                )}
              </div>

              <AnimatePresence>
                {terminou && resultado && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`flex items-start gap-3 border-t px-5 py-4 ${resultado.aprovado ? 'border-ok/40 bg-ok/10' : 'border-err/40 bg-err/10'}`}
                    role="status"
                  >
                    {resultado.aprovado ? (
                      <CircleCheck className="mt-0.5 size-6 shrink-0 text-ok" aria-hidden="true" />
                    ) : (
                      <CircleX className="mt-0.5 size-6 shrink-0 text-err" aria-hidden="true" />
                    )}
                    <div>
                      <p className="font-semibold">{resultado.aprovado ? 'Pagamento concluído com sucesso' : 'Pagamento recusado'}</p>
                      <p className="mt-0.5 text-sm text-fg-muted">
                        {resultado.aprovado
                          ? `Estratégia ${METODOS.find((m) => m.codigo === execucao.metodo)?.classe} executada${execucao.metodo === 'PAYPAL' ? ' via PayPalAdapter' : ''}.`
                          : `${resultado.motivo} — interrompido em ${resultado.falhouEm}.`}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusIcone({ status }: { status: Status }) {
  if (status === 'ok') return <CircleCheck className="size-4 text-ok" aria-hidden="true" />
  if (status === 'falha') return <CircleX className="size-4 text-err" aria-hidden="true" />
  if (status === 'rodando') return <LoaderCircle className="size-4 animate-spin text-fg-muted" aria-hidden="true" />
  return <span className="size-2 rounded-full bg-line" aria-hidden="true" />
}
