import { describe, expect, it } from 'vitest'
import {
  criarEstatisticas,
  maiorDistribuicao,
  normalizarEstatisticas,
  percentualVitorias,
  registrarResultado,
} from './estatisticas'

describe('estatisticas', () => {
  it('começa zerada', () => {
    const stats = criarEstatisticas()
    expect(stats).toEqual({
      jogos: 0,
      vitorias: 0,
      sequenciaAtual: 0,
      recorde: 0,
      distribuicao: {},
    })
    expect(percentualVitorias(stats)).toBe(0)
  })

  it('acumula vitórias, derrota e distribuição', () => {
    let stats = criarEstatisticas()
    stats = registrarResultado(stats, true, 1)
    stats = registrarResultado(stats, true, 3)
    stats = registrarResultado(stats, false, 6)

    expect(stats.jogos).toBe(3)
    expect(stats.vitorias).toBe(2)
    expect(stats.sequenciaAtual).toBe(0)
    expect(stats.recorde).toBe(2)
    expect(stats.distribuicao).toEqual({ '1': 1, '3': 1 })
    expect(percentualVitorias(stats)).toBe(67)
  })

  it('zera a sequência na derrota e mantém o recorde', () => {
    let stats = criarEstatisticas()
    stats = registrarResultado(stats, true, 2)
    stats = registrarResultado(stats, true, 2)
    stats = registrarResultado(stats, false, 6)

    expect(stats.sequenciaAtual).toBe(0)
    expect(stats.recorde).toBe(2)
  })

  it('não muta o objeto original', () => {
    const original = criarEstatisticas()
    registrarResultado(original, true, 1)
    expect(original.jogos).toBe(0)
  })

  it('calcula o maior valor da distribuição', () => {
    expect(maiorDistribuicao({ ...criarEstatisticas(), distribuicao: { '2': 1, '3': 5 } })).toBe(5)
    expect(maiorDistribuicao(criarEstatisticas())).toBe(1)
  })

  it('descarta dados inválidos ao hidratar', () => {
    expect(normalizarEstatisticas(null)).toEqual(criarEstatisticas())
    expect(normalizarEstatisticas({ jogos: 'x', distribuicao: { a: 1, '3': 2 } })).toEqual({
      jogos: 0,
      vitorias: 0,
      sequenciaAtual: 0,
      recorde: 0,
      distribuicao: { '3': 2 },
    })
  })
})
