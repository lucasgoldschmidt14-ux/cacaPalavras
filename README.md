# cacaPalavras

Jogo casual de **adivinhação de palavras** em português do Brasil, no estilo
Wordle/TERMO. Apesar do nome, não é uma sopa de letras: o objetivo é descobrir a
palavra secreta com pistas de cor.

Feito para o navegador, com layout **mobile-first**, teclado virtual e progresso
salvo localmente. Não há backend: a palavra do dia é calculada no cliente de
forma determinística.

## Funcionalidades

- **Palavra do dia** igual para todos os jogadores, com sequência de vitórias.
- **Modo livre ilimitado**, com estatísticas separadas do diário.
- Três tamanhos de palavra: **4, 5 e 6 letras** (6, 6 e 5 tentativas).
- **Modo difícil** opcional: as dicas reveladas precisam ser reaproveitadas.
- Teclado físico e virtual, com o estado de cada letra (verde, amarela ou cinza).
- Acentuação ignorada na comparação; a grafia acentuada aparece nas letras certas.
- Animações de virada, aviso de palavra inválida e fim de jogo.
- **Compartilhamento** do resultado em emojis, sem revelar a palavra.
- **Estatísticas**: partidas, vitórias, sequência atual e recorde, distribuição
  por tentativas.
- **Arquivo dos últimos 30 dias**, com resultado e opção de revanche.
- Progresso e preferências persistidos no `localStorage`.
- Respeito a `prefers-reduced-motion`, foco visível e rótulos de acessibilidade.

## Como jogar

Cada palpite deve ter o mesmo número de letras da palavra secreta.

| Cor | Significado |
| --- | --- |
| 🟩 Verde | A letra existe e está na posição certa. |
| 🟨 Amarela | A letra existe, mas está em outra posição. |
| ⬛ Cinza | A letra não existe na palavra (ou já teve todas as ocorrências usadas). |

- Letras repetidas são contabilizadas corretamente: cada ocorrência da resposta é
  usada no máximo uma vez.
- Acentos são ignorados: `A` vale para `Á`, `Ã`, `Â` etc. O teclado virtual tem
  apenas A–Z (o `Ç` é digitado como `C`).
- O modo difícil exige usar todos os verdes e, quando não houver verdes, pelo
  menos um amarelo da tentativa anterior. Ele vale a partir da segunda jogada.
- No diário, a sequência só avança com a partida oficial do dia. Revanches no
  arquivo e partidas do modo livre não alteram a sequência.

## Rodando o projeto

Requisitos: **Node.js 20.19+** (ou 22.12+) e npm.

```bash
npm install
npm run dev       # servidor de desenvolvimento em http://localhost:5173
```

Outros comandos:

```bash
npm test          # testes unitários (Vitest)
npm run test:watch
npm run build     # checagem de tipos + build de produção em dist/
npm run preview   # serve o build de produção
```

### Abrir sem servidor

O build gera um `dist/index.html` autônomo: o JavaScript e o CSS ficam embutidos
no próprio arquivo. Assim, dá para abrir o jogo com duplo clique, sem servidor:

```bash
npm run build
xdg-open dist/index.html   # Linux; use "open" no macOS
```

O `favicon.svg` fica ao lado do HTML e é opcional. A pasta `dist/` também pode
ser publicada em qualquer hospedagem estática.

## Testes

A camada `src/core/` é pura, sem React, e concentra as regras testáveis:

- avaliação de letras (incluindo o caso clássico de letras repetidas);
- normalização de texto e acentos;
- data local, embaralhamento determinístico e índice do dia;
- dificuldades e modo difícil;
- estatísticas e sequência;
- persistência com envelope versionado e tolerância a dados corrompidos;
- geração do texto de compartilhamento.

```bash
npm test
```

## Arquitetura

```text
src/
  core/          regras puras: avaliação, diário, estatísticas, persistência...
  data/          listas de palavras e seleção da palavra do dia
  components/    telas e componentes de interface
  estado.ts      formato do estado + hidratação defensiva
  useJogo.ts     ações da partida, persistência e regras de estatística
  App.tsx        navegação entre telas e modais
  styles.css     tema, layout responsivo e animações
scripts/
  build-words.mjs        geração das listas
  raw/termo-wordlist.json
```

As listas são embutidas no bundle pelo Vite (`?raw`). A palavra do dia usa uma
permutação determinística da lista de respostas e o número de dias desde
1970-01-01, portanto não depende de `Math.random()`.

## Dicionários

Arquivos gerados e versionados em `src/data/`:

| Arquivo | Conteúdo |
| --- | --- |
| `palpites.txt` | 34.046 palavras válidas de 4 a 6 letras (A–Z, sem acento) |
| `respostas.txt` | 800 respostas de 4 letras, 2.002 de 5 e 800 de 6, no formato `exibição\|NORMALIZADA` |

Para regenerar:

```bash
curl -L https://raw.githubusercontent.com/pythonprobr/palavras/master/palavras.txt -o /tmp/palavras.txt
curl -L https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/pt_br/pt_br_50k.txt -o /tmp/freq.txt
node scripts/build-words.mjs /tmp/palavras.txt /tmp/freq.txt scripts/raw/termo-wordlist.json
```

As respostas de 4 e 6 letras são geradas por frequência e passam por filtros de
nomes próprios, palavrões, plurais triviais, vogais, repetições e terminações
típicas. As de 5 letras vêm de uma lista curada, que passa pelos bloqueios de
nomes e palavrões.

**Fontes e licenças:** veja [`NOTICE.md`](NOTICE.md). A lista curada de 5 letras
não declara licença; para distribuição pública ou comercial, ela deve ser
substituída ou revisada.

## Persistência e privacidade

- Chave do `localStorage`: `cacapalavras`.
- Envelope versionado: `{ "versao": 1, "dados": { ... } }`.
- Dados inválidos ou de versão desconhecida são descartados sem quebrar o jogo.
- Nada é enviado a servidores. Como o jogo roda inteiramente no cliente, a
  resposta também fica acessível no armazenamento local e no bundle — isso é
  inerente a um jogo sem backend.
- Para apagar tudo, limpe os dados do site no navegador. As estatísticas também
  podem ser zeradas na interface.

## Limitações e próximos passos

- Sem sincronização entre abas ou dispositivos.
- Sem PWA/offline, tema escuro, i18n ou modos versus/multi-grid (backlog).
- Ao trocar as listas, as palavras diárias futuras mudam; o histórico guarda a
  palavra já jogada para as revanches.
- O bundle inclui os dicionários (≈196 kB gzip); um carregamento sob demanda
  pode reduzi-lo.

## Licenças

Código do projeto: não há licença definida neste repositório; consulte o autor
antes de redistribuir. As dependências mantêm suas licenças (React, Vite e
Vitest: MIT; TypeScript: Apache-2.0). As listas de palavras e suas atribuições
estão detalhadas em [`NOTICE.md`](NOTICE.md).
