/* checkout.js — finalização do pedido
   1) dados do cliente  2) endereço e frete  3) pagamento (crédito, débito ou PIX)
   Ao confirmar: valida tudo, salva o pedido no navegador, esvazia o
   carrinho e abre a página de confirmação. */

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

document.addEventListener('DOMContentLoaded', function () {
  // Carrinho vazio? Não há o que finalizar.
  if (!Carrinho.detalhado().length) {
    document.getElementById('form-checkout').outerHTML =
      '<div class="vazio" style="margin-bottom:96px"><div class="vazio__icone">' + ICONES.sacola + '</div>' +
      '<h2>Seu carrinho está vazio</h2><p>Adicione produtos antes de finalizar a compra.</p>' +
      '<a class="btn btn--primario" href="catalogo.html">Ver produtos</a></div>';
    return;
  }

  const $ = function (id) { return document.getElementById(id); };
  const form = $('form-checkout');

  $('ic-credito').innerHTML = ICONES.cartao;
  $('ic-debito').innerHTML = ICONES.cartao;
  $('ic-pix').innerHTML = ICONES.pix;
  $('uf').innerHTML = '<option value="">UF</option>' + UFS.map(function (uf) { return '<option>' + uf + '</option>'; }).join('');

  // Recupera o CEP digitado no carrinho e o nome/e-mail de quem "entrou" na conta
  const usuario = lerStorage('olyporus:usuario', null);
  if (usuario) { $('nome').value = usuario.nome || ''; $('email').value = usuario.email || ''; }
  $('cep').value = lerPedidoAtual().cep || '';

  /* ---------- Máscaras enquanto digita ---------- */
  const mascaras = { cpf: mascaraCpf, telefone: mascaraTelefone, cep: mascaraCep, 'cartao-numero': mascaraCartao, 'cartao-validade': mascaraValidade };
  Object.keys(mascaras).forEach(function (id) {
    $(id).addEventListener('input', function () { this.value = mascaras[id](this.value); });
  });
  $('cartao-cvv').addEventListener('input', function () { this.value = somenteDigitos(this.value).slice(0, 4); });

  /* ---------- Forma de pagamento ---------- */
  function formaAtual() {
    return form.querySelector('input[name="forma"]:checked').value;
  }

  form.querySelectorAll('input[name="forma"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      const forma = formaAtual();
      $('painel-cartao').hidden = forma === 'pix';
      $('painel-pix').hidden = forma !== 'pix';
      $('campo-parcelas').hidden = forma !== 'credito';
      $('cv-tipo').textContent = forma === 'debito' ? 'DÉBITO' : 'CRÉDITO';
      $('cartao-visual').classList.toggle('cartao-visual--debito', forma === 'debito');
      limparErros($('painel-cartao'));
      atualizarResumo();
    });
  });

  /* ---------- Cartão visual (espelha o que é digitado) ---------- */
  ['cartao-numero', 'cartao-nome', 'cartao-validade'].forEach(function (id) {
    $(id).addEventListener('input', atualizarCartaoVisual);
  });
  function atualizarCartaoVisual() {
    const numero = $('cartao-numero').value;
    $('cv-numero').textContent = (numero + '•••• •••• •••• ••••'.slice(numero.length)) || '•••• •••• •••• ••••';
    $('cv-nome').textContent = $('cartao-nome').value.toUpperCase() || 'NOME NO CARTÃO';
    $('cv-validade').textContent = $('cartao-validade').value || 'MM/AA';
    $('cv-bandeira').textContent = detectarBandeira(numero) || 'OLYPORUS';
  }

  /* ---------- Parcelas ---------- */
  function atualizarParcelas() {
    // Parcelas calculadas sobre o total sem juros
    const base = calcularResumo('credito').total;
    const selecionada = $('parcelas').value || '1';
    $('parcelas').innerHTML = calcularParcelas(base).map(function (o) {
      const texto = o.numero + 'x de ' + formatarPreco(o.valorParcela) +
        (o.semJuros ? ' sem juros' : ' com juros (total ' + formatarPreco(o.total) + ')');
      return '<option value="' + o.numero + '">' + texto + '</option>';
    }).join('');
    if ($('parcelas').querySelector('option[value="' + selecionada + '"]')) $('parcelas').value = selecionada;
  }
  $('parcelas').addEventListener('change', atualizarResumo);

  /* ---------- Frete ---------- */
  function atualizarOpcoesFrete() {
    const resumo = calcularResumo();
    const alvo = $('frete-checkout');
    if (!resumo.opcoesFrete) {
      alvo.innerHTML = '<p class="texto-sutil" style="font-size:.9rem">Informe o CEP para ver as opções.</p>';
      return;
    }
    const modalidade = lerPedidoAtual().modalidade || 'pac';
    alvo.innerHTML = ['pac', 'sedex'].map(function (k) {
      const o = resumo.opcoesFrete[k];
      const gratisCupom = resumo.cupom === 'FRETEGRATIS';
      return '<label><input type="radio" name="modalidade" value="' + k + '"' + (modalidade === k ? ' checked' : '') + '>' +
        '<span><strong>' + o.nome + '</strong> · chega em até ' + o.prazo + ' dias úteis</span>' +
        '<strong>' + (o.valor === 0 || gratisCupom ? 'Grátis' : formatarPreco(o.valor)) + '</strong></label>';
    }).join('');
  }
  $('frete-checkout').addEventListener('change', function (e) {
    salvarPedidoAtual({ modalidade: e.target.value });
    atualizarResumo();
  });

  // Quando o CEP fica completo: calcula o frete e busca o endereço (ViaCEP)
  $('cep').addEventListener('input', function () {
    const digitos = somenteDigitos(this.value);
    salvarPedidoAtual({ cep: digitos.length === 8 ? this.value : '' });
    atualizarOpcoesFrete();
    atualizarResumo();
    if (digitos.length === 8) buscarEndereco(digitos);
  });

  function buscarEndereco(cep) {
    const status = $('cep-status');
    status.textContent = 'Buscando endereço…';
    fetch('https://viacep.com.br/ws/' + cep + '/json/')
      .then(function (resposta) { return resposta.json(); })
      .then(function (dados) {
        if (dados.erro) { status.textContent = 'CEP não encontrado. Preencha o endereço manualmente.'; return; }
        $('rua').value = dados.logradouro || $('rua').value;
        $('bairro').value = dados.bairro || $('bairro').value;
        $('cidade').value = dados.localidade || $('cidade').value;
        $('uf').value = dados.uf || $('uf').value;
        status.textContent = 'Endereço encontrado ✓';
        limparErros($('form-checkout').querySelector('fieldset:nth-of-type(2)'));
        $('numero').focus();
      })
      .catch(function () {
        status.textContent = 'Sem conexão com o serviço de CEP. Preencha o endereço manualmente.';
      });
  }

  /* ---------- PIX: código e QR Code fictícios ---------- */
  function atualizarPix(total) {
    const valor = total.toFixed(2);
    const codigo = '00020126580014BR.GOV.BCB.PIX0136olyporus-loja-ficticia@exemplo.com.br52040000530398654' +
      String(valor.length).padStart(2, '0') + valor + '5802BR5908OLYPORUS6009SAO PAULO62070503***6304' +
      (Math.abs(hashTexto(valor)) % 65536).toString(16).toUpperCase().padStart(4, '0');
    $('pix-codigo').value = codigo;
    desenharQrFicticio($('qr-pix'), codigo);
  }
  $('copiar-pix').addEventListener('click', function () {
    const campo = $('pix-codigo');
    campo.select();
    (navigator.clipboard ? navigator.clipboard.writeText(campo.value) : Promise.reject())
      .then(function () { mostrarAviso('Código PIX copiado!', 'sucesso'); })
      .catch(function () { document.execCommand('copy'); mostrarAviso('Código PIX copiado!', 'sucesso'); });
  });

  /* ---------- Resumo lateral ---------- */
  $('resumo-itens').innerHTML = Carrinho.detalhado().map(function (l) {
    return '<div class="resumo-item"><div class="midia midia--' + l.produto.tipoImagem + '"><img src="' + l.produto.imagem + '" alt=""></div>' +
      '<div>' + escaparHtml(l.produto.nome) + '<small>Qtd: ' + l.quantidade + '</small></div><strong>' + formatarPreco(l.subtotal) + '</strong></div>';
  }).join('');

  function atualizarResumo() {
    const forma = formaAtual();
    if (forma === 'credito') atualizarParcelas();
    const parcelas = forma === 'credito' ? Number($('parcelas').value || 1) : null;
    const r = calcularResumo(forma, parcelas);

    $('c-subtotal').textContent = formatarPreco(r.subtotal);
    $('c-linha-cupom').hidden = !r.cupom;
    if (r.cupom) {
      $('c-cupom-nome').textContent = 'Cupom ' + r.cupom;
      $('c-cupom').textContent = CUPONS[r.cupom].tipo === 'frete' ? 'Frete grátis' : '− ' + formatarPreco(r.descontoCupom);
    }
    $('c-frete').innerHTML = r.frete === null ? 'Informe o CEP' : (r.frete === 0 ? '<span class="texto-sucesso">Grátis</span>' : formatarPreco(r.frete));
    $('c-linha-pix').hidden = !r.descontoPix;
    $('c-pix').textContent = '− ' + formatarPreco(r.descontoPix);
    $('c-linha-juros').hidden = !r.juros;
    $('c-juros').textContent = '+ ' + formatarPreco(r.juros);
    $('c-total').textContent = formatarPreco(r.total);

    let descricao = 'PIX à vista com 5% de desconto';
    if (forma === 'debito') descricao = 'Débito à vista';
    if (forma === 'credito') {
      const opcao = calcularParcelas(calcularResumo('credito').total).find(function (o) { return o.numero === parcelas; });
      descricao = 'Crédito em ' + parcelas + 'x de ' + formatarPreco(opcao.valorParcela) + (opcao.semJuros ? ' sem juros' : ' com juros');
    }
    $('c-forma').textContent = descricao;
    $('confirmar').textContent = 'Confirmar pedido · ' + formatarPreco(r.total);

    if (forma === 'pix') atualizarPix(r.total);
    return r;
  }

  /* ---------- Validação ---------- */
  function mostrarErro(id, mensagem) {
    const campo = $(id).closest('.campo');
    campo.classList.toggle('invalido', !!mensagem);
    campo.querySelector('.campo__erro').textContent = mensagem || '';
    $(id).setAttribute('aria-invalid', mensagem ? 'true' : 'false');
  }
  function limparErros(area) {
    area.querySelectorAll('.campo').forEach(function (c) {
      c.classList.remove('invalido');
      const erro = c.querySelector('.campo__erro'); if (erro) erro.textContent = '';
    });
  }
  // Ao corrigir um campo, a mensagem de erro some
  form.addEventListener('input', function (e) {
    const campo = e.target.closest('.campo');
    if (campo && campo.classList.contains('invalido')) { campo.classList.remove('invalido'); campo.querySelector('.campo__erro').textContent = ''; }
  });

  function validarFormulario() {
    const regras = [
      ['nome', validarNomeCompleto($('nome').value), 'Informe nome e sobrenome.'],
      ['email', validarEmail($('email').value), 'E-mail inválido.'],
      ['telefone', validarTelefone($('telefone').value), 'Celular com DDD.'],
      ['cpf', validarCpf($('cpf').value), 'CPF inválido.'],
      ['cep', somenteDigitos($('cep').value).length === 8, 'CEP com 8 números.'],
      ['rua', $('rua').value.trim().length > 2, 'Informe a rua.'],
      ['numero', $('numero').value.trim() !== '', 'Informe o número.'],
      ['bairro', $('bairro').value.trim() !== '', 'Informe o bairro.'],
      ['cidade', $('cidade').value.trim() !== '', 'Informe a cidade.'],
      ['uf', $('uf').value !== '', 'Escolha o estado.']
    ];
    if (formaAtual() !== 'pix') {
      const bandeira = detectarBandeira($('cartao-numero').value);
      regras.push(
        ['cartao-numero', validarNumeroCartao($('cartao-numero').value), 'Número de cartão inválido.'],
        ['cartao-nome', $('cartao-nome').value.trim().length >= 3, 'Nome como está no cartão.'],
        ['cartao-validade', validarValidade($('cartao-validade').value), 'Validade inválida ou vencida.'],
        ['cartao-cvv', validarCvv($('cartao-cvv').value, bandeira), bandeira === 'Amex' ? 'CVV com 4 dígitos.' : 'CVV com 3 dígitos.']
      );
    }
    let primeiroErro = null;
    regras.forEach(function (regra) {
      mostrarErro(regra[0], regra[1] ? '' : regra[2]);
      if (!regra[1] && !primeiroErro) primeiroErro = regra[0];
    });
    if (primeiroErro) {
      $(primeiroErro).focus();
      $(primeiroErro).scrollIntoView({ behavior: 'smooth', block: 'center' });
      mostrarAviso('Confira os campos destacados.', 'erro');
      return false;
    }
    return true;
  }

  /* ---------- Confirmar pedido ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validarFormulario()) return;
    salvarPedidoAtual({ cep: $('cep').value }); // garante o frete do CEP que está no campo

    const forma = formaAtual();
    const parcelas = forma === 'credito' ? Number($('parcelas').value) : 1;
    const resumo = calcularResumo(forma, forma === 'credito' ? parcelas : null);
    const modalidade = lerPedidoAtual().modalidade || 'pac';
    const opcaoParcela = forma === 'credito' ? calcularParcelas(calcularResumo('credito').total).find(function (o) { return o.numero === parcelas; }) : null;

    const pedido = {
      numero: 'OLY-' + Date.now().toString().slice(-6),
      data: new Date().toISOString(),
      status: forma === 'pix' ? 'Aguardando pagamento' : 'Pagamento aprovado',
      cliente: { nome: $('nome').value.trim(), email: $('email').value.trim(), telefone: $('telefone').value, cpf: $('cpf').value },
      entrega: {
        endereco: $('rua').value.trim() + ', ' + $('numero').value.trim() + ($('complemento').value.trim() ? ' — ' + $('complemento').value.trim() : ''),
        bairro: $('bairro').value.trim(), cidade: $('cidade').value.trim(), uf: $('uf').value, cep: $('cep').value,
        modalidade: resumo.opcoesFrete[modalidade].nome, prazo: resumo.opcoesFrete[modalidade].prazo
      },
      pagamento: {
        forma: forma,
        bandeira: forma === 'pix' ? null : (detectarBandeira($('cartao-numero').value) || 'Cartão'),
        final: forma === 'pix' ? null : somenteDigitos($('cartao-numero').value).slice(-4), // nunca guardamos o número completo
        parcelas: parcelas,
        valorParcela: opcaoParcela ? opcaoParcela.valorParcela : resumo.total,
        semJuros: opcaoParcela ? opcaoParcela.semJuros : true,
        pixCodigo: forma === 'pix' ? $('pix-codigo').value : null
      },
      itens: Carrinho.detalhado().map(function (l) {
        return { id: l.produto.id, nome: l.produto.nome, quantidade: l.quantidade, preco: l.produto.preco, imagem: l.produto.imagem, tipoImagem: l.produto.tipoImagem };
      }),
      valores: resumo
    };

    // Simula o tempo de resposta da operadora
    const botao = $('confirmar');
    botao.disabled = true;
    botao.textContent = forma === 'pix' ? 'Gerando PIX…' : 'Processando pagamento…';

    setTimeout(function () {
      const pedidos = lerStorage(CHAVE_PEDIDOS, []);
      pedidos.unshift(pedido);
      salvarStorage(CHAVE_PEDIDOS, pedidos);
      Carrinho.limpar();
      salvarPedidoAtual({ cupom: null });
      window.location.href = 'confirmacao.html?pedido=' + pedido.numero;
    }, 1400);
  });

  /* ---------- Dados de exemplo (para a apresentação) ---------- */
  $('preencher-exemplo').addEventListener('click', function () {
    const exemplo = {
      nome: 'Ash Ketchum', email: 'ash@exemplo.com', telefone: '(11) 98765-4321', cpf: '529.982.247-25',
      cep: '01310-100', rua: 'Avenida Paulista', numero: '1000', complemento: 'Apto 151', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP',
      'cartao-numero': '4111 1111 1111 1111', 'cartao-nome': 'ASH KETCHUM', 'cartao-validade': '12/30', 'cartao-cvv': '123'
    };
    Object.keys(exemplo).forEach(function (id) { $(id).value = exemplo[id]; });
    salvarPedidoAtual({ cep: exemplo.cep });
    limparErros(form);
    atualizarCartaoVisual();
    atualizarOpcoesFrete();
    atualizarResumo();
    mostrarAviso('Dados fictícios preenchidos.');
  });

  atualizarOpcoesFrete();
  atualizarResumo();
  if (somenteDigitos($('cep').value).length === 8 && !$('rua').value) buscarEndereco(somenteDigitos($('cep').value));
});
