/* home.js — monta as partes dinâmicas da página inicial */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Categorias (com a quantidade de produtos de cada uma)
  document.getElementById('grade-categorias').innerHTML = CATEGORIAS.map(function (c) {
    const total = PRODUTOS.filter(function (p) { return p.categoria === c.id; }).length;
    return '<a class="categoria-card revelar" href="catalogo.html?categoria=' + c.id + '">' +
      '<div class="midia midia--' + c.tipoImagem + '"><img src="' + c.imagem + '" alt="" loading="lazy"></div>' +
      '<h3>' + c.nome + '</h3><p>' + c.descricao + '</p><span>' + total + ' produtos ›</span></a>';
  }).join('');

  // 2. Mais vendidos: produtos marcados como destaque
  const destaques = PRODUTOS.filter(function (p) { return p.destaque; }).slice(0, 8);
  document.getElementById('grade-destaques').innerHTML = destaques.map(cardProdutoHtml).join('');

  // 3. Preço do destaque escuro (vem do "banco de dados")
  const charizard = buscarProdutoPorId('charizard-ex-chamas-obsidianas');
  document.getElementById('preco-destaque').textContent = formatarPreco(charizard.preco) + ' · ' + textoParcelamento(charizard.preco);

  // 4. Carrossel de coleções (Elite Trainer Box e boxes)
  const trilho = document.getElementById('carrossel');
  trilho.innerHTML = PRODUTOS.filter(function (p) { return p.categoria === 'colecoes'; }).map(function (p) {
    return '<a class="carrossel__item" href="produto.html?id=' + p.id + '">' +
      '<div class="midia midia--caixa"><img src="' + p.imagem + '" alt="' + escaparHtml(p.nome) + '" loading="lazy"></div>' +
      '<h3>' + escaparHtml(p.colecao) + '</h3><p class="texto-sutil">' + escaparHtml(p.nome) + '</p>' +
      '<span class="link-acento">' + formatarPreco(p.preco) + ' · Ver coleção ›</span></a>';
  }).join('');

  // Setas: rolam o carrossel o equivalente a um card
  function rolar(direcao) {
    const item = trilho.querySelector('.carrossel__item');
    trilho.scrollBy({ left: direcao * (item.offsetWidth + 20), behavior: 'smooth' });
  }
  document.getElementById('carrossel-anterior').addEventListener('click', function () { rolar(-1); });
  document.getElementById('carrossel-proximo').addEventListener('click', function () { rolar(1); });

  ativarAnimacoes();
});
