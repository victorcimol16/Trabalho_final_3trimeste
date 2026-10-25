/* carrinho.js (página) — lista os itens, altera quantidades,
   remove produtos e recalcula os totais a cada mudança. */

document.addEventListener('DOMContentLoaded', function () {
  const lista = document.getElementById('lista-itens');
  const campoCep = document.getElementById('cep-carrinho');
  campoCep.value = lerPedidoAtual().cep || '';

  /* ---- Desenha os itens ---- */
  function renderizarItens() {
    const linhas = Carrinho.detalhado();

    if (!linhas.length) {
      document.getElementById('area-carrinho').innerHTML =
        '<div class="vazio" style="grid-column:1/-1">' +
          '<div class="vazio__icone">' + ICONES.sacola + '</div>' +
          '<h2>Sua sacola está vazia</h2>' +
          '<p>Explore as cartas, boosters e coleções e adicione o que quiser. Os itens ficam salvos neste navegador.</p>' +
          '<a class="btn btn--primario" href="catalogo.html">Começar a comprar</a>' +
        '</div>';
      document.getElementById('resumo-topo').textContent = '';
      return false;
    }

    lista.innerHTML = linhas.map(function (l) {
      const p = l.produto;
      return '<article class="item-carrinho" data-id="' + p.id + '">' +
        '<a href="produto.html?id=' + p.id + '" class="midia midia--' + p.tipoImagem + '"><img src="' + p.imagem + '" alt="' + escaparHtml(p.nome) + '"></a>' +
        '<div class="item-carrinho__info">' +
          '<h3><a href="produto.html?id=' + p.id + '">' + escaparHtml(p.nome) + '</a></h3>' +
          '<p>' + [p.colecao, p.raridade, p.idioma].filter(function (t) { return t !== '—'; }).map(escaparHtml).join(' · ') + '</p>' +
          '<p>' + formatarPreco(p.preco) + ' cada</p>' +
          '<div class="item-carrinho__acoes">' +
            '<div class="quantidade">' +
              '<button type="button" data-acao="menos" aria-label="Diminuir quantidade de ' + escaparHtml(p.nome) + '">−</button>' +
              '<input type="number" value="' + l.quantidade + '" min="1" max="' + p.estoque + '" data-acao="digitar" aria-label="Quantidade de ' + escaparHtml(p.nome) + '">' +
              '<button type="button" data-acao="mais" aria-label="Aumentar quantidade de ' + escaparHtml(p.nome) + '"' + (l.quantidade >= p.estoque ? ' disabled' : '') + '>+</button>' +
            '</div>' +
            '<button class="btn-remover" type="button" data-acao="remover">' + ICONES.lixeira + ' Remover</button>' +
          '</div>' +
        '</div>' +
        '<div class="item-carrinho__preco">' + formatarPreco(l.subtotal) + (l.quantidade > 1 ? '<small>' + l.quantidade + ' unidades</small>' : '') + '</div>' +
      '</article>';
    }).join('');

    const unidades = Carrinho.quantidadeTotal();
    document.getElementById('resumo-topo').textContent = unidades + (unidades === 1 ? ' item' : ' itens') + ' · Frete grátis acima de ' + formatarPreco(FRETE_GRATIS_ACIMA) + '.';
    return true;
  }

  /* ---- Atualiza o resumo de valores ---- */
  function renderizarResumo() {
    const resumo = calcularResumo();
    const pedido = lerPedidoAtual();

    document.getElementById('r-subtotal').textContent = formatarPreco(resumo.subtotal);

    // Cupom
    const linhaCupom = document.getElementById('linha-cupom');
    linhaCupom.hidden = !resumo.cupom;
    if (resumo.cupom) {
      document.getElementById('r-cupom-nome').innerHTML = 'Cupom ' + resumo.cupom + ' <button type="button" class="btn--link" id="remover-cupom" style="border:0;background:none;font-size:.8rem">remover</button>';
      document.getElementById('r-cupom').textContent = CUPONS[resumo.cupom].tipo === 'frete' ? 'Frete grátis' : '− ' + formatarPreco(resumo.descontoCupom);
      document.getElementById('remover-cupom').addEventListener('click', function () {
        removerCupom();
        document.getElementById('msg-cupom').textContent = '';
        renderizarResumo();
      });
    }

    // Frete
    document.getElementById('r-frete').innerHTML = resumo.frete === null ? 'Informe o CEP' : (resumo.frete === 0 ? '<span class="texto-sucesso">Grátis</span>' : formatarPreco(resumo.frete));
    const escolha = document.getElementById('frete-escolha');
    if (resumo.opcoesFrete) {
      escolha.innerHTML = ['pac', 'sedex'].map(function (k) {
        const o = resumo.opcoesFrete[k];
        return '<label><input type="radio" name="modalidade" value="' + k + '"' + ((pedido.modalidade || 'pac') === k ? ' checked' : '') + '>' +
          '<span>' + o.nome + ' · até ' + o.prazo + ' dias úteis</span><strong>' + (o.valor === 0 ? 'Grátis' : formatarPreco(o.valor)) + '</strong></label>';
      }).join('');
    } else {
      escolha.innerHTML = '';
    }

    // Barra "falta pouco para o frete grátis"
    const falta = FRETE_GRATIS_ACIMA - resumo.subtotal;
    document.getElementById('msg-frete-gratis').innerHTML = falta > 0
      ? 'Faltam <strong>' + formatarPreco(falta) + '</strong> para ganhar frete grátis (PAC).'
      : '<span class="texto-sucesso">Você ganhou frete grátis no PAC!</span>';
    document.getElementById('barra-frete').style.width = Math.min(100, (resumo.subtotal / FRETE_GRATIS_ACIMA) * 100) + '%';

    // Total e parcelamento
    document.getElementById('r-total').textContent = formatarPreco(resumo.total);
    document.getElementById('r-parcelas').textContent = 'ou ' + textoParcelamento(resumo.total) + ' · ' + formatarPreco(resumo.total - (resumo.subtotal - resumo.descontoCupom) * DESCONTO_PIX) + ' no PIX';
  }

  function atualizarTudo() {
    if (renderizarItens()) renderizarResumo();
  }

  /* ---- Eventos dos itens (delegação: um ouvinte para a lista toda) ---- */
  lista.addEventListener('click', function (e) {
    const botao = e.target.closest('[data-acao]');
    if (!botao || botao.dataset.acao === 'digitar') return;
    const id = botao.closest('.item-carrinho').dataset.id;
    const atual = Carrinho.itens().find(function (i) { return i.id === id; }).quantidade;

    if (botao.dataset.acao === 'mais') Carrinho.alterarQuantidade(id, atual + 1);
    if (botao.dataset.acao === 'menos') Carrinho.alterarQuantidade(id, atual - 1); // chegando a 0, remove
    if (botao.dataset.acao === 'remover') {
      Carrinho.remover(id);
      mostrarAviso('Produto removido do carrinho.');
    }
    atualizarTudo();
  });

  lista.addEventListener('change', function (e) {
    if (e.target.dataset.acao !== 'digitar') return;
    const id = e.target.closest('.item-carrinho').dataset.id;
    Carrinho.alterarQuantidade(id, parseInt(e.target.value, 10) || 0);
    atualizarTudo();
  });

  /* ---- Frete ---- */
  campoCep.addEventListener('input', function () { campoCep.value = mascaraCep(campoCep.value); });
  document.getElementById('form-cep').addEventListener('submit', function (e) {
    e.preventDefault();
    if (somenteDigitos(campoCep.value).length !== 8) {
      mostrarAviso('Digite um CEP com 8 números.', 'erro');
      return;
    }
    salvarPedidoAtual({ cep: campoCep.value });
    renderizarResumo();
  });
  document.getElementById('frete-escolha').addEventListener('change', function (e) {
    salvarPedidoAtual({ modalidade: e.target.value });
    renderizarResumo();
  });

  /* ---- Cupom ---- */
  document.getElementById('form-cupom').addEventListener('submit', function (e) {
    e.preventDefault();
    const campo = document.getElementById('cupom');
    const resultado = aplicarCupom(campo.value);
    const msg = document.getElementById('msg-cupom');
    msg.textContent = resultado.mensagem;
    msg.className = 'mensagem ' + (resultado.ok ? 'mensagem--ok' : 'mensagem--erro');
    if (resultado.ok) campo.value = '';
    renderizarResumo();
  });

  atualizarTudo();
});
