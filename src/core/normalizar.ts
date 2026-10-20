/**
 * Normaliza uma palavra para comparação:
 * - remove acentos e cedilha;
 * - remove tudo que não for letra;
 * - converte para maiúsculas.
 *
 * Ex.: "coração" -> "CORACAO", "a-b-c" -> "ABC".
 */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase()
}

/** Remove acentos preservando o restante do texto. */
export function removerAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/** Verdadeiro quando o caractere é uma letra A-Z (após normalização). */
export function ehLetra(caractere: string): boolean {
  return /^[A-Z]$/.test(normalizar(caractere))
}
