import { normalizarEstatisticas, type Estatisticas } from './core/estatisticas'
import type { AvaliacaoLetra, Fase, Modo, Partida, ResultadoDia } from './core/tipos'
import { TAMANHOS } from './core/dificuldade'

export interface Preferencias {
  tamanho: number
  modoDificil: boolean
}

export interface EstadoApp {
  partida: Partida | null
  statsDiario: Estatisticas
  statsLivre: Estatisticas
  historico: Record<string, ResultadoDia>
  prefs: Preferencias
}

export const PREFERENCIAS_INICIAIS: Preferencias = {
  tamanho: 5,
  modoDificil: false,
}

export const ESTADO_INICIAL: EstadoApp = {
  partida: null,
  statsDiario: normalizarEstatisticas(null),
  statsLivre: normalizarEstatisticas(null),
  historico: {},
  prefs: PREFERENCIAS_INICIAIS,
}

const MODOS: Modo[] = ['diario', 'ilimitado']
const FASES: Fase[] = ['jogando', 'vitoria', 'derrota']

function normalizarAvaliacoes(valor: unknown): AvaliacaoLetra[][] {
  if (!Array.isArray(valor)) return []
  return valor
    .filter(Array.isArray)
    .map((linha) =>
      (linha as unknown[])
        .filter(
          (item): item is AvaliacaoLetra =>
            !!item &&
            typeof item === 'object' &&
            typeof (item as AvaliacaoLetra).letra === 'string' &&
            ['correta', 'presente', 'ausente'].includes((item as AvaliacaoLetra).estado),
        )
        .map(({ letra, estado }) => ({ letra, estado })),
    )
    .filter((linha) => linha.length > 0)
}

export function normalizarPartida(valor: unknown): Partida | null {
  if (!valor || typeof valor !== 'object') return null
  const p = valor as Partial<Partida>

  if (!MODOS.includes(p.modo as Modo)) return null
  if (!FASES.includes(p.fase as Fase)) return null
  if (typeof p.tamanho !== 'number' || !TAMANHOS.includes(p.tamanho as 4 | 5 | 6)) return null
  if (typeof p.tentativas !== 'number' || p.tentativas < 3 || p.tentativas > 10) return null
  if (typeof p.resposta !== 'string' || typeof p.respostaNormalizada !== 'string') return null
  if (p.respostaNormalizada.length !== p.tamanho) return null
  if (!Array.isArray(p.palpites)) return null

  return {
    id: typeof p.id === 'string' ? p.id : `restaurada:${Date.now()}`,
    modo: p.modo as Modo,
    dia: typeof p.dia === 'string' ? p.dia : null,
    replay: Boolean(p.replay),
    tamanho: p.tamanho,
    tentativas: p.tentativas,
    resposta: p.resposta,
    respostaNormalizada: p.respostaNormalizada,
    palpites: p.palpites.filter((palpite): palpite is string => typeof palpite === 'string'),
    avaliacoes: normalizarAvaliacoes(p.avaliacoes),
    fase: p.fase as Fase,
    modoDificil: Boolean(p.modoDificil),
  }
}

function normalizarHistorico(valor: unknown): Record<string, ResultadoDia> {
  if (!valor || typeof valor !== 'object') return {}
  const historico: Record<string, ResultadoDia> = {}

  for (const [dia, item] of Object.entries(valor as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) continue
    if (!item || typeof item !== 'object') continue
    const r = item as Partial<ResultadoDia>
    if (typeof r.resposta !== 'string' || typeof r.respostaNormalizada !== 'string') continue
    if (typeof r.tamanho !== 'number' || typeof r.tentativas !== 'number') continue

    historico[dia] = {
      dia,
      resposta: r.resposta,
      respostaNormalizada: r.respostaNormalizada,
      tamanho: r.tamanho,
      tentativas: r.tentativas,
      usadas: typeof r.usadas === 'number' ? r.usadas : 0,
      venceu: Boolean(r.venceu),
      jogadoEm: typeof r.jogadoEm === 'number' ? r.jogadoEm : 0,
      avaliacoes: normalizarAvaliacoes(r.avaliacoes),
      palpites: Array.isArray(r.palpites)
        ? r.palpites.filter((palpite): palpite is string => typeof palpite === 'string')
        : [],
    }
  }

  return historico
}

function normalizarPreferencias(valor: unknown): Preferencias {
  if (!valor || typeof valor !== 'object') return PREFERENCIAS_INICIAIS
  const p = valor as Partial<Preferencias>
  return {
    tamanho:
      typeof p.tamanho === 'number' && TAMANHOS.includes(p.tamanho as 4 | 5 | 6)
        ? p.tamanho
        : PREFERENCIAS_INICIAIS.tamanho,
    modoDificil: Boolean(p.modoDificil),
  }
}

export function normalizarEstado(valor: unknown): EstadoApp {
  if (!valor || typeof valor !== 'object') return ESTADO_INICIAL
  const bruto = valor as Partial<EstadoApp>
  return {
    partida: normalizarPartida(bruto.partida),
    statsDiario: normalizarEstatisticas(bruto.statsDiario),
    statsLivre: normalizarEstatisticas(bruto.statsLivre),
    historico: normalizarHistorico(bruto.historico),
    prefs: normalizarPreferencias(bruto.prefs),
  }
}
