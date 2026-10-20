const DIA_EM_MS = 86_400_000

/** Data local no formato AAAA-MM-DD. */
export function chaveDoDia(data: Date = new Date()): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

/** Converte AAAA-MM-DD em número de dias desde 1970-01-01 (UTC, sem fuso). */
export function diasDesdeEpoca(chave: string): number {
  const [ano, mes, dia] = chave.split('-').map(Number)
  if (!ano || !mes || !dia) throw new Error(`Data inválida: ${chave}`)
  return Math.floor(Date.UTC(ano, mes - 1, dia) / DIA_EM_MS)
}

export function dataDeChave(chave: string): Date {
  const [ano, mes, dia] = chave.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

/**
 * Embaralhamento determinístico (Fisher-Yates com PRNG mulberry32).
 * A mesma lista e a mesma semente produzem sempre a mesma ordem — necessário
 * para que a palavra do dia seja idêntica para todos os jogadores.
 */
export function embaralharDeterministico<T>(lista: readonly T[], semente = 20_260_101): T[] {
  const copia = [...lista]
  let estado = semente >>> 0

  const aleatorio = () => {
    estado = (estado + 0x6d2b79f5) >>> 0
    let t = estado
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }

  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

/** Índice da palavra do dia. Dias consecutivos usam índices consecutivos. */
export function indiceDoDia(chave: string, total: number): number {
  if (total <= 0) throw new Error('Lista de respostas vazia.')
  const indice = diasDesdeEpoca(chave) % total
  return (indice + total) % total
}

/** Lista de chaves de dias, da mais antiga para a mais recente (inclui hoje). */
export function ultimosDias(quantidade: number, hoje: string = chaveDoDia()): string[] {
  const base = diasDesdeEpoca(hoje)
  const dias: string[] = []
  for (let i = quantidade - 1; i >= 0; i--) {
    dias.push(chaveDeDias(base - i))
  }
  return dias
}

function chaveDeDias(dias: number): string {
  const data = new Date(dias * DIA_EM_MS)
  const ano = data.getUTCFullYear()
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0')
  const dia = String(data.getUTCDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

const formatador = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

export function formatarDia(chave: string): string {
  return formatador
    .format(dataDeChave(chave))
    .replace(/\bde\s+/i, '')
    .replace('.', '')
    .trim()
}

const formatadorLongo = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function formatarDiaLongo(chave: string): string {
  return formatadorLongo.format(dataDeChave(chave))
}
