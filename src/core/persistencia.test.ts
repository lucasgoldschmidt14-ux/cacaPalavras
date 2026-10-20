import { describe, expect, it } from 'vitest'
import { criarPersistencia, type Armazenamento } from './persistencia'

function armazenamentoFalso(): Armazenamento & { dados: Map<string, string> } {
  const dados = new Map<string, string>()
  return {
    dados,
    getItem: (chave) => dados.get(chave) ?? null,
    setItem: (chave, valor) => {
      dados.set(chave, valor)
    },
    removeItem: (chave) => {
      dados.delete(chave)
    },
  }
}

describe('persistencia', () => {
  it('grava e lê o estado com versionamento', () => {
    const store = armazenamentoFalso()
    const persistencia = criarPersistencia('teste', store)

    persistencia.salvar({ pontos: 12 })
    expect(persistencia.carregar({ pontos: 0 })).toEqual({ pontos: 12 })
    expect(store.dados.get('teste')).toContain('"versao":1')
  })

  it('devolve o fallback quando não há nada salvo', () => {
    const persistencia = criarPersistencia('teste', armazenamentoFalso())
    expect(persistencia.carregar({ ok: true })).toEqual({ ok: true })
  })

  it('devolve o fallback e limpa JSON corrompido', () => {
    const store = armazenamentoFalso()
    store.dados.set('teste', '{oops')
    const persistencia = criarPersistencia('teste', store)

    expect(persistencia.carregar('padrao')).toBe('padrao')
    expect(store.dados.has('teste')).toBe(false)
  })

  it('ignora envelope de versão antiga', () => {
    const store = armazenamentoFalso()
    store.dados.set('teste', JSON.stringify({ versao: 0, dados: { antigo: true } }))
    const persistencia = criarPersistencia('teste', store)

    expect(persistencia.carregar('padrao')).toBe('padrao')
  })

  it('suporta armazenamento indisponível', () => {
    const persistencia = criarPersistencia('teste', undefined)
    expect(() => persistencia.salvar({ x: 1 })).not.toThrow()
    expect(persistencia.carregar('padrao')).toBe('padrao')
  })
})
