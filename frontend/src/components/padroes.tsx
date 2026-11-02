import { Banknote, Barcode, Boxes, Cable, CreditCard, Factory, Globe, Link2, QrCode, type LucideIcon } from 'lucide-react'
import type { CodigoMetodo, Padrao } from '../domain/pagamentos'

export interface InfoPadrao {
  nome: string
  categoria: string
  cor: string
  icone: LucideIcon
  pacote: string
}

export const PADROES: Record<Exclude<Padrao, 'sistema'>, InfoPadrao> = {
  chain: {
    nome: 'Chain of Responsibility',
    categoria: 'Comportamental',
    cor: 'var(--color-chain)',
    icone: Link2,
    pacote: 'chain',
  },
  factory: {
    nome: 'Factory',
    categoria: 'Criacional',
    cor: 'var(--color-factory)',
    icone: Factory,
    pacote: 'factory',
  },
  strategy: {
    nome: 'Strategy',
    categoria: 'Comportamental',
    cor: 'var(--color-strategy)',
    icone: Boxes,
    pacote: 'strategy',
  },
  adapter: {
    nome: 'Adapter',
    categoria: 'Estrutural',
    cor: 'var(--color-adapter)',
    icone: Cable,
    pacote: 'adapter',
  },
  model: {
    nome: 'Model',
    categoria: 'Domínio',
    cor: 'var(--color-model)',
    icone: Banknote,
    pacote: 'model',
  },
}

export const METODOS: { codigo: CodigoMetodo; nome: string; classe: string; icone: LucideIcon }[] = [
  { codigo: 'PIX', nome: 'PIX', classe: 'PagamentoPix', icone: QrCode },
  { codigo: 'CARTAO', nome: 'Cartão', classe: 'PagamentoCartao', icone: CreditCard },
  { codigo: 'BOLETO', nome: 'Boleto', classe: 'PagamentoBoleto', icone: Barcode },
  { codigo: 'PAYPAL', nome: 'PayPal', classe: 'PagamentoPayPal', icone: Globe },
]

export function PatternTag({ padrao, className = '' }: { padrao: keyof typeof PADROES; className?: string }) {
  const p = PADROES[padrao]
  const Icone = p.icone
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${className}`}
      style={{
        color: p.cor,
        borderColor: `color-mix(in srgb, ${p.cor} 35%, transparent)`,
        background: `color-mix(in srgb, ${p.cor} 10%, transparent)`,
      }}
    >
      <Icone className="size-3.5" aria-hidden="true" />
      {p.nome}
    </span>
  )
}
