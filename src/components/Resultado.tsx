import { exibirPalpite } from '../core/jogo'
import { gerarGrade } from '../core/compartilhar'
import type { ResultadoDia } from '../core/tipos'
import { IconeCompartilhar } from './icones'

interface Props {
  resultado: ResultadoDia
  sequencia: number
  onCompartilhar: (resultado: ResultadoDia) => void
}

export function ConteudoResultado({ resultado, sequencia, onCompartilhar }: Props) {
  return (
    <div className="resultado">
      <p className={`fim__selo fim__selo--${resultado.venceu ? 'vitoria' : 'derrota'}`}>
        {resultado.venceu ? 'Vitória' : 'Derrota'}
      </p>

      <h3 className="fim__titulo">
        {resultado.venceu
          ? `Em ${resultado.usadas} de ${resultado.tentativas} tentativas`
          : 'A palavra era'}
      </h3>

      <p className="fim__palavra">{resultado.resposta.toUpperCase()}</p>

      <div className="resultado__grade" aria-label={gerarGrade(resultado.avaliacoes)}>
        {resultado.avaliacoes.map((linha, indiceLinha) => {
          const palpite = resultado.palpites[indiceLinha] ?? ''
          const letras = palpite
            ? exibirPalpite(palpite, resultado.resposta, linha)
            : linha.map(({ letra }) => letra)

          return (
            <div className="resultado__linha" key={indiceLinha}>
              {linha.map(({ estado }, posicao) => (
                <span key={posicao} className={`mini-tile mini-tile--${estado}`}>
                  {letras[posicao] ?? ''}
                </span>
              ))}
            </div>
          )
        })}
      </div>

      {sequencia > 0 && resultado.venceu && (
        <p className="fim__sequencia">🔥 {sequencia} dias seguidos</p>
      )}

      <button
        className="botao botao--primario botao--largo"
        onClick={() => onCompartilhar(resultado)}
      >
        <IconeCompartilhar /> Compartilhar
      </button>
    </div>
  )
}
