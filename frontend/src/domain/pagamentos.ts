// Porte em TypeScript do código Java em src/main/java/com/thiago/pagamentos.
// A estrutura (classes, nomes e mensagens) espelha o original. Serve de
// alternativa quando a API Spring Boot não está rodando: o Console abaixo faz
// o papel da classe Saida e gera as mesmas linhas que a API devolve.

export type Padrao = 'model' | 'chain' | 'factory' | 'strategy' | 'adapter' | 'sistema'

export type NivelLog = 'info' | 'sucesso' | 'erro'

export interface LinhaLog {
  padrao: Padrao
  origem: string
  mensagem: string
  nivel: NivelLog
}

export class Console {
  readonly linhas: LinhaLog[] = []

  log(padrao: Padrao, origem: string, mensagem: string) {
    // Mesma regra de LinhaSaida.java
    const nivel: NivelLog = mensagem.startsWith('✓')
      ? 'sucesso'
      : mensagem.startsWith('✗') || mensagem.startsWith('Motivo:')
        ? 'erro'
        : 'info'
    this.linhas.push({ padrao, origem, mensagem, nivel })
  }
}

const brl = (valor: number) =>
  valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// ── model ────────────────────────────────────────────────────────────────

export type CodigoMetodo = 'PIX' | 'CARTAO' | 'BOLETO' | 'PAYPAL'

export class Pagamento {
  readonly cliente: string
  readonly valor: number
  readonly metodo: string

  constructor(cliente: string, valor: number, metodo: string) {
    this.cliente = cliente
    this.valor = valor
    this.metodo = metodo
  }

  toString() {
    return `Pagamento{cliente='${this.cliente}', valor=${this.valor.toFixed(1)}, metodo='${this.metodo}'}`
  }
}

// ── chain ────────────────────────────────────────────────────────────────

export abstract class ValidadorPagamento {
  private proximo?: ValidadorPagamento
  protected readonly console: Console

  constructor(console: Console) {
    this.console = console
  }

  definirProximo(proximo: ValidadorPagamento): ValidadorPagamento {
    this.proximo = proximo
    return proximo
  }

  validar(pagamento: Pagamento): void {
    this.validarAtual(pagamento)
    this.proximo?.validar(pagamento)
  }

  protected abstract validarAtual(pagamento: Pagamento): void
}

export class ValorValidator extends ValidadorPagamento {
  protected validarAtual(pagamento: Pagamento) {
    if (pagamento.valor <= 0) {
      throw new Error('O valor do pagamento deve ser maior que zero.')
    }
    this.console.log('chain', 'ValorValidator', '✓ Valor validado.')
  }
}

export class ClienteValidator extends ValidadorPagamento {
  protected validarAtual(pagamento: Pagamento) {
    if (!pagamento.cliente || pagamento.cliente.trim() === '') {
      throw new Error('Cliente não informado.')
    }
    this.console.log('chain', 'ClienteValidator', '✓ Cliente validado.')
  }
}

export class SaldoValidator extends ValidadorPagamento {
  private readonly saldoDisponivel: number

  constructor(console: Console, saldoDisponivel: number) {
    super(console)
    this.saldoDisponivel = saldoDisponivel
  }

  protected validarAtual(pagamento: Pagamento) {
    if (pagamento.valor > this.saldoDisponivel) {
      throw new Error(`Saldo insuficiente. Saldo disponível: R$ ${brl(this.saldoDisponivel)}`)
    }
    this.console.log('chain', 'SaldoValidator', '✓ Saldo validado.')
  }
}

// ── adapter ──────────────────────────────────────────────────────────────

/** API externa com interface incompatível (inglês, ordem de parâmetros diferente). */
export class GatewayPayPal {
  private readonly console: Console

  constructor(console: Console) {
    this.console = console
  }

  sendPayment(amount: number, customerName: string) {
    this.console.log('adapter', 'GatewayPayPal', 'Conectando ao gateway externo do PayPal...')
    this.console.log(
      'adapter',
      'GatewayPayPal',
      `PayPal: pagamento de USD ${brl(amount)} processado para ${customerName}.`,
    )
    this.console.log('adapter', 'GatewayPayPal', 'Pagamento aprovado pelo PayPal.')
  }
}

export class PayPalAdapter {
  private readonly gateway: GatewayPayPal

  constructor(console: Console) {
    this.gateway = new GatewayPayPal(console)
  }

  processarPagamento(valor: number, cliente: string) {
    this.gateway.sendPayment(valor, cliente)
  }
}

// ── strategy ─────────────────────────────────────────────────────────────

export interface MetodoPagamento {
  pagar(pagamento: Pagamento): void
}

export class PagamentoPix implements MetodoPagamento {
  private readonly console: Console
  constructor(console: Console) {
    this.console = console
  }
  pagar(pagamento: Pagamento) {
    this.console.log('strategy', 'PagamentoPix', 'Processando pagamento via PIX...')
    this.console.log(
      'strategy',
      'PagamentoPix',
      `PIX de R$ ${brl(pagamento.valor)} realizado para ${pagamento.cliente}.`,
    )
  }
}

export class PagamentoCartao implements MetodoPagamento {
  private readonly console: Console
  constructor(console: Console) {
    this.console = console
  }
  pagar(pagamento: Pagamento) {
    this.console.log('strategy', 'PagamentoCartao', 'Processando pagamento via cartão...')
    this.console.log(
      'strategy',
      'PagamentoCartao',
      `Pagamento de R$ ${brl(pagamento.valor)} realizado no cartão para ${pagamento.cliente}.`,
    )
  }
}

export class PagamentoBoleto implements MetodoPagamento {
  private readonly console: Console
  constructor(console: Console) {
    this.console = console
  }
  pagar(pagamento: Pagamento) {
    const codigo = '34191.79001 01043.510047 91020.150008 1'
    this.console.log('strategy', 'PagamentoBoleto', 'Gerando boleto...')
    this.console.log('strategy', 'PagamentoBoleto', 'Boleto gerado com sucesso.')
    this.console.log('strategy', 'PagamentoBoleto', `Código: ${codigo}`)
    this.console.log('strategy', 'PagamentoBoleto', `Valor: R$ ${brl(pagamento.valor)}`)
  }
}

export class PagamentoPayPal implements MetodoPagamento {
  private readonly console: Console
  private readonly payPalAdapter: PayPalAdapter
  constructor(console: Console) {
    this.console = console
    this.payPalAdapter = new PayPalAdapter(console)
  }
  pagar(pagamento: Pagamento) {
    this.console.log('strategy', 'PagamentoPayPal', 'Processando pagamento via PayPal...')
    this.payPalAdapter.processarPagamento(pagamento.valor, pagamento.cliente)
  }
}

// ── factory ──────────────────────────────────────────────────────────────

export const PagamentoFactory = {
  criar(metodo: string, console: Console): MetodoPagamento {
    if (!metodo || metodo.trim() === '') {
      throw new Error('Método de pagamento não informado.')
    }

    let estrategia: MetodoPagamento
    let classe: string
    switch (metodo.toUpperCase()) {
      case 'PIX':
        estrategia = new PagamentoPix(console)
        classe = 'PagamentoPix'
        break
      case 'CARTAO':
        estrategia = new PagamentoCartao(console)
        classe = 'PagamentoCartao'
        break
      case 'BOLETO':
        estrategia = new PagamentoBoleto(console)
        classe = 'PagamentoBoleto'
        break
      case 'PAYPAL':
        estrategia = new PagamentoPayPal(console)
        classe = 'PagamentoPayPal'
        break
      default:
        throw new Error(`Método de pagamento inválido: ${metodo}`)
    }

    // Nome explícito: constructor.name não sobrevive à minificação do build.
    console.log('factory', 'PagamentoFactory', `criar("${metodo}") → new ${classe}()`)
    return estrategia
  },
}

// ── ProcessadorPagamento ─────────────────────────────────────────────────────────────────

export interface ResultadoExecucao {
  aprovado: boolean
  motivo?: string
  /** Etapa em que a execução parou (útil para destacar na UI). */
  falhouEm?: string
  linhas: LinhaLog[]
}

export const ETAPAS = ['ValorValidator', 'ClienteValidator', 'SaldoValidator', 'PagamentoFactory'] as const

export function processarPagamento(pagamento: Pagamento, saldoDisponivel: number): ResultadoExecucao {
  const console = new Console()

  console.log('sistema', 'ProcessadorPagamento', 'Pagamento solicitado:')
  console.log('sistema', 'ProcessadorPagamento', pagamento.toString())

  const valorValidator = new ValorValidator(console)
  const clienteValidator = new ClienteValidator(console)
  const saldoValidator = new SaldoValidator(console, saldoDisponivel)

  valorValidator.definirProximo(clienteValidator).definirProximo(saldoValidator)

  try {
    console.log('sistema', 'ProcessadorPagamento', 'Validando pagamento...')
    valorValidator.validar(pagamento)
    console.log('sistema', 'ProcessadorPagamento', '✓ Todas as validações foram aprovadas.')

    const metodoPagamento = PagamentoFactory.criar(pagamento.metodo, console)

    console.log('sistema', 'ProcessadorPagamento', 'Processando pagamento...')
    metodoPagamento.pagar(pagamento)

    console.log('sistema', 'ProcessadorPagamento', '✓ Pagamento concluído com sucesso!')
    return { aprovado: true, linhas: console.linhas }
  } catch (e) {
    const motivo = e instanceof Error ? e.message : String(e)
    console.log('sistema', 'ProcessadorPagamento', '✗ Pagamento recusado.')
    console.log('sistema', 'ProcessadorPagamento', `Motivo: ${motivo}`)
    // A primeira etapa que não chegou a registrar nada é onde a execução parou.
    const falhouEm = ETAPAS.find((etapa) => !console.linhas.some((l) => l.origem === etapa))
    return { aprovado: false, motivo, falhouEm, linhas: console.linhas }
  }
}
