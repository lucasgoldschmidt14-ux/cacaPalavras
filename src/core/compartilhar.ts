import type { AvaliacaoLetra, EstadoLetra } from './tipos'

const BLOCO: Record<EstadoLetra, string> = {
  correta: '🟩',
  presente: '🟨',
  ausente: '⬛',
}

export interface DadosResultado {
  avaliacoes: AvaliacaoLetra[][]
  tentativas: number
  venceu: boolean
  sequencia: number
  tamanho: number
}

/** Monta a grade de quadrados (sem revelar a palavra). */
export function gerarGrade(avaliacoes: AvaliacaoLetra[][]): string {
  return avaliacoes
    .map((linha) => linha.map(({ estado }) => BLOCO[estado]).join(''))
    .join('\n')
}

/**
 * Texto final para compartilhar, no estilo Wordle:
 *
 *   cacaPalavras 4/6
 *   ⬛🟨⬛⬛⬛
 *   🟩🟩🟩🟩🟩
 *   🔥 12
 */
export function gerarTextoResultado({
  avaliacoes,
  tentativas,
  venceu,
  sequencia,
  tamanho,
}: DadosResultado): string {
  const placar = venceu ? `${avaliacoes.length}/${tentativas}` : `X/${tentativas}`
  const linhas = [`cacaPalavras ${placar}`, `${tamanho} letras`, '', gerarGrade(avaliacoes)]

  if (sequencia > 0) {
    linhas.push('', `🔥 ${sequencia}`)
  }

  return linhas.join('\n')
}
