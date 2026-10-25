/* confirmacao.js — mostra o pedido recém-criado (confirmacao.html?pedido=OLY-123456) */

// Texto da forma de pagamento: "Visa final 1111 · 3x de R$ 100,00 sem juros"
function descreverPagamento(pg) {
  if (pg.forma === 'pix') return 'PIX à vista (5% de desconto)';
  const tipo = pg.forma === 'credito' ? 'Crédito' : 'Débito';
  let texto = tipo + ' ' + pg.bandeira + ' final ' + pg.final;
  if (pg.forma === 'credito') texto += ' · ' + pg.parcelas + 'x de ' + formatarPreco(pg.valorParcela) + (pg.semJuros ? ' sem juros' : ' com juros');
  else texto += ' · à vista';
  return texto;
}

document.addEventListener('DOMContentLoaded', function () {
  const main = document.getElementById('conteudo');
  const pedidos = lerStorage(CHAVE_PEDIDOS, []);
  const pedido = pedidos.find(function (p) { return p.numero === parametroUrl('pedido'); });

  if (!pedido) {
    main.innerHTML = '<div class="vazio" style="margin:64px 0 96px"><div class="vazio__icone">' + ICONES.sacola + '</div>' +
      '<h2>Pedido não encontrado</h2><p>Veja seus pedidos em Minha conta.</p><a class="btn btn--primario" href="conta.html#pedidos">Meus pedidos</a></div>';
    return;
  }

  const ehPix = pedido.pagamento.forma === 'pix';
  const primeiroNome = pedido.cliente.nome.split(' ')[0];
  const previsao = new Date(pedido.data);
  previsao.setDate(previsao.getDate() + pedido.entrega.prazo + 1);
  const v = pedido.valores;

  main.innerHTML =
    '<section class="confirmacao">' +
      '<div class="confirmacao__check">' + ICONES.check + '</div>' +
      '<p class="eyebrow">Pedido ' + pedido.numero + '</p>' +
      '<h1 class="titulo-display">' + (ehPix ? 'Quase lá, ' : 'Compra realizada, ') + escaparHtml(primeiroNome) + '!</h1>' +
      '<p class="subtitulo" id="mensagem-status">' + (ehPix
        ? 'Seu pedido foi criado. Pague o PIX abaixo para concluir.'
        : 'Pagamento aprovado. Enviamos os detalhes para ' + escaparHtml(pedido.cliente.email) + '.') + '</p>' +
    '</section>' +

    (ehPix ?
      '<section class="painel" style="max-width:760px;margin:0 auto 32px" id="painel-pix-confirmacao">' +
        '<div class="pix"><canvas id="qr-confirmacao" width="200" height="200" aria-label="QR Code PIX fictício"></canvas>' +
        '<div><p style="font-weight:600;font-size:1.2rem">Total no PIX: ' + formatarPreco(v.total) + '</p>' +
        '<p class="texto-sutil">Código válido por <strong id="contador-pix">30:00</strong></p>' +
        '<div class="pix__codigo"><input readonly value="' + escaparHtml(pedido.pagamento.pixCodigo) + '" id="codigo-confirmacao" aria-label="Código PIX"><button class="btn btn--contorno" type="button" id="copiar-confirmacao">Copiar</button></div>' +
        '<button class="btn btn--primario" type="button" id="simular-pix" style="margin-top:14px">Simular pagamento do PIX</button></div></div>' +
      '</section>' : '') +

    '<div class="confirmacao__grade">' +
      '<section class="painel">' +
        '<h2 style="font-size:1.2rem;margin-bottom:16px">Itens</h2>' +
        '<div class="resumo-itens" style="max-height:none">' + pedido.itens.map(function (i) {
          return '<div class="resumo-item"><div class="midia midia--' + i.tipoImagem + '"><img src="' + i.imagem + '" alt=""></div>' +
            '<div>' + escaparHtml(i.nome) + '<small>Qtd: ' + i.quantidade + '</small></div><strong>' + formatarPreco(i.preco * i.quantidade) + '</strong></div>';
        }).join('') + '</div>' +
        '<div class="resumo-linha"><span>Subtotal</span><span>' + formatarPreco(v.subtotal) + '</span></div>' +
        (v.descontoCupom ? '<div class="resumo-linha resumo-linha--desconto"><span>Cupom ' + v.cupom + '</span><span>− ' + formatarPreco(v.descontoCupom) + '</span></div>' : '') +
        '<div class="resumo-linha"><span>Frete (' + pedido.entrega.modalidade + ')</span><span>' + (v.frete ? formatarPreco(v.frete) : 'Grátis') + '</span></div>' +
        (v.descontoPix ? '<div class="resumo-linha resumo-linha--desconto"><span>Desconto PIX</span><span>− ' + formatarPreco(v.descontoPix) + '</span></div>' : '') +
        (v.juros ? '<div class="resumo-linha"><span>Juros</span><span>+ ' + formatarPreco(v.juros) + '</span></div>' : '') +
        '<div class="resumo-linha resumo-linha--total"><span>Total</span><span>' + formatarPreco(v.total) + '</span></div>' +
      '</section>' +
      '<section class="painel">' +
        '<h2 style="font-size:1.2rem;margin-bottom:16px">Entrega e pagamento</h2>' +
        '<p class="eyebrow-cinza" style="margin-top:0">Previsão de entrega</p>' +
        '<p style="font-size:1.3rem;font-weight:600">' + previsao.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) + '</p>' +
        '<p class="texto-sutil">' + pedido.entrega.modalidade + ' · até ' + pedido.entrega.prazo + ' dias úteis após o pagamento</p>' +
        '<p class="eyebrow-cinza">Endereço</p>' +
        '<p>' + escaparHtml(pedido.cliente.nome) + '<br>' + escaparHtml(pedido.entrega.endereco) + '<br>' + escaparHtml(pedido.entrega.bairro) + ' · ' + escaparHtml(pedido.entrega.cidade) + '/' + pedido.entrega.uf + ' · ' + pedido.entrega.cep + '</p>' +
        '<p class="eyebrow-cinza">Pagamento</p>' +
        '<p>' + descreverPagamento(pedido.pagamento) + '</p>' +
        '<p class="eyebrow-cinza">Status</p>' +
        '<p><span class="selo ' + (ehPix ? 'selo--alerta' : 'selo--promo') + '" id="selo-status">' + pedido.status + '</span></p>' +
        '<div class="hero__acoes" style="justify-content:flex-start;margin-top:24px">' +
          '<a class="btn btn--primario" href="index.html">Continuar comprando</a>' +
          '<a class="btn btn--link" href="conta.html#pedidos">Ver meus pedidos ›</a>' +
        '</div>' +
      '</section>' +
    '</div>';

  if (!ehPix) return;

  /* ---- PIX: QR, cópia, contagem regressiva e simulação ---- */
  desenharQrFicticio(document.getElementById('qr-confirmacao'), pedido.pagamento.pixCodigo);

  document.getElementById('copiar-confirmacao').addEventListener('click', function () {
    const campo = document.getElementById('codigo-confirmacao');
    campo.select();
    (navigator.clipboard ? navigator.clipboard.writeText(campo.value) : Promise.reject())
      .then(function () { mostrarAviso('Código PIX copiado!', 'sucesso'); })
      .catch(function () { document.execCommand('copy'); mostrarAviso('Código PIX copiado!', 'sucesso'); });
  });

  const fim = new Date(pedido.data).getTime() + 30 * 60 * 1000;
  const timer = setInterval(function () {
    const restante = Math.max(0, fim - Date.now());
    const min = Math.floor(restante / 60000), seg = Math.floor((restante % 60000) / 1000);
    document.getElementById('contador-pix').textContent = String(min).padStart(2, '0') + ':' + String(seg).padStart(2, '0');
    if (!restante) clearInterval(timer);
  }, 1000);

  if (pedido.status === 'Pagamento aprovado') aprovarNaTela();

  document.getElementById('simular-pix').addEventListener('click', function () {
    // Atualiza o status do pedido salvo
    const lista = lerStorage(CHAVE_PEDIDOS, []);
    lista.forEach(function (p) { if (p.numero === pedido.numero) p.status = 'Pagamento aprovado'; });
    salvarStorage(CHAVE_PEDIDOS, lista);
    aprovarNaTela();
    mostrarAviso('PIX recebido! Pedido confirmado.', 'sucesso');
  });

  function aprovarNaTela() {
    clearInterval(timer);
    document.getElementById('painel-pix-confirmacao').innerHTML =
      '<p style="text-align:center;font-weight:600;font-size:1.2rem" class="texto-sucesso">✓ Pagamento PIX aprovado. Compra realizada com sucesso!</p>';
    document.querySelector('.confirmacao h1').textContent = 'Compra realizada, ' + primeiroNome + '!';
    document.getElementById('mensagem-status').textContent = 'Pagamento aprovado. Enviamos os detalhes para ' + pedido.cliente.email + '.';
    const selo = document.getElementById('selo-status');
    selo.textContent = 'Pagamento aprovado';
    selo.className = 'selo selo--promo';
  }
});
