/* =========================================================
   layout.js — partes comuns a todas as páginas
   ---------------------------------------------------------
   • Cabeçalho (menu, busca, tema claro/escuro, sacola)
   • Rodapé
   • Card de produto (usado na home, catálogo, favoritos…)
   • Favoritos
   • Animações de entrada ao rolar a página
   Cada página HTML tem <div id="topo"></div> e <div id="rodape"></div>,
   que são preenchidos por este arquivo.
   ========================================================= */

const CHAVE_TEMA = 'olyporus:tema';
const CHAVE_FAVORITOS = 'olyporus:favoritos';
const CHAVE_BUSCAS = 'olyporus:buscas-recentes';

/* ---------- CABEÇALHO ---------- */

function montarCabecalho() {
  const alvo = document.getElementById('topo');
  if (!alvo) return;

  const pagina = document.body.dataset.pagina;     // definido no <body data-pagina="...">
  const categoriaAtual = parametroUrl('categoria');

  const links = CATEGORIAS.map(function (c) {
    const ativo = pagina === 'catalogo' && categoriaAtual === c.id ? ' aria-current="page"' : '';
    return '<a href="catalogo.html?categoria=' + c.id + '"' + ativo + '>' + c.nome.replace(' avulsas', '') + '</a>';
  }).join('');

  alvo.outerHTML =
    '<header class="topo" id="topo">' +
      '<div class="topo__barra container">' +
        '<button class="icone-btn topo__menu-btn" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu-movel">' + ICONES.menu + '</button>' +
        '<a class="logo" href="index.html" aria-label="OLYPORUS — página inicial"><img src="img/logo.png" alt="" width="38" height="24"><span>OLYPORUS</span></a>' +
        '<nav class="topo__nav" aria-label="Categorias">' + links + '</nav>' +
        '<div class="topo__acoes">' +
          '<a class="topo__comprar" href="catalogo.html"' + (pagina === 'catalogo' && !categoriaAtual ? ' aria-current="page"' : '') + '>Comprar</a>' +
          '<button class="icone-btn" type="button" id="abrir-busca" aria-label="Pesquisar produtos" aria-expanded="false" aria-controls="painel-busca">' + ICONES.lupa + '</button>' +
          '<button class="icone-btn" type="button" id="alternar-tema" aria-label="Alternar modo escuro"><span class="so-claro">' + ICONES.lua + '</span><span class="so-escuro">' + ICONES.sol + '</span></button>' +
          '<a class="icone-btn esconder-mobile" href="favoritos.html" aria-label="Favoritos">' + ICONES.coracao + '</a>' +
          '<a class="icone-btn" href="conta.html" aria-label="Minha conta">' + ICONES.conta + '</a>' +
          '<a class="icone-btn sacola" href="carrinho.html" aria-label="Carrinho">' + ICONES.sacola + '<span class="sacola__contador" id="contador-carrinho" hidden>0</span></a>' +
        '</div>' +
      '</div>' +

      /* Painel de busca (abre ao clicar na lupa) */
      '<div class="busca" id="painel-busca" hidden>' +
        '<div class="busca__painel">' +
          '<form class="busca__form container-estreito" action="catalogo.html" role="search" id="form-busca">' +
            '<span class="busca__icone">' + ICONES.lupa + '</span>' +
            '<input type="search" name="busca" id="campo-busca" placeholder="Buscar cartas, coleções, boosters…" autocomplete="off" aria-label="Buscar produtos">' +
            '<button type="button" class="busca__fechar" id="fechar-busca" aria-label="Fechar busca">' + ICONES.fechar + '</button>' +
          '</form>' +
          '<div class="busca__conteudo container-estreito" id="busca-conteudo"></div>' +
        '</div>' +
        '<div class="busca__fundo" id="busca-fundo"></div>' +
      '</div>' +

      /* Menu lateral do celular */
      '<div class="menu-movel" id="menu-movel" hidden>' +
        '<div class="menu-movel__fundo" data-fechar-menu></div>' +
        '<nav class="menu-movel__painel" aria-label="Menu">' +
          '<button class="icone-btn menu-movel__fechar" type="button" data-fechar-menu aria-label="Fechar menu">' + ICONES.fechar + '</button>' +
          '<a href="index.html">Início</a>' +
          '<a href="catalogo.html">Todos os produtos</a>' +
          CATEGORIAS.map(function (c) { return '<a href="catalogo.html?categoria=' + c.id + '">' + c.nome + '</a>'; }).join('') +
          '<hr>' +
          '<a href="favoritos.html">Favoritos</a>' +
          '<a href="conta.html">Minha conta e pedidos</a>' +
          '<a href="carrinho.html">Carrinho</a>' +
        '</nav>' +
      '</div>' +
    '</header>';

  configurarBusca();
  configurarMenuMovel();
  document.getElementById('alternar-tema').addEventListener('click', alternarTema);
  atualizarContadorCarrinho();
}

/* ---------- TEMA CLARO / ESCURO ---------- */

function alternarTema() {
  const atual = document.documentElement.dataset.tema === 'escuro' ? 'escuro' : 'claro';
  const novo = atual === 'escuro' ? 'claro' : 'escuro';
  document.documentElement.dataset.tema = novo;
  salvarStorage(CHAVE_TEMA, novo);
}

/* ---------- CONTADOR DA SACOLA ---------- */

function atualizarContadorCarrinho() {
  const contador = document.getElementById('contador-carrinho');
  if (!contador) return;
  const total = Carrinho.quantidadeTotal();
  contador.textContent = total > 99 ? '99+' : total;
  contador.hidden = total === 0;
}

/* ---------- BUSCA ---------- */

function configurarBusca() {
  const painel = document.getElementById('painel-busca');
  const botao = document.getElementById('abrir-busca');
  const campo = document.getElementById('campo-busca');
  const conteudo = document.getElementById('busca-conteudo');
  const form = document.getElementById('form-busca');

  function abrir() {
    painel.hidden = false;
    botao.setAttribute('aria-expanded', 'true');
    document.body.classList.add('sem-rolagem');
    campo.value = parametroUrl('busca') || '';
    renderizarSugestoes();
    setTimeout(function () { campo.focus(); }, 30);
  }
  function fechar() {
    painel.hidden = true;
    botao.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('sem-rolagem');
    botao.focus();
  }

  // Monta o conteúdo do painel conforme o que foi digitado
  function renderizarSugestoes() {
    const termo = campo.value.trim();
    const recentes = lerStorage(CHAVE_BUSCAS, []);
    let html = '';

    if (!termo) {
      if (recentes.length) {
        html += '<p class="eyebrow-cinza">Buscas recentes</p><div class="chips">' +
          recentes.map(function (r) { return '<a class="chip" href="catalogo.html?busca=' + encodeURIComponent(r) + '">↺ ' + escaparHtml(r) + '</a>'; }).join('') + '</div>';
      }
      html += '<p class="eyebrow-cinza">Mais procurados</p><div class="chips">' +
        ['Charizard', 'Pikachu', 'Elite Trainer Box', 'Mew', 'Booster'].map(function (r) {
          return '<a class="chip" href="catalogo.html?busca=' + encodeURIComponent(r) + '">' + r + '</a>';
        }).join('') + '</div>';
      html += '<p class="eyebrow-cinza">Links rápidos</p><ul class="busca__links">' +
        '<li><a href="catalogo.html?categoria=cartas">→ Cartas raras e ilustrações especiais</a></li>' +
        '<li><a href="catalogo.html?promocao=1">→ Produtos em promoção</a></li>' +
        '<li><a href="conta.html">→ Acompanhar meus pedidos</a></li></ul>';
    } else {
      const resultados = pesquisarProdutos(termo);
      if (resultados.length) {
        html += '<p class="eyebrow-cinza">Sugestões</p><ul class="busca__lista">' +
          resultados.slice(0, 5).map(function (p) {
            return '<li><a class="busca__item" href="produto.html?id=' + p.id + '">' +
              '<span class="busca__miniatura midia midia--' + p.tipoImagem + '"><img src="' + p.imagem + '" alt=""></span>' +
              '<span class="busca__texto"><strong>' + escaparHtml(p.nome) + '</strong><small>' + escaparHtml(p.colecao) + ' · ' + escaparHtml(p.raridade) + '</small></span>' +
              '<span class="busca__preco">' + formatarPreco(p.preco) + '</span></a></li>';
          }).join('') + '</ul>' +
          '<a class="link-acento busca__todos" href="catalogo.html?busca=' + encodeURIComponent(termo) + '">Ver todos os ' + resultados.length + ' resultados para “' + escaparHtml(termo) + '” ›</a>';
      } else {
        html += '<p class="busca__vazio">Nenhum produto encontrado para “' + escaparHtml(termo) + '”. Tente “charizard” ou “booster”.</p>';
      }
    }
    conteudo.innerHTML = html;
  }

  botao.addEventListener('click', abrir);
  document.getElementById('fechar-busca').addEventListener('click', fechar);
  document.getElementById('busca-fundo').addEventListener('click', fechar);
  campo.addEventListener('input', renderizarSugestoes);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !painel.hidden) fechar();
  });

  // Ao enviar, guarda a busca nas "recentes" (máximo 5, sem repetir)
  form.addEventListener('submit', function (e) {
    const termo = campo.value.trim();
    if (!termo) { e.preventDefault(); return; }
    const recentes = lerStorage(CHAVE_BUSCAS, []).filter(function (r) { return r.toLowerCase() !== termo.toLowerCase(); });
    recentes.unshift(termo);
    salvarStorage(CHAVE_BUSCAS, recentes.slice(0, 5));
  });
}

/* ---------- MENU DO CELULAR ---------- */

function configurarMenuMovel() {
  const menu = document.getElementById('menu-movel');
  const botao = document.querySelector('.topo__menu-btn');
  botao.addEventListener('click', function () {
    menu.hidden = false;
    botao.setAttribute('aria-expanded', 'true');
    document.body.classList.add('sem-rolagem');
  });
  menu.querySelectorAll('[data-fechar-menu]').forEach(function (el) {
    el.addEventListener('click', function () {
      menu.hidden = true;
      botao.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('sem-rolagem');
    });
  });
}

/* ---------- RODAPÉ ---------- */

function montarRodape() {
  const alvo = document.getElementById('rodape');
  if (!alvo) return;
  alvo.outerHTML =
    '<footer class="rodape">' +
      '<div class="container">' +
        '<div class="rodape__confianca">' +
          '<div>' + ICONES.escudo + '<span><strong>Compra segura</strong>Ambiente protegido</span></div>' +
          '<div>' + ICONES.caminhao + '<span><strong>Frete grátis</strong>Acima de ' + formatarPreco(FRETE_GRATIS_ACIMA) + '</span></div>' +
          '<div>' + ICONES.cartao + '<span><strong>Até 12x no cartão</strong>6x sem juros</span></div>' +
          '<div>' + ICONES.pix + '<span><strong>5% off no PIX</strong>Aprovação na hora</span></div>' +
        '</div>' +
        '<div class="rodape__colunas">' +
          '<div class="rodape__marca"><a class="logo" href="index.html"><img src="img/logo.png" alt="" width="38" height="24"><span>OLYPORUS</span></a>' +
          '<p>Cartas e produtos de Pokémon TCG com curadoria, conferência de condição e envio protegido para todo o Brasil.</p></div>' +
          '<div><h3>Comprar</h3><ul>' + CATEGORIAS.map(function (c) { return '<li><a href="catalogo.html?categoria=' + c.id + '">' + c.nome + '</a></li>'; }).join('') +
            '<li><a href="catalogo.html?promocao=1">Promoções</a></li></ul></div>' +
          '<div><h3>Sua conta</h3><ul><li><a href="conta.html">Minha conta</a></li><li><a href="conta.html#pedidos">Meus pedidos</a></li><li><a href="favoritos.html">Favoritos</a></li><li><a href="carrinho.html">Carrinho</a></li></ul></div>' +
          '<div><h3>Pagamento</h3><ul class="rodape__pagamentos"><li>Cartão de crédito</li><li>Cartão de débito</li><li>PIX</li></ul></div>' +
        '</div>' +
        '<p class="rodape__aviso">OLYPORUS é uma loja fictícia criada para fins acadêmicos, sem afiliação oficial com a Pokémon Company. Imagens ilustrativas. Nenhum pagamento real é processado.</p>' +
        '<p class="rodape__copy">© ' + new Date().getFullYear() + ' OLYPORUS · Feito com HTML, CSS e JavaScript</p>' +
      '</div>' +
    '</footer>';
}

/* ---------- FAVORITOS ---------- */

function listarFavoritos() {
  return lerStorage(CHAVE_FAVORITOS, []);
}

function ehFavorito(id) {
  return listarFavoritos().includes(id);
}

function alternarFavorito(id) {
  let favoritos = listarFavoritos();
  const jaEra = favoritos.includes(id);
  favoritos = jaEra ? favoritos.filter(function (f) { return f !== id; }) : favoritos.concat(id);
  salvarStorage(CHAVE_FAVORITOS, favoritos);
  return !jaEra;
}

/* ---------- CARD DE PRODUTO ---------- */

function cardProdutoHtml(p) {
  const desconto = p.precoAntigo ? Math.round((1 - p.preco / p.precoAntigo) * 100) : 0;
  const selos = [];
  if (desconto) selos.push('<span class="selo selo--promo">-' + desconto + '%</span>');
  if (p.estoque <= 3) selos.push('<span class="selo selo--alerta">Últimas unidades</span>');
  const favorito = ehFavorito(p.id);

  return '' +
    '<article class="card-produto revelar">' +
      '<a class="card-produto__link" href="produto.html?id=' + p.id + '">' +
        '<div class="midia midia--' + p.tipoImagem + '"><img src="' + p.imagem + '" alt="' + escaparHtml(p.nome) + '" loading="lazy"></div>' +
        (selos.length ? '<div class="card-produto__selos">' + selos.join('') + '</div>' : '') +
        '<h3 class="card-produto__nome">' + escaparHtml(p.nome) + '</h3>' +
        '<p class="card-produto__meta">' + escaparHtml(p.colecao) + ' · ' + escaparHtml(p.raridade) + '</p>' +
        '<p class="card-produto__descricao">' + escaparHtml(p.descricao) + '</p>' +
        '<div class="card-produto__precos">' +
          (p.precoAntigo ? '<s>' + formatarPreco(p.precoAntigo) + '</s>' : '') +
          '<strong>' + formatarPreco(p.preco) + '</strong>' +
          '<span>' + textoParcelamento(p.preco) + '</span>' +
          (p.preco >= FRETE_GRATIS_ACIMA ? '<span class="texto-sucesso">Frete grátis</span>' : '') +
        '</div>' +
      '</a>' +
      '<button class="btn-favorito" type="button" data-favorito="' + p.id + '" aria-pressed="' + favorito + '" aria-label="' + (favorito ? 'Remover dos' : 'Adicionar aos') + ' favoritos">' + ICONES.coracao + '</button>' +
      '<button class="btn btn--primario btn--bloco" type="button" data-adicionar="' + p.id + '">Adicionar ao carrinho</button>' +
    '</article>';
}

/* ---------- AÇÕES GLOBAIS (delegação de eventos) ----------
   Um único "ouvinte" no documento trata os cliques de todos os
   botões "Adicionar" e "Favoritar", inclusive os criados depois. */

document.addEventListener('click', function (e) {
  const botaoAdicionar = e.target.closest('[data-adicionar]');
  if (botaoAdicionar) {
    const produto = buscarProdutoPorId(botaoAdicionar.dataset.adicionar);
    if (Carrinho.adicionar(produto.id, 1)) {
      mostrarAviso('“' + produto.nome + '” foi adicionado ao carrinho.', 'sucesso');
      botaoAdicionar.classList.add('btn--pulso');
      setTimeout(function () { botaoAdicionar.classList.remove('btn--pulso'); }, 400);
    }
    return;
  }

  const botaoFavorito = e.target.closest('[data-favorito]');
  if (botaoFavorito) {
    const agora = alternarFavorito(botaoFavorito.dataset.favorito);
    document.querySelectorAll('[data-favorito="' + botaoFavorito.dataset.favorito + '"]').forEach(function (b) {
      b.setAttribute('aria-pressed', agora);
      b.setAttribute('aria-label', (agora ? 'Remover dos' : 'Adicionar aos') + ' favoritos');
    });
    mostrarAviso(agora ? 'Salvo nos favoritos.' : 'Removido dos favoritos.');
    document.dispatchEvent(new CustomEvent('favoritos-alterados'));
  }
});

/* ---------- ANIMAÇÃO DE ENTRADA ----------
   Elementos com a classe .revelar aparecem suavemente ao entrar na tela. */

function ativarAnimacoes(raiz) {
  const elementos = (raiz || document).querySelectorAll('.revelar:not(.visivel)');
  if (!('IntersectionObserver' in window)) {
    elementos.forEach(function (el) { el.classList.add('visivel'); });
    return;
  }
  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visivel');
        observador.unobserve(entrada.target);
      }
    });
  }, { rootMargin: '0px 0px -40px 0px' });
  elementos.forEach(function (el) { observador.observe(el); });
}

/* ---------- INICIALIZAÇÃO ---------- */

document.addEventListener('DOMContentLoaded', function () {
  montarCabecalho();
  montarRodape();
  ativarAnimacoes();
});

// Se o carrinho mudar em outra aba, atualiza a bolinha da sacola
window.addEventListener('storage', function (e) {
  if (e.key === CHAVE_CARRINHO) atualizarContadorCarrinho();
});
