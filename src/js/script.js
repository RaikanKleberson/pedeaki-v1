// ===== CONEXÃO COM O SUPABASE =====
const SUPABASE_URL = "https://hvskcvrudpuqwpvoyxrk.supabase.co";
const SUPABASE_KEY = "sb_publishable_JQ2wiXMsvXgdvYGbnfS1Gw_sYGNndgK";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let produtos = [];

// ===== LOCALSTORAGE (guarda só as quantidades do carrinho) =====
function salvarDados() {
  const quantidades = {};
  produtos.forEach((p) => {
    if (p.qtd > 0) quantidades[p.id] = p.qtd;
  });
  localStorage.setItem("carrinho_pedeaki", JSON.stringify(quantidades));
}

// ===== CARREGA PRODUTOS DO SUPABASE =====
async function carregarProdutosDoSupabase() {
  const { data, error } = await sb.from("produtos").select("*");

  if (error) {
    console.error("Erro ao carregar produtos:", error);
    return;
  }

  const catalogoAtual = data.map((p) => {
    let nome = p.nome;
    if (typeof nome === "object" && nome !== null) {
      nome = nome.pt || nome.br || nome.name || JSON.stringify(nome);
    }

    let preco = p.preco;
    if (typeof preco === "object" && preco !== null) {
      preco = preco.valor ?? preco.price ?? JSON.stringify(preco);
    }
    preco = parseFloat(preco) || 0;

    const categoria = (
      typeof p.categoria === "string" ? p.categoria : p.categoria?.toString?.() ?? ""
    ).toLowerCase();

    return {
      id: p.id,
      nome,
      preco,
      categoria,
      imagem: p.foto_url || "src/images/produto-padrao.png",
      qtd: 0,
    };
  });

  const carrinhoSalvo = localStorage.getItem("carrinho_pedeaki");
  const quantidadesSalvas = carrinhoSalvo ? JSON.parse(carrinhoSalvo) : {};

  produtos = catalogoAtual.map((p) => ({
    ...p,
    qtd: quantidadesSalvas[p.id] || 0,
  }));

  inicializarCatalogo();
  atualizarCarrinho();
  mostrarCategoria("acougue"); // mostra a primeira categoria por padrão
} // <- fecha carregarProdutosDoSupabase aqui, antes de qualquer outra função

// ===== INICIA O CATÁLOGO =====
function inicializarCatalogo() {
  const categorias = ["acougue", "hortifruti", "mercearia", "bebidas", "limpeza"];

  categorias.forEach((cat) => {
    const container = document.getElementById(`${cat}-produtos`);
    if (!container) return;

    container.innerHTML = "";
    const filtrados = produtos.filter((p) => p.categoria === cat);

    filtrados.forEach((produto) => {
      const card = document.createElement("div");
      card.className = "produto-card";

      card.innerHTML = `
        <img
          src="${produto.imagem}"
          class="produto-imagem"
          alt="${produto.nome}"
          onerror="this.src='src/images/produto-padrao.png'"
        />
        <h3 class="produto-nome">${produto.nome}</h3>
        <p class="produto-preco">R$ ${produto.preco.toFixed(2)}</p>
        <div class="controles">
          <button class="btn-quantidade" onclick="diminuir(${produto.id})">−</button>
          <span class="quantidade" id="qtd-${produto.id}">${produto.qtd}</span>
          <button class="btn-quantidade" onclick="aumentar(${produto.id})">+</button>
        </div>
      `;

      container.appendChild(card);
    });
  });
}

// ===== FILTRO DE CATEGORIA (estilo abas) =====
function mostrarCategoria(categoria) {
  document.querySelectorAll(".categoria").forEach((sec) => {
    sec.classList.remove("ativa");
  });
  const secaoAlvo = document.getElementById(categoria);
  if (secaoAlvo) secaoAlvo.classList.add("ativa");

  document.querySelectorAll(".menu-categorias a").forEach((link) => {
    link.classList.remove("ativo");
  });
  const linkAlvo = document.querySelector(`.menu-categorias a[href="#${categoria}"]`);
  if (linkAlvo) linkAlvo.classList.add("ativo");

  const menu = document.querySelector(".menu-categorias");
  if (menu) {
    window.scrollTo({ top: menu.offsetTop, behavior: "smooth" });
  }
}

// liga o clique de cada link do menu à troca de categoria
function iniciarMenuCategorias() {
  document.querySelectorAll(".menu-categorias a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const categoria = link.getAttribute("href").substring(1);
      mostrarCategoria(categoria);
    });
  });
}

// ===== ABRE O CARRINHO (botão flutuante) =====
function abrirCarrinho() {
  document.querySelector(".carrinho").scrollIntoView({ behavior: "smooth" });
}

// ===== AUMENTA QUANTIDADE =====
function aumentar(id) {
  const produto = produtos.find((p) => p.id === id);
  if (produto) {
    produto.qtd++;
    document.getElementById(`qtd-${id}`).innerText = produto.qtd;
    salvarDados();
    atualizarCarrinho();
  }
}

// ===== DIMINUI QUANTIDADE =====
function diminuir(id) {
  const produto = produtos.find((p) => p.id === id);
  if (produto && produto.qtd > 0) {
    produto.qtd--;
    document.getElementById(`qtd-${id}`).innerText = produto.qtd;
    salvarDados();
    atualizarCarrinho();
  }
}

// ===== ATUALIZA CARRINHO (única versão, com contador flutuante) =====
function atualizarCarrinho() {
  const lista = document.getElementById("lista-produtos");
  const totalDisplay = document.getElementById("total-pedido");
  const contador = document.getElementById("carrinho-contador");

  if (!lista || !totalDisplay) return;

  lista.innerHTML = "";
  let total = 0;
  let itensDistintos = 0;

  produtos.forEach((p) => {
    if (p.qtd > 0) {
      total += p.preco * p.qtd;
      itensDistintos++;

      lista.innerHTML += `
        <div class="carrinho-item">
          <span>${p.qtd}x ${p.nome}</span>
          <span>R$ ${(p.preco * p.qtd).toFixed(2)}</span>
        </div>
      `;
    }
  });

  if (itensDistintos === 0) {
    lista.innerHTML = '<p class="carrinho-vazio">🛒 Seu carrinho está vazio</p>';
  }

  totalDisplay.innerText = `R$ ${total.toFixed(2)}`;

  if (contador) {
    contador.innerText = itensDistintos;
  }
}

// ===== FINALIZA PEDIDO =====
function finalizarPedido() {
  const nome = document.getElementById("nome-cliente").value.trim();
  const endereco = document.getElementById("endereco-cliente").value.trim();
  const observacao = document.getElementById("observacao-cliente").value.trim();

  if (!nome || !endereco) {
    alert("⚠️ Por favor, preencha seu NOME e ENDEREÇO!");
    return;
  }

  let mensagem = `Olá! Meu nome é ${nome}.%0A`;
  mensagem += `Endereço para entrega: ${endereco}%0A`;
  if (observacao) {
    mensagem += `Observação: ${observacao}%0A`;
  }
  mensagem += "%0A📋 *Meu pedido:*%0A%0A";

  let totalPedido = 0;

  produtos.forEach((p) => {
    if (p.qtd > 0) {
      mensagem += `• ${p.qtd}x ${p.nome} - R$ ${(p.preco * p.qtd).toFixed(2)}%0A`;
      totalPedido += p.preco * p.qtd;
    }
  });

  if (totalPedido === 0) {
    alert("⚠️ Seu carrinho está vazio!");
    return;
  }

  mensagem += `%0A*💰 Total: R$ ${totalPedido.toFixed(2)}*`;

  const numeroWhatsApp = "5563999665779";
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;

  window.open(urlWhatsApp, "_blank");
}

// ===== CARROSSEL DE BANNERS =====
let slideAtual = 0;
const slides = document.querySelectorAll(".slide");
let intervaloCarrossel;

function mostrarSlide(index) {
  slides.forEach((slide) => slide.classList.remove("active"));
  if (slides[index]) slides[index].classList.add("active");
}

function trocarSlide() {
  slideAtual++;
  if (slideAtual >= slides.length) slideAtual = 0;
  mostrarSlide(slideAtual);
}

function iniciarCarrossel() {
  if (slides.length === 0) return;

  let imagensCarregadas = 0;
  const totalSlides = slides.length;

  function iniciarLoop() {
    mostrarSlide(0);
    intervaloCarrossel = setInterval(trocarSlide, 3000);
  }

  slides.forEach((img) => {
    if (img.complete) {
      imagensCarregadas++;
    } else {
      img.addEventListener("load", () => {
        imagensCarregadas++;
        if (imagensCarregadas === totalSlides) iniciarLoop();
      });
      img.addEventListener("error", () => {
        imagensCarregadas++;
        if (imagensCarregadas === totalSlides) iniciarLoop();
      });
    }
  });

  if (imagensCarregadas === totalSlides) iniciarLoop();
}

// ===== INICIA O SISTEMA =====
document.addEventListener("DOMContentLoaded", () => {
  carregarProdutosDoSupabase();
  iniciarCarrossel();
  iniciarMenuCategorias();

  // pausa o carrossel quando a aba não está visível
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(intervaloCarrossel);
    } else if (slides.length > 0) {
      intervaloCarrossel = setInterval(trocarSlide, 3000);
    }
  });
});