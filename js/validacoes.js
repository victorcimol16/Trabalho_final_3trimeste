/* =========================================================
   validacoes.js — regras para conferir os dados do formulário
   ========================================================= */

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
}

function validarNomeCompleto(nome) {
  // Pelo menos duas palavras com 2+ letras (nome e sobrenome)
  return String(nome).trim().split(/\s+/).filter(function (p) { return p.length >= 2; }).length >= 2;
}

function validarTelefone(telefone) {
  const d = somenteDigitos(telefone);
  return d.length === 10 || d.length === 11;
}

/* CPF: os dois últimos números são "dígitos verificadores",
   calculados a partir dos 9 primeiros. Se a conta não bater, o CPF é inválido. */
function validarCpf(cpf) {
  const d = somenteDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false; // 111.111.111-11 etc. são inválidos

  function digito(quantidade) {
    let soma = 0;
    for (let i = 0; i < quantidade; i++) soma += Number(d[i]) * (quantidade + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  }
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}

/* Cartão: algoritmo de Luhn (usado por todas as bandeiras).
   Da direita para a esquerda, dobra um dígito sim, outro não;
   se o dobro passar de 9, subtrai 9. A soma tem que terminar em 0. */
function validarNumeroCartao(numero) {
  const d = somenteDigitos(numero);
  if (d.length < 13 || d.length > 16) return false;
  let soma = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9; }
    soma += n;
  }
  return soma % 10 === 0;
}

// Descobre a bandeira pelos primeiros dígitos
function detectarBandeira(numero) {
  const d = somenteDigitos(numero);
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(d)) return 'Elo';
  if (/^4/.test(d)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'Mastercard';
  if (/^3[47]/.test(d)) return 'Amex';
  if (/^(606282|3841)/.test(d)) return 'Hipercard';
  return '';
}

// Validade MM/AA: mês entre 1 e 12 e não pode estar vencida
function validarValidade(validade) {
  const partes = String(validade).split('/');
  if (partes.length !== 2 || partes[1].length !== 2) return false;
  const mes = Number(partes[0]);
  const ano = 2000 + Number(partes[1]);
  if (mes < 1 || mes > 12) return false;
  const hoje = new Date();
  const fimDoMes = new Date(ano, mes, 0, 23, 59, 59); // último dia do mês da validade
  return fimDoMes >= hoje && ano <= hoje.getFullYear() + 20;
}

function validarCvv(cvv, bandeira) {
  const d = somenteDigitos(cvv);
  return bandeira === 'Amex' ? d.length === 4 : d.length === 3;
}
