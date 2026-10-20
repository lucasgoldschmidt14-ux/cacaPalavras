import type { Partida } from '../core/tipos'
import { exibirPalpite } from '../core/jogo'

interface Props {
  partida: Partida
  entrada: string
  tremendo: boolean
}

export function Tabuleiro({ partida, entrada, tremendo }: Props) {
  const linhaAtual = partida.avaliacoes.length
  const linhas = Array.from({ length: partida.tentativas }, (_, indice) => indice)
  const finalizada = partida.fase !== 'jogando'

  return (
    <div
      className="tabuleiro"
      style={{
        ['--colunas' as string]: partida.tamanho,
        ['--tile' as string]: `min(64px, calc((100dvh - 250px) / ${partida.tentativas}), calc((100vw - 44px) / ${partida.tamanho + 0.8}))`,
      }}
      role="group"
      aria-label="Tabuleiro de tentativas"
    >
      {linhas.map((indice) => {
        const avaliacao = partida.avaliacoes[indice]
        const palpite = partida.palpites[indice]
        const ativa = indice === linhaAtual && !finalizada
        const letras = avaliacao && palpite
          ? exibirPalpite(palpite, partida.resposta, avaliacao)
          : ativa
            ? Array.from({ length: partida.tamanho }, (_, posicao) => entrada[posicao] ?? '')
            : Array.from({ length: partida.tamanho }, () => '')

        return (
          <div
            key={indice}
            className={[
              'linha',
              avaliacao ? 'linha--revelar' : '',
              ativa ? 'linha--ativa' : '',
              ativa && tremendo ? 'linha--tremer' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {letras.map((letra, posicao) => {
              const estado = avaliacao?.[posicao]?.estado
              return (
                <div
                  key={posicao}
                  className={[
                    'tile',
                    letra ? 'tile--preenchido' : '',
                    estado ? `tile--${estado}` : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={avaliacao ? { animationDelay: `${posicao * 110}ms` } : undefined}
                  aria-label={
                    letra
                      ? `${letra}${estado === 'correta' ? ', posição correta' : estado === 'presente' ? ', presente em outra posição' : estado === 'ausente' ? ', ausente' : ''}`
                      : 'vazio'
                  }
                >
                  {letra}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
