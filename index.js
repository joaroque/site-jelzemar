(() => {
  "use strict";
  const products = window.EKULU_PRODUCTS || [];
  const byId = new Map(products.map((p) => [p.id, p]));
  const page = document.body.dataset.page;
  const params = new URLSearchParams(location.search);
  const main = document.getElementById("main");
  const drawer = document.getElementById("cart-drawer");
  const CART_KEY = "ekulu-cart-v1";
  const ORDER_KEY = "ekulu-order-draft-v1";
  const paths = {
    arrow: "M4 12h16m-6-6 6 6-6 6",
    diagonal: "M6 18 18 6M6 6h12v12",
    search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    bag: "M5 7h14l1 14H4L5 7Zm3 0V5a4 4 0 0 1 8 0v2",
    menu: "M4 7h16M4 12h16M4 17h16",
    close: "m6 6 12 12M6 18 18 6",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    check: "m5 12 4 4L19 6",
    shield: "m12 2 8 3v6c0 5-8 10-8 10S4 16 4 11V5l8-3Zm-4 9 3 3 5-5",
    truck:
      "M1 5h13v12H1V5Zm13 5h4l4 4v3h-8M6 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    globe:
      "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z",
    chat: "M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-1l-6 2 2-6a9 9 0 1 1 17-4ZM8 11h.01M12 11h.01M16 11h.01",
    chevron: "m9 5 7 7-7 7",
    phone:
      "M5 3h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2Z",
    mail: "M3 5h18v14H3V5Zm0 0 9 7 9-7",
    pin: "M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
    lock: "M5 10h14v11H5V10Zm3 0V6a4 4 0 0 1 8 0v4",
    spark: "m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z",
    laptop: "M5 3h14v13H5V3ZM2 16h20l-2 4H4l-2-4",
    heart: "M20 4a5 5 0 0 0-8 2 5 5 0 0 0-8-2c-4 4 0 9 8 16 8-7 12-12 8-16Z",
    refresh: "M20 7V2l-4 4M4 17v5l4-4M4 7a9 9 0 0 1 15-2M20 17a9 9 0 0 1-15 2",
  };
  function icon(name) {
    return `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="${paths[name] || paths.arrow}"/></svg>`;
  }
  function esc(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }
  function money(value) {
    return new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 })
      .format(value)
      .replace(/\s/g, ".");
  }
  function price(value) {
    return `<span class="price">${money(value)} <small>Kz</small></span>`;
  }
  function productUrl(p, c, s) {
    return `${p.category === "macbook" ? "selecionar-macbook" : "selecionar-iphone"}.html?model=${encodeURIComponent(p.id)}${c ? "&color=" + encodeURIComponent(c) : ""}${s ? "&storage=" + encodeURIComponent(s) : ""}`;
  }
  function brand() {
    return '<a class="brand" href="index.html" aria-label="EkuluTech, página inicial"><span class="brand-mark" aria-hidden="true">E</span><span class="brand-name">Ekulu<span>Tech</span><span style="color:#83935b">.</span></span></a>';
  }
  function readStorage(key, fallback, session = false) {
    try {
      return (
        JSON.parse((session ? sessionStorage : localStorage).getItem(key)) ??
        fallback
      );
    } catch {
      return fallback;
    }
  }
  function normalizeCart(value) {
    if (!Array.isArray(value)) return [];
    const valid = new Map();
    value.slice(0, 200).forEach((item) => {
      const p = byId.get(item?.id);
      if (!p || !Number.isInteger(item.qty) || item.qty < 1) return;
      const c = p.colors.find((c) => c.value === item.color);
      const s = p.storage.find((s) => s.capacity === item.storage);
      if (!c || !s) return;
      const row = {
        id: p.id,
        color: c.value,
        storage: s.capacity,
        qty: Math.min(99, item.qty),
      };
      const key = itemKey(row);
      if (valid.has(key))
        valid.get(key).qty = Math.min(99, valid.get(key).qty + row.qty);
      else valid.set(key, row);
    });
    return [...valid.values()];
  }
  function itemKey(item) {
    return `${item.id}|${item.color}|${item.storage}`;
  }
  let cart = normalizeCart(readStorage(CART_KEY, []));
  function itemData(item) {
    const p = byId.get(item.id),
      c = p.colors.find((c) => c.value === item.color),
      s = p.storage.find((s) => s.capacity === item.storage);
    return { p, c, s, unit: p.basePrice + s.price };
  }
  function cartCount() {
    return cart.reduce((n, item) => n + item.qty, 0);
  }
  function cartTotal(items = cart) {
    return items.reduce((n, item) => n + itemData(item).unit * item.qty, 0);
  }
  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      toast("Carrinho guardado apenas nesta sessão.");
    }
    updateCounts();
  }
  function updateCounts() {
    document
      .querySelectorAll("[data-cart-count]")
      .forEach((el) => (el.textContent = cartCount()));
    document
      .querySelectorAll("[data-cart-trigger]")
      .forEach((el) =>
        el.setAttribute(
          "aria-label",
          `Abrir carrinho, ${cartCount()} ${cartCount() === 1 ? "item" : "itens"}`,
        ),
      );
  }
  let toastTimer;
  function toast(message) {
    const el = document.getElementById("toast");
    el.innerHTML = icon("check") + `<span>${esc(message)}</span>`;
    el.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("visible"), 3500);
  }
  const links = [
    ["index.html", "Início", "home"],
    ["iphones.html", "iPhones", "iphone"],
    ["mackbooks.html", "MacBooks", "macbook"],
    ["sobre.html", "Sobre nós", "about"],
  ];
  function navLinks() {
    return links
      .map(
        ([url, text, tag]) =>
          `<a href="${url}"${page === tag ? ' class="active" aria-current="page"' : ""}>${text}</a>`,
      )
      .join("");
  }
  document.getElementById("site-header").innerHTML = `
    <div class="topbar"><div class="container"><span>Dos EUA para Angola. <strong>O seu próximo nível começa aqui.</strong></span><a class="topbar-contact" href="https://wa.me/244943400675" target="_blank" rel="noopener noreferrer">Fale com a nossa equipa ${icon("diagonal")}</a></div></div>
    <header class="header"><div class="container header-inner">${brand()}<nav class="desktop-nav" aria-label="Menu principal">${navLinks()}</nav>
    <div class="header-actions"><form class="search" role="search" action="catalogo.html"><input type="search" name="q" aria-label="Pesquisar produtos" placeholder="O que procura hoje?" value="${esc(params.get("q") || params.get("search") || "")}" maxlength="100"><button aria-label="Pesquisar" type="submit">${icon("search")}</button></form>
    <div class="header-buttons"><button class="cart-trigger" data-cart-trigger aria-haspopup="dialog">${icon("bag")}<span class="cart-label">Carrinho</span><span class="cart-count" data-cart-count>0</span></button><button class="menu-toggle" id="menu-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="mobile-menu">${icon("menu")}</button></div></div></div>
    <nav class="mobile-menu" id="mobile-menu" aria-label="Menu para telemóvel" hidden>${navLinks()}</nav></header>`;
  document.getElementById("site-footer").innerHTML = `
    <footer class="footer"><div class="container"><div class="footer-grid"><div class="footer-about">${brand()}<p>Tecnologia que aproxima o seu futuro.<br>Produtos Apple dos EUA para Angola,<br>com a confiança da Ekulu Company.</p></div>
    <div><h3>Explore a loja</h3><ul><li><a href="iphones.html">Todos os iPhones</a></li><li><a href="mackbooks.html">Todos os MacBooks</a></li><li><a href="catalogo.html">Catálogo completo</a></li><li><a href="carrinho.html">O meu carrinho</a></li></ul></div>
    <div><h3>Vamos conversar</h3><ul><li><a href="sobre.html">Sobre a EkuluTech</a></li><li><a href="sobre.html#contacto">Entrega e atendimento</a></li><li><a href="https://wa.me/244943400675" target="_blank" rel="noopener noreferrer">Apoio pelo WhatsApp ↗</a></li></ul></div>
    <div class="footer-contact"><h3>Estamos por perto</h3><ul><li><a href="tel:+244943400675">${icon("phone")} +244 943 400 675</a></li><li><a href="mailto:ekulucompany@gmail.com">${icon("mail")} ekulucompany@gmail.com</a></li><li><a href="sobre.html#contacto">${icon("pin")} Luanda, Angola</a></li></ul></div></div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} EkuluTech · Ekulu Company. Todos os direitos reservados.</span><span>${icon("globe")} Feito para conectar Angola ao futuro.</span></div></div></footer>`;
  updateCounts();
  document.getElementById("menu-toggle").addEventListener("click", (e) => {
    const button = e.currentTarget,
      menu = document.getElementById("mobile-menu"),
      open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", open);
    button.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    button.innerHTML = icon(open ? "close" : "menu");
    menu.hidden = !open;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const btn = document.getElementById("menu-toggle");
      if (btn.getAttribute("aria-expanded") === "true") {
        btn.click();
        btn.focus();
      }
    }
  });
  function breadcrumb(label, parent) {
    return `<div class="breadcrumb"><a href="index.html">Início</a>${icon("chevron")}${parent ? `<a href="${parent.url}">${esc(parent.label)}</a>${icon("chevron")}` : ""}<span>${esc(label)}</span></div>`;
  }
  function colorHex(c) {
    return (
      {
        black: "#343738",
        titanium: "#b7b0a2",
        "white-titanium": "#e5e4dc",
        "black-titanium": "#3c3c3a",
        "blue-titanium": "#5d6778",
        tangerine: "#da7437",
        white: "#efefec",
        blue: "#9cbcc9",
        pink: "#efc5d3",
        green: "#b7cba6",
        purple: "#c4bad4",
        midnight: "#363e49",
        starlight: "#eee9da",
        default: "#a7a9a7",
        silver: "#dddeda",
        "deep-blue": "#414b64",
      }[c.value] || "#9daa8c"
    );
  }
  function card(p, index = 0) {
    const c = p.colors[0],
      newest = p.id.startsWith("iphone-17");
    return `<article class="product-card"><a class="product-media" href="${productUrl(p)}" tabindex="-1" aria-hidden="true">${newest ? '<span class="pill featured">Nova geração</span>' : p.category === "macbook" ? '<span class="pill">MacBook</span>' : ""}<img src="${esc(c.image)}" alt="" loading="lazy" width="300" height="300"></a><div class="product-body"><div class="product-meta"><span>${p.category === "iphone" ? "APPLE · IPHONE" : "APPLE · MACBOOK"}</span><span class="color-dots" aria-hidden="true">${p.colors
      .slice(0, 4)
      .map((c) => `<i style="--swatch:${colorHex(c)}"></i>`)
      .join(
        "",
      )}</span></div><h3><a href="${productUrl(p)}">${esc(p.name)}</a></h3><p class="product-description">${esc(p.storage[0].capacity)} · ${esc(p.category === "iphone" ? "Importado dos EUA" : p.description)}</p><div class="product-bottom"><div><span class="price-caption">A partir de</span>${price(p.basePrice)}</div><button class="add-button" data-quick-add="${p.id}" aria-label="Adicionar ${esc(p.name)}, ${esc(c.name)}, ${esc(p.storage[0].capacity)} ao carrinho">${icon("plus")}</button></div></div></article>`;
  }
  function benefit(symbol, title, description) {
    return `<div class="benefit">${icon(symbol)}<div><h3>${title}</h3><p>${description}</p></div></div>`;
  }
  function helpBanner() {
    return `<section class="help-banner"><div><h2>A escolha certa começa com uma conversa.</h2><p>A nossa equipa ajuda a encontrar o produto que combina consigo.</p></div><a class="btn btn-outline" href="https://wa.me/244943400675" target="_blank" rel="noopener noreferrer">${icon("chat")} Fale connosco</a></section>`;
  }
  function home() {
    main.innerHTML = `<div class="container"><section class="hero"><div class="hero-copy"><div class="eyebrow">Tecnologia sem fronteiras</div><h1>O próximo nível.<br>Na sua <span>mão.</span></h1><p>O iPhone que deseja. O MacBook que o inspira.<br>Diretamente dos EUA, mais perto de si.</p><div class="hero-cta"><a class="btn" href="catalogo.html">Explorar produtos ${icon("arrow")}</a><a class="text-link" href="sobre.html">Conheça a EkuluTech ${icon("diagonal")}</a></div><div class="hero-note">${icon("shield")}<span><strong>Escolha com confiança.</strong> Atendimento em cada etapa.</span></div></div><div class="hero-visual"><div class="hero-visual-top"><span>iPhone 17 Pro Max</span><span class="pill">Já no catálogo</span></div><span class="hero-bg-word" aria-hidden="true">PRO.</span><img class="hero-product" src="assets/hero-iphone.webp" alt="iPhone 17 Pro Max na cor azul profundo, visto de frente e de trás" width="900" height="900" fetchpriority="high"><div class="hero-product-caption"><div><h2>Um novo olhar para tudo.</h2><p>Conheça o iPhone 17 Pro Max.</p></div><a class="circle-link" href="selecionar-iphone.html?model=iphone-17-pro-max" aria-label="Conhecer iPhone 17 Pro Max">${icon("diagonal")}</a></div></div></section>
    <div class="benefits">${benefit("globe", "Diretamente dos EUA", "Procedência em primeiro lugar")}${benefit("shield", "Compre com confiança", "Apoio antes e depois da compra")}${benefit("truck", "Entrega em Angola", "Combine os detalhes com a equipa")}${benefit("chat", "Atendimento próximo", "Pessoas prontas para ajudar")}</div>
    <section class="section" aria-labelledby="featured-heading"><div class="section-heading"><div><div class="eyebrow">Escolhidos para si</div><h2 id="featured-heading">O seu próximo favorito.</h2><p>Grandes ideias merecem grandes ferramentas.</p></div><div class="tabs" aria-label="Filtrar destaques"><button class="tab" data-home-filter="featured" aria-pressed="true">Destaques</button><button class="tab" data-home-filter="iphone" aria-pressed="false">iPhones</button><button class="tab" data-home-filter="macbook" aria-pressed="false">MacBooks</button></div></div><div class="products-grid" id="featured-grid"></div><div class="browse-all"><a class="btn btn-outline" href="catalogo.html">Ver todos os produtos ${icon("arrow")}</a></div></section>
    <section class="promo"><div class="promo-copy"><div class="eyebrow">O seu talento, sem limites</div><h2>Menos limites.<br>Mais possibilidades.</h2><p>Do primeiro projeto à sua próxima grande ideia.<br>Encontre o MacBook à sua altura.</p><a class="btn btn-lime" href="mackbooks.html">Explore os MacBooks ${icon("arrow")}</a></div><div class="promo-image"><img src="assets/macbook-promo.webp" alt="MacBook Pro com ecrã aberto" loading="lazy" width="800" height="600"><span>CRIADO PARA IR MAIS LONGE.</span></div></section>${helpBanner()}</div>`;
    function featured(filter) {
      const list =
        filter === "featured"
          ? [
              "iphone-17-pro-max",
              "iphone-16",
              "iphone-15-pro",
              "macbook-air-13-m2",
            ].map((id) => byId.get(id))
          : products.filter((p) => p.category === filter).slice(0, 4);
      document.getElementById("featured-grid").innerHTML = list
        .map(card)
        .join("");
      document
        .querySelectorAll("[data-home-filter]")
        .forEach((b) =>
          b.setAttribute("aria-pressed", b.dataset.homeFilter === filter),
        );
    }
    featured("featured");
    main
      .querySelectorAll("[data-home-filter]")
      .forEach((b) =>
        b.addEventListener("click", () => featured(b.dataset.homeFilter)),
      );
  }
  function catalog() {
    const initial = page === "catalog" ? "all" : page;
    const state = {
      category: initial,
      generation: "all",
      q: (params.get("q") || params.get("search") || "").slice(0, 100),
      sort: "featured",
    };
    const title =
      page === "iphone"
        ? "Um iPhone. O seu estilo."
        : page === "macbook"
          ? "Ideias grandes. MacBooks à altura."
          : "Encontre o seu próximo nível.";
    const subtitle =
      page === "iphone"
        ? "Explore as gerações, escolha a sua cor e encontre o iPhone que combina consigo."
        : page === "macbook"
          ? "Potência para criar, trabalhar e levar as suas ideias mais longe."
          : "iPhones e MacBooks, num só lugar. Escolha o que faz sentido para si.";
    const choices =
      page === "catalog"
        ? [
            ["all", "Todos"],
            ["iphone", "iPhones"],
            ["macbook", "MacBooks"],
          ]
        : page === "iphone"
          ? [
              ["all", "Todos"],
              ["17", "iPhone 17"],
              ["16", "iPhone 16"],
              ["15", "iPhone 15"],
              ["14", "iPhone 14"],
            ]
          : [
              ["all", "Todos"],
              ["m3", "Chip M3"],
              ["m2", "Chip M2"],
              ["m1", "Chip M1"],
              ["intel", "Intel"],
            ];
    main.innerHTML = `<div class="container catalog-content">${breadcrumb(page === "iphone" ? "iPhones" : page === "macbook" ? "MacBooks" : "Catálogo")}<section class="page-intro"><div class="eyebrow">${page === "catalog" ? "O universo EkuluTech" : page === "iphone" ? "Feito para o seu dia a dia" : "Para criar sem limites"}</div><h1>${title}</h1><p>${subtitle}</p></section><div class="catalog-toolbar"><div class="tabs" aria-label="Filtrar produtos">${choices.map(([value, label]) => `<button class="tab" data-filter="${value}" aria-pressed="${value === "all"}">${label}</button>`).join("")}</div><label class="select-wrap">Ordenar por<select id="sort-products"><option value="featured">Destaques</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="name">Nome, A–Z</option></select></label></div><p id="catalog-count" class="catalog-count" role="status" aria-live="polite"></p><div id="catalog-results"></div></div>`;
    function render() {
      const q = state.q.toLocaleLowerCase("pt");
      let list = products.filter(
        (p) =>
          (state.category === "all" || p.category === state.category) &&
          (state.generation === "all" ||
            p.id.includes(
              page === "iphone"
                ? "iphone-" + state.generation
                : state.generation,
            )) &&
          `${p.name} ${p.description} ${p.storage.map((s) => s.capacity).join(" ")}`
            .toLocaleLowerCase("pt")
            .includes(q),
      );
      if (state.sort === "price-asc")
        list.sort((a, b) => a.basePrice - b.basePrice);
      if (state.sort === "price-desc")
        list.sort((a, b) => b.basePrice - a.basePrice);
      if (state.sort === "name")
        list.sort((a, b) => a.name.localeCompare(b.name, "pt"));
      document.getElementById("catalog-count").textContent =
        `${list.length} ${list.length === 1 ? "produto" : "produtos"}${state.q ? " para “" + state.q + "”" : ""}`;
      document.getElementById("catalog-results").innerHTML = list.length
        ? `<div class="products-grid">${list.map(card).join("")}</div>`
        : `<div class="empty-state"><div class="empty-icon">${icon("search")}</div><h2>Não encontrámos esse produto.</h2><p>Tente outro nome ou explore o catálogo completo.</p><button class="btn btn-outline" data-reset-filters>Limpar filtros ${icon("refresh")}</button></div>`;
      const reset = main.querySelector("[data-reset-filters]");
      if (reset)
        reset.addEventListener("click", () => {
          location.href = "catalogo.html";
        });
    }
    main.querySelectorAll("[data-filter]").forEach((b) =>
      b.addEventListener("click", () => {
        if (page === "catalog") state.category = b.dataset.filter;
        else state.generation = b.dataset.filter;
        main
          .querySelectorAll("[data-filter]")
          .forEach((el) => el.setAttribute("aria-pressed", el === b));
        render();
      }),
    );
    document.getElementById("sort-products").addEventListener("change", (e) => {
      state.sort = e.target.value;
      render();
    });
    render();
  }
  function productPage() {
    const p = byId.get(
      params.get("model") ||
        (location.pathname.includes("macbook")
          ? "macbook-air-13-m2"
          : "iphone-17-pro-max"),
    );
    if (!p) {
      notFound(
        "Produto não encontrado",
        "Este modelo não está no catálogo. Explore os produtos disponíveis.",
      );
      return;
    }
    document.title = p.name + " | EkuluTech";
    let c =
        p.colors.find((c) => c.value === params.get("color")) || p.colors[0],
      s =
        p.storage.find((s) => s.capacity === params.get("storage")) ||
        p.storage[0],
      qty = 1;
    main.innerHTML = `<div class="container">${breadcrumb(p.name, { url: p.category === "iphone" ? "iphones.html" : "mackbooks.html", label: p.category === "iphone" ? "iPhones" : "MacBooks" })}<section class="product-detail"><div class="detail-media"><span class="pill">${p.id.startsWith("iphone-17") ? "Nova geração" : "Explore cada detalhe"}</span><img id="detail-image" src="${esc(c.image)}" alt="${esc(p.name + " — " + c.name)}" width="800" height="800"><p class="detail-media-note">Imagens ilustrativas. Confirme a disponibilidade com a equipa.</p></div><div class="detail-copy"><div class="eyebrow">Apple · Importado dos EUA</div><h1>${esc(p.name)}</h1><p class="detail-description">${esc(p.description)}</p><div class="detail-price"><div id="detail-price">${price(p.basePrice + s.price)}</div><p>Preço em kwanzas · Entrega a combinar</p></div><fieldset class="option-group"><legend>Cor <span id="selected-color">${esc(c.name)}</span></legend><div class="color-options">${p.colors.map((color) => `<button class="color-option" style="--swatch:${colorHex(color)}" data-color="${esc(color.value)}" aria-label="${esc(color.name)}" title="${esc(color.name)}" aria-pressed="${c === color}"></button>`).join("")}</div></fieldset><fieldset class="option-group"><legend>${p.category === "iphone" ? "Capacidade" : "Configuração"}</legend><div class="storage-options">${p.storage.map((storage) => `<button class="storage-option" data-storage="${esc(storage.capacity)}" aria-pressed="${s === storage}">${esc(storage.capacity)}</button>`).join("")}</div></fieldset><div class="purchase-row"><div class="quantity-control"><button id="product-minus" aria-label="Diminuir quantidade" disabled>${icon("minus")}</button><output id="product-quantity" aria-live="polite" aria-label="Quantidade">1</output><button id="product-plus" aria-label="Aumentar quantidade">${icon("plus")}</button></div><button class="btn btn-lime" id="add-product">${icon("bag")} Adicionar ao carrinho</button></div><p class="detail-trust">${icon("shield")} Escolha com calma. A nossa equipa acompanha o seu pedido.</p><details class="specs"><summary>Conheça as especificações</summary><dl>${Object.entries(
      p.specs,
    )
      .filter(([k]) =>
        ["Tela", "Chip", "Processador", "Configuração", "Resistência"].includes(
          k,
        ),
      )
      .map(([key, value]) => `<dt>${esc(key)}</dt><dd>${esc(value)}</dd>`)
      .join(
        "",
      )}</dl></details></div></section><section class="related"><div class="section-heading"><div><div class="eyebrow">Continue a explorar</div><h2>Também pode gostar.</h2></div><a class="text-link" href="${p.category === "iphone" ? "iphones.html" : "mackbooks.html"}">Ver todos ${icon("arrow")}</a></div><div class="products-grid">${products
      .filter((other) => other.category === p.category && other.id !== p.id)
      .slice(0, 4)
      .map(card)
      .join("")}</div></section></div>`;
    main.querySelectorAll("[data-color]").forEach((b) =>
      b.addEventListener("click", () => {
        c = p.colors.find((c) => c.value === b.dataset.color);
        const img = document.getElementById("detail-image");
        img.src = c.image;
        img.alt = p.name + " — " + c.name;
        document.getElementById("selected-color").textContent = c.name;
        main
          .querySelectorAll("[data-color]")
          .forEach((el) => el.setAttribute("aria-pressed", el === b));
      }),
    );
    main.querySelectorAll("[data-storage]").forEach((b) =>
      b.addEventListener("click", () => {
        s = p.storage.find((s) => s.capacity === b.dataset.storage);
        document.getElementById("detail-price").innerHTML = price(
          p.basePrice + s.price,
        );
        main
          .querySelectorAll("[data-storage]")
          .forEach((el) => el.setAttribute("aria-pressed", el === b));
      }),
    );
    function quantity(delta) {
      qty = Math.min(99, Math.max(1, qty + delta));
      document.getElementById("product-quantity").textContent = qty;
      document.getElementById("product-minus").disabled = qty === 1;
      document.getElementById("product-plus").disabled = qty === 99;
    }
    document
      .getElementById("product-minus")
      .addEventListener("click", () => quantity(-1));
    document
      .getElementById("product-plus")
      .addEventListener("click", () => quantity(1));
    document.getElementById("add-product").addEventListener("click", () => {
      addItem(p, c, s, qty);
      openCart();
    });
  }
  function addItem(p, c = p.colors[0], s = p.storage[0], qty = 1) {
    const row = { id: p.id, color: c.value, storage: s.capacity, qty },
      existing = cart.find((i) => itemKey(i) === itemKey(row));
    const before = existing?.qty || 0,
      added = Math.min(qty, 99 - before);
    if (!added) {
      toast("Limite de 99 unidades por configuração.");
      return;
    }
    if (existing) existing.qty += added;
    else cart.push({ ...row, qty: added });
    saveCart();
    toast(
      `${p.name} adicionado ao carrinho${added < qty ? " (limite de 99 unidades)" : ""}.`,
    );
  }
  function quantityWidget(item, key) {
    return `<div class="quantity-control"><button data-cart-action="minus" data-key="${esc(key)}" aria-label="Diminuir quantidade de ${esc(byId.get(item.id).name)}"${item.qty === 1 ? " disabled" : ""}>${icon("minus")}</button><output aria-label="Quantidade" aria-live="polite">${item.qty}</output><button data-cart-action="plus" data-key="${esc(key)}" aria-label="Aumentar quantidade de ${esc(byId.get(item.id).name)}"${item.qty === 99 ? " disabled" : ""}>${icon("plus")}</button></div>`;
  }
  function cartLine(item, readonly = false) {
    const { p, c, s, unit } = itemData(item),
      key = itemKey(item);
    return `<article class="cart-line"><a href="${productUrl(p, c.value, s.capacity)}" class="cart-line-image" tabindex="-1" aria-hidden="true"><img src="${esc(c.image)}" alt="" width="100" height="100"></a><div><div class="cart-line-top"><h3><a href="${productUrl(p, c.value, s.capacity)}">${esc(p.name)}</a></h3>${readonly ? "" : `<button class="remove-item" data-cart-action="remove" data-key="${esc(key)}" aria-label="Remover ${esc(p.name)} do carrinho">${icon("trash")}</button>`}</div><p>${esc(c.name)} · ${esc(s.capacity)}</p><div class="cart-line-actions">${readonly ? `<span class="field-hint">${item.qty} × ${money(unit)} Kz</span>` : quantityWidget(item, key)}${price(unit * item.qty)}</div></div></article>`;
  }
  function emptyCart(drawerMode = false) {
    return `<div class="empty-state"><div class="empty-icon">${icon("bag")}</div><h${drawerMode ? "2" : "1"}>O seu carrinho está à espera.</h${drawerMode ? "2" : "1"}><p>Há um próximo favorito por descobrir. Explore a loja e adicione o que combina consigo.</p><a class="btn btn-lime" href="catalogo.html">Explorar produtos ${icon("arrow")}</a></div>`;
  }
  function renderDrawer() {
    const active = document.activeElement,
      action = active?.dataset?.cartAction,
      key = active?.dataset?.key,
      scroll = drawer.querySelector(".drawer-items")?.scrollTop || 0;
    drawer.innerHTML = `<div class="drawer-header"><h2 id="drawer-title">O seu carrinho <span style="color:var(--muted);font-weight:400">(${cartCount()})</span></h2><button class="icon-button" id="close-cart" aria-label="Fechar carrinho">${icon("close")}</button></div><div class="drawer-items">${cart.length ? cart.map((i) => cartLine(i)).join("") : `<div class="drawer-empty">${emptyCart(true)}</div>`}</div>${cart.length ? `<div class="drawer-footer"><div class="total-row"><span>Subtotal</span><strong>${money(cartTotal())} Kz</strong></div><p>Entrega e disponibilidade confirmadas pela nossa equipa.</p><a class="btn btn-lime btn-full" href="pagamento.html">Continuar pedido ${icon("arrow")}</a><a class="text-link" href="carrinho.html">Ver carrinho completo</a></div>` : ""}`;
    document
      .getElementById("close-cart")
      .addEventListener("click", () => drawer.close());
    drawer.querySelector(".drawer-items").scrollTop = scroll;
    if (action && key) {
      const match = [...drawer.querySelectorAll("[data-cart-action]")].find(
        (el) =>
          el.dataset.cartAction === action &&
          el.dataset.key === key &&
          !el.disabled,
      );
      (match || document.getElementById("close-cart")).focus();
    }
  }
  function openCart() {
    renderDrawer();
    drawer.showModal();
  }
  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) {
      const r = drawer.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        drawer.close();
    }
  });
  function summary() {
    return `<h2>Resumo do pedido</h2><div class="total-row"><span>${cartCount()} ${cartCount() === 1 ? "item" : "itens"}</span><span>${money(cartTotal())} Kz</span></div><div class="total-row"><span>Entrega</span><span>A combinar</span></div><div class="total-row summary-total"><span>Subtotal</span><strong>${money(cartTotal())} Kz</strong></div>`;
  }
  function cartPage() {
    main.innerHTML = `<div class="container">${breadcrumb("O seu carrinho")}${cart.length ? `<section class="page-intro"><div class="eyebrow">Boas escolhas, num só lugar</div><h1>O seu carrinho.</h1><p>Reveja os seus favoritos. O próximo passo é confirmar os detalhes com a equipa.</p></section><div class="cart-layout"><div class="cart-panel">${cart.map((i) => cartLine(i)).join("")}<div class="cart-panel-footer"><a class="text-link" href="catalogo.html">Continuar a explorar ${icon("arrow")}</a><button class="subtle-button" data-cart-action="clear">Esvaziar carrinho</button></div></div><aside class="summary-card">${summary()}<a class="btn btn-lime btn-full" href="pagamento.html">Continuar pedido ${icon("arrow")}</a><p class="summary-note">Os preços apresentados correspondem aos produtos. A equipa confirma a disponibilidade e o valor da entrega antes da compra.</p><div class="secure-note">${icon("shield")} Atendimento pessoal em cada etapa</div></aside></div>` : emptyCart()}</div>`;
  }
  function checkout() {
    const previousForm = document.getElementById("checkout-form");
    const previousValues = previousForm
      ? Object.fromEntries(new FormData(previousForm))
      : readOrder()?.customer;
    if (!cart.length) {
      main.innerHTML = `<div class="container">${breadcrumb("Rever pedido")}${emptyCart()}</div>`;
      return;
    }
    main.innerHTML = `<div class="container">${breadcrumb("Rever pedido", { url: "carrinho.html", label: "Carrinho" })}<section class="page-intro"><div class="eyebrow">Falta pouco para o próximo nível</div><h1>Vamos preparar o seu pedido.</h1><p>Preencha os seus dados e reveja os detalhes antes de enviar pelo WhatsApp.</p></section><div class="checkout-layout"><form class="checkout-form" id="checkout-form"><h2>Os seus dados</h2><p>A equipa usa estas informações para combinar a disponibilidade e a entrega.</p><div class="form-grid"><label class="field field-wide">Nome completo *<input name="name" autocomplete="name" required minlength="2" maxlength="100" placeholder="Como podemos chamar-lhe?"></label><label class="field">Telemóvel *<input name="phone" type="tel" inputmode="tel" autocomplete="tel" required pattern="[+0-9() .-]{9,20}" maxlength="20" placeholder="+244 9XX XXX XXX" aria-describedby="phone-hint"><span class="field-hint" id="phone-hint">Inclua o indicativo do país.</span></label><label class="field">Cidade / Província *<input name="city" autocomplete="address-level2" required minlength="2" maxlength="100" placeholder="Ex.: Luanda"></label><label class="field field-wide">Endereço para entrega *<input name="address" autocomplete="street-address" required minlength="5" maxlength="200" placeholder="Bairro, rua e ponto de referência"></label><label class="field field-wide">Alguma observação? <span class="field-hint">Opcional</span><textarea name="notes" maxlength="500" placeholder="Diga-nos se há algo que devemos saber."></textarea></label></div><button class="btn btn-lime btn-full" type="submit">Rever o meu pedido ${icon("arrow")}</button><p class="summary-note">Este passo prepara o pedido para envio. A compra e o pagamento são combinados diretamente com a EkuluTech.</p></form><aside class="summary-card">${summary()}<p class="summary-note">A disponibilidade e o valor da entrega serão confirmados pela equipa.</p><div style="margin-top:18px"><a class="text-link" href="carrinho.html">Editar o carrinho ${icon("arrow")}</a></div></aside></div></div>`;
    if (previousValues)
      for (const field of ["name", "phone", "city", "address", "notes"])
        document
          .getElementById("checkout-form")
          .elements.namedItem(field).value = previousValues[field] || "";
    document.getElementById("checkout-form").addEventListener("submit", (e) => {
      e.preventDefault();
      if (!e.currentTarget.reportValidity()) return;
      const fields = Object.fromEntries(new FormData(e.currentTarget));
      Object.keys(fields).forEach((k) => (fields[k] = fields[k].trim()));
      if (
        fields.name.length < 2 ||
        fields.city.length < 2 ||
        fields.address.length < 5
      ) {
        toast("Preencha os dados sem usar apenas espaços.");
        return;
      }
      const order = {
        customer: fields,
        items: cart.map((i) => ({ ...i })),
        createdAt: new Date().toISOString(),
      };
      try {
        sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
        location.href = "pagamento_feito.html";
      } catch {
        toast(
          "Não foi possível guardar o resumo. Ative o armazenamento do navegador.",
        );
      }
    });
  }
  function readOrder() {
    const value = readStorage(ORDER_KEY, null, true);
    if (
      !value ||
      typeof value !== "object" ||
      !value.customer ||
      typeof value.customer !== "object"
    )
      return null;
    const items = normalizeCart(value.items);
    if (!items.length) return null;
    const customer = {};
    for (const field of ["name", "phone", "city", "address", "notes"])
      customer[field] = String(value.customer[field] || "").slice(
        0,
        field === "notes" ? 500 : 200,
      );
    return { customer, items };
  }
  function orderPage() {
    const order = readOrder();
    if (!order) {
      main.innerHTML = `<div class="container"><div class="empty-state"><div class="empty-icon">${icon("bag")}</div><h1>Ainda não há um pedido para rever.</h1><p>Adicione os seus produtos ao carrinho para preparar o pedido.</p><a class="btn btn-lime" href="carrinho.html">Ir para o carrinho ${icon("arrow")}</a></div></div>`;
      return;
    }
    const { customer, items } = order,
      total = cartTotal(items);
    const message = [
      "Olá, EkuluTech! Gostaria de confirmar este pedido:",
      "",
      ...items.map((i) => {
        const { p, c, s, unit } = itemData(i);
        return `${i.qty} × ${p.name} — ${c.name}, ${s.capacity}: ${money(unit * i.qty)} Kz`;
      }),
      "",
      `Subtotal: ${money(total)} Kz`,
      "Entrega a combinar.",
      "",
      `Nome: ${customer.name}`,
      `Telemóvel: ${customer.phone}`,
      `Cidade: ${customer.city}`,
      `Endereço: ${customer.address}`,
      customer.notes ? `Observações: ${customer.notes}` : "",
      "Por favor, confirmem a disponibilidade e os detalhes para pagamento.",
    ]
      .filter(Boolean)
      .join("\n");
    main.innerHTML = `<div class="container"><section class="order-card"><div class="empty-icon">${icon("check")}</div><span class="order-badge">Pronto para enviar</span><h1>O seu próximo nível está quase aí.</h1><p class="order-intro">Reveja o resumo e envie o pedido para a nossa equipa pelo WhatsApp. A disponibilidade, a entrega e o pagamento serão confirmados na conversa.</p>${items.map((i) => cartLine(i, true)).join("")}<div class="total-row"><span>Subtotal dos produtos</span><strong>${money(total)} Kz</strong></div><div class="order-details"><h2>Dados para contacto e entrega</h2><p><strong>${esc(customer.name)}</strong> · ${esc(customer.phone)}</p><p>${esc(customer.address)} · ${esc(customer.city)}</p>${customer.notes ? `<p>${esc(customer.notes)}</p>` : ""}</div><div class="order-actions"><a class="btn btn-lime" href="https://wa.me/244943400675?text=${encodeURIComponent(message)}" target="_blank" rel="noopener noreferrer">${icon("chat")} Enviar pedido pelo WhatsApp ${icon("diagonal")}</a><a class="btn btn-outline" href="pagamento.html">Editar dados</a></div><p class="summary-note">O pedido só é enviado quando confirmar a mensagem no WhatsApp. O seu carrinho continua guardado.</p></section></div>`;
  }
  function about() {
    main.innerHTML = `<div class="container">${breadcrumb("Sobre nós")}<section class="about-hero"><div><div class="eyebrow">Prazer, somos a EkuluTech</div><h1>Mais perto da tecnologia.<br>Mais perto de si.</h1><p>A EkuluTech nasceu da paixão por tecnologia e da vontade de aproximar Angola dos melhores produtos Apple. Fazemos parte da Ekulu Company e trazemos iPhones e MacBooks diretamente dos Estados Unidos.</p><p>Acreditamos numa escolha bem informada, num atendimento próximo e em relações de confiança. Por isso, acompanhamos cada etapa: da escolha do modelo aos detalhes da entrega.</p></div><div class="about-art"><span class="brand-mark" aria-hidden="true">E</span><h2>De Angola. Para o futuro.</h2><p>EkuluTech · Uma marca Ekulu Company</p></div></section><section class="values-grid" aria-label="Os nossos valores"><article class="value-card">${icon("shield")}<h2>Confiança, sempre.</h2><p>Transparência sobre o produto e os detalhes da compra. Para escolher com tranquilidade.</p></article><article class="value-card">${icon("spark")}<h2>Paixão pelo que vem.</h2><p>Tecnologia que acompanha as suas ideias e abre espaço para novas possibilidades.</p></article><article class="value-card">${icon("chat")}<h2>Pessoas por perto.</h2><p>Uma equipa disponível para ouvir, esclarecer e encontrar a melhor opção para si.</p></article></section><section id="contacto" class="contact-panel"><div><div class="eyebrow" style="margin-bottom:15px">Vamos conversar</div><h2>A sua próxima escolha começa aqui.</h2><p>Estamos em Luanda, Angola. Fale connosco para confirmar produtos,<br>condições de garantia, disponibilidade e entrega na sua região.</p><p style="margin-top:15px"><a href="tel:+244943400675">+244 943 400 675</a> · <a href="mailto:ekulucompany@gmail.com">ekulucompany@gmail.com</a></p></div><a class="btn btn-lime" href="https://wa.me/244943400675" target="_blank" rel="noopener noreferrer">${icon("chat")} Falar com a equipa ${icon("diagonal")}</a></section></div>`;
  }
  function notFound(
    title = "Esta página tomou outro caminho.",
    description = "Vamos encontrar o caminho de volta para o seu próximo favorito.",
  ) {
    main.innerHTML = `<div class="container notfound"><div class="empty-state"><div class="empty-icon">${icon("search")}</div><h1>${esc(title)}</h1><p>${esc(description)}</p><a class="btn btn-lime" href="catalogo.html">Explorar a loja ${icon("arrow")}</a></div></div>`;
  }
  document.addEventListener("click", (e) => {
    const quick = e.target.closest("[data-quick-add]");
    if (quick) {
      const p = byId.get(quick.dataset.quickAdd);
      if (p) addItem(p);
      return;
    }
    if (e.target.closest("[data-cart-trigger]")) {
      openCart();
      return;
    }
    const btn = e.target.closest("[data-cart-action]");
    if (!btn) return;
    const action = btn.dataset.cartAction,
      row = cart.find((i) => itemKey(i) === btn.dataset.key);
    if (action === "clear") {
      cart = [];
      toast("O carrinho foi esvaziado.");
    } else if (row) {
      if (action === "plus") row.qty = Math.min(99, row.qty + 1);
      if (action === "minus") row.qty = Math.max(1, row.qty - 1);
      if (action === "remove") {
        cart = cart.filter((i) => i !== row);
        toast("Produto removido do carrinho.");
      }
    } else return;
    saveCart();
    if (drawer.open) renderDrawer();
    if (page === "cart") {
      const focusKey = btn.dataset.key,
        focusAction = btn.dataset.cartAction;
      cartPage();
      const next = [...main.querySelectorAll("[data-cart-action]")].find(
        (el) =>
          el.dataset.key === focusKey &&
          el.dataset.cartAction === focusAction &&
          !el.disabled,
      );
      if (next) next.focus();
      else main.focus({ preventScroll: true });
    }
    if (page === "checkout") checkout();
  });
  window.addEventListener("storage", (e) => {
    if (e.key === CART_KEY || e.key === null) {
      cart = normalizeCart(readStorage(CART_KEY, []));
      updateCounts();
      if (drawer.open) renderDrawer();
      if (page === "cart") cartPage();
      if (page === "checkout") checkout();
    }
  });
  if (page === "home") home();
  else if (["catalog", "iphone", "macbook"].includes(page)) catalog();
  else if (page === "product") productPage();
  else if (page === "cart") cartPage();
  else if (page === "checkout") checkout();
  else if (page === "order") orderPage();
  else if (page === "about") about();
  else notFound();
})();
