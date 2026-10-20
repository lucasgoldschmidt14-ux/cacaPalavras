# Fontes e licenças

As listas em `src/data/` foram geradas por `scripts/build-words.mjs` a partir das
fontes abaixo. Elas são dados derivados; os textos originais e as licenças
continuam pertencendo aos respectivos projetos.

## Listas de palavras

### pythonprobr/palavras — MPL-2.0

- Fonte: https://github.com/pythonprobr/palavras
- Uso: base ampla de palavras do português, origem do arquivo `palpites.txt`
  (34.046 palavras de 4 a 6 letras, normalizadas para A-Z).
- Licença: Mozilla Public License 2.0. O texto da licença está disponível em
  https://www.mozilla.org/MPL/2.0/.
- O script de geração e os arquivos derivados estão neste repositório; para
  redistribuir, mantenha esta atribuição e o link para a fonte.

### hermitdave/FrequencyWords — MIT

- Fonte: https://github.com/hermitdave/FrequencyWords
- Arquivo usado: `content/2018/pt_br/pt_br_50k.txt`
- Uso: ranking de frequência para selecionar e ordenar as respostas de 4 e 6
  letras.
- Licença: MIT.

### vhfarias/omret — sem licença declarada

- Fonte: https://github.com/vhfarias/omret
- Arquivo usado: `database/wordList.json` (cópia em
  `scripts/raw/termo-wordlist.json`)
- Uso: lista curada de 2.002 palavras de 5 letras, usada como respostas do modo
  clássico.
- **Atenção:** o repositório não declara uma licença. A lista é composta por
  palavras comuns, mas, para distribuição pública ou comercial, recomenda-se
  substituí-la por uma fonte com licença explícita ou revisar a situação
  jurídica com responsabilidade própria.

## Filtros aplicados

As respostas de 4 e 6 letras passam por bloqueios de nomes próprios, palavrões,
gírias e estrangeirismos, além de regras de plural, vogais, repetição e
terminações típicas do português. Elas são limitadas às 800 palavras mais
frequentes que passam nos filtros. A lista de 5 letras é curada e passa apenas
pelos bloqueios de nomes e palavrões.

## Software

- React e React DOM — MIT
- Vite — MIT
- TypeScript — Apache-2.0
- Vitest — MIT

As licenças completas de cada dependência estão em `node_modules/` após a
instalação.
