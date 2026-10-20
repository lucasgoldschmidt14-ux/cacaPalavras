import palpitesBrutos from './palpites.txt?raw'
import respostasBrutas from './respostas.txt?raw'
import { embaralharDeterministico, indiceDoDia } from '../core/diario'
import { TAMANHOS } from '../core/dificuldade'
import { normalizar } from '../core/normalizar'

export interface PalavraResposta {
  /** Com acentos, minúscula. É o que o jogador vê. */
  exibicao: string
  /** Sem acentos, maiúscula. É o que o jogo compara. */
  normalizada: string
  tamanho: number
}

function lerRespostas(bruto: string): PalavraResposta[] {
  return bruto
    .split(/\r?\n/)
    .filter(Boolean)
    .map((linha) => {
      const [exibicao, normalizada] = linha.split('|')
      return {
        exibicao: (exibicao ?? normalizada).toLowerCase(),
        normalizada: normalizada || normalizar(exibicao ?? ''),
        tamanho: (normalizada || exibicao || '').length,
      }
    })
    .filter(({ normalizada }) => /^[A-Z]+$/.test(normalizada))
}

function lerPalpites(bruto: string): Record<number, ReadonlySet<string>> {
  const grupos: Record<number, Set<string>> = { 4: new Set(), 5: new Set(), 6: new Set() }
  for (const linha of bruto.split(/\r?\n/)) {
    const palavra = normalizar(linha)
    if (!palavra) continue
    const grupo = grupos[palavra.length]
    if (grupo) grupo.add(palavra)
  }
  return grupos
}

export const RESPOSTAS: PalavraResposta[] = lerRespostas(respostasBrutas)

export const RESPOSTAS_POR_TAMANHO: Record<number, PalavraResposta[]> = {
  4: RESPOSTAS.filter(({ tamanho }) => tamanho === 4),
  5: RESPOSTAS.filter(({ tamanho }) => tamanho === 5),
  6: RESPOSTAS.filter(({ tamanho }) => tamanho === 6),
}

export const PALPITES_POR_TAMANHO: Record<number, ReadonlySet<string>> = lerPalpites(palpitesBrutos)

// Ordem fixa por tamanho: garante a mesma palavra do dia para todo mundo e
// evita que dias consecutivos caiam em palavras vizinhas no alfabeto.
const ORDEM_DIARIA: Record<number, PalavraResposta[]> = {}
for (const tamanho of TAMANHOS) {
  ORDEM_DIARIA[tamanho] = embaralharDeterministico(RESPOSTAS_POR_TAMANHO[tamanho])
}

export function respostasDe(tamanho: number): PalavraResposta[] {
  return RESPOSTAS_POR_TAMANHO[tamanho] ?? []
}

export function dicionarioDe(tamanho: number): ReadonlySet<string> {
  return PALPITES_POR_TAMANHO[tamanho] ?? new Set<string>()
}

export function palavraDoDia(tamanho: number, dia: string): PalavraResposta {
  const lista = ORDEM_DIARIA[tamanho] ?? []
  if (lista.length === 0) throw new Error(`Sem respostas para ${tamanho} letras.`)
  return lista[indiceDoDia(dia, lista.length)]
}

export function palavraAleatoria(tamanho: number): PalavraResposta {
  const lista = RESPOSTAS_POR_TAMANHO[tamanho] ?? []
  if (lista.length === 0) throw new Error(`Sem respostas para ${tamanho} letras.`)
  return lista[Math.floor(Math.random() * lista.length)]
}

/** Só para testes e depuração. */
export function ordemDiaria(tamanho: number): PalavraResposta[] {
  return [...(ORDEM_DIARIA[tamanho] ?? [])]
}
