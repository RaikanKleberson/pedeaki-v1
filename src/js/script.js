//CONEXÃO COM O BANCO DE DADOS SUPABASE
const SUPABASE_URL = "https://hvskcvrudpuqwpvoyxrk.supabase.co";
const SUPABASE_KEY = "sb_publishable_JQ2wiXMsvXgdvYGbnfS1Gw_sYGNndgK";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let produtos = [];

// FUNÇÃO QUE SALVA NO NAVEGADOR | SALVA NO LOCALSTORAGE E NÃO PERDE
function salvarDados() {
  localStorage.setItem("carrinho_pedeaki", JSON.stringify(produtos));
}

//CARREGA OS PRODUTOS DO SUPABASE E INICIALIZA O CATALOGO DO SISTEMA
async function carregarProdutosDoSupabase() {
  const { data, error } = await sb.from("produtos").select("*");
  if (error) {
    console.error("Erro:", error);
    return;
  }

  // VERIFICA SE TEM ALGO SALVO NO NAVEGADOR | VERIFICA NO LOCALSTORAGE
  const dadosSalvos = localStorage.getItem("carrinho_pedeaki");

  if (dadosSalvos) {
    produtos = JSON.parse(dadosSalvos);
  } else {
    produtos = data.map((p) => ({
      id: p.id,
      nome: p.nome,
      preco: parseFloat(p.preco),
      categoria: p.categoria.toLowerCase(),
      imagem: p.foto_url,
      qtd: 0,
    }));
  }

  inicializarCatalogo();
  atualizarCarrinho();
}

//INICIA CATEGORIA DO CATÁLOGO
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

    const filtrados = produtos.filter((p) => p.categoria === cat);
    filtrados.forEach((produto) => {
      const card = document.createElement("div");
      card.className = "produto-card";
      card.innerHTML = `
                <img src="${produto.imagem}" style="width:100%; height:150px; object-fit:cover;">
                <h3>${produto.nome}</h3>
                <p>R$ ${produto.preco.toFixed(2)}</p>
                <div class="controles">
                    <button class="btn-quantidade" onclick="diminuir(${produto.id})">-</button>
                    <span class="quantidade" id="qtd-${produto.id}">${produto.qtd}</span>
                    <button class="btn-quantidade" onclick="aumentar(${produto.id})">+</button>
                </div>
            `;
      container.appendChild(card);
    });
  });
}

function aumentar(id) {
  const produto = produtos.find((p) => p.id === id);
  if (produto) {
    produto.qtd++;
    document.getElementById(`qtd-${id}`).innerText = produto.qtd;
    salvarDados();
    atualizarCarrinho();
  }
}

function diminuir(id) {
  const produto = produtos.find((p) => p.id === id);
  if (produto && produto.qtd > 0) {
    produto.qtd--;
    document.getElementById(`qtd-${id}`).innerText = produto.qtd;
    salvarDados();
    atualizarCarrinho();
  }
}

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
                    <span>${p.qtd}x ${p.nome}</span>
                    <span>R$ ${(p.preco * p.qtd).toFixed(2)}</span>
                </div>
            `;
    }
  });
  totalDisplay.innerText = `R$ ${total.toFixed(2)}`;
}

document.addEventListener("DOMContentLoaded", carregarProdutosDoSupabase);

function finalizarPedido() {
  let mensagem = "Olá! Gostaria de fazer o seguinte pedido:%0A%0A";
  let totalPedido = 0;

  // Percorre os produtos para montar a lista de texto
  produtos.forEach((p) => {
    if (p.qtd > 0) {
      mensagem += `* ${p.qtd}x ${p.nome} - R$ ${(p.preco * p.qtd).toFixed(2)}%0A`;
      totalPedido += p.preco * p.qtd;
    }
  });

  // Se o carrinho estiver vazio, avisa o usuário
  if (totalPedido === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  mensagem += `%0A*Total: R$ ${totalPedido.toFixed(2)}*`;

  // Substitua pelo número de telefone do mercadinho (com DDD e 9)
  const numeroWhatsApp = "5563999665779";
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;

  // Abre o WhatsApp
  window.open(urlWhatsApp, "_blank");
}
