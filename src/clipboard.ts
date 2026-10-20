/** Copia texto para a área de transferência com fallback para navegadores antigos. */
export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto)
      return true
    }
  } catch {
    // segue para o fallback
  }

  try {
    const area = document.createElement('textarea')
    area.value = texto
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.top = '-1000px'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const copiou = document.execCommand('copy')
    document.body.removeChild(area)
    return copiou
  } catch {
    return false
  }
}
