/* =========================================================
   pix.js — código "copia e cola" e QR Code ILUSTRATIVOS do PIX
   (usado no checkout e na confirmação)
   ========================================================= */

// Transforma um texto em um número (sempre o mesmo para o mesmo texto)
function hashTexto(texto) {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) hash = (hash * 31 + texto.charCodeAt(i)) | 0;
  return hash;
}

/* Desenha um QR Code ILUSTRATIVO no <canvas>: os três quadrados de posição
   ficam nos cantos e o miolo é gerado a partir do código (não é escaneável). */
function desenharQrFicticio(canvas, texto) {
  const ctx = canvas.getContext('2d');
  const modulos = 29;
  const tamanho = canvas.width / modulos;
  let semente = hashTexto(texto);
  function aleatorio() { semente = (semente * 1103515245 + 12345) & 0x7fffffff; return semente / 0x7fffffff; }

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#111';

  function ehAreaDePosicao(x, y) {
    return (x < 8 && y < 8) || (x > modulos - 9 && y < 8) || (x < 8 && y > modulos - 9);
  }
  for (let y = 0; y < modulos; y++) {
    for (let x = 0; x < modulos; x++) {
      if (!ehAreaDePosicao(x, y) && aleatorio() > 0.5) ctx.fillRect(x * tamanho, y * tamanho, tamanho, tamanho);
    }
  }
  [[0, 0], [modulos - 7, 0], [0, modulos - 7]].forEach(function (p) {
    ctx.fillRect(p[0] * tamanho, p[1] * tamanho, 7 * tamanho, 7 * tamanho);
    ctx.fillStyle = '#fff'; ctx.fillRect((p[0] + 1) * tamanho, (p[1] + 1) * tamanho, 5 * tamanho, 5 * tamanho);
    ctx.fillStyle = '#111'; ctx.fillRect((p[0] + 2) * tamanho, (p[1] + 2) * tamanho, 3 * tamanho, 3 * tamanho);
  });
}
