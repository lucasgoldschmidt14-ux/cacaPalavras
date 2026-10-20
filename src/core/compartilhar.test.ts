import { describe, expect, it } from 'vitest'
import { gerarGrade, gerarTextoResultado } from './compartilhar'
import type { AvaliacaoLetra } from './tipos'

const linha = (...estados: AvaliacaoLetra['estado'][]): AvaliacaoLetra[] =>
  estados.map((estado, indice) => ({ letra: 'ABCDE'[indice], estado }))

describe('gerarGrade', () => {
  it('converte os estados em quadrados', () => {
    expect(
      gerarGrade([linha('ausente', 'presente', 'correta'), linha('correta', 'correta', 'correta')]),
    ).toBe('⬛🟨🟩\n🟩🟩🟩')
  })
})

describe('gerarTextoResultado', () => {
  it('monta o texto de vitória com streak', () => {
    const texto = gerarTextoResultado({
      avaliacoes: [linha('ausente', 'presente', 'correta')],
      tentativas: 6,
      venceu: true,
      sequencia: 12,
      tamanho: 5,
    })

    expect(texto).toContain('cacaPalavras 1/6')
    expect(texto).toContain('5 letras')
    expect(texto).toContain('⬛🟨🟩')
    expect(texto).toContain('🔥 12')
  })

  it('usa X quando o jogador perde', () => {
    const texto = gerarTextoResultado({
      avaliacoes: [linha('ausente', 'ausente', 'ausente')],
      tentativas: 4,
      venceu: false,
      sequencia: 0,
      tamanho: 4,
    })

    expect(texto).toContain('cacaPalavras X/4')
    expect(texto).not.toContain('🔥')
  })

  it('nunca revela a palavra', () => {
    const texto = gerarTextoResultado({
      avaliacoes: [linha('correta', 'correta', 'correta')],
      tentativas: 6,
      venceu: true,
      sequencia: 1,
      tamanho: 5,
    })

    expect(texto).not.toContain('CASA')
    expect(texto).not.toContain('casa')
  })
})
