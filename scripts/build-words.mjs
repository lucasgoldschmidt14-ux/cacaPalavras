#!/usr/bin/env node
/**
 * Gera as listas de palavras do jogo.
 *
 * Fontes:
 *  - Lista ampla de palavras do português: https://github.com/pythonprobr/palavras (MPL-2.0)
 *  - Frequência de palavras PT-BR (legendas): https://github.com/hermitdave/FrequencyWords (MIT)
 *  - Lista curada de 5 letras: https://github.com/vhfarias/omret (sem licença declarada)
 *
 * Detalhes de atribuição e licenciamento: NOTICE.md.
 *
 * Uso:
 *   node scripts/build-words.mjs <palavras.txt> <freq.txt> [termo-wordlist.json]
 *
 * Exemplo (com a lista curada de 5 letras):
 *   node scripts/build-words.mjs palavras.txt freq.txt scripts/raw/termo-wordlist.json
 *
 * Saída:
 *   src/data/palpites.txt  -> palavras normalizadas (A-Z, sem acento), 4 a 6 letras
 *   src/data/respostas.txt -> palavras de resposta (com acento, minúsculas), curadas
 */

import fs from 'node:fs'
import path from 'node:path'

const [, , arquivoDicionario, arquivoFrequencia] = process.argv
if (!arquivoDicionario || !arquivoFrequencia) {
  console.error('Uso: node scripts/build-words.mjs <palavras.txt> <freq.txt> [termo-wordlist.json]')
  process.exit(1)
}

const TAMANHOS = [4, 5, 6]
const MAX_RESPOSTAS_POR_TAMANHO = 1400

// Palavras que nunca devem ser resposta: palavrões, gírias e estrangeirismos.
const BLOQUEIO_RESPOSTA = new Set(`
BUCETA BUNDA CARALHO CERROTES FODA FODER FODIDO MERDA PENIS PORRA
PUTA PUTAS PUTINHO PUTINHA XOXOTA TESAO PIRU PICA PINTO ROLA
BABACA BADALADO BAGULHO BAIXARIA BOCETA BOLACHA BOSTA CACETE CAFONA CAFONO
CARACA CARAMBA CORNO CORNA CUZAO FODASE FODACE OTARIA OTARIO SAFADO SAFADA
VAGABUNDA VAGABUNDO VIADO VEADO
BLOGGER COMPUTER DOWNLOAD EMAIL FACEBOOK GOOGLE INTERNET IPHONE LAPTOP
LOGIN NOTEBOOK ONLINE PENDRIVE PLAYSTATION SMARTPHONE SOFTWARE TABLET
TWITTER VIDEOGAME WINDOWS YOUTUBE WHATSAPP
`.split(/\s+/).filter(Boolean))

// Nomes próprios que não devem ser resposta. A lista foi revisada manualmente:
// palavras comuns que também são nomes (ALMA, FLOR, ROSA, CLARA, BRANCO...)
// NÃO entram aqui.
const BLOQUEIO_NOMES = new Set(`
ABEL ADAO AIDA AIME AJAX ALAN ALDO AMIN AMIR AMON AMOS ANIA ARNO ARON AXEL AZIZ
BENE BOAZ CECI CIRO CLEO CRIS CURT DARA DAVI DEDE DELI DIDI DINA DINO DORI EDEN
ELBA ELIA ELMO EMIR ENOS EROS FRED GAEL GENE GINO HANA HANS HARI IAGO IGOR ILSA
INES INGE IONA IRES IRON ISIS IVES JACO JEAN JOEL JUDA JUMA JUNE KARL LANA LARA
LEVI LEVY LILA LILI LINE LINO LISE LOLA LORE LORI LUCI LUNA MACO MAIA MALI MARA
MARC MARE MARI MARX MAXI MILA MONA NANA NARA NATA NERI NERO NICE NILO NINA NOEL
NOIR NUNO OLGA OMAR PALO PAUL PERI PERO RANA RANI RAUL RENE RITA ROSE SAUL SIRO
THOR TITO TONI YANG ZARA ZECA ZITO
ABNER ADELE ADLER AIMEE AIRES ALEX EMMA GERSON JOAO JOSE KEVIN MANUEL RAMIRO ROMA SACHA EDIPO ALAIN ALEXA ALICE AMARO ANDRE ANGEL ANTON APOLO ARIEL
ARTUR ASTOR BENTA BERTA BOSCO BRUCE CAIRO CARLO CAROL CESAR CHANG CHICO DARIO
DAVID DENIS DIANA DIANE DIEGO EDGAR ELDER ELISE ELMER ELTON ELVIS EMILE ERICA
ESTER FABIO FELIX FIDEL HEIDI HELEN HELGA HENRI HUGO ILANA IRENE ISAAC IVAN
JAIME JAMAL JANE JEOVA JOANA JOHN JORGE JOSIE JOSUE JUAN JULIO KARLA KATIA KLAUS
LAILA LEILA LIBIA LIVIA LUCAS LUCIA LUIGI LUISA LUIS LUIZ MABEL MAGDA MARGO
MARIA MARIE MARIO MARLA MARTA MAURA MIKE MOIRA MOSES NADIA NANCY NANDO NAZIR
OLIVA ORION OSCAR PABLO PAOLO PAULA PAULO PETER PETRA RAMON REGIS REINA ROBIN
ROGER ROMEU RONAN RUBEN SAARA SAINT SAIRA SARA SARAH SELMA SILVA SIMAO SIMON
SIRIA SOFIA SONIA SOUZA SUSAN TALIA TIAGO VASCO VERA VIDAL WEBER ZELDA
ABRAAO ALBERT ALEXIS ALONSO AMELIA ANDREA ANDREI ANGELO ARLENE ARTHUR ARTURO
BENITO BRENDA CALVIN CAMILA CARMEN CASTRO CELINE CLAIRE CLAUDE DALTON DANIEL
DARWIN DENISE DIETER EDISON EDWARD ELAINE ELVIRA EMILIA EMILIO EUNICE FAUSTO
FELIPE FILIPE GARCIA GEORGE GIBSON GIULIA GLENDA GRECIA HECTOR HELENA HELENE
HERMES HILTON HUDSON ITALIA ISABEL JANICE JANINE JAVIER JUAREZ JULIAN JULIUS
KARINA LAZARO LILIAN LIONEL LOUISE MANOLO MARCEL MARCUS MARINE MARINO MARISA
MARLON MARTIN MICHEL MIGUEL MILTON MIRIAM MOISES MORGAN MOZART MULLER MURIEL
NADINE NAZARE NELSON NESTOR NICOLE NORMAN NORTON OLIMPO OLIVER OLIVIA PAMELA
PIERRE PIETRO QUENIA RAFAEL RAMONA RAMSES RAQUEL REGINA RONALD ROMERO SABINA
SABINE SAMUEL SANSAO SELENA SERGIO SERVIO SIDNEY SILVIA SIMONE SOPHIA SYDNEY
TAMARA TAYLOR TERESA THOMAS TOBIAS URSULA VICTOR VIVIAN WAGNER WALTER WATSON
WILSON XAVIER ANUBIS BALTAR BORGIA BRUTUS BERLIM ANGOLA AFRICA ALASCA ARABIA
APACHE ARCHER BALBOA BLANCO BLAZER BRIDGE VENUS VASCO
`.split(/\s+/).filter(Boolean))

const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase()

const lerLinhas = (arquivo) => fs.readFileSync(arquivo, 'utf8').split(/\r?\n/).filter(Boolean)

// 1. Dicionário de palpites: qualquer palavra alfabética de 4 a 6 letras.
const palpitesPorTamanho = new Map(TAMANHOS.map((t) => [t, new Set()]))
for (const linha of lerLinhas(arquivoDicionario)) {
  const palavra = normalizar(linha)
  if (!TAMANHOS.includes(palavra.length)) continue
  if (!/^[A-Z]+$/.test(palavra)) continue
  palpitesPorTamanho.get(palavra.length).add(palavra)
}

// 2. Candidatos a resposta: palavras frequentes que existem no dicionário.
const candidatosPorTamanho = new Map(TAMANHOS.map((t) => [t, []]))
const vistos = new Map(TAMANHOS.map((t) => [t, new Set()]))

for (const linha of lerLinhas(arquivoFrequencia)) {
  const [bruta, contagem] = linha.split(' ')
  if (!bruta) continue
  const exibicao = bruta.trim().toLowerCase()
  const normalizada = normalizar(exibicao)
  if (!TAMANHOS.includes(normalizada.length)) continue
  if (!palpitesPorTamanho.get(normalizada.length)?.has(normalizada)) continue
  if (vistos.get(normalizada.length).has(normalizada)) continue
  vistos.get(normalizada.length).add(normalizada)
  candidatosPorTamanho.get(normalizada.length).push({
    exibicao,
    normalizada,
    frequencia: Number(contagem) || 0,
  })
}

const vogais = new Set(['A', 'E', 'I', 'O', 'U'])
const ehBoaResposta = ({ exibicao, normalizada }) => {
  if (BLOQUEIO_RESPOSTA.has(normalizada)) return false
  if (BLOQUEIO_NOMES.has(normalizada)) return false
  if (exibicao !== exibicao.toLowerCase()) return false

  // Evita palavras com letras repetidas em sequência (ex.: "SSSS").
  if (/(.)\1\1/.test(normalizada)) return false

  // Precisa ter ao menos uma vogal.
  if (![...normalizada].some((l) => vogais.has(l))) return false

  // Evita plural trivial: termina em S e o singular também é palavra.
  if (normalizada.endsWith('S')) {
    const singular = normalizada.slice(0, -1)
    if (palpitesPorTamanho.get(singular.length)?.has(singular)) return false
  }

  // Evita plurais de verbos e formas muito coloquiais terminadas em "RAM".
  if (normalizada.endsWith('RAM')) return false

  // Padrão ortográfico do português: K, W e Y só aparecem em estrangeirismos.
  if (/[KWY]/.test(normalizada)) return false

  // Terminações típicas do português: vogal, S, R, L, Z ou M.
  // Isso elimina a maior parte dos estrangeirismos e abreviações (BACK, BABY, BEST...).
  if (!/[AEIOUSRLZM]$/.test(normalizada)) return false

  return true
}

const respostasPorTamanho = new Map(TAMANHOS.map((t) => [t, []]))
for (const tamanho of TAMANHOS) {
  const limite = tamanho === 5 ? 0 : 800
  const candidatos = candidatosPorTamanho
    .get(tamanho)
    .filter(ehBoaResposta)
    .sort((a, b) => b.frequencia - a.frequencia)
    .slice(0, limite || MAX_RESPOSTAS_POR_TAMANHO)
    .sort((a, b) => a.normalizada.localeCompare(b.normalizada, 'pt-BR'))
  respostasPorTamanho.set(tamanho, candidatos)
}

// Lista curada do Termo (5 letras): https://github.com/vhfarias/omret
// Formato original: { palavraNormalizada: palavraComAcento }
const arquivoTermo = process.argv[4]
if (arquivoTermo && fs.existsSync(arquivoTermo)) {
  const termo = JSON.parse(fs.readFileSync(arquivoTermo, 'utf8'))
  const curadas = []
  for (const [chave, exibicao] of Object.entries(termo)) {
    const normalizada = normalizar(exibicao)
    if (normalizada.length !== 5) continue
    if (BLOQUEIO_RESPOSTA.has(normalizada)) continue
    if (BLOQUEIO_NOMES.has(normalizada)) continue
    curadas.push({ exibicao: exibicao.toLowerCase(), normalizada, frequencia: 0 })
  }
  respostasPorTamanho.set(5, curadas.sort((a, b) => a.normalizada.localeCompare(b.normalizada, 'pt-BR')))
}

const destino = path.resolve('src/data')
fs.mkdirSync(destino, { recursive: true })

// Palpites: todas as palavras, separadas por quebra de linha.
const palpites = TAMANHOS.flatMap((t) => [...palpitesPorTamanho.get(t)].sort())
fs.writeFileSync(path.join(destino, 'palpites.txt'), palpites.join('\n') + '\n')

// Respostas: palavra de exibição (com acento)|forma normalizada.
const linhasRespostas = []
for (const tamanho of TAMANHOS) {
  for (const { exibicao, normalizada } of respostasPorTamanho.get(tamanho)) {
    linhasRespostas.push(`${exibicao}|${normalizada}`)
  }
}
fs.writeFileSync(path.join(destino, 'respostas.txt'), linhasRespostas.join('\n') + '\n')

for (const tamanho of TAMANHOS) {
  const totalPalpites = palpitesPorTamanho.get(tamanho).size
  const totalRespostas = respostasPorTamanho.get(tamanho).length
  console.log(`${tamanho} letras: ${totalPalpites} palpites, ${totalRespostas} respostas`)
}
console.log(`Total de palpites: ${palpites.length}`)
