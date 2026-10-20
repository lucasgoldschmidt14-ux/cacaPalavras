import { describe, expect, it } from 'vitest'
import { avaliarPalpite, estadosDoTeclado } from './avaliar'
import type { AvaliacaoLetra } from './tipos'

const estados = (palpite: string, resposta: string) =>
  avaliarPalpite(palpite, resposta).map(({ estado }) => estado)

describe('avaliarPalpite', () => {
  it('marca todas as letras como corretas quando o palpite é a resposta', () => {
    expect(estados('CASA', 'CASA')).toEqual(['correta', 'correta', 'correta', 'correta'])
  })

  it('marca todas como ausentes quando nenhuma letra existe', () => {
    expect(estados('XXXX', 'CASA')).toEqual(['ausente', 'ausente', 'ausente', 'ausente'])
  })

  it('marca letra presente em posição errada como amarela', () => {
    expect(estados('ACAS', 'CASA')).toEqual(['presente', 'presente', 'presente', 'presente'])
  })

  it('resolve letras repetidas em excesso no palpite (ALIBI x LLAMA)', () => {
    expect(estados('LLAMA', 'ALIBI')).toEqual([
      'ausente',
      'correta',
      'presente',
      'ausente',
      'ausente',
    ])
  })

  it('distribui múltiplas ocorrências da mesma letra na resposta', () => {
    expect(estados('ANANAS', 'BANANA')).toEqual([
      'presente',
      'presente',
      'presente',
      'presente',
      'presente',
      'ausente',
    ])
  })

  it('não rebaixa uma letra verde para amarela na mesma tentativa', () => {
    expect(estados('AAXX', 'CASA')).toEqual(['presente', 'correta', 'ausente', 'ausente'])
  })

  it('ignora acentos e maiúsculas', () => {
    expect(estados('café', 'CAFE')).toEqual([
      'correta',
      'correta',
      'correta',
      'correta',
    ])
  })

  it('rejeita palpite com tamanho diferente', () => {
    expect(() => avaliarPalpite('CASA', 'CASAS')).toThrow()
  })
})

describe('estadosDoTeclado', () => {
  it('mantém o melhor estado conhecido de cada letra', () => {
    const mapa = estadosDoTeclado([
      [{ letra: 'R', estado: 'ausente' }],
      [{ letra: 'R', estado: 'presente' }],
      [{ letra: 'R', estado: 'correta' }],
      [{ letra: 'R', estado: 'presente' }],
    ] satisfies AvaliacaoLetra[][])

    expect(mapa.get('R')).toBe('correta')
  })
})
