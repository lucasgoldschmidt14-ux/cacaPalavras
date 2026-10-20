import type { EstadoLetra } from '../core/tipos'
import { IconeApagar } from './icones'

interface Props {
  estados: Map<string, EstadoLetra>
  desabilitado: boolean
  onLetra: (letra: string) => void
  onApagar: () => void
  onEnter: () => void
}

const LINHAS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

export function Teclado({ estados, desabilitado, onLetra, onApagar, onEnter }: Props) {
  return (
    <div
      className="teclado"
      aria-label="Teclado virtual"
      onMouseUp={(evento) => {
        const botao = (evento.target as HTMLElement).closest('button')
        botao?.blur()
      }}
    >
      {LINHAS.map((linha, indice) => (
        <div className="teclado__linha" key={linha}>
          {indice === 2 && (
            <button
              className="tecla tecla--acao"
              onClick={onEnter}
              disabled={desabilitado}
              aria-label="Enviar palpite"
            >
              ENTER
            </button>
          )}

          {Array.from(linha, (letra) => {
            const estado = estados.get(letra)
            return (
              <button
                key={letra}
                className={`tecla ${estado ? `tecla--${estado}` : ''}`}
                onClick={() => onLetra(letra)}
                disabled={desabilitado}
                aria-label={`Letra ${letra}${estado === 'correta' ? ', posição correta' : estado === 'presente' ? ', na palavra' : estado === 'ausente' ? ', ausente' : ''}`}
              >
                {letra}
              </button>
            )
          })}

          {indice === 2 && (
            <button
              className="tecla tecla--acao"
              onClick={onApagar}
              disabled={desabilitado}
              aria-label="Apagar última letra"
            >
              <IconeApagar />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
