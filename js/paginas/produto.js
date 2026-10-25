/* produto.js — página de detalhes (produto.html?id=...) */

// Avaliações de exemplo (o texto muda conforme o tipo de produto)
const AVALIACOES_EXEMPLO = {
  cartas: [
    ['Marina S.', 5, 'Chegou impecável, em top loader e caixa rígida. A centralização é perfeita.'],
    ['Lucas P.', 5, 'Exatamente como na foto. Envio rápido e muito bem embalado.'],
    ['Rafael T.', 4, 'Carta linda, só demorou um dia a mais que o previsto.']
  ],
  boosters: [
    ['Ana C.', 5, 'Lacrado certinho. Tirei uma ilustração rara logo no primeiro!'],
    ['Pedro M.', 4, 'Preço justo e chegou rápido.'],
    ['Júlia R.', 5, 'Comprei para meu filho, ele amou.']
  ],
  colecoes: [
    ['Bruno L.', 5, 'Caixa veio sem nenhum amassado, protegida com plástico bolha.'],
    ['Camila F.', 5, 'Conteúdo completo, ótimo para começar a jogar.'],
    ['Diego A.', 4, 'Muito bonita. Só queria que viesse com mais boosters.']
  ],
  acessorios: [
    ['Sofia N.', 5, 'Qualidade excelente, as cartas encaixam perfeitamente.'],
    ['Thiago V.', 4, 'Bom custo-benefício.'],
    ['Lara G.', 5, 'Material resistente e acabamento bonito.']
  ]
};

document.addEventListener('DOMContentLoaded', function () {
  const main = document.getElementById('conteudo');
  const produto = buscarProdutoPorId(parametroUrl('id'));

  // Produto inexistente: mostra mensagem amigável
  if (!produto) {
    main.innerHTML = '<div class="vazio" style="margin:64px 0"><div class="vazio__icone">' + ICONES.lupa + '</div>' +
      '<h2>Produto não encontrado</h2><p>O link pode estar incorreto ou o produto saiu do catálogo.</p>' +
      '<a class="btn btn--primario" href="catalogo.html">Ver todos os produtos</a></div>';
    return;
  }

  const categoria = buscarCategoria(produto.categoria);
  const desconto = produto.precoAntigo ? Math.round((1 - produto.preco / produto.precoAntigo) * 100) : 0;
  const precoPix = produto.preco * (1 - DESCONTO_PIX);
  document.title = produto.nome + ' — OLYPORUS';

  main.innerHTML =
    '<nav class="trilha" aria-label="Você está em"><a href="index.html">Início</a><span>›</span>' +
      '<a href="catalogo.html?categoria=' + categoria.id + '">' + categoria.nome + '</a><span>›</span><span>' + escaparHtml(produto.nome) + '</span></nav>' +

    '<section class="produto">' +
      '<div class="produto__galeria"><div class="midia midia--' + produto.tipoImagem + '"><img src="' + produto.imagem + '" alt="' + escaparHtml(produto.nome) + '"></div></div>' +

      '<div class="produto__info">' +
        '<div class="produto__selos"><span class="selo selo--info">' + categoria.nome + '</span>' +
          (desconto ? '<span class="selo selo--promo">-' + desconto + '% OFF</span>' : '') +
          (produto.estoque <= 3 ? '<span class="selo selo--alerta">Restam ' + produto.estoque + '</span>' : '') + '</div>' +
        '<p class="eyebrow">' + escaparHtml(produto.colecao) + '</p>' +
        '<h1>' + escaparHtml(produto.nome) + '</h1>' +
        '<a class="produto__avaliacao" href="#abas">' + estrelasHtml(produto.avaliacao) + ' ' + produto.avaliacao.toFixed(1).replace('.', ',') + ' (' + produto.numAvaliacoes + ' avaliações)</a>' +
        '<p class="subtitulo">' + escaparHtml(produto.descricao) + '</p>' +

        '<div class="produto__precos">' +
          (produto.precoAntigo ? '<s>' + formatarPreco(produto.precoAntigo) + '</s>' : '') +
          '<span class="produto__preco">' + formatarPreco(produto.preco) + '</span>' +
          '<span class="texto-sutil">' + textoParcelamento(produto.preco) + ' no cartão</span>' +
          '<span class="produto__pix">' + formatarPreco(precoPix) + ' no PIX (5% de desconto)</span>' +
        '</div>' +

        '<div class="produto__compra">' +
          '<div class="produto__compra-linha">' +
            '<div class="quantidade" aria-label="Quantidade">' +
              '<button type="button" id="qtd-menos" aria-label="Diminuir quantidade">−</button>' +
              '<input type="number" id="qtd" value="1" min="1" max="' + produto.estoque + '" aria-label="Quantidade">' +
              '<button type="button" id="qtd-mais" aria-label="Aumentar quantidade">+</button>' +
            '</div>' +
            '<span class="texto-sutil">' + produto.estoque + ' em estoque</span>' +
          '</div>' +
          '<div class="produto__botoes">' +
            '<button class="btn btn--primario btn--grande" type="button" id="adicionar">Adicionar ao carrinho</button>' +
            '<button class="btn btn--contorno btn--grande" type="button" id="comprar-agora">Comprar agora</button>' +
            '<button class="btn-favorito" type="button" data-favorito="' + produto.id + '" aria-pressed="' + ehFavorito(produto.id) + '" aria-label="Favoritar">' + ICONES.coracao + '</button>' +
          '</div>' +
          '<div class="frete">' +
            '<label for="cep-produto" class="texto-sutil">Calcular frete e prazo</label>' +
            '<form id="form-frete"><input class="entrada" id="cep-produto" inputmode="numeric" placeholder="00000-000" maxlength="9" value="' + escaparHtml(lerPedidoAtual().cep || '') + '"><button class="btn btn--escuro" type="submit">Calcular</button></form>' +
            '<div class="frete__opcoes" id="frete-opcoes"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="secao" style="padding-top:0" id="abas">' +
      '<div class="abas" role="tablist">' +
        '<button role="tab" aria-selected="true" aria-controls="aba-descricao" id="tab-descricao">Descrição</button>' +
        '<button role="tab" aria-selected="false" aria-controls="aba-specs" id="tab-specs">Especificações</button>' +
        '<button role="tab" aria-selected="false" aria-controls="aba-avaliacoes" id="tab-avaliacoes">Avaliações (' + produto.numAvaliacoes + ')</button>' +
      '</div>' +
      '<div role="tabpanel" id="aba-descricao" aria-labelledby="tab-descricao"><p class="subtitulo" style="max-width:760px">' + escaparHtml(produto.detalhes) + '</p></div>' +
      '<div role="tabpanel" id="aba-specs" aria-labelledby="tab-specs" hidden><table class="tabela-specs"><tbody>' +
        [['Categoria', categoria.nome], ['Coleção', produto.colecao], ['Número', produto.numero], ['Raridade', produto.raridade], ['Idioma', produto.idioma], ['Condição', produto.condicao], ['Garantia', 'Curadoria OLYPORUS']]
          .filter(function (l) { return l[1] !== '—'; })
          .map(function (l) { return '<tr><th scope="row">' + l[0] + '</th><td>' + escaparHtml(l[1]) + '</td></tr>'; }).join('') +
      '</tbody></table></div>' +
      '<div role="tabpanel" id="aba-avaliacoes" aria-labelledby="tab-avaliacoes" hidden><div class="avaliacoes">' +
        AVALIACOES_EXEMPLO[produto.categoria].map(function (a) {
          return '<article class="avaliacao"><header><span>' + a[0] + ' <small>· compra verificada</small></span>' + estrelasHtml(a[1]) + '</header><p>' + a[2] + '</p></article>';
        }).join('') +
      '</div></div>' +
    '</section>' +

    '<section class="secao" style="padding-top:0"><h2 class="titulo-secao" style="margin-bottom:32px">Combina com</h2><div class="grade-produtos" id="relacionados"></div></section>';

  /* ---- Quantidade ---- */
  const campoQtd = document.getElementById('qtd');
  function lerQuantidade() {
    const valor = Math.max(1, Math.min(produto.estoque, parseInt(campoQtd.value, 10) || 1));
    campoQtd.value = valor;
    document.getElementById('qtd-menos').disabled = valor <= 1;
    document.getElementById('qtd-mais').disabled = valor >= produto.estoque;
    return valor;
  }
  document.getElementById('qtd-menos').addEventListener('click', function () { campoQtd.value = lerQuantidade() - 1; lerQuantidade(); });
  document.getElementById('qtd-mais').addEventListener('click', function () { campoQtd.value = lerQuantidade() + 1; lerQuantidade(); });
  campoQtd.addEventListener('change', lerQuantidade);
  lerQuantidade();

  /* ---- Comprar ---- */
  document.getElementById('adicionar').addEventListener('click', function () {
    const qtd = lerQuantidade();
    if (Carrinho.adicionar(produto.id, qtd)) {
      mostrarAviso(qtd + 'x “' + produto.nome + '” no carrinho.', 'sucesso');
    }
  });
  document.getElementById('comprar-agora').addEventListener('click', function () {
    Carrinho.adicionar(produto.id, lerQuantidade());
    window.location.href = 'carrinho.html';
  });

  /* ---- Frete ---- */
  const campoCep = document.getElementById('cep-produto');
  campoCep.addEventListener('input', function () { campoCep.value = mascaraCep(campoCep.value); });
  function mostrarFrete() {
    const opcoes = calcularFrete(campoCep.value, produto.preco * lerQuantidade());
    const alvo = document.getElementById('frete-opcoes');
    if (!opcoes) { alvo.innerHTML = '<p class="mensagem mensagem--erro">Digite um CEP com 8 números.</p>'; return; }
    salvarPedidoAtual({ cep: campoCep.value });
    alvo.innerHTML = ['pac', 'sedex'].map(function (k) {
      const o = opcoes[k];
      return '<div><span>' + o.nome + ' · até ' + o.prazo + ' dias úteis</span><strong>' + (o.valor === 0 ? '<span class="texto-sucesso">Grátis</span>' : formatarPreco(o.valor)) + '</strong></div>';
    }).join('');
  }
  document.getElementById('form-frete').addEventListener('submit', function (e) { e.preventDefault(); mostrarFrete(); });
  if (campoCep.value) mostrarFrete();

  /* ---- Abas ---- */
  const abas = main.querySelectorAll('[role="tab"]');
  abas.forEach(function (aba) {
    aba.addEventListener('click', function () {
      abas.forEach(function (a) {
        const ativa = a === aba;
        a.setAttribute('aria-selected', ativa);
        document.getElementById(a.getAttribute('aria-controls')).hidden = !ativa;
      });
    });
  });
  main.querySelector('.produto__avaliacao').addEventListener('click', function () { document.getElementById('tab-avaliacoes').click(); });

  /* ---- Relacionados: mesma categoria primeiro ---- */
  const relacionados = PRODUTOS.filter(function (p) { return p.id !== produto.id; })
    .sort(function (a, b) { return (b.categoria === produto.categoria) - (a.categoria === produto.categoria) || b.avaliacao - a.avaliacao; })
    .slice(0, 4);
  document.getElementById('relacionados').innerHTML = relacionados.map(cardProdutoHtml).join('');
  ativarAnimacoes(main);
});
