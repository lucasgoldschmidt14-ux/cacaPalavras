import type { AvaliacaoLetra, EstadoLetra } from './tipos'
import { normalizar } from './normalizar'

const PESO: Record<EstadoLetra, number> = {
  ausente: 0,
  presente: 1,
  correta: 2,
}

/**
 * Avalia um palpite contra a palavra secreta.
 *
 * Regras:
 * 1. Letras na posição correta são marcadas como "correta" (verde) e consomem
 *    uma ocorrência da letra na resposta.
 * 2. As demais letras são marcadas como "presente" (amarelo) enquanto houver
 *    ocorrências disponíveis na resposta — cada ocorrência é consumida uma vez.
 * 3. O restante é "ausente" (cinza).
 *
 * Isso resolve corretamente o caso clássico de letras repetidas:
 *   avaliarPalpite('LLAMA', 'ALIBI')
 *   -> L cinza, L verde, A amarelo, M cinza, A cinza
 */
export function avaliarPalpite(palpite: string, resposta: string): AvaliacaoLetra[] {
  const p = normalizar(palpite)
  const r = normalizar(resposta)

  if (p.length !== r.length) {
    throw new Error(`Palpite e resposta devem ter o mesmo tamanho (${p.length} e ${r.length}).`)
  }

  const resultado: AvaliacaoLetra[] = Array.from(p, (letra) => ({
    letra,
    estado: 'ausente' as EstadoLetra,
  }))

  const disponiveis = new Map<string, number>()

  for (let i = 0; i < p.length; i++) {
    if (p[i] === r[i]) {
      resultado[i].estado = 'correta'
    } else {
      disponiveis.set(r[i], (disponiveis.get(r[i]) ?? 0) + 1)
    }
  }

  for (let i = 0; i < p.length; i++) {
    if (resultado[i].estado === 'correta') continue
    const restantes = disponiveis.get(p[i]) ?? 0
    if (restantes > 0) {
      resultado[i].estado = 'presente'
      disponiveis.set(p[i], restantes - 1)
    }
  }

  return resultado
}

/** Resume o melhor estado conhecido de cada letra para pintar o teclado. */
export function estadosDoTeclado(
  avaliacoes: AvaliacaoLetra[][],
): Map<string, EstadoLetra> {
  const estados = new Map<string, EstadoLetra>()
  for (const linha of avaliacoes) {
    for (const { letra, estado } of linha) {
      const atual = estados.get(letra)
      if (!atual || PESO[estado] > PESO[atual]) {
        estados.set(letra, estado)
      }
    }
  }
  return estados
}

/** Compara duas avaliações posição a posição. Usado nos testes e no modo difícil. */
export function todasCorretas(avaliacao: AvaliacaoLetra[]): boolean {
  return avaliacao.every(({ estado }) => estado === 'correta')
}
