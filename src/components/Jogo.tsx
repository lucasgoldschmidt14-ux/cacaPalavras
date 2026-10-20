import { useCallback, useEffect, useRef, useState } from 'react'
import type { ErroPalpite } from '../core/jogo'
import { MENSAGENS_ERRO } from '../core/jogo'
import { estadosDoTeclado } from '../core/avaliar'
import { formatarDia } from '../core/diario'
import { normalizar } from '../core/normalizar'
import type { Partida } from '../core/tipos'
import { Tabuleiro } from './Tabuleiro'
import { Teclado } from './Teclado'
import {
  IconeAjuda,
  IconeCompartilhar,
  IconeFogo,
  IconeGrafico,
  IconeVoltar,
} from './icones'

interface Props {
  partida: Partida
  sequencia: number
  bloqueado: boolean
  onSair: () => void
  onEnviar: (texto: string) => ErroPalpite | null
  onCompartilhar: () => void
  onEstatisticas: () => void
  onNovoJogo: () => void
  onAjuda: () => void
}

export function Jogo({
  partida,
  sequencia,
  bloqueado,
  onSair,
  onEnviar,
  onCompartilhar,
  onEstatisticas,
  onNovoJogo,
  onAjuda,
}: Props) {
  const [entrada, setEntrada] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)
  const [tremendo, setTremendo] = useState(false)
  const [painelFechado, setPainelFechado] = useState(false)
  const temporizador = useRef<number | null>(null)

  const finalizada = partida.fase !== 'jogando'
  const estados = estadosDoTeclado(partida.avaliacoes)

  useEffect(() => {
    if (partida.palpites.length === 0) {
      setEntrada('')
      setPainelFechado(false)
      setAviso(null)
    }
  }, [partida.id, partida.palpites.length])

  useEffect(
    () => () => {
      if (temporizador.current) window.clearTimeout(temporizador.current)
    },
    [],
  )

  const mostrarAviso = useCallback((texto: string) => {
    setAviso(texto)
    if (temporizador.current) window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(() => setAviso(null), 2600)
  }, [])

  const digitar = useCallback(
    (letra: string) => {
      if (partida.fase !== 'jogando') return
      setEntrada((atual) => (atual.length < partida.tamanho ? atual + letra : atual))
    },
    [partida.fase, partida.tamanho],
  )

  const apagar = useCallback(() => {
    setEntrada((atual) => atual.slice(0, -1))
  }, [])

  const enviar = useCallback(() => {
    if (partida.fase !== 'jogando') return
    const erro = onEnviar(entrada)
    if (erro) {
      mostrarAviso(MENSAGENS_ERRO[erro])
      setTremendo(true)
      window.setTimeout(() => setTremendo(false), 420)
      return
    }
    setEntrada('')
  }, [entrada, mostrarAviso, onEnviar, partida.fase])

  useEffect(() => {
    if (bloqueado) return

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.ctrlKey || evento.metaKey || evento.altKey) return
      const alvo = evento.target as HTMLElement | null
      if (alvo && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(alvo.tagName)) return

      if (evento.key === 'Enter') {
        evento.preventDefault()
        enviar()
        return
      }
      if (evento.key === 'Backspace') {
        evento.preventDefault()
        apagar()
        return
      }

      const letra = normalizar(evento.key)
      if (letra.length === 1) {
        evento.preventDefault()
        digitar(letra)
      }
    }

    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [apagar, bloqueado, digitar, enviar])

  const linhas = partida.avaliacoes.length
  const restantes = partida.tentativas - linhas

  return (
    <div className="tela tela--jogo">
      <header className="topo topo--jogo">
        <button className="botao-icone" onClick={onSair} aria-label="Voltar ao início">
          <IconeVoltar />
        </button>

        <div className="topo__centro">
          <span className="topo__titulo">
            {partida.modo === 'diario' ? 'Palavra do dia' : 'Modo livre'}
            {partida.modoDificil && <span className="selo">difícil</span>}
          </span>
          <span className="topo__sub">
            {partida.replay && partida.dia
              ? `Revanche de ${formatarDia(partida.dia)}`
              : partida.modo === 'diario' && partida.dia
                ? formatarDia(partida.dia)
                : `${partida.tamanho} letras · ${partida.tentativas} tentativas`}
          </span>
        </div>

        <div className="topo__acoes">
          <button className="botao-icone" onClick={onEstatisticas} aria-label="Estatísticas">
            <IconeGrafico />
          </button>
          <button className="botao-icone" onClick={onAjuda} aria-label="Como jogar">
            <IconeAjuda />
          </button>
        </div>
      </header>

      <main className="jogo">
        <div className="jogo__status">
          {finalizada ? (
            <span className="jogo__status-final">
              {partida.fase === 'vitoria' ? 'Palavra encontrada!' : 'Fim das tentativas'}
            </span>
          ) : (
            <span>
              Tentativa <strong>{linhas + 1}</strong> de {partida.tentativas}
              {restantes <= 2 && restantes > 0 && (
                <em className="jogo__alerta"> · últimas {restantes}</em>
              )}
            </span>
          )}
          {sequencia > 0 && (
            <span className="jogo__sequencia" title="Sequência de vitórias no diário">
              <IconeFogo /> {sequencia}
            </span>
          )}
        </div>

        <Tabuleiro partida={partida} entrada={entrada} tremendo={tremendo} />

        {finalizada && painelFechado && (
          <div className="jogo__acoes-fim">
            <button className="botao botao--primario" onClick={onCompartilhar}>
              <IconeCompartilhar /> Compartilhar
            </button>
            <button className="botao botao--secundario" onClick={() => setPainelFechado(false)}>
              Ver resultado
            </button>
          </div>
        )}

        <Teclado
          estados={estados}
          desabilitado={finalizada || bloqueado}
          onLetra={digitar}
          onApagar={apagar}
          onEnter={enviar}
        />
      </main>

      {aviso && (
        <div className="aviso" role="status">
          {aviso}
        </div>
      )}

      {finalizada && !painelFechado && (
        <div className="fim-fundo">
          <div className="fim" role="dialog" aria-modal="true" aria-label="Fim de partida">
            <p className={`fim__selo fim__selo--${partida.fase}`}>
              {partida.fase === 'vitoria' ? 'Você acertou' : 'Não foi dessa vez'}
            </p>

            <h2 className="fim__titulo">
              {partida.fase === 'vitoria'
                ? `Em ${partida.avaliacoes.length} ${partida.avaliacoes.length === 1 ? 'tentativa' : 'tentativas'}`
                : 'A palavra era'}
            </h2>

            <p className="fim__palavra">{partida.resposta.toUpperCase()}</p>

            {partida.fase === 'vitoria' && sequencia > 0 && !partida.replay && (
              <p className="fim__sequencia">
                <IconeFogo /> {sequencia} {sequencia === 1 ? 'dia seguido' : 'dias seguidos'}
              </p>
            )}

            <p className="fim__nota">
              {partida.replay
                ? 'Revanche não altera suas estatísticas.'
                : partida.modo === 'diario'
                  ? partida.fase === 'vitoria'
                    ? 'Volte amanhã para o próximo desafio.'
                    : 'A sequência do diário foi reiniciada. Amanhã tem mais.'
                  : 'Partida livre concluída.'}
            </p>

            <div className="fim__acoes">
              <button className="botao botao--primario botao--largo" onClick={onCompartilhar}>
                <IconeCompartilhar /> Compartilhar resultado
              </button>

              {(partida.modo === 'ilimitado' || partida.replay) && (
                <button className="botao botao--secundario botao--largo" onClick={onNovoJogo}>
                  {partida.modo === 'ilimitado' ? 'Jogar outra palavra' : 'Jogar de novo'}
                </button>
              )}

              <div className="fim__acoes-linha">
                <button className="botao botao--fantasma" onClick={onEstatisticas}>
                  Estatísticas
                </button>
                <button className="botao botao--fantasma" onClick={() => setPainelFechado(true)}>
                  Ver tabuleiro
                </button>
                <button className="botao botao--fantasma" onClick={onSair}>
                  Início
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
