export type EstadoLetra = 'correta' | 'presente' | 'ausente'

export interface AvaliacaoLetra {
  letra: string
  estado: EstadoLetra
}

export type Modo = 'diario' | 'ilimitado'

export type Fase = 'jogando' | 'vitoria' | 'derrota'

export interface Configuracao {
  tamanho: number
  tentativas: number
  modoDificil: boolean
}

export interface Partida {
  id: string
  modo: Modo
  /** Data no formato AAAA-MM-DD. Presente também em replays do arquivo. */
  dia: string | null
  /** Verdadeiro quando a partida é um replay de um dia passado (não afeta estatísticas). */
  replay: boolean
  tamanho: number
  tentativas: number
  /** Palavra como será exibida, com acentos e minúscula. */
  resposta: string
  respostaNormalizada: string
  palpites: string[]
  avaliacoes: AvaliacaoLetra[][]
  fase: Fase
  modoDificil: boolean
}

export interface ResultadoDia {
  dia: string
  resposta: string
  respostaNormalizada: string
  tamanho: number
  tentativas: number
  usadas: number
  venceu: boolean
  jogadoEm: number
  avaliacoes: AvaliacaoLetra[][]
  palpites: string[]
}
