import { describe, expect, it } from 'vitest'
import {
  chaveDoDia,
  diasDesdeEpoca,
  embaralharDeterministico,
  indiceDoDia,
  ultimosDias,
} from './diario'

describe('chaveDoDia', () => {
  it('usa a data local no formato AAAA-MM-DD', () => {
    expect(chaveDoDia(new Date(2026, 9, 20))).toBe('2026-10-20')
    expect(chaveDoDia(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('diasDesdeEpoca', () => {
  it('conta dias desde 1970-01-01', () => {
    expect(diasDesdeEpoca('1970-01-01')).toBe(0)
    expect(diasDesdeEpoca('1970-01-02')).toBe(1)
    expect(diasDesdeEpoca('2026-10-20') - diasDesdeEpoca('2026-10-19')).toBe(1)
  })

  it('rejeita data inválida', () => {
    expect(() => diasDesdeEpoca('ontem')).toThrow()
  })
})

describe('indiceDoDia', () => {
  it('é determinístico para o mesmo dia', () => {
    expect(indiceDoDia('2026-10-20', 800)).toBe(indiceDoDia('2026-10-20', 800))
  })

  it('muda de um dia para o outro', () => {
    expect(indiceDoDia('2026-10-20', 800)).not.toBe(indiceDoDia('2026-10-21', 800))
  })

  it('nunca sai do intervalo da lista', () => {
    for (let dia = 1; dia <= 28; dia++) {
      const indice = indiceDoDia(`2026-02-${String(dia).padStart(2, '0')}`, 7)
      expect(indice).toBeGreaterThanOrEqual(0)
      expect(indice).toBeLessThan(7)
    }
  })
})

describe('embaralharDeterministico', () => {
  it('produz sempre a mesma ordem com a mesma semente', () => {
    const lista = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    expect(embaralharDeterministico(lista, 42)).toEqual(embaralharDeterministico(lista, 42))
  })

  it('não muta a lista original', () => {
    const lista = ['A', 'B', 'C']
    embaralharDeterministico(lista, 1)
    expect(lista).toEqual(['A', 'B', 'C'])
  })
})

describe('ultimosDias', () => {
  it('devolve os dias em ordem, incluindo hoje', () => {
    expect(ultimosDias(3, '2026-10-20')).toEqual(['2026-10-18', '2026-10-19', '2026-10-20'])
  })
})
