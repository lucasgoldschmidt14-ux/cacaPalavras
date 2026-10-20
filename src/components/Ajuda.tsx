const EXEMPLOS = [
  { letra: 'C', estado: 'correta', texto: 'está na palavra e na posição certa' },
  { letra: 'A', estado: 'presente', texto: 'está na palavra, mas em outra posição' },
  { letra: 'S', estado: 'ausente', texto: 'não faz parte da palavra' },
] as const

export function Ajuda() {
  return (
    <div className="ajuda">
      <p>
        Descubra a palavra secreta em poucas tentativas. A cada palpite, as letras mudam de cor e
        mostram o quão perto você está.
      </p>

      <ul className="ajuda__exemplos">
        {EXEMPLOS.map(({ letra, estado, texto }) => (
          <li key={letra}>
            <span className={`tile tile--${estado} tile--exemplo`}>{letra}</span>
            <span>{texto}</span>
          </li>
        ))}
      </ul>

      <div className="ajuda__tabela">
        <div>
          <strong>Palavra do dia</strong>
          <p>Uma palavra por dia, igual para todo mundo. A sequência conta apenas nesse modo.</p>
        </div>
        <div>
          <strong>Modo livre</strong>
          <p>Palavras aleatórias, quantas quiser. Não altera a sequência do diário.</p>
        </div>
        <div>
          <strong>Modo difícil</strong>
          <p>Você precisa usar as letras verdes e amarelas reveladas no palpite seguinte.</p>
        </div>
        <div>
          <strong>Acentos</strong>
          <p>Não precisa digitar acentos: a comparação ignora acentos e cedilha.</p>
        </div>
      </div>

      <p className="ajuda__nota">
        Dica: comece com palavras que tenham letras diferentes e muitas vogais. Depois, use as
        pistas para eliminar possibilidades.
      </p>
    </div>
  )
}
