/* catalogo.js — listagem com busca, filtros e ordenação
   Os filtros começam com o que vier na URL, por exemplo:
   catalogo.html?categoria=cartas   catalogo.html?busca=charizard   catalogo.html?promocao=1 */

document.addEventListener('DOMContentLoaded', function () {
  // Estado atual dos filtros
  const filtro = {
    busca: parametroUrl('busca') || '',
    categoria: parametroUrl('categoria') || 'todas',
    idiomas: [],
    precoMin: null,
    precoMax: null,
    promocao: parametroUrl('promocao') === '1',
    poucoEstoque: false,
    ordenar: parametroUrl('ordenar') || 'relevancia'
  };

  const grade = document.getElementById('grade-catalogo');
  const idiomas = Array.from(new Set(PRODUTOS.map(function (p) { return p.idioma; }).filter(function (i) { return i !== '—'; })));

  /* ---- Monta os controles de filtro ---- */
  const opcoesCategoria = [{ id: 'todas', nome: 'Todas' }].concat(CATEGORIAS);

  document.getElementById('chips-categorias').innerHTML = opcoesCategoria.map(function (c) {
    return '<button class="chip" type="button" data-categoria="' + c.id + '">' + c.nome + '</button>';
  }).join('');

  document.getElementById('filtro-categoria').innerHTML = opcoesCategoria.map(function (c) {
    const total = c.id === 'todas' ? PRODUTOS.length : PRODUTOS.filter(function (p) { return p.categoria === c.id; }).length;
    return '<label><input type="radio" name="categoria" value="' + c.id + '"> ' + c.nome + ' <span class="texto-sutil">(' + total + ')</span></label>';
  }).join('');

  document.getElementById('filtro-idioma').innerHTML = idiomas.map(function (i) {
    return '<label><input type="checkbox" name="idioma" value="' + i + '"> ' + i + '</label>';
  }).join('');

  document.getElementById('fechar-filtros').innerHTML = ICONES.fechar;
  document.getElementById('ordenar').value = filtro.ordenar;
  document.getElementById('filtro-promocao').checked = filtro.promocao;

  /* ---- Aplica filtros e ordenação ---- */
  function produtosFiltrados() {
    let lista = filtro.busca ? pesquisarProdutos(filtro.busca) : PRODUTOS.slice();

    lista = lista.filter(function (p) {
      if (filtro.categoria !== 'todas' && p.categoria !== filtro.categoria) return false;
      if (filtro.idiomas.length && !filtro.idiomas.includes(p.idioma)) return false;
      if (filtro.precoMin !== null && p.preco < filtro.precoMin) return false;
      if (filtro.precoMax !== null && p.preco > filtro.precoMax) return false;
      if (filtro.promocao && !p.precoAntigo) return false;
      if (filtro.poucoEstoque && p.estoque > 3) return false;
      return true;
    });

    const comparadores = {
      'menor-preco': function (a, b) { return a.preco - b.preco; },
      'maior-preco': function (a, b) { return b.preco - a.preco; },
      'avaliacao': function (a, b) { return b.avaliacao - a.avaliacao || b.numAvaliacoes - a.numAvaliacoes; },
      'nome': function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); },
      'relevancia': function (a, b) { return (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0); }
    };
    return lista.sort(comparadores[filtro.ordenar] || comparadores.relevancia);
  }

  /* ---- Desenha a tela ---- */
  function renderizar() {
    const lista = produtosFiltrados();
    const categoria = buscarCategoria(filtro.categoria);

    // Títulos
    let titulo = categoria ? categoria.nome : 'Todos os produtos';
    let subtitulo = categoria ? categoria.descricao + '.' : 'Cartas, boosters, coleções e acessórios com curadoria.';
    if (filtro.busca) { titulo = '“' + filtro.busca + '”'; subtitulo = 'Resultados da busca' + (categoria ? ' em ' + categoria.nome : '') + '.'; }
    if (filtro.promocao && !filtro.busca && !categoria) { titulo = 'Promoções'; subtitulo = 'Preços especiais por tempo limitado.'; }
    document.getElementById('titulo-catalogo').textContent = titulo;
    document.getElementById('subtitulo-catalogo').textContent = subtitulo;
    document.getElementById('trilha-atual').textContent = filtro.busca ? 'Busca' : titulo;
    document.title = titulo + ' — OLYPORUS';

    // Controles marcados
    document.querySelectorAll('[data-categoria]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.categoria === filtro.categoria); });
    document.querySelectorAll('input[name="categoria"]').forEach(function (r) { r.checked = r.value === filtro.categoria; });

    document.getElementById('contagem').textContent = lista.length + (lista.length === 1 ? ' produto' : ' produtos');

    if (!lista.length) {
      grade.innerHTML =
        '<div class="vazio" style="grid-column:1/-1">' +
          '<div class="vazio__icone">' + ICONES.lupa + '</div>' +
          '<h2>Não encontramos esse produto… ainda.</h2>' +
          '<p>Confira a grafia, use termos mais gerais ou limpe os filtros para ver mais opções.</p>' +
          '<div class="hero__acoes"><button class="btn btn--primario" type="button" id="vazio-limpar">Limpar busca e filtros</button>' +
          '<a class="btn btn--link" href="catalogo.html?busca=charizard">Buscar “charizard” ›</a></div>' +
        '</div>';
      document.getElementById('vazio-limpar').addEventListener('click', limparTudo);
      return;
    }
    grade.innerHTML = lista.map(cardProdutoHtml).join('');
    ativarAnimacoes(grade);
  }

  // Mantém a URL atualizada (dá para copiar o link do filtro)
  function atualizarUrl() {
    const params = new URLSearchParams();
    if (filtro.busca) params.set('busca', filtro.busca);
    if (filtro.categoria !== 'todas') params.set('categoria', filtro.categoria);
    if (filtro.promocao) params.set('promocao', '1');
    if (filtro.ordenar !== 'relevancia') params.set('ordenar', filtro.ordenar);
    const query = params.toString();
    history.replaceState(null, '', 'catalogo.html' + (query ? '?' + query : ''));
  }

  function mudou() { atualizarUrl(); renderizar(); }

  function limparTudo() {
    filtro.busca = ''; filtro.categoria = 'todas'; filtro.idiomas = []; filtro.precoMin = null; filtro.precoMax = null;
    filtro.promocao = false; filtro.poucoEstoque = false;
    document.querySelectorAll('#filtros input[type="checkbox"]').forEach(function (c) { c.checked = false; });
    document.getElementById('preco-min').value = ''; document.getElementById('preco-max').value = '';
    mudou();
  }

  /* ---- Eventos ---- */
  document.getElementById('chips-categorias').addEventListener('click', function (e) {
    const chip = e.target.closest('[data-categoria]');
    if (chip) { filtro.categoria = chip.dataset.categoria; mudou(); }
  });
  document.getElementById('filtro-categoria').addEventListener('change', function (e) { filtro.categoria = e.target.value; mudou(); });
  document.getElementById('filtro-idioma').addEventListener('change', function () {
    filtro.idiomas = Array.from(document.querySelectorAll('input[name="idioma"]:checked')).map(function (c) { return c.value; });
    mudou();
  });
  ['preco-min', 'preco-max'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      const min = document.getElementById('preco-min').value, max = document.getElementById('preco-max').value;
      filtro.precoMin = min === '' ? null : Number(min);
      filtro.precoMax = max === '' ? null : Number(max);
      renderizar();
    });
  });
  document.getElementById('filtro-promocao').addEventListener('change', function (e) { filtro.promocao = e.target.checked; mudou(); });
  document.getElementById('filtro-estoque').addEventListener('change', function (e) { filtro.poucoEstoque = e.target.checked; mudou(); });
  document.getElementById('ordenar').addEventListener('change', function (e) { filtro.ordenar = e.target.value; mudou(); });
  document.getElementById('limpar-filtros').addEventListener('click', limparTudo);

  // Gaveta de filtros no celular
  const painelFiltros = document.getElementById('filtros');
  document.getElementById('abrir-filtros').addEventListener('click', function () { painelFiltros.classList.add('aberto'); });
  document.getElementById('fechar-filtros').addEventListener('click', function () { painelFiltros.classList.remove('aberto'); });

  renderizar();
});
