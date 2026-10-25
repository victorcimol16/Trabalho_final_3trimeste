/* conta.js — login simulado e histórico de pedidos
   O "login" só guarda nome e e-mail no navegador para preencher o checkout.
   Não existe servidor: nenhuma senha é enviada ou armazenada. */

const CHAVE_USUARIO = 'olyporus:usuario';

document.addEventListener('DOMContentLoaded', function () {
  renderizarUsuario();
  renderizarPedidos();
});

function renderizarUsuario() {
  const painel = document.getElementById('painel-usuario');
  const usuario = lerStorage(CHAVE_USUARIO, null);

  if (usuario) {
    const iniciais = usuario.nome.split(' ').map(function (p) { return p[0]; }).slice(0, 2).join('').toUpperCase();
    painel.innerHTML =
      '<div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">' +
        '<span style="display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:var(--text);color:var(--bg);font-weight:600">' + escaparHtml(iniciais) + '</span>' +
        '<div><strong style="font-size:1.1rem">Olá, ' + escaparHtml(usuario.nome.split(' ')[0]) + '</strong><p class="texto-sutil" style="font-size:.85rem">' + escaparHtml(usuario.email) + '</p></div>' +
      '</div>' +
      '<p class="eyebrow-cinza" style="margin-top:0">Atalhos</p>' +
      '<ul style="display:grid;gap:10px;margin-bottom:24px">' +
        '<li><a class="link-acento" href="favoritos.html">Favoritos (' + listarFavoritos().length + ') ›</a></li>' +
        '<li><a class="link-acento" href="carrinho.html">Carrinho (' + Carrinho.quantidadeTotal() + ') ›</a></li>' +
        '<li><a class="link-acento" href="catalogo.html?promocao=1">Promoções ›</a></li>' +
      '</ul>' +
      '<button class="btn btn--contorno btn--bloco" type="button" id="sair">Sair</button>';
    document.getElementById('sair').addEventListener('click', function () {
      localStorage.removeItem(CHAVE_USUARIO);
      mostrarAviso('Você saiu da conta.');
      renderizarUsuario();
    });
    return;
  }

  painel.innerHTML =
    '<h2 style="font-size:1.3rem;margin-bottom:6px">Entrar</h2>' +
    '<p class="texto-sutil" style="font-size:.9rem;margin-bottom:20px">Acompanhe pedidos e finalize compras mais rápido.</p>' +
    '<form id="form-login" novalidate style="display:grid;gap:14px">' +
      '<div class="campo"><label for="login-nome">Nome completo</label><input id="login-nome" autocomplete="name"><span class="campo__erro"></span></div>' +
      '<div class="campo"><label for="login-email">E-mail</label><input id="login-email" type="email" autocomplete="email"><span class="campo__erro"></span></div>' +
      '<div class="campo"><label for="login-senha">Senha</label><input id="login-senha" type="password" autocomplete="current-password"><span class="campo__erro"></span><span class="campo__dica">Demonstração: qualquer senha com 6+ caracteres.</span></div>' +
      '<button class="btn btn--primario btn--bloco" type="submit">Entrar</button>' +
    '</form>';

  document.getElementById('form-login').addEventListener('submit', function (e) {
    e.preventDefault();
    const nome = document.getElementById('login-nome');
    const email = document.getElementById('login-email');
    const senha = document.getElementById('login-senha');
    const erros = [
      [nome, validarNomeCompleto(nome.value), 'Informe nome e sobrenome.'],
      [email, validarEmail(email.value), 'E-mail inválido.'],
      [senha, senha.value.length >= 6, 'Mínimo de 6 caracteres.']
    ];
    let valido = true;
    erros.forEach(function (r) {
      r[0].closest('.campo').classList.toggle('invalido', !r[1]);
      r[0].closest('.campo').querySelector('.campo__erro').textContent = r[1] ? '' : r[2];
      if (!r[1]) valido = false;
    });
    if (!valido) return;
    salvarStorage(CHAVE_USUARIO, { nome: nome.value.trim(), email: email.value.trim() });
    mostrarAviso('Bem-vindo(a), ' + nome.value.trim().split(' ')[0] + '!', 'sucesso');
    renderizarUsuario();
  });
}

function renderizarPedidos() {
  const pedidos = lerStorage(CHAVE_PEDIDOS, []);
  const lista = document.getElementById('lista-pedidos');

  if (!pedidos.length) {
    lista.innerHTML = '<div class="vazio"><div class="vazio__icone">' + ICONES.sacola + '</div><h2>Nenhum pedido ainda</h2>' +
      '<p>Quando você finalizar uma compra, ela aparece aqui com o status e os detalhes.</p><a class="btn btn--primario" href="catalogo.html">Ir às compras</a></div>';
    return;
  }

  lista.innerHTML = pedidos.map(function (p) {
    const data = new Date(p.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    const unidades = p.itens.reduce(function (s, i) { return s + i.quantidade; }, 0);
    const aprovado = p.status === 'Pagamento aprovado';
    return '<article class="pedido-card">' +
      '<div class="pedido-card__fotos">' + p.itens.slice(0, 3).map(function (i) {
        return '<div class="midia midia--' + i.tipoImagem + '"><img src="' + i.imagem + '" alt=""></div>';
      }).join('') + '</div>' +
      '<div><strong>' + p.numero + '</strong> <span class="selo ' + (aprovado ? 'selo--promo' : 'selo--alerta') + '">' + p.status + '</span>' +
        '<p class="texto-sutil" style="font-size:.85rem">' + data + ' · ' + unidades + (unidades === 1 ? ' item' : ' itens') + ' · ' + formatarPreco(p.valores.total) + '</p></div>' +
      '<a class="link-acento" href="confirmacao.html?pedido=' + p.numero + '">Detalhes ›</a>' +
    '</article>';
  }).join('');
}
