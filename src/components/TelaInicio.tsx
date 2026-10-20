import { PRESETS, presetPorTamanho } from '../core/dificuldade'
import { formatarDia, formatarDiaLongo } from '../core/diario'
import type { Partida, ResultadoDia } from '../core/tipos'
import type { Preferencias } from '../estado'
import { IconeAjuda, IconeCalendario, IconeFogo, IconeGrafico } from './icones'

interface Props {
  hoje: string
  resultadoHoje: ResultadoDia | null
  prefs: Preferencias
  partidaEmAndamento: Partida | null
  sequencia: number
  onJogarDiario: () => void
  onVerResultadoHoje: () => void
  onJogarLivre: () => void
  onContinuar: () => void
  onAbrirArquivo: () => void
  onAbrirEstatisticas: () => void
  onAbrirAjuda: () => void
  onDefinirTamanho: (tamanho: number) => void
  onAlternarModoDificil: () => void
}

export function TelaInicio({
  hoje,
  resultadoHoje,
  prefs,
  partidaEmAndamento,
  sequencia,
  onJogarDiario,
  onVerResultadoHoje,
  onJogarLivre,
  onContinuar,
  onAbrirArquivo,
  onAbrirEstatisticas,
  onAbrirAjuda,
  onDefinirTamanho,
  onAlternarModoDificil,
}: Props) {
  const preset = presetPorTamanho(prefs.tamanho)
  const diarioEmAndamento =
    partidaEmAndamento?.modo === 'diario' && !partidaEmAndamento.replay
      ? partidaEmAndamento
      : null
  const outraPartida = partidaEmAndamento && !diarioEmAndamento ? partidaEmAndamento : null

  return (
    <div className="tela tela--inicio">
      <header className="topo">
        <div className="marca">
          <span className="marca__icone" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span className="marca__nome">cacaPalavras</span>
        </div>

        <nav className="topo__acoes" aria-label="Ações">
          <button className="botao-icone" onClick={onAbrirAjuda} aria-label="Como jogar">
            <IconeAjuda />
          </button>
          <button className="botao-icone" onClick={onAbrirEstatisticas} aria-label="Estatísticas">
            <IconeGrafico />
          </button>
          <button className="botao-icone" onClick={onAbrirArquivo} aria-label="Arquivo de dias">
            <IconeCalendario />
          </button>
        </nav>
      </header>

      <main className="inicio">
        <div className="inicio__cabecalho">
          <p className="olho">Um desafio por dia</p>
          <h1 className="titulo-principal">
            Adivinhe a palavra
            <br />
            <span className="titulo-principal__destaque">escondida.</span>
          </h1>
          <p className="subtitulo">
            Use as cores como pistas e descubra a palavra em poucas tentativas. Todo mundo joga a
            mesma palavra do dia.
          </p>
        </div>

        <section className="cartao cartao--diario">
          <div className="cartao__texto">
            <span className="etiqueta">
              <span className="etiqueta__ponto" />
              Palavra do dia
            </span>
            <h2>{formatarDiaLongo(hoje)}</h2>
            {resultadoHoje ? (
              <p>
                {resultadoHoje.venceu
                  ? `Resolvida em ${resultadoHoje.usadas} de ${resultadoHoje.tentativas} tentativas.`
                  : `Não foi dessa vez. A palavra era “${resultadoHoje.resposta}”.`}
              </p>
            ) : diarioEmAndamento ? (
              <p>
                Partida em andamento · {diarioEmAndamento.tamanho} letras ·{' '}
                {diarioEmAndamento.tentativas} tentativas.
              </p>
            ) : (
              <p>
                Mesma palavra para todo mundo · {preset.descricao}.
              </p>
            )}
            {sequencia > 0 && (
              <p className="sequencia">
                <IconeFogo /> {sequencia} {sequencia === 1 ? 'dia seguido' : 'dias seguidos'}
              </p>
            )}
          </div>

          <button
            className="botao botao--primario"
            onClick={
              resultadoHoje
                ? onVerResultadoHoje
                : diarioEmAndamento
                  ? onContinuar
                  : onJogarDiario
            }
          >
            {resultadoHoje ? 'Ver resultado' : diarioEmAndamento ? 'Continuar' : 'Jogar agora'}
          </button>
        </section>

        {outraPartida && (
          <button className="cartao cartao--continuar" onClick={onContinuar}>
            <span className="cartao--continuar__icone">↻</span>
            <span>
              <strong>Partida em andamento</strong>
              <small>
                {outraPartida.replay && outraPartida.dia
                  ? `Revanche de ${formatarDia(outraPartida.dia)}`
                  : outraPartida.modo === 'diario'
                    ? 'Palavra do dia'
                    : 'Modo livre'}{' '}
                · {outraPartida.avaliacoes.length} de {outraPartida.tentativas} tentativas usadas
              </small>
            </span>
            <span className="cartao--continuar__seta" aria-hidden="true">
              →
            </span>
          </button>
        )}

        <section className="opcoes" aria-label="Dificuldade">
          <div className="opcoes__cabecalho">
            <span className="rotulo">Dificuldade</span>
            <span className="opcoes__dica">{preset.descricao}</span>
          </div>

          <div className="segmentos" role="group" aria-label="Número de letras">
            {PRESETS.map(({ id, nome, tamanho }) => (
              <button
                key={id}
                className={`segmento ${prefs.tamanho === tamanho ? 'segmento--ativo' : ''}`}
                onClick={() => onDefinirTamanho(tamanho)}
                aria-pressed={prefs.tamanho === tamanho}
              >
                <strong>{nome}</strong>
                <small>{tamanho} letras</small>
              </button>
            ))}
          </div>

          <label className="interruptor">
            <span>
              <strong>Modo difícil</strong>
              <small>Obrigatório usar as dicas já reveladas</small>
            </span>
            <input
              type="checkbox"
              checked={prefs.modoDificil}
              onChange={onAlternarModoDificil}
            />
            <span className="interruptor__trilho" aria-hidden="true">
              <span className="interruptor__bolinha" />
            </span>
          </label>
        </section>

        <section className="cartao cartao--livre">
          <div className="cartao__texto">
            <h2>Modo livre</h2>
            <p>Palavras novas, sem limite. Não altera a sequência do diário.</p>
          </div>
          <button className="botao botao--secundario" onClick={onJogarLivre}>
            Jogar
          </button>
        </section>

        <p className="rodape-nota">
          Sem anúncios, sem cadastro. Seu progresso fica salvo neste navegador.
          <br />
          <button className="link" onClick={onAbrirArquivo}>
            Ver dias anteriores
          </button>
          {resultadoHoje && (
            <>
              {' · '}
              <span>Volte amanhã para o próximo desafio ({formatarDia(hoje)}).</span>
            </>
          )}
        </p>
      </main>
    </div>
  )
}
