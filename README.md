# EkuluTech

Loja de iPhones e MacBooks da Ekulu Company, com interface responsiva em português e preços em kwanzas (AOA).

## Executar localmente

Não há instalação nem compilação. A partir da raiz do repositório:

```sh
python3 -m http.server 4173
```

Aceda a `http://localhost:4173`.

## Páginas e funcionalidades

- Página inicial com destaques, categorias e contactos.
- Catálogo com pesquisa, filtros por categoria/geração e ordenação por preço ou nome.
- Seleção de modelo, cor, capacidade e quantidade, com preço atualizado.
- Carrinho persistente neste navegador, partilhado entre separadores, com ajuste de quantidade e remoção de itens.
- Revisão dos dados de entrega e resumo do pedido para envio pelo WhatsApp da loja.
- Navegação por teclado, menu móvel e suporte à preferência por movimento reduzido.

O carrinho é guardado no `localStorage`. O rascunho com os dados de contacto e entrega é guardado apenas no `sessionStorage` do separador. Não existe processamento de pagamentos nem registo de encomendas num servidor: o utilizador confirma a mensagem no WhatsApp e combina disponibilidade, entrega e pagamento com a equipa. O resumo não indica que o pedido já foi enviado ou pago.

## Alterar produtos

O catálogo partilhado está em `catalog.js`. Os preços base e os acréscimos de capacidade estão em AOA. As imagens, a fonte e os ícones são locais; o site não depende de CDNs para carregar a interface. Fotografias são ilustrativas e a disponibilidade das configurações deve ser confirmada com a loja.

Os ficheiros em `site-jelzemar-main/` são um caminho antigo e encaminham para as páginas da raiz, preservando os parâmetros dos produtos.

## GitHub Pages

Publicação a partir de `main`, pasta `/` (raiz), com `.nojekyll`. Todos os caminhos são relativos para suportar o subdiretório do repositório.

URL prevista após ativar a publicação: https://joaroque.github.io/site-jelzemar/

## Verificação

A interface foi verificada no Chromium com o percurso catálogo → configuração → carrinho → dados de entrega → resumo do WhatsApp, incluindo cálculo de totais, persistência, sincronização entre separadores, entradas inválidas e páginas em larguras de 320, 390, 768, 1024 e 1440 px.

A fonte Manrope é distribuída sob a licença em `assets/Manrope-LICENSE.txt`. As imagens dos produtos mantêm os direitos dos respetivos titulares.
