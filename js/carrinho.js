/* =========================================================
   carrinho.js — regras do carrinho e dos cálculos do pedido
   ---------------------------------------------------------
   O carrinho é salvo no navegador (localStorage) como uma lista:
   [ { id: 'charizard-ex-151', quantidade: 2 }, ... ]
   Assim os itens continuam lá ao trocar de página ou recarregar.
   ========================================================= */

const CHAVE_CARRINHO = 'olyporus:carrinho';
const CHAVE_PEDIDO_ATUAL = 'olyporus:pedido-atual'; // cupom, CEP e frete escolhidos
const CHAVE_PEDIDOS = 'olyporus:pedidos';            // histórico de pedidos finalizados

const FRETE_GRATIS_ACIMA = 299;      // frete grátis em compras a partir de R$ 299
const DESCONTO_PIX = 0.05;           // 5% de desconto pagando com PIX
const PARCELAS_SEM_JUROS = 6;        // até 6x sem juros
const MAX_PARCELAS = 12;             // até 12x no cartão de crédito
const JUROS_AO_MES = 0.0199;         // 1,99% ao mês a partir da 7ª parcela
const PARCELA_MINIMA = 10;           // nenhuma parcela menor que R$ 10

const CUPONS = {
  OLY10:       { tipo: 'percentual', valor: 10, descricao: '10% de desconto nos produtos' },
  BEMVINDO20:  { tipo: 'fixo', valor: 20, minimo: 150, descricao: 'R$ 20 de desconto em compras acima de R$ 150' },
  FRETEGRATIS: { tipo: 'frete', descricao: 'Frete grátis em qualquer valor' }
};

const Carrinho = {
  // Lista crua salva no navegador
  itens: function () {
    return lerStorage(CHAVE_CARRINHO, []);
  },

  salvar: function (itens) {
    salvarStorage(CHAVE_CARRINHO, itens);
    atualizarContadorCarrinho(); // função do layout.js (bolinha da sacola)
  },

  // Adiciona um produto. Se já existe, soma a quantidade (respeitando o estoque).
  adicionar: function (id, quantidade) {
    quantidade = quantidade || 1;
    const produto = buscarProdutoPorId(id);
    if (!produto) return false;

    const itens = this.itens();
    const existente = itens.find(function (item) { return item.id === id; });
    const atual = existente ? existente.quantidade : 0;
    const nova = Math.min(atual + quantidade, produto.estoque);

    if (nova === atual) {
      mostrarAviso('Estoque máximo atingido para este produto.', 'erro');
      return false;
    }
    if (existente) existente.quantidade = nova;
    else itens.push({ id: id, quantidade: nova });

    this.salvar(itens);
    return true;
  },

  // Define uma nova quantidade (0 ou menos remove o item)
  alterarQuantidade: function (id, quantidade) {
    const produto = buscarProdutoPorId(id);
    let itens = this.itens();
    if (quantidade <= 0) {
      itens = itens.filter(function (item) { return item.id !== id; });
    } else {
      itens.forEach(function (item) {
        if (item.id === id) item.quantidade = Math.min(quantidade, produto.estoque);
      });
    }
    this.salvar(itens);
  },

  remover: function (id) {
    this.salvar(this.itens().filter(function (item) { return item.id !== id; }));
  },

  limpar: function () {
    this.salvar([]);
  },

  // Total de unidades (para a bolinha da sacola)
  quantidadeTotal: function () {
    return this.itens().reduce(function (soma, item) { return soma + item.quantidade; }, 0);
  },

  // Itens com os dados completos do produto e o subtotal de cada linha
  detalhado: function () {
    return this.itens()
      .map(function (item) {
        const produto = buscarProdutoPorId(item.id);
        return produto ? { produto: produto, quantidade: item.quantidade, subtotal: produto.preco * item.quantidade } : null;
      })
      .filter(Boolean); // remove produtos que não existem mais
  },

  // Soma de todos os produtos
  subtotal: function () {
    return this.detalhado().reduce(function (soma, linha) { return soma + linha.subtotal; }, 0);
  }
};

/* ---------- Pedido atual: cupom e frete ---------- */

function lerPedidoAtual() {
  return lerStorage(CHAVE_PEDIDO_ATUAL, { cupom: null, cep: '', modalidade: 'pac' });
}

function salvarPedidoAtual(dados) {
  salvarStorage(CHAVE_PEDIDO_ATUAL, Object.assign(lerPedidoAtual(), dados));
}

// Valida e aplica um cupom. Devolve { ok, mensagem }.
function aplicarCupom(codigo) {
  const chave = String(codigo || '').trim().toUpperCase();
  const cupom = CUPONS[chave];
  if (!cupom) return { ok: false, mensagem: 'Cupom inválido. Experimente OLY10.' };
  if (cupom.minimo && Carrinho.subtotal() < cupom.minimo) {
    return { ok: false, mensagem: 'Este cupom vale para compras acima de ' + formatarPreco(cupom.minimo) + '.' };
  }
  salvarPedidoAtual({ cupom: chave });
  return { ok: true, mensagem: 'Cupom ' + chave + ' aplicado: ' + cupom.descricao + '.' };
}

function removerCupom() {
  salvarPedidoAtual({ cupom: null });
}

// Simulação de frete pelo CEP: a primeira cifra indica a região do Brasil.
// Devolve as opções PAC e SEDEX com valor e prazo.
function calcularFrete(cep, subtotal) {
  const digitos = String(cep || '').replace(/\D/g, '');
  if (digitos.length !== 8) return null;

  const regiao = Number(digitos[0]);             // 0–9
  const distancia = [1.2, 1.1, 1.0, 0.9, 1.3, 1.4, 1.6, 1.5, 0.8, 0.9][regiao]; // fator por região
  const gratis = subtotal >= FRETE_GRATIS_ACIMA;

  return {
    pac:   { nome: 'PAC',   valor: gratis ? 0 : arredondar(19.9 * distancia), prazo: Math.round(5 + 4 * distancia) },
    sedex: { nome: 'SEDEX', valor: gratis ? arredondar(9.9 * distancia) : arredondar(34.9 * distancia), prazo: Math.round(1 + 2 * distancia) }
  };
}

function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

/* Resumo de valores do pedido.
   formaPagamento: 'credito' | 'debito' | 'pix' (opcional)
   parcelas: número de parcelas no crédito (opcional) */
function calcularResumo(formaPagamento, parcelas) {
  const pedido = lerPedidoAtual();
  const subtotal = Carrinho.subtotal();
  const cupom = pedido.cupom ? CUPONS[pedido.cupom] : null;

  // Desconto do cupom
  let descontoCupom = 0;
  if (cupom && cupom.tipo === 'percentual') descontoCupom = subtotal * (cupom.valor / 100);
  if (cupom && cupom.tipo === 'fixo' && subtotal >= (cupom.minimo || 0)) descontoCupom = cupom.valor;
  descontoCupom = Math.min(arredondar(descontoCupom), subtotal);

  // Frete (só existe depois que o CEP for informado)
  const opcoes = calcularFrete(pedido.cep, subtotal);
  let frete = opcoes ? opcoes[pedido.modalidade || 'pac'].valor : null;
  if (cupom && cupom.tipo === 'frete' && frete !== null) frete = 0;

  const base = subtotal - descontoCupom + (frete || 0);

  // Desconto do PIX sobre os produtos (não sobre o frete)
  const descontoPix = formaPagamento === 'pix' ? arredondar((subtotal - descontoCupom) * DESCONTO_PIX) : 0;

  // Juros do parcelamento no crédito
  let juros = 0;
  if (formaPagamento === 'credito' && parcelas) {
    const opcao = calcularParcelas(base).find(function (o) { return o.numero === Number(parcelas); });
    if (opcao) juros = arredondar(opcao.total - base);
  }

  return {
    subtotal: subtotal,
    cupom: pedido.cupom,
    descontoCupom: descontoCupom,
    frete: frete,
    opcoesFrete: opcoes,
    descontoPix: descontoPix,
    juros: juros,
    total: arredondar(base - descontoPix + juros)
  };
}

/* Opções de parcelamento para um valor.
   Até 6x sem juros; de 7x a 12x com juros compostos (Tabela Price):
   parcela = valor * i / (1 - (1 + i)^-n) */
function calcularParcelas(valor) {
  const opcoes = [];
  for (let n = 1; n <= MAX_PARCELAS; n++) {
    let parcela;
    if (n <= PARCELAS_SEM_JUROS) {
      parcela = valor / n;
    } else {
      parcela = valor * JUROS_AO_MES / (1 - Math.pow(1 + JUROS_AO_MES, -n));
    }
    parcela = arredondar(parcela);
    if (n > 1 && parcela < PARCELA_MINIMA) break; // não oferece parcelas muito pequenas
    opcoes.push({ numero: n, valorParcela: parcela, total: arredondar(parcela * n), semJuros: n <= PARCELAS_SEM_JUROS });
  }
  return opcoes;
}

// Texto usado nos cards: "em até 6x de R$ 81,65 sem juros"
function textoParcelamento(preco) {
  const opcoes = calcularParcelas(preco).filter(function (o) { return o.semJuros; });
  const melhor = opcoes[opcoes.length - 1];
  if (!melhor || melhor.numero === 1) return 'à vista';
  return 'em até ' + melhor.numero + 'x de ' + formatarPreco(melhor.valorParcela) + ' sem juros';
}
