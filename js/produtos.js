/* =========================================================
   produtos.js — "banco de dados" da loja
   ---------------------------------------------------------
   Cada produto é um objeto. As páginas leem esta lista para
   montar a vitrine, o catálogo, a página de detalhes e o carrinho.
   ========================================================= */

const CATEGORIAS = [
  { id: 'cartas',     nome: 'Cartas avulsas', descricao: 'Raras, ilustrações especiais e full arts', imagem: 'img/cartas/charizard-ex-151.webp', tipoImagem: 'carta' },
  { id: 'boosters',   nome: 'Boosters',       descricao: 'A emoção de abrir cada pacote',          imagem: 'img/produtos/booster-equilibrio-perfeito.webp', tipoImagem: 'caixa' },
  { id: 'colecoes',   nome: 'Coleções',       descricao: 'Elite Trainer Box e boxes especiais',    imagem: 'img/produtos/etb-scarlet-violet.webp', tipoImagem: 'caixa' },
  { id: 'acessorios', nome: 'Acessórios',     descricao: 'Proteja e organize sua coleção',         imagem: 'img/produtos/sleeves-olyporus.svg', tipoImagem: 'caixa' }
];

const PRODUTOS = [
  /* ---------- CARTAS AVULSAS ---------- */
  {
    id: 'charizard-ex-151', categoria: 'cartas', nome: 'Charizard ex',
    colecao: 'Scarlet & Violet — 151', numero: '199/165', raridade: 'Special Illustration Rare', idioma: 'Inglês', condicao: 'NM — Near Mint',
    preco: 489.90, precoAntigo: 529.90, estoque: 4, avaliacao: 4.9, numAvaliacoes: 128, destaque: true,
    imagem: 'img/cartas/charizard-ex-151.webp', tipoImagem: 'carta',
    descricao: 'Ilustração especial do Charizard sobrevoando o vulcão. Uma das cartas mais desejadas da coleção 151.',
    detalhes: 'Carta avulsa conferida pela nossa curadoria: centralização, bordas e superfície avaliadas antes do envio. Enviada em sleeve + top loader + caixa rígida para chegar perfeita até você.'
  },
  {
    id: 'pikachu-ex-surging-sparks', categoria: 'cartas', nome: 'Pikachu ex',
    colecao: 'Surging Sparks', numero: '238/191', raridade: 'Special Illustration Rare', idioma: 'Inglês', condicao: 'NM — Near Mint',
    preco: 1249.90, estoque: 2, avaliacao: 5.0, numAvaliacoes: 64, destaque: true,
    imagem: 'img/cartas/pikachu-ex-surging-sparks.webp', tipoImagem: 'carta',
    descricao: 'O Pikachu ex com arte cristalizada e efeito holográfico intenso. Peça central para qualquer coleção.',
    detalhes: 'Uma das cartas mais valorizadas da expansão Surging Sparks. Conferida e enviada com proteção tripla.'
  },
  {
    id: 'mew-ex-dourada', categoria: 'cartas', nome: 'Mew ex dourada',
    colecao: 'Scarlet & Violet — 151', numero: '205/165', raridade: 'Hyper Rare (dourada)', idioma: 'Inglês', condicao: 'NM — Near Mint',
    preco: 219.90, estoque: 6, avaliacao: 4.8, numAvaliacoes: 87, destaque: true,
    imagem: 'img/cartas/mew-ex-dourada.webp', tipoImagem: 'carta',
    descricao: 'Versão dourada do Mew ex, com textura em relevo e brilho metálico.',
    detalhes: 'As Hyper Rares douradas têm acabamento texturizado que aparece melhor em luz direta. Enviada em sleeve + top loader.'
  },
  {
    id: 'charizard-ex-paldean-fates', categoria: 'cartas', nome: 'Charizard ex shiny',
    colecao: 'Paldean Fates', numero: '234/091', raridade: 'Special Illustration Rare', idioma: 'Inglês', condicao: 'NM — Near Mint',
    preco: 359.90, estoque: 3, avaliacao: 4.7, numAvaliacoes: 52, destaque: false,
    imagem: 'img/cartas/charizard-ex-paldean-fates.webp', tipoImagem: 'carta',
    descricao: 'Charizard ex na forma shiny (escura), da coleção Paldean Fates.',
    detalhes: 'Carta da subcoleção shiny, muito procurada por colecionadores de Charizard.'
  },
  {
    id: 'iono-paldea-evolved', categoria: 'cartas', nome: 'Iono',
    colecao: 'Paldea Evolved', numero: '269/193', raridade: 'Special Illustration Rare', idioma: 'Inglês', condicao: 'NM — Near Mint',
    preco: 279.90, estoque: 5, avaliacao: 4.8, numAvaliacoes: 41, destaque: true,
    imagem: 'img/cartas/iono-paldea-evolved.webp', tipoImagem: 'carta',
    descricao: 'Treinadora Iono em ilustração especial cheia de detalhes e cores vibrantes.',
    detalhes: 'Carta de Treinador (Apoiador) também muito usada em jogo competitivo.'
  },
  {
    id: 'mew-ex-151', categoria: 'cartas', nome: 'Mew ex',
    colecao: 'Scarlet & Violet — 151', numero: '151/165', raridade: 'Ultra Rare', idioma: 'Inglês', condicao: 'NM — Near Mint',
    preco: 89.90, estoque: 12, avaliacao: 4.6, numAvaliacoes: 33, destaque: false,
    imagem: 'img/cartas/mew-ex-151.webp', tipoImagem: 'carta',
    descricao: 'Mew ex em arte completa, a carta de número 151 da coleção.',
    detalhes: 'Ótima opção de entrada para quem está começando a colecionar a coleção 151.'
  },
  {
    id: 'charizard-ex-obsidian-flames', categoria: 'cartas', nome: 'Charizard ex',
    colecao: 'Obsidian Flames', numero: '223/197', raridade: 'Special Illustration Rare', idioma: 'Inglês', condicao: 'NM — Near Mint',
    preco: 189.90, precoAntigo: 229.90, estoque: 7, avaliacao: 4.7, numAvaliacoes: 76, destaque: false,
    imagem: 'img/cartas/charizard-ex-obsidian-flames.webp', tipoImagem: 'carta',
    descricao: 'Charizard ex tipo Escuridão, com arte completa e efeito holográfico.',
    detalhes: 'Carta símbolo da expansão Obsidian Flames. Conferida e enviada com proteção tripla.'
  },
  {
    id: 'charizard-ex-chamas-obsidianas', categoria: 'cartas', nome: 'Charizard ex (PT)',
    colecao: 'Chamas Obsidianas', numero: '215/197', raridade: 'Ultra Rare', idioma: 'Português', condicao: 'NM — Near Mint',
    preco: 149.90, estoque: 9, avaliacao: 4.8, numAvaliacoes: 58, destaque: true,
    imagem: 'img/cartas/charizard-ex-chamas-obsidianas.webp', tipoImagem: 'carta',
    descricao: 'A versão em português do Charizard ex, com o ataque Reino Infernal.',
    detalhes: 'Edição brasileira oficial. Ideal para quem coleciona cartas em português.'
  },
  {
    id: 'pikachu-151', categoria: 'cartas', nome: 'Pikachu',
    colecao: 'Scarlet & Violet — 151', numero: '173/165', raridade: 'Illustration Rare', idioma: 'Inglês', condicao: 'NM — Near Mint',
    preco: 64.90, estoque: 15, avaliacao: 4.9, numAvaliacoes: 112, destaque: false,
    imagem: 'img/cartas/pikachu-151.webp', tipoImagem: 'carta',
    descricao: 'Pikachu em ilustração rara: uma cena do dia a dia com treinadores e Pokémon.',
    detalhes: 'Uma das Illustration Rares mais queridas da coleção 151.'
  },
  {
    id: 'riolu-ilustracao-rara', categoria: 'cartas', nome: 'Riolu',
    colecao: 'Escarlate e Violeta', numero: '215/193', raridade: 'Illustration Rare', idioma: 'Português', condicao: 'NM — Near Mint',
    preco: 34.90, estoque: 20, avaliacao: 4.6, numAvaliacoes: 19, destaque: false,
    imagem: 'img/cartas/riolu.webp', tipoImagem: 'carta',
    descricao: 'Riolu em ilustração rara colorida, perfeita para começar a coleção.',
    detalhes: 'Edição em português. Arte assinada com cenário completo.'
  },

  /* ---------- BOOSTERS ---------- */
  {
    id: 'booster-equilibrio-perfeito', categoria: 'boosters', nome: 'Booster Equilíbrio Perfeito',
    colecao: 'Escarlate e Violeta', numero: '—', raridade: 'Lacrado', idioma: 'Português', condicao: 'Lacrado de fábrica',
    preco: 44.90, estoque: 60, avaliacao: 4.7, numAvaliacoes: 203, destaque: true,
    imagem: 'img/produtos/booster-equilibrio-perfeito.webp', tipoImagem: 'caixa',
    descricao: 'Pacote com 10 cartas sortidas e a chance de tirar uma carta rara ou ilustração especial.',
    detalhes: 'Booster lacrado de fábrica, em português. Cada pacote contém 10 cartas, incluindo ao menos 1 rara.'
  },
  {
    id: 'booster-equilibrio-perfeito-kit-3', categoria: 'boosters', nome: 'Kit 3 Boosters Equilíbrio Perfeito',
    colecao: 'Escarlate e Violeta', numero: '—', raridade: 'Lacrado', idioma: 'Português', condicao: 'Lacrado de fábrica',
    preco: 124.90, precoAntigo: 134.70, estoque: 25, avaliacao: 4.8, numAvaliacoes: 47, destaque: false,
    imagem: 'img/produtos/booster-equilibrio-perfeito.webp', tipoImagem: 'caixa',
    descricao: 'Três pacotes lacrados com desconto: mais chances de encontrar a carta que você procura.',
    detalhes: 'Kit com 3 boosters lacrados (30 cartas). Economize R$ 9,80 em relação à compra avulsa.'
  },

  /* ---------- COLEÇÕES (ETB e boxes) ---------- */
  {
    id: 'etb-scarlet-violet', categoria: 'colecoes', nome: 'Elite Trainer Box Scarlet & Violet',
    colecao: 'Scarlet & Violet', numero: '—', raridade: 'Elite Trainer Box', idioma: 'Inglês', condicao: 'Lacrado de fábrica',
    preco: 399.90, estoque: 8, avaliacao: 4.9, numAvaliacoes: 91, destaque: true,
    imagem: 'img/produtos/etb-scarlet-violet.webp', tipoImagem: 'caixa',
    descricao: '9 boosters, 65 sleeves, 45 energias, dados, marcadores e caixa colecionável.',
    detalhes: 'A Elite Trainer Box é o kit completo para jogar e colecionar: 9 boosters, sleeves, energias, dados, marcadores de condição e um guia da coleção.'
  },
  {
    id: 'etb-paldea-evolved', categoria: 'colecoes', nome: 'Elite Trainer Box Paldea Evolved',
    colecao: 'Paldea Evolved', numero: '—', raridade: 'Elite Trainer Box', idioma: 'Inglês', condicao: 'Lacrado de fábrica',
    preco: 429.90, estoque: 6, avaliacao: 4.8, numAvaliacoes: 54, destaque: false,
    imagem: 'img/produtos/etb-paldea-evolved.webp', tipoImagem: 'caixa',
    descricao: 'Com Sprigatito, Fuecoco e Quaxly na caixa. 9 boosters e acessórios para jogar.',
    detalhes: 'Inclui 9 boosters Paldea Evolved, 65 sleeves temáticos, 45 energias, 6 dados de dano e guia do jogador.'
  },
  {
    id: 'etb-obsidian-flames', categoria: 'colecoes', nome: 'Elite Trainer Box Obsidian Flames',
    colecao: 'Obsidian Flames', numero: '—', raridade: 'Elite Trainer Box', idioma: 'Inglês', condicao: 'Lacrado de fábrica',
    preco: 449.90, precoAntigo: 479.90, estoque: 5, avaliacao: 4.9, numAvaliacoes: 68, destaque: false,
    imagem: 'img/produtos/etb-obsidian-flames.webp', tipoImagem: 'caixa',
    descricao: 'A ETB do Charizard: 9 boosters Obsidian Flames e acessórios temáticos.',
    detalhes: 'Kit completo com 9 boosters, sleeves com arte de Charmander, energias, dados e caixa colecionável.'
  },
  {
    id: 'etb-perfect-order', categoria: 'colecoes', nome: 'Elite Trainer Box Perfect Order',
    colecao: 'Perfect Order', numero: '—', raridade: 'Elite Trainer Box', idioma: 'Inglês', condicao: 'Lacrado de fábrica',
    preco: 459.90, estoque: 4, avaliacao: 4.7, numAvaliacoes: 22, destaque: false,
    imagem: 'img/produtos/etb-perfect-order.webp', tipoImagem: 'caixa',
    descricao: 'Lançamento: 9 boosters Perfect Order, sleeves e acessórios exclusivos.',
    detalhes: 'Elite Trainer Box do lançamento mais recente, com conteúdo completo para jogar e colecionar.'
  },
  {
    id: 'box-fogo-branco', categoria: 'colecoes', nome: 'Coleção Treinador Avançado Fogo Branco',
    colecao: 'Fogo Branco', numero: '—', raridade: 'Box Coleção', idioma: 'Português', condicao: 'Lacrado de fábrica',
    preco: 599.90, estoque: 3, avaliacao: 4.8, numAvaliacoes: 17, destaque: true,
    imagem: 'img/produtos/box-fogo-branco.webp', tipoImagem: 'caixa',
    descricao: 'Box em português com carta promo exclusiva, boosters e acessórios de colecionador.',
    detalhes: 'Edição brasileira com carta promocional, boosters e itens de colecionador. Quantidade limitada.'
  },
  {
    id: 'colecao-151-ultra-premium', categoria: 'colecoes', nome: 'Coleção 151 Ultra-Premium',
    colecao: 'Scarlet & Violet — 151', numero: '—', raridade: 'Box Coleção', idioma: 'Inglês', condicao: 'Lacrado de fábrica',
    preco: 1199.90, estoque: 2, avaliacao: 5.0, numAvaliacoes: 29, destaque: false,
    imagem: 'img/produtos/colecao-151-ultra-premium.webp', tipoImagem: 'caixa',
    descricao: '16 boosters, cartas promo de Mew (incluindo versão metálica) e moeda colecionável.',
    detalhes: 'A caixa mais completa da coleção 151, com cartas promocionais, playmat, moeda metálica e 16 boosters.'
  },

  /* ---------- ACESSÓRIOS ---------- */
  {
    id: 'sleeves-olyporus', categoria: 'acessorios', nome: 'Sleeves OLYPORUS (65 un.)',
    colecao: 'Linha OLYPORUS', numero: '—', raridade: 'Acessório', idioma: '—', condicao: 'Novo',
    preco: 29.90, estoque: 80, avaliacao: 4.6, numAvaliacoes: 144, destaque: false,
    imagem: 'img/produtos/sleeves-olyporus.svg', tipoImagem: 'caixa',
    descricao: 'Protetores de carta com acabamento fosco, tamanho padrão (66 × 91 mm).',
    detalhes: 'Pacote com 65 sleeves foscos, sem ácido e sem PVC. Encaixe justo para cartas de tamanho padrão.'
  },
  {
    id: 'deck-box-olyporus', categoria: 'acessorios', nome: 'Deck Box OLYPORUS',
    colecao: 'Linha OLYPORUS', numero: '—', raridade: 'Acessório', idioma: '—', condicao: 'Novo',
    preco: 49.90, estoque: 40, avaliacao: 4.5, numAvaliacoes: 38, destaque: false,
    imagem: 'img/produtos/deck-box-olyporus.svg', tipoImagem: 'caixa',
    descricao: 'Caixa rígida para até 80 cartas com sleeve, com tampa magnética.',
    detalhes: 'Material rígido com forro interno macio. Comporta um deck completo de 60 cartas com folga.'
  },
  {
    id: 'fichario-olyporus', categoria: 'acessorios', nome: 'Fichário 9 bolsos OLYPORUS',
    colecao: 'Linha OLYPORUS', numero: '—', raridade: 'Acessório', idioma: '—', condicao: 'Novo',
    preco: 119.90, precoAntigo: 139.90, estoque: 18, avaliacao: 4.8, numAvaliacoes: 66, destaque: false,
    imagem: 'img/produtos/fichario-olyporus.svg', tipoImagem: 'caixa',
    descricao: 'Pasta com zíper e 20 páginas de 9 bolsos: guarda até 360 cartas.',
    detalhes: 'Bolsos com abertura lateral (a carta não escorrega), páginas sem ácido e capa resistente.'
  }
];

/* Funções de busca na lista ------------------------------------------ */

// Retorna um produto pelo id (ou undefined se não existir)
function buscarProdutoPorId(id) {
  return PRODUTOS.find(function (p) { return p.id === id; });
}

// Retorna a categoria pelo id
function buscarCategoria(id) {
  return CATEGORIAS.find(function (c) { return c.id === id; });
}

// Pesquisa por texto no nome, coleção, raridade e categoria (ignora acentos e maiúsculas)
function pesquisarProdutos(texto) {
  const termo = normalizarTexto(texto);
  if (!termo) return PRODUTOS.slice();
  return PRODUTOS.filter(function (p) {
    const categoria = buscarCategoria(p.categoria);
    const alvo = normalizarTexto([p.nome, p.colecao, p.raridade, p.idioma, categoria ? categoria.nome : ''].join(' '));
    // todas as palavras digitadas precisam aparecer
    return termo.split(' ').every(function (palavra) { return alvo.includes(palavra); });
  });
}

// "Pokémon Coleção" -> "pokemon colecao"
function normalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
