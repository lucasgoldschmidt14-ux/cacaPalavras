import { useCallback, useEffect, useState } from 'react'
import { criarPersistencia } from './core/persistencia'
import { chaveDoDia } from './core/diario'
import { criarConfiguracao } from './core/dificuldade'
import { aplicarPalpite, criarPartida, type ErroPalpite } from './core/jogo'
import { criarEstatisticas, registrarResultado } from './core/estatisticas'
import type { Partida, ResultadoDia } from './core/tipos'
import { dicionarioDe, palavraAleatoria, palavraDoDia } from './data'
import { ESTADO_INICIAL, normalizarEstado, type EstadoApp } from './estado'

const persistencia = criarPersistencia('cacapalavras')

function hidratar(): EstadoApp {
  const salvo = normalizarEstado(persistencia.carregar(ESTADO_INICIAL))
  const hoje = chaveDoDia()

  if (
    salvo.partida?.modo === 'diario' &&
    salvo.partida.dia !== hoje &&
    !salvo.partida.replay
  ) {
    return { ...salvo, partida: null }
  }

  return salvo
}

export function useJogo() {
  const [estado, setEstado] = useState<EstadoApp>(hidratar)
  const hoje = chaveDoDia()

  useEffect(() => {
    persistencia.salvar(estado)
  }, [estado])

  const jogarDiario = useCallback(() => {
    setEstado((prev) => {
      if (prev.historico[hoje]) return prev
      const emAndamento =
        prev.partida?.modo === 'diario' &&
        prev.partida.dia === hoje &&
        !prev.partida.replay &&
        prev.partida.fase === 'jogando'
      if (emAndamento) return prev
      const config = criarConfiguracao(prev.prefs.tamanho, prev.prefs.modoDificil)
      const palavra = palavraDoDia(config.tamanho, hoje)
      return {
        ...prev,
        partida: criarPartida('diario', config, palavra.exibicao, hoje, false),
      }
    })
  }, [hoje])

  const jogarLivre = useCallback(() => {
    setEstado((prev) => {
      const config = criarConfiguracao(prev.prefs.tamanho, prev.prefs.modoDificil)
      const palavra = palavraAleatoria(config.tamanho)
      return {
        ...prev,
        partida: criarPartida('ilimitado', config, palavra.exibicao, null, false),
      }
    })
  }, [])

  const jogarArquivo = useCallback(
    (dia: string) => {
      setEstado((prev) => {
        const anterior = prev.historico[dia]
        const config = anterior
          ? {
              tamanho: anterior.tamanho,
              tentativas: anterior.tentativas,
              modoDificil: prev.prefs.modoDificil,
            }
          : criarConfiguracao(prev.prefs.tamanho, prev.prefs.modoDificil)

        const palavra =
          anterior && anterior.tamanho === config.tamanho
            ? {
                exibicao: anterior.resposta,
                normalizada: anterior.respostaNormalizada,
                tamanho: anterior.tamanho,
              }
            : palavraDoDia(config.tamanho, dia)

        return {
          ...prev,
          partida: criarPartida('diario', config, palavra.exibicao, dia, true),
        }
      })
    },
    [],
  )

  const enviarPalpite = useCallback(
    (texto: string): ErroPalpite | null => {
      const partida = estado.partida
      if (!partida) return 'encerrada'

      const resultado = aplicarPalpite(partida, texto, dicionarioDe(partida.tamanho))
      if (resultado.erro) return resultado.erro

      const finalizada = resultado.partida.fase !== 'jogando'
      setEstado((prev) => {
        const proximo: EstadoApp = { ...prev, partida: resultado.partida }
        if (!finalizada) return proximo

        const resposta: ResultadoDia = {
          dia: resultado.partida.dia ?? hoje,
          resposta: resultado.partida.resposta,
          respostaNormalizada: resultado.partida.respostaNormalizada,
          tamanho: resultado.partida.tamanho,
          tentativas: resultado.partida.tentativas,
          usadas: resultado.partida.avaliacoes.length,
          venceu: resultado.partida.fase === 'vitoria',
          jogadoEm: Date.now(),
          avaliacoes: resultado.partida.avaliacoes,
          palpites: resultado.partida.palpites,
        }

        const oficial =
          resultado.partida.modo === 'diario' &&
          resultado.partida.dia === hoje &&
          !resultado.partida.replay

        if (oficial) {
          proximo.statsDiario = registrarResultado(
            prev.statsDiario,
            resposta.venceu,
            resposta.usadas,
          )
          proximo.historico = { ...prev.historico, [hoje]: resposta }
        } else if (resultado.partida.modo === 'ilimitado') {
          proximo.statsLivre = registrarResultado(
            prev.statsLivre,
            resposta.venceu,
            resposta.usadas,
          )
        }

        return proximo
      })

      return null
    },
    [estado.partida, hoje],
  )

  const definirTamanho = useCallback((tamanho: number) => {
    setEstado((prev) => ({ ...prev, prefs: { ...prev.prefs, tamanho } }))
  }, [])

  const alternarModoDificil = useCallback(() => {
    setEstado((prev) => ({
      ...prev,
      prefs: { ...prev.prefs, modoDificil: !prev.prefs.modoDificil },
    }))
  }, [])

  const zerarEstatisticas = useCallback(() => {
    setEstado((prev) => ({
      ...prev,
      statsDiario: criarEstatisticas(),
      statsLivre: criarEstatisticas(),
    }))
  }, [])

  const resultadoDeHoje = estado.historico[hoje] ?? null

  return {
    estado,
    hoje,
    resultadoDeHoje,
    jogarDiario,
    jogarLivre,
    jogarArquivo,
    enviarPalpite,
    definirTamanho,
    alternarModoDificil,
    zerarEstatisticas,
    partida: estado.partida as Partida | null,
  }
}

export type Jogo = ReturnType<typeof useJogo>
