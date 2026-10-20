import type { Configuracao } from './tipos'

export const TAMANHOS = [4, 5, 6] as const

export type Tamanho = (typeof TAMANHOS)[number]

/**
 * Tentativas por tamanho de palavra. Menos tentativas para palavras maiores.
 * O modo difícil continua opcional e independente.
 */
export function tentativasParaTamanho(tamanho: number): number {
  if (tamanho <= 4) return 6
  if (tamanho === 5) return 6
  return 5
}

export interface Preset {
  id: 'facil' | 'normal' | 'dificil'
  nome: string
  tamanho: Tamanho
  descricao: string
}

export const PRESETS: Preset[] = [
  { id: 'facil', nome: 'Fácil', tamanho: 4, descricao: '4 letras · 6 tentativas' },
  { id: 'normal', nome: 'Normal', tamanho: 5, descricao: '5 letras · 6 tentativas' },
  { id: 'dificil', nome: 'Difícil', tamanho: 6, descricao: '6 letras · 5 tentativas' },
]

export function presetPorTamanho(tamanho: number): Preset {
  return PRESETS.find((p) => p.tamanho === tamanho) ?? PRESETS[1]
}

export function criarConfiguracao(tamanho: number, modoDificil: boolean): Configuracao {
  return {
    tamanho,
    tentativas: tentativasParaTamanho(tamanho),
    modoDificil,
  }
}

export function configuracaoValida(config: Configuracao): boolean {
  return (
    TAMANHOS.includes(config.tamanho as Tamanho) &&
    Number.isInteger(config.tentativas) &&
    config.tentativas >= 3 &&
    config.tentativas <= 10
  )
}
