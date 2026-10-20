import { maiorDistribuicao, percentualVitorias, type Estatisticas as Stats } from '../core/estatisticas'
import { IconeFogo } from './icones'

interface Props {
  diario: Stats
  livre: Stats
  onZerar: () => void
}

function Bloco({ titulo, stats, destaque }: { titulo: string; stats: Stats; destaque?: boolean }) {
  const maximo = maiorDistribuicao(stats)
  const tentativas = Math.max(6, ...Object.keys(stats.distribuicao).map(Number), 1)

  return (
    <section className={`stats-bloco ${destaque ? 'stats-bloco--destaque' : ''}`}>
      <header className="stats-bloco__topo">
        <h3>{titulo}</h3>
        {stats.sequenciaAtual > 0 && (
          <span className="stats-bloco__fogo">
            <IconeFogo /> {stats.sequenciaAtual}
          </span>
        )}
      </header>

      <div className="stats-numeros">
        <div>
          <strong>{stats.jogos}</strong>
          <span>Jogos</span>
        </div>
        <div>
          <strong>{percentualVitorias(stats)}%</strong>
          <span>Vitórias</span>
        </div>
        <div>
          <strong>{stats.sequenciaAtual}</strong>
          <span>Sequência</span>
        </div>
        <div>
          <strong>{stats.recorde}</strong>
          <span>Recorde</span>
        </div>
      </div>

      <h4 className="stats-subtitulo">Distribuição de tentativas</h4>
      <div className="distribuicao" role="img" aria-label="Distribuição de vitórias por tentativa">
        {Array.from({ length: tentativas }, (_, indice) => indice + 1).map((numero) => {
          const quantidade = stats.distribuicao[String(numero)] ?? 0
          const largura = Math.max(6, (quantidade / maximo) * 100)
          return (
            <div className="distribuicao__linha" key={numero}>
              <span className="distribuicao__rotulo">{numero}</span>
              <span
                className={`distribuicao__barra ${quantidade === 0 ? 'distribuicao__barra--vazia' : ''}`}
                style={{ width: `${quantidade === 0 ? 6 : largura}%` }}
              >
                {quantidade > 0 ? quantidade : ''}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function Estatisticas({ diario, livre, onZerar }: Props) {
  return (
    <div className="stats">
      <Bloco titulo="Palavra do dia" stats={diario} destaque />
      <Bloco titulo="Modo livre" stats={livre} />

      <button
        className="link link--perigo"
        onClick={() => {
          if (window.confirm('Zerar todas as estatísticas? O histórico de dias será mantido.')) {
            onZerar()
          }
        }}
      >
        Zerar estatísticas
      </button>
    </div>
  )
}
