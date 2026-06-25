const SUPABASE_URL = "https://hvskcvrudpuqwpvoyxrk.supabase.co";
const SUPABASE_KEY = "sb_publishable_JQ2wiXMsvXgdvYGbnfS1Gw_sYGNndgK";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let produtos = [];

async function carregarProdutosDoSupabase() {
  const { data, error } = await sb.from("produtos").select("*");
  if (error) {
    console.error("Erro:", error);
    return;
  }

  produtos = data.map((p) => ({
    id: p.id,
    nome: p.nome,
    preco: parseFloat(p.preco),
    categoria: p.categoria.toLowerCase(), // Força minúsculo para garantir a conversa
    imagem: p.foto_url,
    qtd: 0,
  }));
  inicializarCatalogo();
}

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

    // Filtra comparando minúsculos
    const filtrados = produtos.filter((p) => p.categoria === cat);

    filtrados.forEach((produto) => {
      const card = document.createElement("div");
      card.className = "produto-card";
      card.innerHTML = `
                <img src="${produto.imagem}" style="width:100%; height:150px; object-fit:cover;">
                <h3>${produto.nome}</h3>
                <p>R$ ${produto.preco.toFixed(2)}</p>
                <button onclick="aumentar(${produto.id})">Adicionar</button>
            `;
      container.appendChild(card);
    });
  });
}

function aumentar(id) {
  const produto = produtos.find((p) => p.id === id);
  if (produto) {
    produto.qtd++;
    console.log("Quantidade atualizada:", produto.nome, produto.qtd);
    // Aqui você precisaria das funções de atualizar carrinho e salvar no LocalStorage
  }
}

document.addEventListener("DOMContentLoaded", carregarProdutosDoSupabase);
