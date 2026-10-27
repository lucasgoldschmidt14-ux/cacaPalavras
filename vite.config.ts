import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Junta JS e CSS dentro do index.html no build, gerando um arquivo único que
 * funciona aberto direto do disco (file://), sem precisar de servidor.
 */
function paginaAutonoma(): Plugin {
  return {
    name: 'pagina-autonoma',
    apply: 'build',
    enforce: 'post',
    generateBundle(_opcoes, bundle) {
      const html = bundle['index.html']
      if (!html || html.type !== 'asset') return

      let fonte = String(html.source)

      for (const [nome, item] of Object.entries(bundle)) {
        if (item.type === 'chunk' && nome.endsWith('.js')) {
          // Evita que um "</script>" dentro de string feche a tag antes da hora.
          const codigo = item.code.replace(/<\/script/gi, '<\\/script')
          fonte = fonte.replace(
            new RegExp(`<script[^>]*src="[^"]*${escaparRegex(nome)}"[^>]*></script>`),
            () => `<script type="module">\n${codigo}\n</script>`,
          )
          delete bundle[nome]
        } else if (item.type === 'asset' && nome.endsWith('.css')) {
          fonte = fonte.replace(
            new RegExp(`<link[^>]*href="[^"]*${escaparRegex(nome)}"[^>]*>`),
            () => `<style>\n${String(item.source)}\n</style>`,
          )
          delete bundle[nome]
        }
      }

      fonte = fonte.replace(/[ \t]*<link[^>]*rel="modulepreload"[^>]*>\n?/g, '')
      html.source = fonte
    },
  }
}

export default defineConfig(({ command }) => ({
  plugins: [react(), paginaAutonoma()],
  // Caminhos relativos deixam o build portátil (qualquer pasta/servidor).
  base: command === 'build' ? './' : '/',
  server: {
    port: 5173,
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
}))
