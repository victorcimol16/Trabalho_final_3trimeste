/* =========================================================
   utils.js — funções de apoio usadas em todas as páginas
   ========================================================= */

// Formata um número como moeda brasileira: 489.9 -> "R$ 489,90"
function formatarPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Lê um valor salvo no navegador (localStorage). Se não existir, devolve o padrão.
function lerStorage(chave, padrao) {
  try {
    const valor = localStorage.getItem(chave);
    return valor ? JSON.parse(valor) : padrao;
  } catch (erro) {
    return padrao; // navegação privada ou armazenamento bloqueado
  }
}

// Salva um valor no navegador (convertido para texto JSON)
function salvarStorage(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) {
    /* sem armazenamento: a loja continua funcionando na página atual */
  }
}

// Lê um parâmetro da URL: produto.html?id=mew-ex -> parametroUrl('id') = 'mew-ex'
function parametroUrl(nome) {
  return new URLSearchParams(window.location.search).get(nome);
}

// Evita que textos digitados pelo usuário virem HTML (segurança contra XSS)
function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Mostra um aviso flutuante (toast) no canto da tela
function mostrarAviso(mensagem, tipo) {
  let area = document.getElementById('avisos');
  if (!area) {
    area = document.createElement('div');
    area.id = 'avisos';
    area.className = 'avisos';
    area.setAttribute('aria-live', 'polite');
    document.body.appendChild(area);
  }
  const aviso = document.createElement('div');
  aviso.className = 'aviso' + (tipo ? ' aviso--' + tipo : '');
  aviso.textContent = mensagem;
  area.appendChild(aviso);
  setTimeout(function () { aviso.classList.add('aviso--saindo'); }, 2600);
  setTimeout(function () { aviso.remove(); }, 3000);
}

/* Máscaras de digitação: deixam o texto no formato certo enquanto a pessoa digita */
function somenteDigitos(valor) { return String(valor).replace(/\D/g, ''); }

function mascaraCep(valor) {        // 01310100 -> 01310-100
  return somenteDigitos(valor).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
}
function mascaraCpf(valor) {        // 52998224725 -> 529.982.247-25
  return somenteDigitos(valor).slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}
function mascaraTelefone(valor) {   // 11987654321 -> (11) 98765-4321
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.replace(/^(\d+)/, '($1');
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{0,4})(\d{0,4}).*/, '($1) $2-$3').replace(/-$/, '');
  return d.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
}
function mascaraCartao(valor) {     // 4111111111111111 -> 4111 1111 1111 1111
  return somenteDigitos(valor).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}
function mascaraValidade(valor) {   // 1229 -> 12/29
  return somenteDigitos(valor).slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');
}

// Gera as estrelinhas de avaliação: 4.7 -> ★★★★★ (com a última parcialmente cheia)
function estrelasHtml(nota) {
  const porcentagem = Math.round((nota / 5) * 100);
  return '<span class="estrelas" style="--nota:' + porcentagem + '%" aria-label="Nota ' + nota.toFixed(1).replace('.', ',') + ' de 5">★★★★★</span>';
}

// Ícones SVG reutilizados (desenhados à mão, sem biblioteca externa)
const ICONES = {
  lupa: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>',
  lua: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>',
  sol: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  conta: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  sacola: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  coracao: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3c0 5.4-7.5 10-7.5 10Z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  fechar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  lixeira: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17l9-10"/></svg>',
  caminhao: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 6h11v10H2zM13 9h4l4 4v3h-8"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
  escudo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>',
  cartao: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/></svg>',
  lupaCheck: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21M7.5 10.5l2 2 3.5-4"/></svg>',
  pix: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8 21.2 12 12 21.2 2.8 12Z"/><path d="M7.5 9.5 10 12l-2.5 2.5M16.5 9.5 14 12l2.5 2.5"/></svg>'
};
