import { useEffect, type ReactNode } from 'react'
import { IconeFechar } from './icones'

interface Props {
  titulo: string
  aoFechar: () => void
  children: ReactNode
  largo?: boolean
}

export function Modal({ titulo, aoFechar, children, largo }: Props) {
  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = overflowAnterior
    }
  }, [aoFechar])

  return (
    <div className="modal-fundo" onMouseDown={(evento) => evento.target === evento.currentTarget && aoFechar()}>
      <div
        className={`modal ${largo ? 'modal--largo' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <header className="modal__topo">
          <h2 className="modal__titulo">{titulo}</h2>
          <button className="botao-icone" onClick={aoFechar} aria-label="Fechar">
            <IconeFechar />
          </button>
        </header>
        <div className="modal__corpo">{children}</div>
      </div>
    </div>
  )
}
