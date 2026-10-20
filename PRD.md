# PRD — cacaPalavras

**Jogo casual de adivinhação de palavras para navegador (web), mobile-first, em Português do Brasil.**

| Campo | Valor |
| --- | --- |
| Versão do documento | 1.1 |
| Status | Implementado (entrega 1) |
| Stack | React + TypeScript + Vite |
| Plataforma | Web (browser), mobile-first |
| Monetização | Nenhuma |

---

## 1. Resumo

Um jogo casual em que o jogador adivinha uma palavra secreta usando apenas pistas de cor sobre as letras. O jogador tem um número limitado de tentativas; a cada tentativa as letras são marcadas como **verde** (na posição certa), **amarelo** (existe na palavra, mas noutra posição) ou **cinza** (não existe na palavra).

O produto aposta no clássico bem executado — sem variantes experimentais na primeira entrega — apoiado por um forte motor de retenção diário (mesma palavra para todos no mesmo dia, sequência de vitórias e resultado compartilhável).

## 2. Objetivos e não-objetivos

### 2.1 Objetivos

1. Entregar uma experiência de jogo de palavras de referência em PT-BR no navegador móvel, rápida (carregamento inicial pequeno) e jogável com uma mão só.
2. Garantir retenção diária por meio da **palavra do dia** e da **sequência de vitórias**.
3. Permitir que qualquer jogador conclua uma partida sem ajuda externa, com autoexplicação das cores na própria tela.
4. Preservar o progresso entre sessões e dispositivos do mesmo navegador (persistência local).

### 2.2 Não-objetivos (fora do escopo da entrega 1)

- Multiplayer, salas privadas, challenges por link.
- Contas de usuário, login, sincronização em nuvem.
- Monetização (anúncios, compras, dicas pagas).
- Backend, API ou banco de dados.
- Aplicativo móvel nativo (iOS/Android) e PWA instalável.

---

## 3. Definição do jogo

### 3.1 Conceito

O jogador recebe um tabuleiro com N colunas (uma por letra da palavra secreta) e M linhas (uma por tentativa). Digita uma palavra de N letras e confirma. O jogo aplica o algoritmo de avaliação e devolve as cores de cada letra. Ao acertar todas as letras na posição correta, vence. Ao esgotar as tentativas, a resposta é revelada.

### 3.2 Regras

1. A palavra secreta tem **4, 5 ou 6 letras** (conforme a dificuldade escolhida).
2. O jogador dispõe de **6 tentativas** para palavras de 4 ou 5 letras e **5 tentativas** para palavras de 6 letras.
3. Cada tentativa deve ser uma **palavra válida do dicionário de palpites** com exatamente N letras. Palavras inválidas são rejeitadas com aviso e **não consomem tentativa**.
4. O jogo avalia a tentativa contra a palavra secreta e colore cada letra:
   - **🟩 Verde** — a letra existe na palavra secreta **e** está na posição correta.
   - **🟨 Amarelo** — a letra existe na palavra secreta, mas **não** na posição usada.
   - **⬜ Cinza** — a letra **não existe** na palavra secreta ou já teve todas as suas ocorrências consumidas por outras posições.
5. Acertos (verde) e letras presentes (amarelo) ficam registrados no **teclado** com o mesmo código de cor.
6. Acertar a palavra encerra a partida imediatamente. Esgotar as tentativas também a encerra, revelando a resposta.
7. A partida só é considerada concluída quando o jogador **confirmar** uma tentativa válida.

### 3.3 Algoritmo de avaliação (crítico)

A avaliação deve tratar corretamente **letras repetidas**. Regras de implementação:

1. Normalizar o texto: `uppercase`, remover acentos e diacríticos e manter apenas letras `A-Z` (espaços, hífens e outros caracteres são descartados). A palavra canônica é sempre sem acento.
2. **Primeira passagem** — marcados como verdes: para cada posição `i`, se `palpite[i] == resposta[i]`, marcar verde em `i` e consumir a ocorrência da letra na resposta.
3. **Segunda passagem** — restantes: para cada posição `i` ainda não marcado, se ainda houver ocorrência disponível da letra `palpite[i]` na resposta, marcar amarelo em `i` e consumir a ocorrência. O que sobrar permanece cinza.
4. Cada ocorrência da resposta é consumida **no máximo uma vez**. Exemplo canônico: resposta `ALIBI`, palpite `LLAMA` → `L` cinza (pos. 0), `L` verde (pos. 1), `A` amarelo (pos. 2), `M` cinza, `A` cinza.

### 3.4 Dicionário de entrada e normalização

- **Acentos nunca contam como erro.** Palavras com acento são aceitas na digitação e convertidas para a forma sem acento antes da comparação (ex.: `coração` → `CORACAO`). A palavra é gravada sem acento na lista de palpites.
- **Alfabeto:** apenas `A-Z`. Caracteres fora desse conjunto são ignorados na entrada.
- Entrada maiúscula ou minúscula indiferente.

### 3.5 Modo difícil (regras confirmadas)

O jogador pode ativar o modo difícil, que passa a exigir:

1. Usar **todas as letras verdes** da tentativa anterior, nas mesmas posições.
2. Na ausência de verdes, usar **ao menos uma letra amarela** da tentativa anterior.
3. O modo difícil é opcional, vale a partir da segunda tentativa e é indicado por um selo na partida. Sem ele, o jogador pode testar qualquer palavra válida.

### 3.6 Dicionário

Duas listas distintas, com finalidades distintas:

- **`palpites`** — 34.046 palavras de 4 a 6 letras. Define o que o jogador pode submeter. Nunca é a resposta obrigatória.
- **`respostas`** — 800 palavras de 4 letras, 2.002 de 5 letras e 800 de 6 letras, com a grafia acentuada preservada para exibição.

Requisitos de qualidade aplicados às respostas geradas (4 e 6 letras):

- Sem nomes próprios, palavrões, gírias ou estrangeirismos óbvios.
- Sem plural trivial (termina em S e o singular também é palavra válida).
- Pelo menos uma vogal e nenhuma sequência de 3 letras iguais.
- Terminações típicas do português (vogal, S, R, L, Z ou M) e sem K, W ou Y.
- As respostas de 4 e 6 letras são selecionadas por frequência; as de 5 letras vêm de uma lista curada, que passa pelos bloqueios de nomes próprios e palavrões.

As fontes e o licenciamento das listas estão em `NOTICE.md`. Para distribuição pública ou comercial, o licenciamento deve ser revisado.

### 3.7 Dificuldades

Presets expostos na tela inicial e no menu de cada partida:

| Preset | Letras | Tentativas | Característica |
| --- | --- | --- | --- |
| Fácil | 4 | 6 | Palavras curtas |
| Normal | 5 | 6 | Padrão do gênero |
| Difícil | 6 | 5 | Palavras maiores, menos tentativas |

O preset define o tamanho da palavra e o número de tentativas. O **modo difícil** é um interruptor independente, que exige reaproveitar as dicas reveladas. As preferências ficam registradas para a próxima partida.

### 3.8 Modos de jogo

**Modo diário**
- Uma palavra por dia, **idêntica para todos os jogadores** com a mesma quantidade de letras.
- Seleção **determinística no cliente**, sem servidor: a lista de respostas é embaralhada com PRNG de semente fixa e o índice é `diasDesdeEpoca(AAAA-MM-DD) % tamanho`. Dias consecutivos usam posições consecutivas do baralho, evitando palavras em ordem alfabética e repetições antes de percorrer a lista inteira.
- O dia de referência é a **data local do navegador** (evita divergência com o servidor e mantém a mesma palavra para o usuário durante o dia todo).
- Ao concluir a partida do dia, a tela inicial passa a exibir **Ver resultado**; o tabuleiro fica disponível para consulta e uma nova partida oficial só acontece no dia seguinte.

**Modo ilimitado**
- Palavra aleatória a cada partida, quantas partidas o jogador quiser.
- Registro separado das estatísticas (não afeta a sequência do diário).

### 3.9 Arquivo / calendário

- Tela listando os últimos dias (mínimo 30 dias), com a data e o resultado (vitória em N tentativas / derrota).
- Cada entrada permite **rejogar** aquele dia. Para dias já jogados, a revanche usa a mesma palavra, o mesmo tamanho e o mesmo número de tentativas; para dias não jogados, vale o preset atual. A revanche é identificada na interface e **não altera estatísticas nem o histórico oficial**.
- O dia corrente aparece destacado; se já concluído, permite apenas ver o resultado. Datas futuras não são exibidas nem navegáveis.

---

## 4. Funcionalidades

### 4.1 Loop de jogo (Obrigatório)

| ID | Requisito |
| --- | --- |
| F-01 | Tela inicial com o nome do jogo, seleção de modo (Diário / Ilimitado), seleção de preset de dificuldade e opção de modo difícil. |
| F-02 | Tabuleiro com M linhas (tentativas) × N colunas (letras); a linha atual é editável, as anteriores ficam travadas e coloridas. |
| F-03 | Digitação por teclado físico e por teclado virtual na tela; o teclado virtual fica sempre visível no mobile e o físico funciona quando disponível. |
| F-04 | Enter confirma o palpite; se faltarem letras, o jogo avisa e sacode a linha sem consumir tentativa. |
| F-05 | Teclado virtual com um estado por letra, refletindo a melhor informação obtida até agora (verde > amarelo > cinza > desconhecida). |
| F-06 | Validação do palpite contra a lista `palpites`; palpite inválido exibe aviso e não consome tentativa. |
| F-07 | Aplicação das cores conforme a seção 3.3, incluindo letras repetidas. |
| F-08 | Animação de virada dos tiles, escalonada da esquerda para a direita. |
| F-09 | Fim de partida: vitória (com contagem de tentativas) ou derrota (revelando a resposta). |
| F-10 | Tela de fim com botões: compartilhar, ver estatísticas, próxima partida (no ilimitado) ou voltar ao início (no diário). |

### 4.2 Compartilhamento (Obrigatório)

| ID | Requisito |
| --- | --- |
| F-11 | Gera uma grade de blocos coloridos com as tentativas (emojis ou texto equivalente), sem revelar a palavra. |
| F-12 | Texto com identificação do jogo, o resultado, a quantidade de letras, o número de tentativas (`4/6`) e a sequência de vitórias (`🔥 12`, quando maior que zero). |
| F-13 | Botão "copiar" que usa a Clipboard API, com fallback para `textarea`/`execCommand`; confirmação visual de "copiado". |

Exemplo de saída:

```
cacaPalavras 3/6
5 letras

🟩⬛🟨⬛⬛
🟩🟩🟨🟩⬛
🟩🟩🟩🟩🟩
🔥 12
```

### 4.3 Estatísticas e sequência (Obrigatório)

| ID | Requisito |
| --- | --- |
| F-14 | Estatísticas separadas por modo: vitórias, partidas jogadas, % de acerto, sequência atual e recorde de sequência. |
| F-15 | Distribuição das vitórias por número de tentativas (gráfico de barras de 1 a N). |
| F-16 | A sequência do diário só é alterada pelo modo diário; o ilimitado não a modifica. |
| F-17 | A sequência zera apenas quando o jogador conclui uma partida do dia com derrota; simplesmente não jogar não a zera. |
| F-18 | Botão de zerar estatísticas, com confirmação explícita. |

### 4.4 Persistência (Obrigatório)

| ID | Requisito |
| --- | --- |
| F-19 | O estado completo do tabuleiro é salvo a cada ação; ao reabrir, a partida continua de onde parou. |
| F-20 | Estatísticas, sequência, preferências de dificuldade e o histórico do arquivo persistem localmente. |
| F-21 | O estado é versionado (campo `versao` no envelope); migrações futuras não quebram o salvamento existente. |

### 4.5 Acessibilidade e mobile

| ID | Requisito |
| --- | --- |
| F-22 | Layout responsivo; funciona corretamente de 320 px a 1440 px de largura; sem rolagem horizontal. |
| F-23 | Navegação completa por teclado físico, incluindo backspace e Enter. |
| F-24 | Cores acompanhadas de rótulos textuais/ícones, para não depender apenas de cor. |
| F-25 | Alvos de toque com no mínimo 44 px. |
| F-26 | Respeita `prefers-reduced-motion`, desativando as animações de virada. |

---

## 5. Fora do escopo (backlog)

- Modo escuro e temas alternativos.
- Instalação como PWA e funcionamento offline.
- Multi-grid (2, 4, 8 palavras simultâneas).
- Modos temáticos por categoria (animais, países, profissões).
- Desafio versus com código por link.
- Suporte a outros idiomas (PT-PT, inglês).
- Analytics e telemetria.

---

## 6. Stack técnica

| Camada | Escolha |
| --- | --- |
| Build | Vite |
| Linguagem | TypeScript (modo estrito) |
| UI | React |
| Estado | Hooks do React (`useJogo`), sem biblioteca externa |
| Persistência | `localStorage` (wrapper com versionamento) |
| Estilo | CSS puro com variáveis CSS (tokens de cor por estado da letra) |
| Testes | Vitest |
| Deploy | Hospedagem estática (qualquer CDN) |

**Sem backend.** Toda a lógica — seleção da palavra diária, avaliação, estatísticas — roda no cliente.

---

## 7. Arquitetura sugerida

```
src/
  data/
    palpites.txt       // 34.046 palavras válidas (A-Z, sem acento)
    respostas.txt      // respostas no formato exibição|normalizada
    index.ts           // carregamento, dicionários por tamanho e palavra do dia
  core/
    tipos.ts           // tipos compartilhados
    normalizar.ts      // sem acento, maiúsculas, filtro A-Z
    avaliar.ts         // algoritmo de letras repetidas (seção 3.3)
    diario.ts          // data local, embaralhamento determinístico e índice do dia
    dificuldade.ts     // presets e tentativas
    estatisticas.ts    // sequência, distribuição, % de acerto
    persistencia.ts    // wrapper de localStorage versionado
    compartilhar.ts    // grade e texto de resultado
    jogo.ts            // criação da partida, validação e modo difícil
    *.test.ts          // testes unitários da camada core
  components/
    TelaInicio, Jogo, Tabuleiro, Teclado, Modal,
    Estatisticas, Ajuda, Arquivo, Resultado, icones
  estado.ts            // estado do app e hidratação defensiva
  useJogo.ts           // ações, persistência e regras de estatística
  App.tsx              // navegação entre telas e modais
  styles.css           // tokens, layout, animações e responsividade
  clipboard.ts         // cópia com fallback
scripts/
  build-words.mjs      // geração das listas de palavras
  raw/termo-wordlist.json
public/
  favicon.svg
```

A camada `core` é **pura e sem dependência de React**, testada de forma isolada. Os testes ficam ao lado dos módulos (`*.test.ts`).

---

## 8. Testes

Prioridade na lógica de `core`, onde está o risco real de bugs.

| ID | Caso de teste |
| --- | --- |
| T-01 | Palavra completamente correta: todas as letras verdes. |
| T-02 | Nenhuma letra presente: todas cinza. |
| T-03 | Letra presente na posição errada: amarelo. |
| T-04 | Letra repetida com excesso no palpite: cinza (ex.: `ALIBI` × `LLAMA`). |
| T-05 | Letra repetida com excesso na resposta: múltiplos amarelos/verdes corretos. |
| T-06 | Letra verde não pode ser marcada amarela em outra posição da mesma tentativa. |
| T-07 | Normalização: `cORAÇÃO` e `coracao` produzem o mesmo resultado. |
| T-08 | Palpite de tamanho errado é rejeitado sem consumir tentativa. |
| T-09 | Mesmo dia gera sempre o mesmo índice de palavra; dias consecutivos geram índices diferentes. |
| T-10 | Estatísticas: vitória na 1ª, na 3ª e derrota; conferir distribuição, % de acerto e sequência. |
| T-11 | Sequência zera na derrota do diário e não é alterada pelo modo ilimitado. |
| T-12 | Persistência: gravar e reler o estado mantém tabuleiro e estatísticas. |
| T-13 | Modo difícil: verde fora do lugar e amarela ignorada são rejeitados; primeira tentativa é livre. |
| T-14 | Persistência: JSON corrompido e envelope de versão antiga caem no estado padrão sem quebrar. |
| T-15 | Compartilhamento: texto não revela a palavra e usa `X` em caso de derrota. |

**Implementação:** 47 testes em 6 arquivos (`npm test`), cobrindo avaliação (incluindo letras repetidas), normalização, diário, estatísticas, persistência, modo difícil e compartilhamento.

---

## 9. Riscos e mitigações

| Risco | Mitigação |
| --- | --- |
| Qualidade/licenciamento do dicionário PT-BR | Listas abertas, filtros automáticos e revisão manual das respostas; fontes e licenças em `NOTICE.md`. Revisar antes de distribuição pública/comercial. |
| Bug clássico na avaliação de letras repetidas | Algoritmo de duas passagens (seção 3.3) e testes T-04 a T-06. |
| Jogadores em fusos horários diferentes vendo dias diferentes | O dia é definido pela data local e isso é explicado na interface; o modo livre serve para prática. |
| Palavra diária nondeterminística após atualização do dicionário | Embaralhamento determinístico sobre uma lista versionada; nunca usar `Math.random()` no diário. Replays usam a palavra gravada no histórico. |
| Palavras «óbvias» quebrando o desafio | Filtro de qualidade aplicado à lista de respostas (seção 3.6). |
| Fuso horário e estado corrompido | Dia definido pela data local; wrapper de persistência com `versao` e fallback para estado limpo em caso de leitura inválida. |

---

## 10. Métricas de sucesso

| Métrica | Meta |
| --- | --- |
| Jogadores que concluem uma partida sem abrir a tela de ajuda | > 90% |
| Retenção no dia 7 | > 15% |
| Partidas por sessão | ≥ 2 |
| Taxa de compartilhamento entre jogadores ativos | > 10% das vitórias |
| Erros de avaliação de letras | 0 |
---

## 11. Implementação da entrega 1

### 11.1 Como executar

```bash
npm install
npm run dev       # desenvolvimento
npm test          # testes unitários
npm run build     # checagem de tipos + build de produção
npm run preview   # build de produção local
```

Requisitos: Node.js 20.19+ (ou 22.12+).

### 11.2 Decisões implementadas

- **Palavra do dia:** a lista de respostas é embaralhada uma vez com PRNG de
  semente fixa (mulberry32); o índice é `diasDesdeEpoca(dataLocal) % total`.
  Cada tamanho (4, 5, 6) tem sua própria ordem. Não há `Math.random()` no diário.
- **Tentativas:** 6 para 4 e 5 letras, 5 para 6 letras. O modo difícil é
  independente, opcional e válido a partir da segunda tentativa.
- **Acentos:** a comparação usa a forma normalizada (A–Z, maiúscula); os acertos
  exibem a grafia original da resposta (`exibicao`). O teclado virtual tem A–Z.
- **Estatísticas:** o diário e o modo livre têm contadores separados. A sequência
  só é alterada pela partida oficial do dia atual; revanches do arquivo não
  gravam histórico nem estatísticas.
- **Arquivo:** últimos 30 dias, com data, resultado e ação. Dias passados já
  jogados podem ser rejogados com a palavra e o número de tentativas originais;
  dias não jogados usam o preset atual. O dia atual, depois de concluído, apenas
  exibe o resultado.
- **Persistência:** chave `cacapalavras`, envelope `{ versao: 1, dados }`.
  A hidratação valida o formato e descarta uma partida diária de outro dia.
- **Compartilhamento:** texto com modo/tentativas, quantidade de letras, grade de
  emojis e sequência (quando maior que zero), sem revelar a palavra.
- **Sem backend:** a resposta fica no estado local e no bundle. É uma limitação
  inerente ao escopo, aceita por não haver ranking competitivo.

### 11.3 Fora do escopo desta entrega (backlog)

- PWA/offline, tema escuro, i18n, multi-grid e modos temáticos.
- Modo versus, desafios por link e ranking.
- Sincronização entre abas (`storage` event) e entre dispositivos.
- Code-splitting dos dicionários para reduzir o bundle inicial.
- Analytics e testes de retenção.

### 11.4 Verificação

- `npm test`: **47 testes em 6 arquivos**, todos passando.
- `npm run build`: `tsc --noEmit` limpo e build Vite concluído.
  - JS: 521,16 kB (195,95 kB gzip); CSS: 20,01 kB (5,10 kB gzip).
  - O Vite emite aviso de chunk > 500 kB por causa das listas embutidas; o
    carregamento sob demanda está no backlog.
- QA manual em Chrome headless, viewports 390×844 e 1280×900: início, partida
  diária, palavra inválida, vitória, retomada após reload, tamanhos 4/5/6, modo
  difícil, estatísticas, arquivo, revanche e compartilhamento.
