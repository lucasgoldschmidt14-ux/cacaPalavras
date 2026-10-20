import { useCallback, useEffect, useRef, useState } from 'react'
import { copiarTexto } from './clipboard'
import { gerarTextoResultado } from './core/compartilhar'
import { chaveDoDia, formatarDia } from './core/diario'
import type { Partida, ResultadoDia } from './core/tipos'
import { useJogo } from './useJogo'
import { Ajuda } from './components/Ajuda'
import { Arquivo } from './components/Arquivo'
import { Estatisticas } from './components/Estatisticas'
import { Jogo } from './components/Jogo'
import { Modal } from './components/Modal'
import { ConteudoResultado } from './components/Resultado'
import { TelaInicio } from './components/TelaInicio'

type Tela = 'inicio' | 'jogo' | 'arquivo'
type ModalTipo = 'ajuda' | 'estatisticas' | null

function resultadoDaPartida(partida: Partida, hoje: string): ResultadoDia {
  return {
    dia: partida.dia ?? hoje,
    resposta: partida.resposta,
    respostaNormalizada: partida.respostaNormalizada,
    tamanho: partida.tamanho,
    tentativas: partida.tentativas,
    usadas: partida.avaliacoes.length,
    venceu: partida.fase === 'vitoria',
    jogadoEm: Date.now(),
    avaliacoes: partida.avaliacoes,
    palpites: partida.palpites,
  }
}

export default function App() {
  const jogo = useJogo()
  const { estado, partida, resultadoDeHoje } = jogo
  const [tela, setTela] = useState<Tela>(() =>
    jogo.partida?.fase === 'jogando' ? 'jogo' : 'inicio',
  )
  const [modal, setModal] = useState<ModalTipo>(null)
  const [resultadoAberto, setResultadoAberto] = useState<ResultadoDia | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const timerToast = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timerToast.current) window.clearTimeout(timerToast.current)
    },
    [],
  )

  const mostrarToast = useCallback((texto: string) => {
    setToast(texto)
    if (timerToast.current) window.clearTimeout(timerToast.current)
    timerToast.current = window.setTimeout(() => setToast(null), 2800)
  }, [])

  const compartilhar = useCallback(
    async (resultado: ResultadoDia, sequencia: number) => {
      const texto = gerarTextoResultado({
        avaliacoes: resultado.avaliacoes,
        tentativas: resultado.tentativas,
        venceu: resultado.venceu,
        sequencia,
        tamanho: resultado.tamanho,
      })
      const copiou = await copiarTexto(texto)
      mostrarToast(
        copiou ? 'Resultado copiado para a área de transferência!' : 'Não foi possível copiar o resultado.',
      )
    },
    [mostrarToast],
  )

  const abrirEstatisticas = useCallback(() => setModal('estatisticas'), [])
  const abrirAjuda = useCallback(() => setModal('ajuda'), [])

  const iniciarDiario = useCallback(() => {
    if (resultadoDeHoje) {
      setResultadoAberto(resultadoDeHoje)
      return
    }
    jogo.jogarDiario()
    setTela('jogo')
  }, [jogo, resultadoDeHoje])

  const iniciarLivre = useCallback(() => {
    const diarioEmAndamento =
      jogo.partida?.modo === 'diario' &&
      !jogo.partida.replay &&
      jogo.partida.fase === 'jogando' &&
      !jogo.resultadoDeHoje
    if (
      diarioEmAndamento &&
      !window.confirm(
        'Você tem uma partida do dia em andamento. Começar uma partida livre vai descartá-la. Continuar?',
      )
    ) {
      return
    }
    jogo.jogarLivre()
    setTela('jogo')
  }, [jogo])

  const jogarDia = useCallback(
    (dia: string) => {
      if (dia === jogo.hoje) {
        if (jogo.partida?.modo === 'diario' && jogo.partida.dia === dia && jogo.partida.fase === 'jogando') {
          setTela('jogo')
          return
        }
        if (jogo.resultadoDeHoje) {
          setResultadoAberto(jogo.resultadoDeHoje)
          return
        }
        jogo.jogarDiario()
        setTela('jogo')
        return
      }

      const emAndamento =
        jogo.partida?.fase === 'jogando' && jogo.partida.modo === 'diario'
      if (
        emAndamento &&
        !window.confirm(
          'Você tem uma partida do dia em andamento. Começar uma revanche vai descartá-la. Continuar?',
        )
      ) {
        return
      }

      jogo.jogarArquivo(dia)
      setTela('jogo')
    },
    [jogo],
  )

  const novoJogo = useCallback(() => {
    if (partida?.modo === 'diario' && partida.replay && partida.dia) {
      jogo.jogarArquivo(partida.dia)
    } else {
      jogo.jogarLivre()
    }
  }, [jogo, partida])

  const sequencia = estado.statsDiario.sequenciaAtual
  const partidaEmAndamento = partida?.fase === 'jogando' ? partida : null
  const modalAberto = modal !== null || resultadoAberto !== null

  return (
    <>
      {tela === 'inicio' && (
        <TelaInicio
          hoje={jogo.hoje}
          resultadoHoje={resultadoDeHoje}
          prefs={estado.prefs}
          partidaEmAndamento={partidaEmAndamento}
          sequencia={sequencia}
          onJogarDiario={iniciarDiario}
          onVerResultadoHoje={() => resultadoDeHoje && setResultadoAberto(resultadoDeHoje)}
          onJogarLivre={iniciarLivre}
          onContinuar={() => setTela('jogo')}
          onAbrirArquivo={() => setTela('arquivo')}
          onAbrirEstatisticas={abrirEstatisticas}
          onAbrirAjuda={abrirAjuda}
          onDefinirTamanho={jogo.definirTamanho}
          onAlternarModoDificil={jogo.alternarModoDificil}
        />
      )}

      {tela === 'jogo' && partida && (
        <Jogo
          key={partida.replay ? `${partida.id}:replay` : partida.id}
          partida={partida}
          sequencia={partida.modo === 'diario' && !partida.replay ? sequencia : 0}
          bloqueado={modalAberto}
          onSair={() => setTela('inicio')}
          onEnviar={jogo.enviarPalpite}
          onCompartilhar={() =>
            compartilhar(
              resultadoDaPartida(partida, jogo.hoje),
              partida.modo === 'diario' && !partida.replay ? sequencia : 0,
            )
          }
          onEstatisticas={abrirEstatisticas}
          onNovoJogo={novoJogo}
          onAjuda={abrirAjuda}
        />
      )}

      {tela === 'arquivo' && (
        <Arquivo
          hoje={jogo.hoje}
          historico={estado.historico}
          onVoltar={() => setTela('inicio')}
          onJogar={jogarDia}
          onVerResultado={(resultado) => setResultadoAberto(resultado)}
        />
      )}

      {modal === 'ajuda' && (
        <Modal titulo="Como jogar" aoFechar={() => setModal(null)}>
          <Ajuda />
        </Modal>
      )}

      {modal === 'estatisticas' && (
        <Modal titulo="Estatísticas" aoFechar={() => setModal(null)} largo>
          <Estatisticas
            diario={estado.statsDiario}
            livre={estado.statsLivre}
            onZerar={jogo.zerarEstatisticas}
          />
        </Modal>
      )}

      {resultadoAberto && (
        <Modal
          titulo={`Resultado de ${resultadoAberto.dia === chaveDoDia() ? 'hoje' : formatarDia(resultadoAberto.dia)}`}
          aoFechar={() => setResultadoAberto(null)}
        >
          <ConteudoResultado
            resultado={resultadoAberto}
            sequencia={resultadoAberto.dia === jogo.hoje ? sequencia : 0}
            onCompartilhar={(resultado) =>
              compartilhar(resultado, resultado.dia === jogo.hoje ? sequencia : 0)
            }
          />
        </Modal>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  )
}
