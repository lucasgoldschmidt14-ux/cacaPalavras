export interface Armazenamento {
  getItem(chave: string): string | null
  setItem(chave: string, valor: string): void
  removeItem(chave: string): void
}

export interface Persistencia {
  carregar<T>(fallback: T): T
  salvar(valor: unknown): void
  limpar(): void
}

const VERSAO = 1

/**
 * Wrapper de localStorage com versionamento e tolerância a dados corrompidos.
 * Recebe um armazenamento opcional para facilitar testes.
 */
export function criarPersistencia(
  chave = 'cacapalavras',
  armazenamento?: Armazenamento,
): Persistencia {
  const obterArmazenamento = (): Armazenamento | null => {
    if (armazenamento) return armazenamento
    try {
      return typeof localStorage === 'undefined' ? null : localStorage
    } catch {
      return null
    }
  }

  return {
    carregar<T>(fallback: T): T {
      const store = obterArmazenamento()
      if (!store) return fallback
      try {
        const bruto = store.getItem(chave)
        if (!bruto) return fallback
        const envelope = JSON.parse(bruto) as { versao?: number; dados?: unknown }
        if (envelope.versao !== VERSAO || envelope.dados == null) return fallback
        return envelope.dados as T
      } catch {
        try {
          store.removeItem(chave)
        } catch {
          // armazenamento indisponível: segue com o estado padrão
        }
        return fallback
      }
    },

    salvar(valor: unknown) {
      const store = obterArmazenamento()
      if (!store) return
      try {
        store.setItem(chave, JSON.stringify({ versao: VERSAO, dados: valor }))
      } catch {
        // cota cheia ou modo privado: jogo continua na memória
      }
    },

    limpar() {
      const store = obterArmazenamento()
      try {
        store?.removeItem(chave)
      } catch {
        // ignora
      }
    },
  }
}
