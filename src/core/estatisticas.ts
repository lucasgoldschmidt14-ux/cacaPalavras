export interface Estatisticas {
  jogos: number
  vitorias: number
  sequenciaAtual: number
  recorde: number
  /** Quantas vitórias foram obtidas em cada número de tentativas. */
  distribuicao: Record<string, number>
}

export function criarEstatisticas(): Estatisticas {
  return {
    jogos: 0,
    vitorias: 0,
    sequenciaAtual: 0,
    recorde: 0,
    distribuicao: {},
  }
}

export function registrarResultado(
  estatisticas: Estatisticas,
  venceu: boolean,
  tentativasUsadas: number,
): Estatisticas {
  const sequenciaAtual = venceu ? estatisticas.sequenciaAtual + 1 : 0
  const distribuicao = { ...estatisticas.distribuicao }

  if (venceu) {
    const chave = String(tentativasUsadas)
    distribuicao[chave] = (distribuicao[chave] ?? 0) + 1
  }

  return {
    jogos: estatisticas.jogos + 1,
    vitorias: estatisticas.vitorias + (venceu ? 1 : 0),
    sequenciaAtual,
    recorde: Math.max(estatisticas.recorde, sequenciaAtual),
    distribuicao,
  }
}

export function percentualVitorias(estatisticas: Estatisticas): number {
  if (estatisticas.jogos === 0) return 0
  return Math.round((estatisticas.vitorias / estatisticas.jogos) * 100)
}

export function maiorDistribuicao(estatisticas: Estatisticas): number {
  return Math.max(1, ...Object.values(estatisticas.distribuicao))
}

/** Protege contra dados antigos/corrompidos no armazenamento local. */
export function normalizarEstatisticas(valor: unknown): Estatisticas {
  if (!valor || typeof valor !== 'object') return criarEstatisticas()
  const bruto = valor as Partial<Estatisticas>
  const numero = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : 0)

  const distribuicao: Record<string, number> = {}
  if (bruto.distribuicao && typeof bruto.distribuicao === 'object') {
    for (const [chave, quantidade] of Object.entries(bruto.distribuicao)) {
      if (/^\d+$/.test(chave) && typeof quantidade === 'number' && quantidade > 0) {
        distribuicao[chave] = quantidade
      }
    }
  }

  return {
    jogos: numero(bruto.jogos),
    vitorias: numero(bruto.vitorias),
    sequenciaAtual: numero(bruto.sequenciaAtual),
    recorde: numero(bruto.recorde),
    distribuicao,
  }
}
