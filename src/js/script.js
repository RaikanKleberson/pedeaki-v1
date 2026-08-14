// ===== CONEXÃO COM O SUPABASE =====
const SUPABASE_URL = "https://hvskcvrudpuqwpvoyxrk.supabase.co";
const SUPABASE_KEY = "sb_publishable_JQ2wiXMsvXgdvYGbnfS1Gw_sYGNndgK";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let produtos = [];

// ===== LOCALSTORAGE (guarda só as quantidades do carrinho, não o catálogo) =====
function salvarDados() {
  const quantidades = {};
  produtos.forEach((p) => {
    if (p.qtd > 0) quantidades[p.id] = p.qtd;
  });
  localStorage.setItem("carrinho_pedeaki", JSON.stringify(quantidades));
}

// ===== CARREGA PRODUTOS (sempre busca o catálogo fresco do Supabase) =====
async function carregarProdutosDoSupabase() {
  const { data, error } = await sb.from("produtos").select("*");

  if (error) {
    console.error("Erro:", error);
    return;
  }

  // monta o catálogo sempre a partir do banco
  const catalogoAtual = data.map((p) => ({
    id: p.id,
    nome: p.nome,
    preco: parseFloat(p.preco),
    categoria: p.categoria.toLowerCase(),
    imagem: p.foto_url,
    qtd: 0,
  }));

  // recupera só as quantidades salvas de um carrinho anterior
  const carrinhoSalvo = localStorage.getItem("carrinho_pedeaki");
  const quantidadesSalvas = carrinhoSalvo ? JSON.parse(carrinhoSalvo) : {};

  produtos = catalogoAtual.map((p) => ({
    ...p,
    qtd: quantidadesSalvas[p.id] || 0,
  }));

  inicializarCatalogo();
  atualizarCarrinho();
}

// ===== INICIA O CATÁLOGO =====
function inicializarCatalogo() {
  const categorias = [
    "acougue",
    "hortifruti",
    "mercearia",
    "bebidas",
    "limpeza",
  ];

  categorias.forEach((cat) => {
    const container = document.getElementById(`${cat}-produtos`);

    if (!container) return;

    container.innerHTML = "";

    // filtra produtos da categoria
    const filtrados = produtos.filter((p) => p.categoria === cat);

    filtrados.forEach((produto) => {
      const card = document.createElement("div");

      card.className = "produto-card";

      // cria o card do produto
      card.innerHTML = `
        <img
          src="${produto.imagem}"
          class="produto-imagem"
          alt="${produto.nome}"
        >

        <h3 class="produto-nome">
          ${produto.nome}
        </h3>

        <p class="produto-preco">
          R$ ${produto.preco.toFixed(2)}
        </p>

        <div class="controles">
          <button
            class="btn-quantidade"
            onclick="diminuir(${produto.id})"
          >
            -
          </button>

          <span
            class="quantidade"
            id="qtd-${produto.id}"
          >
            ${produto.qtd}
          </span>

          <button
            class="btn-quantidade"
            onclick="aumentar(${produto.id})"
          >
            +
          </button>
        </div>
      `;

      container.appendChild(card);
    });
  });
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

// ===== ATUALIZA CARRINHO =====
function atualizarCarrinho() {
  const lista = document.getElementById("lista-produtos");
  const totalDisplay = document.getElementById("total-pedido");

  if (!lista || !totalDisplay) return;

  lista.innerHTML = "";

  let total = 0;

  produtos.forEach((p) => {
    if (p.qtd > 0) {
      total += p.preco * p.qtd;

      lista.innerHTML += `
        <div class="carrinho-item">
          <span>
            ${p.qtd}x ${p.nome}
          </span>

          <span>
            R$ ${(p.preco * p.qtd).toFixed(2)}
          </span>
        </div>
      `;
    }
  });

  totalDisplay.innerText = `R$ ${total.toFixed(2)}`;
}

// ===== INICIA O SISTEMA =====
document.addEventListener("DOMContentLoaded", carregarProdutosDoSupabase);

// ===== FINALIZA PEDIDO =====
function finalizarPedido() {
  let mensagem = "Olá! Gostaria de fazer o seguinte pedido:%0A%0A";

  let totalPedido = 0;

  // monta a lista do pedido
  produtos.forEach((p) => {
    if (p.qtd > 0) {
      mensagem += `* ${p.qtd}x ${p.nome} - R$ ${(p.preco * p.qtd).toFixed(2)}%0A`;

      totalPedido += p.preco * p.qtd;
    }
  });

  // verifica carrinho vazio
  if (totalPedido === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  mensagem += `%0A*Total: R$ ${totalPedido.toFixed(2)}*`;

  // número do WhatsApp
  const numeroWhatsApp = "5563999665779";

  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;

  // abre o WhatsApp
  window.open(urlWhatsApp, "_blank");
}

// ===== CARROSSEL DE BANNERS =====
const slides = document.querySelectorAll(".slide");

let slideAtual = 0;

// troca o banner
function trocarSlide() {
  slides[slideAtual].classList.remove("active");

  slideAtual++;

  // volta para o primeiro
  if (slideAtual >= slides.length) {
    slideAtual = 0;
  }

  slides[slideAtual].classList.add("active");
}

// troca a cada 2 segundos
setInterval(trocarSlide, 2000);