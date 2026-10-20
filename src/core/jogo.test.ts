import { describe, expect, it } from 'vitest'
import { aplicarPalpite, criarPartida, exibirPalpite } from './jogo'
import type { Configuracao } from './tipos'

const dicionario = new Set([
  'CASA',
  'CASAS',
  'CARTA',
  'CARRO',
  'CASAL',
  'TERMO',
  'TREMO',
  'TREVO',
  'ALIBI',
  'LLAMA',
  'ACOES',
])

const config = (modoDificil = false): Configuracao => ({
  tamanho: 5,
  tentativas: 3,
  modoDificil,
})

describe('criarPartida', () => {
  it('normaliza a resposta e começa em jogo', () => {
    const partida = criarPartida('ilimitado', config(), 'Ações')

    expect(partida.resposta).toBe('ações')
    expect(partida.respostaNormalizada).toBe('ACOES')
    expect(partida.fase).toBe('jogando')
    expect(partida.avaliacoes).toEqual([])
  })

  it('usa a data como identificador no modo diário', () => {
    const partida = criarPartida('diario', config(), 'carta', '2026-10-20')
    expect(partida.id).toContain('2026-10-20')
    expect(partida.dia).toBe('2026-10-20')
  })
})

describe('aplicarPalpite', () => {
  it('aceita palpite válido e registra a tentativa', () => {
    const partida = criarPartida('ilimitado', config(), 'carta')
    const { partida: nova, erro } = aplicarPalpite(partida, 'termo', dicionario)

    expect(erro).toBeNull()
    expect(nova.palpites).toEqual(['TERMO'])
    expect(nova.avaliacoes).toHaveLength(1)
    expect(nova.fase).toBe('jogando')
  })

  it('rejeita palpite inexistente sem consumir tentativa', () => {
    const partida = criarPartida('ilimitado', config(), 'carta')
    const resultado = aplicarPalpite(partida, 'zzzzz', dicionario)

    expect(resultado.erro).toBe('invalida')
    expect(resultado.partida).toBe(partida)
    expect(resultado.partida.palpites).toHaveLength(0)
  })

  it('rejeita palavra curta ou longa', () => {
    const partida = criarPartida('ilimitado', config(), 'carta')
    expect(aplicarPalpite(partida, 'casa', dicionario).erro).toBe('curta')
    expect(aplicarPalpite(partida, 'casasas', dicionario).erro).toBe('longa')
  })

  it('vence ao acertar a palavra, mesmo com acentos', () => {
    const partida = criarPartida('ilimitado', config(), 'ações')
    const { partida: nova, erro } = aplicarPalpite(partida, 'acoes', dicionario)

    expect(erro).toBeNull()
    expect(nova.fase).toBe('vitoria')
  })

  it('perde ao esgotar as tentativas', () => {
    let partida = criarPartida('ilimitado', config(), 'carta')
    for (const palpite of ['TERMO', 'TREMO', 'TREVO']) {
      partida = aplicarPalpite(partida, palpite, dicionario).partida
    }

    expect(partida.avaliacoes).toHaveLength(3)
    expect(partida.fase).toBe('derrota')
  })

  it('não aceita palpites depois do fim', () => {
    const partida = criarPartida('ilimitado', config(), 'carta')
    const vitoria = aplicarPalpite(partida, 'carta', dicionario).partida
    expect(aplicarPalpite(vitoria, 'termo', dicionario).erro).toBe('encerrada')
  })

  it('não muta a partida original', () => {
    const partida = criarPartida('ilimitado', config(), 'carta')
    aplicarPalpite(partida, 'termo', dicionario)
    expect(partida.palpites).toHaveLength(0)
    expect(partida.avaliacoes).toHaveLength(0)
  })
})

describe('modo difícil', () => {
  it('exige manter as letras verdes na posição', () => {
    let partida = criarPartida('ilimitado', config(true), 'carta')
    partida = aplicarPalpite(partida, 'carro', dicionario).partida

    expect(aplicarPalpite(partida, 'casal', dicionario).erro).toBe('dificil')
    expect(aplicarPalpite(partida, 'carta', dicionario).erro).toBeNull()
  })

  it('sem letras verdes, exige reutilizar ao menos uma amarela', () => {
    const partida = criarPartida('ilimitado', config(true), 'carta')
    const primeira = aplicarPalpite(partida, 'tremo', dicionario).partida

    expect(aplicarPalpite(primeira, 'casal', dicionario).erro).toBe('dificil')
    expect(aplicarPalpite(primeira, 'trevo', dicionario).erro).toBeNull()
  })

  it('não restringe a primeira tentativa', () => {
    const partida = criarPartida('ilimitado', config(true), 'carta')
    expect(aplicarPalpite(partida, 'termo', dicionario).erro).toBeNull()
  })
})

describe('exibirPalpite', () => {
  it('recupera acentos nas letras verdes', () => {
    const avaliacao = [
      { letra: 'C', estado: 'correta' as const },
      { letra: 'A', estado: 'correta' as const },
      { letra: 'F', estado: 'correta' as const },
      { letra: 'E', estado: 'correta' as const },
    ]

    expect(exibirPalpite('CAFE', 'café', avaliacao)).toEqual(['C', 'A', 'F', 'É'])
  })

  it('mantém a letra digitada nas posições sem acerto', () => {
    const avaliacao = [
      { letra: 'C', estado: 'correta' as const },
      { letra: 'A', estado: 'presente' as const },
      { letra: 'F', estado: 'ausente' as const },
      { letra: 'E', estado: 'ausente' as const },
    ]

    expect(exibirPalpite('CAFE', 'café', avaliacao)).toEqual(['C', 'A', 'F', 'E'])
  })
})
