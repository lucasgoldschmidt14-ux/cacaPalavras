import { formatarDia, ultimosDias } from '../core/diario'
import type { ResultadoDia } from '../core/tipos'
import { IconeVoltar } from './icones'

interface Props {
  hoje: string
  historico: Record<string, ResultadoDia>
  onVoltar: () => void
  onJogar: (dia: string) => void
  onVerResultado: (resultado: ResultadoDia) => void
}

function diaDaSemana(chave: string): string {
  const [ano, mes, dia] = chave.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(
    new Date(ano, mes - 1, dia),
  )
}

export function Arquivo({ hoje, historico, onVoltar, onJogar, onVerResultado }: Props) {
  const dias = ultimosDias(30, hoje).reverse()
  const jogados = Object.keys(historico).length
  const vitorias = Object.values(historico).filter(({ venceu }) => venceu).length

  return (
    <div className="tela tela--arquivo">
      <header className="topo topo--jogo">
        <button className="botao-icone" onClick={onVoltar} aria-label="Voltar ao início">
          <IconeVoltar />
        </button>
        <div className="topo__centro">
          <span className="topo__titulo">Arquivo</span>
          <span className="topo__sub">
            {jogados} {jogados === 1 ? 'dia jogado' : 'dias jogados'} · {vitorias}{' '}
            {vitorias === 1 ? 'vitória' : 'vitórias'}
          </span>
        </div>
        <span className="topo__espaco" />
      </header>

      <main className="arquivo">
        <p className="arquivo__introducao">
          Últimos 30 dias. Dias anteriores podem ser rejogados à vontade — a revanche não altera
          suas estatísticas.
        </p>

        <ul className="arquivo__lista">
          {dias.map((dia) => {
            const resultado = historico[dia]
            const ehHoje = dia === hoje

            return (
              <li
                key={dia}
                className={`arquivo__item ${ehHoje ? 'arquivo__item--hoje' : ''} ${!resultado && !ehHoje ? 'arquivo__item--vazio' : ''}`}
              >
                <div className="arquivo__data">
                  <strong>{formatarDia(dia)}</strong>
                  <span>{diaDaSemana(dia)}</span>
                </div>

                <div className="arquivo__status">
                  {resultado ? (
                    <span
                      className={`arquivo__selo ${resultado.venceu ? 'arquivo__selo--vitoria' : 'arquivo__selo--derrota'}`}
                    >
                      {resultado.venceu ? `✓ ${resultado.usadas}/${resultado.tentativas}` : '✕'}
                    </span>
                  ) : (
                    <span className="arquivo__selo arquivo__selo--neutro">
                      {ehHoje ? 'Hoje' : '—'}
                    </span>
                  )}
                  {ehHoje && <span className="arquivo__tag">hoje</span>}
                </div>

                <div className="arquivo__acoes">
                  {ehHoje ? (
                    resultado ? (
                      <button
                        className="botao botao--fantasma botao--pequeno"
                        onClick={() => onVerResultado(resultado)}
                      >
                        Ver
                      </button>
                    ) : (
                      <button
                        className="botao botao--secundario botao--pequeno"
                        onClick={() => onJogar(dia)}
                      >
                        Jogar hoje
                      </button>
                    )
                  ) : (
                    <>
                      {resultado && (
                        <button
                          className="botao botao--fantasma botao--pequeno"
                          onClick={() => onVerResultado(resultado)}
                        >
                          Ver
                        </button>
                      )}
                      <button
                        className="botao botao--secundario botao--pequeno"
                        onClick={() => onJogar(dia)}
                      >
                        {resultado ? 'Rejogar' : 'Jogar'}
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </main>
    </div>
  )
}
