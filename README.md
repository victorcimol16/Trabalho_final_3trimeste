# OLYPORUS — Loja virtual de cartas Pokémon TCG

Loja virtual (e-commerce) **fictícia** desenvolvida para a atividade avaliativa de **Criação de Sites**.
Vende cartas avulsas, boosters, coleções (Elite Trainer Box) e acessórios, simulando todo o processo
de compra: vitrine → detalhes do produto → carrinho → checkout → pagamento → confirmação.

O visual foi criado a partir do design próprio feito no Figma (identidade OLYPORUS: azul `#3466AF`,
fontes Inter e Poppins, layout minimalista). Nenhum pagamento real é processado.

## Como executar

Não precisa instalar nada.

1. Abra a pasta do projeto.
2. Dê dois cliques em **`index.html`** (Chrome ou Edge).

> Recomendado: no VS Code, use a extensão **Live Server** (botão direito em `index.html` → *Open with Live Server*).
> O carrinho é salvo com `localStorage`; no Firefox, abrir os arquivos direto do disco pode separar o
> armazenamento entre páginas, então prefira o Live Server nesse navegador.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura das 8 páginas, formulários e acessibilidade (rótulos, `aria-*`) |
| **CSS3** | Variáveis de cor (tema claro/escuro), Grid, Flexbox, animações e responsividade com `@media` |
| **JavaScript** | Carrinho, cálculos, filtros, busca, validações, formas de pagamento e armazenamento no navegador |

Sem frameworks e sem bibliotecas: só HTML, CSS e JavaScript puros. Única chamada externa: a API pública
**ViaCEP**, que preenche o endereço a partir do CEP no checkout (se estiver sem internet, basta digitar).

## Estrutura de pastas

```
olyporus-loja/
├── index.html          → página inicial (vitrine, categorias, destaques)
├── catalogo.html       → lista de produtos com busca, filtros e ordenação
├── produto.html        → detalhes do produto (?id=...)
├── carrinho.html       → carrinho: quantidade, remover, frete, cupom e total
├── checkout.html       → dados do cliente, entrega e pagamento
├── confirmacao.html    → mensagem de compra realizada
├── favoritos.html      → produtos favoritos (extra)
├── conta.html          → login simulado e histórico de pedidos (extra)
├── css/
│   └── style.css       → todo o estilo (tema claro/escuro e responsivo)
├── js/
│   ├── utils.js        → formatação de preço, localStorage, máscaras, ícones
│   ├── produtos.js     → "banco de dados" com os produtos e categorias
│   ├── carrinho.js     → regras do carrinho, cupons, frete e parcelamento
│   ├── layout.js       → cabeçalho, busca, tema, rodapé e card de produto
│   ├── validacoes.js   → CPF, e-mail, cartão (Luhn), validade, CVV
│   ├── pix.js          → código e QR Code ilustrativos do PIX
│   └── paginas/        → um arquivo de JavaScript para cada página
└── img/
    ├── cartas/         → imagens das cartas
    └── produtos/       → boosters, coleções e acessórios
```

## Requisitos atendidos

| Requisito | Onde está |
|---|---|
| Página inicial organizada | `index.html` + `js/paginas/home.js` |
| Nome e identidade visual própria | Marca OLYPORUS, logo, paleta azul (`css/style.css`, seção 1) |
| Menu de navegação | Cabeçalho em `js/layout.js` (`montarCabecalho`), menu lateral no celular |
| Área de categorias | Seção "Compre por categoria" na home e filtros do catálogo |
| Produtos com imagem, nome, descrição e preço | `js/produtos.js` e `cardProdutoHtml()` em `js/layout.js` |
| Página de detalhes | `produto.html?id=...` |
| Adicionar ao carrinho | Botões `data-adicionar` + `Carrinho.adicionar()` |
| Carrinho funcional | `carrinho.html` + objeto `Carrinho` em `js/carrinho.js` |
| Alterar quantidade / remover | Botões − / + / Remover (`Carrinho.alterarQuantidade`, `Carrinho.remover`) |
| Cálculo do total | `calcularResumo()` em `js/carrinho.js` |
| Finalização do pedido | `checkout.html` |
| Formulário com dados do cliente | Etapa 1 do checkout, com validação de CPF e e-mail |
| Forma de pagamento | Etapa 3: crédito, débito ou PIX |
| Parcelamento no crédito | Até 12x (6x sem juros; 7x–12x com 1,99% a.m.) — `calcularParcelas()` |
| Confirmação de compra | `confirmacao.html` |
| Responsividade | `@media` no fim do `style.css` (computador, tablet e celular) |

### Recursos extras

Busca com sugestões ao vivo · filtros por categoria, idioma, preço e promoção · ordenação · favoritos ·
avaliações · cálculo de frete por CEP (PAC/SEDEX, grátis acima de R$ 299) · cupons de desconto ·
login simulado · histórico de pedidos · **modo escuro** · animações · carrinho salvo no navegador.

## Dados para testar

| O quê | Valor |
|---|---|
| Cupons | `OLY10` (10% off) · `BEMVINDO20` (R$ 20 off acima de R$ 150) · `FRETEGRATIS` |
| Cartão de teste | `4111 1111 1111 1111` · validade futura (ex.: `12/30`) · CVV `123` |
| CPF válido fictício | `529.982.247-25` |
| CEP | `01310-100` (Av. Paulista, São Paulo) |

No checkout há o botão **"Preencher com dados de exemplo"**, que preenche tudo com dados fictícios.

## Roteiro para a apresentação

1. Página inicial → categorias → clicar em **Cartas avulsas**.
2. Usar a **lupa** e buscar "charizard"; abrir um produto.
3. Mostrar detalhes, avaliações e cálculo de frete; **Adicionar ao carrinho** (2 unidades).
4. Adicionar outro produto; no carrinho, **alterar a quantidade** e **remover** um item.
5. Calcular o frete, aplicar o cupom `OLY10` e mostrar o **total**.
6. **Finalizar compra** → preencher dados de exemplo.
7. Mostrar **Crédito** (trocar as parcelas e ver os juros a partir de 7x), **Débito** e **PIX** (5% off e QR Code).
8. Confirmar → mensagem de **compra realizada**; abrir **Minha conta** para ver o histórico.
9. Alternar o **modo escuro** (ícone de lua) e reduzir a janela para mostrar a versão celular.

### Exemplo de código para explicar: adicionar ao carrinho

```js
// js/carrinho.js
adicionar: function (id, quantidade) {
  const produto = buscarProdutoPorId(id);          // 1. acha o produto na lista
  const itens = this.itens();                      // 2. lê o carrinho salvo no navegador
  const existente = itens.find(i => i.id === id);  // 3. o produto já está no carrinho?
  // 4. soma a quantidade, sem passar do estoque
  // 5. salva de volta no localStorage e atualiza a bolinha da sacola
}
```

---

Projeto acadêmico. OLYPORUS é uma loja fictícia, sem afiliação com a Pokémon Company; as imagens das cartas são ilustrativas.
