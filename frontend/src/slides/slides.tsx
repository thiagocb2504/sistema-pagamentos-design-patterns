import { motion } from 'motion/react'
import { ArrowRight, Check, CircleX, Keyboard, Play, Plug, ShieldCheck, User } from 'lucide-react'
import { useState, type ComponentType, type ReactNode } from 'react'
import { CodeBlock, limparJava } from '../components/CodeBlock'
import { METODOS, PADROES, PatternTag } from '../components/padroes'

// Código-fonte real do projeto Java — os slides ficam sempre em sincronia com ele.
import fonteProcessador from '../../../src/main/java/com/thiago/pagamentos/ProcessadorPagamento.java?raw'
import fonteValidador from '../../../src/main/java/com/thiago/pagamentos/chain/ValidadorPagamento.java?raw'
import fonteSaldo from '../../../src/main/java/com/thiago/pagamentos/chain/SaldoValidator.java?raw'
import fonteFactory from '../../../src/main/java/com/thiago/pagamentos/factory/PagamentoFactory.java?raw'
import fonteMetodo from '../../../src/main/java/com/thiago/pagamentos/strategy/MetodoPagamento.java?raw'
import fontePix from '../../../src/main/java/com/thiago/pagamentos/strategy/PagamentoPix.java?raw'
import fonteAdapter from '../../../src/main/java/com/thiago/pagamentos/adapter/PayPalAdapter.java?raw'
import fonteGateway from '../../../src/main/java/com/thiago/pagamentos/adapter/GatewayPayPal.java?raw'

interface SlideProps {
  abrirSimulador: () => void
}

const entrada = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: 0.08 + i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
})

function Cabecalho({
  padrao,
  rotulo,
  titulo,
  children,
}: {
  padrao?: keyof typeof PADROES
  rotulo?: string
  titulo: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="mb-8 max-w-3xl">
      <motion.div {...entrada(0)} className="mb-4 flex flex-wrap items-center gap-2">
        {padrao && <PatternTag padrao={padrao} />}
        {rotulo && (
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">{rotulo}</span>
        )}
      </motion.div>
      <motion.h2 {...entrada(1)} className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        {titulo}
      </motion.h2>
      {children && (
        <motion.p {...entrada(2)} className="mt-4 text-base leading-relaxed text-fg-muted sm:text-lg">
          {children}
        </motion.p>
      )}
    </header>
  )
}

function Pontos({ itens, cor, inicio = 3 }: { itens: ReactNode[]; cor: string; inicio?: number }) {
  return (
    <ul className="space-y-3">
      {itens.map((item, i) => (
        <motion.li key={i} {...entrada(inicio + i)} className="flex gap-3 text-[15px] leading-relaxed text-fg-muted">
          <Check className="mt-0.5 size-5 shrink-0" style={{ color: cor }} aria-hidden="true" />
          <span>{item}</span>
        </motion.li>
      ))}
    </ul>
  )
}

const C = ({ children }: { children: ReactNode }) => (
  <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-fg">{children}</code>
)

// ── 1. Capa ──────────────────────────────────────────────────────────────

function Capa({ abrirSimulador }: SlideProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.span
        {...entrada(0)}
        className="mb-6 rounded-full border border-line bg-surface px-4 py-1.5 font-mono text-xs text-fg-muted"
      >
        Java 21 · Programação Orientada a Objetos
      </motion.span>
      <motion.h1
        {...entrada(1)}
        className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
      >
        Sistema de <span className="text-strategy">Pagamentos</span>
      </motion.h1>
      <motion.p {...entrada(2)} className="mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted sm:text-xl">
        Quatro métodos de pagamento, três validações e uma API externa — organizados com quatro design
        patterns clássicos.
      </motion.p>
      <motion.div {...entrada(3)} className="mt-10 flex flex-wrap justify-center gap-2">
        <PatternTag padrao="strategy" />
        <PatternTag padrao="factory" />
        <PatternTag padrao="chain" />
        <PatternTag padrao="adapter" />
      </motion.div>
      <motion.div {...entrada(4)} className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
        <button
          type="button"
          onClick={abrirSimulador}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-5 text-sm font-semibold transition-colors hover:border-strategy/60 hover:bg-surface-2"
        >
          <Play className="size-4 text-strategy" aria-hidden="true" />
          Ir direto ao simulador
        </button>
        <span className="hidden items-center gap-2 text-sm text-fg-subtle sm:inline-flex">
          <Keyboard className="size-4" aria-hidden="true" />
          Use <kbd className="rounded border border-line px-1.5 font-mono text-xs">←</kbd>
          <kbd className="rounded border border-line px-1.5 font-mono text-xs">→</kbd> para navegar
        </span>
      </motion.div>
    </div>
  )
}

// ── 2. O problema ────────────────────────────────────────────────────────

const ANTES = `public void pagar(String metodo, double valor, String cliente) {
    if (valor <= 0) throw new IllegalArgumentException("...");
    if (cliente == null) throw new IllegalArgumentException("...");
    if (valor > saldo) throw new IllegalArgumentException("...");

    if (metodo.equals("PIX")) {
        // 30 linhas de PIX...
    } else if (metodo.equals("CARTAO")) {
        // 40 linhas de cartão...
    } else if (metodo.equals("BOLETO")) {
        // 25 linhas de boleto...
    } else if (metodo.equals("PAYPAL")) {
        GatewayPayPal g = new GatewayPayPal();
        g.sendPayment(valor, cliente); // API em outro formato
    }
    // e amanhã chega "CRIPTO"...
}`

function Problema() {
  return (
    <div className="grid grid-cols-1 [&>*]:min-w-0 items-center gap-10 lg:grid-cols-[1fr_1.15fr]">
      <div>
        <Cabecalho rotulo="O problema" titulo="Um método que sabe demais">
          Sem padrões, validar e processar pagamentos vira um único bloco de <C>if/else</C> que cresce a cada
          novo meio de pagamento.
        </Cabecalho>
        <ul className="space-y-3">
          {[
            'Toda nova forma de pagamento exige editar código que já funciona.',
            'Validações misturadas com regras de cobrança — difícil testar isoladamente.',
            'A API do PayPal não “fala” a nossa língua e vaza para o domínio.',
          ].map((t, i) => (
            <motion.li key={t} {...entrada(3 + i)} className="flex gap-3 text-[15px] leading-relaxed text-fg-muted">
              <CircleX className="mt-0.5 size-5 shrink-0 text-err" aria-hidden="true" />
              {t}
            </motion.li>
          ))}
        </ul>
      </div>
      <motion.div {...entrada(4)}>
        <CodeBlock codigo={ANTES} arquivo="PagamentoService.java — versão sem padrões" cor="var(--color-err)" destaque={[6, 8, 10, 12, 16]} />
      </motion.div>
    </div>
  )
}

// ── 3. Arquitetura ───────────────────────────────────────────────────────

function Caixa({ padrao, titulo, sub, i }: { padrao: keyof typeof PADROES; titulo: string; sub: string; i: number }) {
  const p = PADROES[padrao]
  const Icone = p.icone
  return (
    <motion.div
      {...entrada(i)}
      className="rounded-xl border bg-surface p-4"
      style={{ borderColor: `color-mix(in srgb, ${p.cor} 40%, transparent)` }}
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: p.cor }}>
        <Icone className="size-4" aria-hidden="true" />
        {p.nome}
      </div>
      <div className="font-mono text-sm font-semibold text-fg">{titulo}</div>
      <div className="mt-1 text-xs leading-relaxed text-fg-muted">{sub}</div>
    </motion.div>
  )
}

function Seta({ i }: { i: number }) {
  return (
    <motion.div {...entrada(i)} className="flex items-center justify-center text-fg-subtle" aria-hidden="true">
      <ArrowRight className="size-5 rotate-90 lg:rotate-0" />
    </motion.div>
  )
}

function Arquitetura() {
  return (
    <div>
      <Cabecalho rotulo="Visão geral" titulo="O caminho de um pagamento">
        Cada etapa tem um único responsável. O <C>ProcessadorPagamento</C> só monta as peças e as conecta.
      </Cabecalho>
      <div className="grid grid-cols-1 [&>*]:min-w-0 gap-3 lg:grid-cols-[1fr_auto_1.3fr_auto_1fr_auto_1.3fr]">
        <Caixa i={3} padrao="model" titulo="Pagamento" sub="cliente, valor e método — objeto imutável" />
        <Seta i={4} />
        <div className="grid gap-2">
          <Caixa i={5} padrao="chain" titulo="Valor → Cliente → Saldo" sub="cada validador decide se passa adiante ou interrompe" />
        </div>
        <Seta i={6} />
        <Caixa i={7} padrao="factory" titulo="PagamentoFactory" sub='"PIX" vira new PagamentoPix()' />
        <Seta i={8} />
        <div className="grid gap-2">
          <Caixa i={9} padrao="strategy" titulo="MetodoPagamento.pagar()" sub="Pix · Cartão · Boleto · PayPal" />
          <Caixa i={10} padrao="adapter" titulo="PayPalAdapter" sub="traduz para GatewayPayPal.sendPayment()" />
        </div>
      </div>
      <motion.p {...entrada(11)} className="mt-8 text-sm text-fg-subtle">
        Pacotes: <C>model</C> · <C>chain</C> · <C>factory</C> · <C>strategy</C> · <C>adapter</C>
      </motion.p>
    </div>
  )
}

// ── 4. Strategy ──────────────────────────────────────────────────────────

function Strategy() {
  const [ativo, setAtivo] = useState(0)
  return (
    <div className="grid grid-cols-1 [&>*]:min-w-0 items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <Cabecalho padrao="strategy" rotulo="Comportamental" titulo="Um contrato, várias formas de pagar">
          A interface <C>MetodoPagamento</C> define <em>o que</em> fazer. Cada classe concreta decide <em>como</em>.
        </Cabecalho>
        <Pontos
          cor={PADROES.strategy.cor}
          itens={[
            'O código cliente chama pagar() sem saber qual implementação está por trás.',
            'Nova forma de pagamento = nova classe. Nada existente é alterado (Open/Closed).',
            'Cada estratégia pode ser testada de forma isolada.',
          ]}
        />
        <motion.div {...entrada(6)} className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Implementações">
          {METODOS.map((m, i) => {
            const Icone = m.icone
            const sel = i === ativo
            return (
              <button
                key={m.codigo}
                type="button"
                onClick={() => setAtivo(i)}
                aria-pressed={sel}
                className={`flex min-h-11 min-w-0 cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium break-all transition-colors ${
                  sel ? 'border-strategy bg-strategy/10 text-strategy' : 'border-line bg-surface text-fg-muted hover:border-fg-subtle'
                }`}
              >
                <Icone className="size-5" aria-hidden="true" />
                {m.classe}
              </button>
            )
          })}
        </motion.div>
      </div>
      <motion.div {...entrada(4)} className="space-y-4">
        <CodeBlock codigo={limparJava(fonteMetodo)} arquivo="strategy/MetodoPagamento.java" destaque={[3]} />
        {ativo === 0 ? (
          <CodeBlock codigo={limparJava(fontePix)} arquivo="strategy/PagamentoPix.java" destaque={[1, 4]} />
        ) : (
          <CodeBlock
            codigo={`public class ${METODOS[ativo].classe} implements MetodoPagamento {\n\n    @Override\n    public void pagar(Pagamento pagamento) {\n        // regra específica de ${METODOS[ativo].nome}\n    }\n}`}
            arquivo={`strategy/${METODOS[ativo].classe}.java`}
            destaque={[1, 4]}
          />
        )}
      </motion.div>
    </div>
  )
}

// ── 5. Factory ───────────────────────────────────────────────────────────

function FactorySlide() {
  const [entradaFab, setEntradaFab] = useState<string>('PIX')
  const opcoes = [...METODOS.map((m) => m.codigo), 'CRIPTO']
  const metodo = METODOS.find((m) => m.codigo === entradaFab)
  const codigoFactory = limparJava(fonteFactory)
  const linhasFactory = codigoFactory.split('\n')
  const achar = (trecho: string) => linhasFactory.findIndex((l) => l.includes(trecho)) + 1
  // Destaca no código o `case` que a entrada escolhida aciona.
  const linhaCase = achar(metodo ? `"${entradaFab}"` : 'default ->')
  return (
    <div className="grid grid-cols-1 [&>*]:min-w-0 items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <Cabecalho padrao="factory" rotulo="Criacional · Simple Factory" titulo="Quem cria a estratégia certa?">
          A <C>PagamentoFactory</C> centraliza o <C>new</C>: recebe um texto e devolve a implementação de{' '}
          <C>MetodoPagamento</C> correspondente.
        </Cabecalho>
        <Pontos
          cor={PADROES.factory.cor}
          itens={[
            'O Main depende só da interface — nunca de PagamentoPix ou PagamentoCartao.',
            'Entrada inválida falha cedo, com mensagem clara.',
            'Construtor privado: a fábrica é usada apenas pelo método estático criar().',
          ]}
        />
        <motion.div {...entrada(6)} className="mt-8 rounded-xl border border-line bg-surface p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-subtle">Experimente</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Valor passado para criar()">
            {opcoes.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setEntradaFab(o)}
                aria-pressed={o === entradaFab}
                className={`min-h-11 cursor-pointer rounded-lg border px-3 font-mono text-xs transition-colors ${
                  o === entradaFab ? 'border-factory bg-factory/10 text-factory' : 'border-line text-fg-muted hover:border-fg-subtle'
                }`}
              >
                "{o}"
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 font-mono text-sm" aria-live="polite">
            <span className="text-fg-muted">criar("{entradaFab}")</span>
            <ArrowRight className="size-4 text-fg-subtle" aria-hidden="true" />
            {metodo ? (
              <span className="text-factory">new {metodo.classe}()</span>
            ) : (
              <span className="text-err">IllegalArgumentException</span>
            )}
          </div>
        </motion.div>
      </div>
      <motion.div {...entrada(4)}>
        <CodeBlock codigo={codigoFactory} arquivo="factory/PagamentoFactory.java" cor={PADROES.factory.cor} destaque={[achar('criar(String'), achar('switch ('), linhaCase]} foco={linhaCase} />
      </motion.div>
    </div>
  )
}

// ── 6. Chain of Responsibility ───────────────────────────────────────────

function Chain() {
  const elos = [
    { nome: 'ValorValidator', regra: 'valor > 0' },
    { nome: 'ClienteValidator', regra: 'cliente informado' },
    { nome: 'SaldoValidator', regra: 'valor ≤ saldo' },
  ]
  return (
    <div className="grid grid-cols-1 [&>*]:min-w-0 items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <Cabecalho padrao="chain" rotulo="Comportamental" titulo="Validações em corrente">
          Cada validador checa uma regra e repassa ao próximo. Se algo falha, a corrente para ali mesmo.
        </Cabecalho>
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          {elos.map((e, i) => (
            <div key={e.nome} className="flex flex-col items-stretch gap-2 sm:flex-1 sm:flex-row sm:items-center">
              <motion.div
                {...entrada(3 + i)}
                className="flex-1 rounded-lg border border-chain/40 bg-chain/5 p-3"
              >
                <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-chain">
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  {e.nome.replace('Validator', '')}
                </div>
                <div className="mt-1 text-xs text-fg-muted">{e.regra}</div>
              </motion.div>
              {i < elos.length - 1 && (
                <motion.span {...entrada(3 + i)} className="self-center text-fg-subtle" aria-hidden="true">
                  <ArrowRight className="size-4 rotate-90 sm:rotate-0" />
                </motion.span>
              )}
            </div>
          ))}
        </div>
        <Pontos
          inicio={6}
          cor={PADROES.chain.cor}
          itens={[
            <>A ordem é montada no Main com <C>definirProximo()</C>, encadeável porque retorna o próximo elo.</>,
            'Adicionar uma regra (ex.: antifraude) é criar uma subclasse e encaixá-la na corrente.',
            <>A classe base usa <em>Template Method</em>: <C>validar()</C> é fixo, <C>validarAtual()</C> é abstrato.</>,
          ]}
        />
      </div>
      <motion.div {...entrada(4)} className="space-y-4">
        <CodeBlock codigo={limparJava(fonteValidador)} arquivo="chain/ValidadorPagamento.java" cor={PADROES.chain.cor} destaque={[5, 13, 15, 17, 18]} />
        <CodeBlock codigo={limparJava(fonteSaldo)} arquivo="chain/SaldoValidator.java" cor={PADROES.chain.cor} destaque={[12, 14]} className="hidden xl:block" />
      </motion.div>
    </div>
  )
}

// ── 7. Adapter ───────────────────────────────────────────────────────────

function Adapter() {
  return (
    <div>
      <Cabecalho padrao="adapter" rotulo="Estrutural" titulo="Falando a língua do PayPal">
        O <C>GatewayPayPal</C> simula uma API externa que não podemos mudar. O <C>PayPalAdapter</C> traduz a
        nossa chamada para o formato dela.
      </Cabecalho>

      <div className="mb-8 grid grid-cols-1 [&>*]:min-w-0 items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <motion.div {...entrada(3)} className="rounded-xl border border-strategy/40 bg-surface p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-strategy">Nosso domínio</div>
          <div className="mt-2 font-mono text-sm">PagamentoPayPal</div>
          <div className="mt-1 font-mono text-xs text-fg-muted">processarPagamento(valor, cliente)</div>
        </motion.div>
        <Seta i={4} />
        <motion.div {...entrada(5)} className="rounded-xl border-2 border-adapter bg-adapter/10 p-4 text-center">
          <Plug className="mx-auto mb-1 size-6 text-adapter" aria-hidden="true" />
          <div className="font-mono text-sm font-semibold text-adapter">PayPalAdapter</div>
          <div className="mt-1 text-xs text-fg-muted">tradutor</div>
        </motion.div>
        <Seta i={6} />
        <motion.div {...entrada(7)} className="rounded-xl border border-dashed border-fg-subtle/60 bg-surface p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">API externa</div>
          <div className="mt-2 font-mono text-sm">GatewayPayPal</div>
          <div className="mt-1 font-mono text-xs text-fg-muted">sendPayment(amount, customerName)</div>
        </motion.div>
      </div>

      <motion.div {...entrada(8)} className="grid grid-cols-1 [&>*]:min-w-0 gap-4 lg:grid-cols-2">
        <CodeBlock codigo={limparJava(fonteAdapter)} arquivo="adapter/PayPalAdapter.java" cor={PADROES.adapter.cor} destaque={[3, 9, 14]} />
        <CodeBlock codigo={limparJava(fonteGateway)} arquivo="adapter/GatewayPayPal.java (externa)" cor={PADROES.adapter.cor} destaque={[3]} />
      </motion.div>
    </div>
  )
}

// ── 8. Tudo junto ────────────────────────────────────────────────────────

function TudoJunto({ abrirSimulador }: SlideProps) {
  const codigo = limparJava(fonteProcessador)
    // O Javadoc da classe ocupa espaço sem ajudar no slide.
    .replace(/\/\*\*[\s\S]*?\*\/\n/, '')
  const linhas = codigo.split('\n')
  const achar = (trecho: string) => linhas.findIndex((l) => l.includes(trecho)) + 1
  const destaque = [achar('processar(Pagamento'), achar('.definirProximo(clienteValidator)'), achar('PagamentoFactory.criar('), achar('metodoPagamento.pagar(')]
  const [passo, setPasso] = useState(1)

  return (
    <div className="grid grid-cols-1 [&>*]:min-w-0 items-start gap-10 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <Cabecalho rotulo="Tudo junto" titulo="Um orquestrador, quatro padrões">
          O <C>ProcessadorPagamento</C> monta a corrente, valida, pede a estratégia à fábrica e executa. O{' '}
          <C>Main</C> e a API Spring Boot usam a mesma classe.
        </Cabecalho>
        <ol className="-mx-2 space-y-1">
          {(
            [
              ['model', 'Recebe o Pagamento'],
              ['chain', 'Encadeia e executa os validadores'],
              ['factory', 'Obtém a estratégia pelo nome do método'],
              ['strategy', 'Chama pagar() — PayPal passa pelo Adapter'],
            ] as const
          ).map(([p, t], i) => (
            <motion.li key={t} {...entrada(3 + i)}>
              <button
                type="button"
                onClick={() => setPasso(i)}
                aria-pressed={passo === i}
                className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-surface-2 ${passo === i ? 'bg-surface' : ''}`}
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold text-[#0b1120]"
                  style={{ background: PADROES[p].cor }}
                >
                  {i + 1}
                </span>
                <span className={`text-[15px] ${passo === i ? 'text-fg' : 'text-fg-muted'}`}>{t}</span>
              </button>
            </motion.li>
          ))}
        </ol>
        <motion.button
          {...entrada(8)}
          type="button"
          onClick={abrirSimulador}
          className="mt-10 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-lg bg-strategy px-6 text-sm font-bold text-[#0b1120] transition-[filter] hover:brightness-110"
        >
          <Play className="size-4" aria-hidden="true" />
          Executar no simulador
        </motion.button>
      </div>
      <motion.div {...entrada(4)}>
        <CodeBlock codigo={codigo} arquivo="ProcessadorPagamento.java" destaque={destaque} foco={destaque[passo]} />
      </motion.div>
    </div>
  )
}

// ── 9. Conclusão ─────────────────────────────────────────────────────────

function Conclusao({ abrirSimulador }: SlideProps) {
  const linhas: [keyof typeof PADROES, string, string][] = [
    ['strategy', 'Trocar o algoritmo de pagamento', 'Open/Closed · Dependency Inversion'],
    ['factory', 'Centralizar a criação de objetos', 'Single Responsibility'],
    ['chain', 'Validações independentes e reordenáveis', 'Single Responsibility · Open/Closed'],
    ['adapter', 'Integrar API com interface incompatível', 'Interface Segregation · baixo acoplamento'],
  ]
  return (
    <div>
      <Cabecalho rotulo="Conclusão" titulo="Cada padrão resolve um problema real">
        Juntos, deixam o sistema pronto para crescer: um novo meio de pagamento ou uma nova regra de validação
        é uma classe nova — não uma edição arriscada.
      </Cabecalho>
      <div className="overflow-hidden rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-fg-subtle">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Padrão</th>
              <th scope="col" className="px-4 py-3 font-semibold">Problema resolvido</th>
              <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Princípios SOLID</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(([p, problema, solid], i) => (
              <motion.tr key={p} {...entrada(3 + i)} className="border-t border-line">
                <td className="px-4 py-4">
                  <PatternTag padrao={p} />
                </td>
                <td className="px-4 py-4 text-fg">{problema}</td>
                <td className="hidden px-4 py-4 text-fg-muted md:table-cell">{solid}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <motion.div {...entrada(8)} className="mt-10 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={abrirSimulador}
          className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-lg bg-strategy px-6 text-sm font-bold text-[#0b1120] transition-[filter] hover:brightness-110"
        >
          <Play className="size-4" aria-hidden="true" />
          Abrir o simulador
        </button>
        <span className="inline-flex items-center gap-2 text-sm text-fg-subtle">
          <User className="size-4" aria-hidden="true" />
          Thiago Brito
        </span>
      </motion.div>
    </div>
  )
}

export const SLIDES: { titulo: string; componente: ComponentType<SlideProps> }[] = [
  { titulo: 'Capa', componente: Capa },
  { titulo: 'O problema', componente: Problema },
  { titulo: 'Visão geral', componente: Arquitetura },
  { titulo: 'Strategy', componente: Strategy },
  { titulo: 'Factory', componente: FactorySlide },
  { titulo: 'Chain of Responsibility', componente: Chain },
  { titulo: 'Adapter', componente: Adapter },
  { titulo: 'Tudo junto', componente: TudoJunto },
  { titulo: 'Conclusão', componente: Conclusao },
]
