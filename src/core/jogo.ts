import { todasCorretas, avaliarPalpite } from './avaliar'
import { normalizar } from './normalizar'
import type { Configuracao, Modo, Partida } from './tipos'

export type ErroPalpite = 'curta' | 'longa' | 'invalida' | 'dificil' | 'encerrada'

export const MENSAGENS_ERRO: Record<ErroPalpite, string> = {
  curta: 'Faltam letras para completar a palavra.',
  longa: 'A palavra é maior que o tabuleiro.',
  invalida: 'Essa palavra não está no dicionário.',
  dificil: 'Modo difícil: use as letras já reveladas.',
  encerrada: 'Esta partida já terminou.',
}

export interface ResultadoPalpite {
  partida: Partida
  erro: ErroPalpite | null
}

export function criarPartida(
  modo: Modo,
  config: Configuracao,
  respostaExibicao: string,
  dia: string | null = null,
  replay = false,
): Partida {
  const normalizada = normalizar(respostaExibicao)
  const identificador =
    modo === 'diario'
      ? `diario:${dia}:${config.tamanho}`
      : `livre:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`

  return {
    id: identificador,
    modo,
    dia,
    replay,
    tamanho: config.tamanho,
    tentativas: config.tentativas,
    resposta: respostaExibicao.toLowerCase(),
    respostaNormalizada: normalizada,
    palpites: [],
    avaliacoes: [],
    fase: 'jogando',
    modoDificil: config.modoDificil,
  }
}

function violaModoDificil(partida: Partida, palpite: string): boolean {
  if (!partida.modoDificil) return false
  const anterior = partida.avaliacoes.at(-1)
  if (!anterior) return false

  const verdes = anterior
    .map((avaliacao, indice) => ({ ...avaliacao, indice }))
    .filter(({ estado }) => estado === 'correta')

  if (verdes.length > 0) {
    return verdes.some(({ letra, indice }) => palpite[indice] !== letra)
  }

  const amarelas = new Set(
    anterior.filter(({ estado }) => estado === 'presente').map(({ letra }) => letra),
  )
  if (amarelas.size === 0) return false
  return ![...amarelas].some((letra) => palpite.includes(letra))
}

/**
 * Aplica um palpite. Nunca muta a partida recebida.
 * Palpites inválidos não consomem tentativa e não alteram o estado.
 */
export function aplicarPalpite(
  partida: Partida,
  palpiteBruto: string,
  dicionario: ReadonlySet<string>,
): ResultadoPalpite {
  if (partida.fase !== 'jogando') {
    return { partida, erro: 'encerrada' }
  }

  const palpite = normalizar(palpiteBruto)

  if (palpite.length < partida.tamanho) return { partida, erro: 'curta' }
  if (palpite.length > partida.tamanho) return { partida, erro: 'longa' }
  if (!dicionario.has(palpite)) return { partida, erro: 'invalida' }
  if (violaModoDificil(partida, palpite)) return { partida, erro: 'dificil' }

  const avaliacao = avaliarPalpite(palpite, partida.respostaNormalizada)
  const avaliacoes = [...partida.avaliacoes, avaliacao]
  const venceu = todasCorretas(avaliacao)
  const esgotou = avaliacoes.length >= partida.tentativas

  return {
    partida: {
      ...partida,
      palpites: [...partida.palpites, palpite],
      avaliacoes,
      fase: venceu ? 'vitoria' : esgotou ? 'derrota' : 'jogando',
    },
    erro: null,
  }
}

/** Palavra exibida no fim: mantém acentos. */
export function respostaExibida(partida: Partida): string {
  return partida.resposta
}

/** Aplica acentos nas letras verdes para exibir o palpite bonito no tabuleiro. */
export function exibirPalpite(
  palpiteNormalizado: string,
  respostaExibicao: string,
  avaliacao: { estado: string }[],
): string[] {
  const letrasResposta = Array.from(respostaExibicao.toUpperCase())
  return Array.from(palpiteNormalizado, (letra, indice) =>
    avaliacao[indice]?.estado === 'correta' && letrasResposta[indice]
      ? letrasResposta[indice]
      : letra,
  )
}
