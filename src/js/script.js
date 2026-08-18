// ===== CONFIGURAÇÃO DO SUPABASE =====
const SUPABASE_URL = "https://hvskcvrudpuqwpvoyxrk.supabase.co";
const SUPABASE_KEY = "sb_publishable_JQ2wiXMsvXgdvYGbnfS1Gw_sYGNndgK";

const clienteSupabase = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const CHAVE_CARRINHO = "carrinho_pedeaki";

const CATEGORIAS = [
  "acougue",
  "hortifruti",
  "mercearia",
  "bebidas",
  "limpeza"
];

let produtos = [];

let slideAtual = 0;
let intervaloCarrossel = null;


// ===== NORMALIZA TEXTO =====
// Remove acentos e deixa tudo em minúsculo.
function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}


// ===== FORMATA PREÇO =====
function formatarPreco(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}


// ===== PEGA O NOME DO PRODUTO =====
function obterNome(produto) {
  const valor = produto.nome;

  if (typeof valor === "object" && valor !== null) {
    return (
      valor.pt ||
      valor.br ||
      valor.name ||
      valor.nome ||
      "Produto sem nome"
    );
  }

  return String(valor ?? "Produto sem nome");
}


// ===== PEGA O PREÇO DO PRODUTO =====
function obterPreco(produto) {
  const valor = produto.preco;

  if (typeof valor === "object" && valor !== null) {
    return Number(
      valor.valor ??
      valor.price ??
      valor.preco ??
      0
    );
  }

  return Number(valor ?? 0);
}


// ===== PEGA A IMAGEM DO PRODUTO =====
function obterImagem(produto) {
  return (
    produto.foto_url ||
    produto.imagem ||
    produto.image_url ||
    produto.foto ||
    "src/images/produto-padrao.png"
  );
}


// ===== SALVA CARRINHO =====
function salvarDados() {
  const quantidades = {};

  produtos.forEach((produto) => {
    if (produto.qtd > 0) {
      quantidades[String(produto.id)] = produto.qtd;
    }
  });

  localStorage.setItem(
    CHAVE_CARRINHO,
    JSON.stringify(quantidades)
  );
}


// ===== CARREGA CARRINHO SALVO =====
function carregarDadosSalvos() {
  try {
    return JSON.parse(
      localStorage.getItem(CHAVE_CARRINHO)
    ) || {};
  } catch {
    return {};
  }
}


// ===== MOSTRA ERRO NO CATÁLOGO =====
function mostrarErroCatalogo(mensagem) {
  CATEGORIAS.forEach((categoria) => {
    const container = document.getElementById(
      `${categoria}-produtos`
    );

    if (!container) return;

    container.innerHTML = `
      <p style="
        grid-column: 1 / -1;
        text-align: center;
        padding: 30px 15px;
        color: #c0392b;
        font-weight: 600;
      ">
        ⚠️ ${mensagem}
      </p>
    `;
  });
}


// ===== CARREGA PRODUTOS DO SUPABASE =====
async function carregarProdutosDoSupabase() {

  console.log(
    "PedeAki: iniciando conexão com Supabase..."
  );

  const { data, error } = await clienteSupabase
    .from("produtos")
    .select("*");


  // Se o Supabase retornar erro
  if (error) {

    console.error(
      "PedeAki - erro do Supabase:",
      error
    );

    mostrarErroCatalogo(
      "Não foi possível carregar os produtos. Abra o console do navegador (F12) para ver o erro."
    );

    return;
  }


  // Confere se realmente recebemos uma lista
  if (!Array.isArray(data)) {

    console.error(
      "PedeAki - resposta inesperada:",
      data
    );

    mostrarErroCatalogo(
      "O Supabase não retornou uma lista de produtos."
    );

    return;
  }


  // Mostra no console quantos produtos chegaram
  console.log(
    `PedeAki: ${data.length} produto(s) recebido(s) do Supabase.`
  );

  // Mostra os produtos completos no console
  console.table(data);


  // Recupera quantidades antigas
  const quantidadesSalvas =
    carregarDadosSalvos();


  // Organiza os produtos recebidos
  produtos = data
    .map((produto) => {

      return {

        id: String(produto.id),

        nome: obterNome(produto),

        preco: obterPreco(produto),

        categoria: normalizarTexto(
          produto.categoria
        ),

        imagem: obterImagem(produto),

        qtd: Number(
          quantidadesSalvas[
            String(produto.id)
          ] || 0
        )

      };

    })
    .filter((produto) => produto.nome);


  console.log(
    "PedeAki: produtos tratados:",
    produtos
  );


  // Monta os cards
  inicializarCatalogo();


  // Atualiza carrinho
  atualizarCarrinho();


  // Mostra primeira categoria
  mostrarCategoria("acougue");
}


// ===== INICIALIZA CATÁLOGO =====
function inicializarCatalogo() {

  CATEGORIAS.forEach((categoria) => {

    const container = document.getElementById(
      `${categoria}-produtos`
    );

    if (!container) return;


    // Limpa o container
    container.innerHTML = "";


    // Filtra produtos da categoria
    const filtrados = produtos.filter(
      (produto) =>
        produto.categoria === categoria
    );


    // Nenhum produto encontrado
    if (filtrados.length === 0) {

      container.innerHTML = `
        <p style="
          grid-column: 1 / -1;
          text-align: center;
          padding: 20px;
          color: #999;
        ">
          Nenhum produto disponível nesta categoria.
        </p>
      `;

      return;
    }


    // Cria cada produto
    filtrados.forEach((produto) => {

      const card =
        document.createElement("div");

      card.className = "produto-card";

      card.dataset.id = produto.id;


      // IMAGEM
      const imagem =
        document.createElement("img");

      imagem.className =
        "produto-imagem";

      imagem.src = produto.imagem;

      imagem.alt = produto.nome;


      // Caso a imagem não exista
      imagem.onerror = () => {

        imagem.src =
          "src/images/produto-padrao.png";

      };


      // NOME
      const nome =
        document.createElement("h3");

      nome.className =
        "produto-nome";

      nome.textContent =
        produto.nome;


      // PREÇO
      const preco =
        document.createElement("p");

      preco.className =
        "produto-preco";

      preco.textContent =
        formatarPreco(produto.preco);


      // CONTROLES
      const controles =
        document.createElement("div");

      controles.className =
        "controles";


      // BOTÃO DIMINUIR
      const btnDiminuir =
        document.createElement("button");

      btnDiminuir.type = "button";

      btnDiminuir.className =
        "btn-quantidade";

      btnDiminuir.dataset.acao =
        "diminuir";

      btnDiminuir.dataset.id =
        produto.id;

      btnDiminuir.textContent = "−";


      // QUANTIDADE
      const quantidade =
        document.createElement("span");

      quantidade.className =
        "quantidade";

      quantidade.id =
        `qtd-${produto.id}`;

      quantidade.textContent =
        produto.qtd;


      // BOTÃO AUMENTAR
      const btnAumentar =
        document.createElement("button");

      btnAumentar.type = "button";

      btnAumentar.className =
        "btn-quantidade";

      btnAumentar.dataset.acao =
        "aumentar";

      btnAumentar.dataset.id =
        produto.id;

      btnAumentar.textContent = "+";


      // Junta controles
      controles.append(
        btnDiminuir,
        quantidade,
        btnAumentar
      );


      // Junta card
      card.append(
        imagem,
        nome,
        preco,
        controles
      );


      // Adiciona na tela
      container.appendChild(card);

    });

  });

}


// ===== MOSTRA CATEGORIA =====
function mostrarCategoria(categoria) {

  // Esconde todas
  document
    .querySelectorAll(".categoria")
    .forEach((secao) => {

      secao.classList.remove("ativa");

    });


  // Mostra categoria escolhida
  const secaoAlvo =
    document.getElementById(categoria);


  if (secaoAlvo) {

    secaoAlvo.classList.add("ativa");

  }


  // Remove ativo dos links
  document
    .querySelectorAll(".menu-categorias a")
    .forEach((link) => {

      link.classList.remove("ativo");

    });


  // Ativa link selecionado
  const linkAlvo =
    document.querySelector(
      `.menu-categorias a[href="#${categoria}"]`
    );


  if (linkAlvo) {

    linkAlvo.classList.add("ativo");

  }


  // Volta para o menu
  const menu =
    document.querySelector(
      ".menu-categorias"
    );


  if (menu) {

    window.scrollTo({
      top: menu.offsetTop,
      behavior: "smooth"
    });

  }

}


// ===== MENU DE CATEGORIAS =====
function iniciarMenuCategorias() {

  document
    .querySelectorAll(".menu-categorias a")
    .forEach((link) => {

      link.addEventListener(
        "click",
        (evento) => {

          evento.preventDefault();

          const categoria =
            link.dataset.categoria;

          if (categoria) {

            mostrarCategoria(
              categoria
            );

          }

        }
      );

    });

}


// ===== ABRE CARRINHO =====
function abrirCarrinho() {

  const carrinho =
    document.querySelector(".carrinho");


  if (!carrinho) return;


  carrinho.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


// ===== AUMENTAR =====
function aumentar(id) {

  const produto =
    produtos.find(
      (item) =>
        String(item.id) ===
        String(id)
    );


  if (!produto) return;


  produto.qtd += 1;


  atualizarQuantidadeNaTela(
    produto
  );


  salvarDados();

  atualizarCarrinho();

}


// ===== DIMINUIR =====
function diminuir(id) {

  const produto =
    produtos.find(
      (item) =>
        String(item.id) ===
        String(id)
    );


  if (!produto) return;


  if (produto.qtd <= 0) return;


  produto.qtd -= 1;


  atualizarQuantidadeNaTela(
    produto
  );


  salvarDados();

  atualizarCarrinho();

}


// ===== ATUALIZA QUANTIDADE NO CARD =====
function atualizarQuantidadeNaTela(
  produto
) {

  const elemento =
    document.getElementById(
      `qtd-${produto.id}`
    );


  if (elemento) {

    elemento.textContent =
      produto.qtd;

  }

}


// ===== REMOVE ITEM =====
function removerItem(id) {

  const produto =
    produtos.find(
      (item) =>
        String(item.id) ===
        String(id)
    );


  if (!produto) return;


  produto.qtd = 0;


  atualizarQuantidadeNaTela(
    produto
  );


  salvarDados();

  atualizarCarrinho();

}


// ===== ATUALIZA CARRINHO =====
function atualizarCarrinho() {

  const lista =
    document.getElementById(
      "lista-produtos"
    );


  const totalDisplay =
    document.getElementById(
      "total-pedido"
    );


  const contador =
    document.getElementById(
      "carrinho-contador"
    );


  if (!lista || !totalDisplay) {
    return;
  }


  lista.innerHTML = "";


  let total = 0;

  let quantidadeTotal = 0;


  produtos.forEach((produto) => {

    if (produto.qtd <= 0) {
      return;
    }


    const subtotal =
      produto.preco *
      produto.qtd;


    total += subtotal;

    quantidadeTotal +=
      produto.qtd;


    const item =
      document.createElement("div");

    item.className =
      "carrinho-item";


    const nome =
      document.createElement("span");

    nome.textContent =
      `${produto.qtd}x ${produto.nome}`;


    const direita =
      document.createElement("span");

    direita.className =
      "carrinho-item-direita";


    const valor =
      document.createElement("span");

    valor.textContent =
      formatarPreco(subtotal);


    const remover =
      document.createElement("button");

    remover.type = "button";

    remover.className =
      "btn-remover";

    remover.title =
      "Remover item";

    remover.dataset.acao =
      "remover";

    remover.dataset.id =
      produto.id;

    remover.textContent =
      "✕";


    direita.append(
      valor,
      remover
    );


    item.append(
      nome,
      direita
    );


    lista.appendChild(item);

  });


  // Carrinho vazio
  if (quantidadeTotal === 0) {

    lista.innerHTML = `
      <p class="carrinho-vazio">
        🛒 Seu carrinho está vazio
      </p>
    `;

  }


  // Total
  totalDisplay.textContent =
    formatarPreco(total);


  // Contador
  if (contador) {

    contador.textContent =
      quantidadeTotal;

  }

}


// ===== FINALIZA PEDIDO =====
function finalizarPedido() {

  const nome =
    document
      .getElementById(
        "nome-cliente"
      )
      ?.value.trim() || "";


  const endereco =
    document
      .getElementById(
        "endereco-cliente"
      )
      ?.value.trim() || "";


  const observacao =
    document
      .getElementById(
        "observacao-cliente"
      )
      ?.value.trim() || "";


  // Validação
  if (!nome || !endereco) {

    alert(
      "⚠️ Por favor, preencha seu NOME e ENDEREÇO!"
    );

    return;

  }


  // Pega produtos selecionados
  const itens =
    produtos.filter(
      (produto) =>
        produto.qtd > 0
    );


  // Carrinho vazio
  if (itens.length === 0) {

    alert(
      "⚠️ Seu carrinho está vazio!"
    );

    return;

  }


  let totalPedido = 0;


  let mensagem =
    `Olá! Meu nome é ${nome}.\n`;


  mensagem +=
    `Endereço para entrega: ${endereco}\n`;


  if (observacao) {

    mensagem +=
      `Observação: ${observacao}\n`;

  }


  mensagem +=
    `\n📋 *Meu pedido:*\n\n`;


  // Lista produtos
  itens.forEach((produto) => {

    const subtotal =
      produto.preco *
      produto.qtd;


    mensagem +=
      `• ${produto.qtd}x ${produto.nome} - ${formatarPreco(subtotal)}\n`;


    totalPedido +=
      subtotal;

  });


  mensagem +=
    `\n*💰 Total: ${formatarPreco(totalPedido)}*`;


  // WhatsApp
  const numeroWhatsApp =
    "5563999665779";


  const urlWhatsApp =
    `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
      mensagem
    )}`;


  window.open(
    urlWhatsApp,
    "_blank"
  );

}


// ===== CARROSSEL =====
function iniciarCarrossel() {

  const slides =
    document.querySelectorAll(
      ".slide"
    );


  if (!slides.length) {
    return;
  }


  mostrarSlide(
    slides,
    0
  );


  intervaloCarrossel =
    setInterval(() => {

      slideAtual =
        (slideAtual + 1) %
        slides.length;


      mostrarSlide(
        slides,
        slideAtual
      );

    }, 3000);

}


// ===== MOSTRA SLIDE =====
function mostrarSlide(
  slides,
  indice
) {

  slides.forEach((slide) => {

    slide.classList.remove(
      "active"
    );

  });


  if (slides[indice]) {

    slides[indice].classList.add(
      "active"
    );

  }

}


// ===== EVENTOS DOS PRODUTOS =====
function iniciarEventosProdutos() {

  document.addEventListener(
    "click",
    (evento) => {

      const botao =
        evento.target.closest(
          "[data-acao]"
        );


      if (!botao) {
        return;
      }


      const acao =
        botao.dataset.acao;


      const id =
        botao.dataset.id;


      if (acao === "aumentar") {

        aumentar(id);

      }


      if (acao === "diminuir") {

        diminuir(id);

      }


      if (acao === "remover") {

        removerItem(id);

      }

    }
  );

}


// ===== INICIA SISTEMA =====
document.addEventListener(
  "DOMContentLoaded",
  async () => {

    iniciarMenuCategorias();

    iniciarEventosProdutos();

    iniciarCarrossel();


    // Botão carrinho
    document
      .getElementById(
        "btn-carrinho-flutuante"
      )
      ?.addEventListener(
        "click",
        abrirCarrinho
      );
// ===== CONFIGURAÇÃO DO SUPABASE =====
const SUPABASE_URL = "https://hvskcvrudpuqwpvoyxrk.supabase.co";
const SUPABASE_KEY = "sb_publishable_JQ2wiXMsvXgdgYbnfS1Gw_sYGNndgK";

const clienteSupabase = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const CHAVE_CARRINHO = "carrinho_pedeaki";

const CATEGORIAS = [
  "acougue",
  "hortifruti",
  "mercearia",
  "bebidas",
  "limpeza"
];

let produtos = [];

let slideAtual = 0;
let intervaloCarrossel = null;


// ===== NORMALIZA TEXTO =====
function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}


// ===== FORMATA PREÇO =====
function formatarPreco(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}


// ===== PEGA O NOME DO PRODUTO =====
function obterNome(produto) {
  const valor = produto.nome;

  if (typeof valor === "object" && valor !== null) {
    return (
      valor.pt ||
      valor.br ||
      valor.name ||
      valor.nome ||
      "Produto sem nome"
    );
  }

  return String(valor ?? "Produto sem nome");
}


// ===== PEGA O PREÇO DO PRODUTO =====
function obterPreco(produto) {
  const valor = produto.preco;

  if (typeof valor === "object" && valor !== null) {
    return Number(
      valor.valor ??
      valor.price ??
      valor.preco ??
      0
    );
  }

  return Number(valor ?? 0);
}


// ===== PEGA A IMAGEM DO PRODUTO =====
function obterImagem(produto) {
  return (
    produto.foto_url ||
    produto.imagem ||
    produto.image_url ||
    produto.foto ||
    "src/images/produto-padrao.png"
  );
}


// ===== SALVA CARRINHO =====
function salvarDados() {
  const quantidades = {};

  produtos.forEach((produto) => {
    if (produto.qtd > 0) {
      quantidades[String(produto.id)] = produto.qtd;
    }
  });

  localStorage.setItem(
    CHAVE_CARRINHO,
    JSON.stringify(quantidades)
  );
}


// ===== CARREGA CARRINHO SALVO =====
function carregarDadosSalvos() {
  try {
    return JSON.parse(
      localStorage.getItem(CHAVE_CARRINHO)
    ) || {};
  } catch {
    return {};
  }
}


// ===== MOSTRA ERRO NO CATÁLOGO =====
function mostrarErroCatalogo(mensagem) {
  CATEGORIAS.forEach((categoria) => {
    const container = document.getElementById(
      `${categoria}-produtos`
    );

    if (!container) return;

    container.innerHTML = `
      <p style="
        grid-column: 1 / -1;
        text-align: center;
        padding: 30px 15px;
        color: #c0392b;
        font-weight: 600;
      ">
        ⚠️ ${mensagem}
      </p>
    `;
  });
}


// ===== CARREGA PRODUTOS DO SUPABASE =====
async function carregarProdutosDoSupabase() {

  console.log(
    "PedeAki: iniciando conexão com Supabase..."
  );

  const { data, error } = await clienteSupabase
    .from("produtos")
    .select("*");


  if (error) {

    console.error(
      "PedeAki - erro do Supabase:",
      error
    );

    mostrarErroCatalogo(
      "Não foi possível carregar os produtos. Abra o console do navegador (F12) para ver o erro."
    );

    return;
  }


  if (!Array.isArray(data)) {

    console.error(
      "PedeAki - resposta inesperada:",
      data
    );

    mostrarErroCatalogo(
      "O Supabase não retornou uma lista de produtos."
    );

    return;
  }


  console.log(
    `PedeAki: ${data.length} produto(s) recebido(s) do Supabase.`
  );

  console.table(data);


  const quantidadesSalvas =
    carregarDadosSalvos();


  produtos = data
    .map((produto) => {

      return {

        id: String(produto.id),

        nome: obterNome(produto),

        preco: obterPreco(produto),

        categoria: normalizarTexto(
          produto.categoria
        ),

        imagem: obterImagem(produto),

        qtd: Number(
          quantidadesSalvas[
            String(produto.id)
          ] || 0
        )

      };

    })
    .filter((produto) => produto.nome);


  console.log(
    "PedeAki: produtos tratados:",
    produtos
  );


  inicializarCatalogo();

  atualizarCarrinho();

  mostrarCategoria("acougue");
}


// ===== INICIALIZA CATÁLOGO =====
function inicializarCatalogo() {

  CATEGORIAS.forEach((categoria) => {

    const container = document.getElementById(
      `${categoria}-produtos`
    );

    if (!container) return;


    container.innerHTML = "";


    const filtrados = produtos.filter(
      (produto) =>
        produto.categoria === categoria
    );


    if (filtrados.length === 0) {

      container.innerHTML = `
        <p style="
          grid-column: 1 / -1;
          text-align: center;
          padding: 20px;
          color: #999;
        ">
          Nenhum produto disponível nesta categoria.
        </p>
      `;

      return;
    }


    filtrados.forEach((produto) => {

      const card =
        document.createElement("div");

      card.className = "produto-card";

      card.dataset.id = produto.id;


      const imagem =
        document.createElement("img");

      imagem.className =
        "produto-imagem";

      imagem.src = produto.imagem;

      imagem.alt = produto.nome;


      imagem.onerror = () => {

        imagem.src =
          "src/images/produto-padrao.png";

      };


      const nome =
        document.createElement("h3");

      nome.className =
        "produto-nome";

      nome.textContent =
        produto.nome;


      const preco =
        document.createElement("p");

      preco.className =
        "produto-preco";

      preco.textContent =
        formatarPreco(produto.preco);


      const controles =
        document.createElement("div");

      controles.className =
        "controles";


      const btnDiminuir =
        document.createElement("button");

      btnDiminuir.type = "button";

      btnDiminuir.className =
        "btn-quantidade";

      btnDiminuir.dataset.acao =
        "diminuir";

      btnDiminuir.dataset.id =
        produto.id;

      btnDiminuir.textContent = "−";


      const quantidade =
        document.createElement("span");

      quantidade.className =
        "quantidade";

      quantidade.id =
        `qtd-${produto.id}`;

      quantidade.textContent =
        produto.qtd;


      const btnAumentar =
        document.createElement("button");

      btnAumentar.type = "button";

      btnAumentar.className =
        "btn-quantidade";

      btnAumentar.dataset.acao =
        "aumentar";

      btnAumentar.dataset.id =
        produto.id;

      btnAumentar.textContent = "+";


      controles.append(
        btnDiminuir,
        quantidade,
        btnAumentar
      );


      card.append(
        imagem,
        nome,
        preco,
        controles
      );


      container.appendChild(card);

    });

  });

}


// ===== MOSTRA CATEGORIA =====
function mostrarCategoria(categoria) {

  document
    .querySelectorAll(".categoria")
    .forEach((secao) => {

      secao.classList.remove("ativa");

    });


  const secaoAlvo =
    document.getElementById(categoria);


  if (secaoAlvo) {

    secaoAlvo.classList.add("ativa");

  }


  document
    .querySelectorAll(".menu-categorias a")
    .forEach((link) => {

      link.classList.remove("ativo");

    });


  const linkAlvo =
    document.querySelector(
      `.menu-categorias a[href="#${categoria}"]`
    );


  if (linkAlvo) {

    linkAlvo.classList.add("ativo");

  }


  const menu =
    document.querySelector(
      ".menu-categorias"
    );


  if (menu) {

    window.scrollTo({
      top: menu.offsetTop,
      behavior: "smooth"
    });

  }

}


// ===== MENU DE CATEGORIAS =====
function iniciarMenuCategorias() {

  document
    .querySelectorAll(".menu-categorias a")
    .forEach((link) => {

      link.addEventListener(
        "click",
        (evento) => {

          evento.preventDefault();

          const categoria =
            link.dataset.categoria;

          if (categoria) {

            mostrarCategoria(
              categoria
            );

          }

        }
      );

    });

}


// ===== ABRE CARRINHO =====
function abrirCarrinho() {

  const carrinho =
    document.querySelector(".carrinho");


  if (!carrinho) return;


  carrinho.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


// ===== AUMENTAR =====
function aumentar(id) {

  const produto =
    produtos.find(
      (item) =>
        String(item.id) ===
        String(id)
    );


  if (!produto) return;


  produto.qtd += 1;


  atualizarQuantidadeNaTela(
    produto
  );


  salvarDados();

  atualizarCarrinho();

}


// ===== DIMINUIR =====
function diminuir(id) {

  const produto =
    produtos.find(
      (item) =>
        String(item.id) ===
        String(id)
    );


  if (!produto) return;


  if (produto.qtd <= 0) return;


  produto.qtd -= 1;


  atualizarQuantidadeNaTela(
    produto
  );


  salvarDados();

  atualizarCarrinho();

}


// ===== ATUALIZA QUANTIDADE NO CARD =====
function atualizarQuantidadeNaTela(
  produto
) {

  const elemento =
    document.getElementById(
      `qtd-${produto.id}`
    );


  if (elemento) {

    elemento.textContent =
      produto.qtd;

  }

}


// ===== REMOVE ITEM =====
function removerItem(id) {

  const produto =
    produtos.find(
      (item) =>
        String(item.id) ===
        String(id)
    );


  if (!produto) return;


  produto.qtd = 0;


  atualizarQuantidadeNaTela(
    produto
  );


  salvarDados();

  atualizarCarrinho();

}


// ===== ATUALIZA CARRINHO =====
function atualizarCarrinho() {

  const lista =
    document.getElementById(
      "lista-produtos"
    );


  const totalDisplay =
    document.getElementById(
      "total-pedido"
    );


  const contador =
    document.getElementById(
      "carrinho-contador"
    );


  if (!lista || !totalDisplay) {
    return;
  }


  lista.innerHTML = "";


  let total = 0;

  // Conta TIPOS de produtos, não unidades
  let quantidadeTotal = 0;


  produtos.forEach((produto) => {

    if (produto.qtd <= 0) {
      return;
    }


    const subtotal =
      produto.preco *
      produto.qtd;


    total += subtotal;

    // Cada produto diferente vale 1 no contador
    quantidadeTotal += 1;


    const item =
      document.createElement("div");

    item.className =
      "carrinho-item";


    const nome =
      document.createElement("span");

    nome.textContent =
      `${produto.qtd}x ${produto.nome}`;


    const direita =
      document.createElement("span");

    direita.className =
      "carrinho-item-direita";


    const valor =
      document.createElement("span");

    valor.textContent =
      formatarPreco(subtotal);


    const remover =
      document.createElement("button");

    remover.type = "button";

    remover.className =
      "btn-remover";

    remover.title =
      "Remover item";

    remover.dataset.acao =
      "remover";

    remover.dataset.id =
      produto.id;

    remover.textContent =
      "✕";


    direita.append(
      valor,
      remover
    );


    item.append(
      nome,
      direita
    );


    lista.appendChild(item);

  });


  // Carrinho vazio
  if (quantidadeTotal === 0) {

    lista.innerHTML = `
      <p class="carrinho-vazio">
        🛒 Seu carrinho está vazio
      </p>
    `;

  }


  // Total
  totalDisplay.textContent =
    formatarPreco(total);


  // Contador de TIPOS de produtos
  if (contador) {

    contador.textContent =
      quantidadeTotal;

  }

}


// ===== FINALIZA PEDIDO =====
function finalizarPedido() {

  const nome =
    document
      .getElementById(
        "nome-cliente"
      )
      ?.value.trim() || "";


  const endereco =
    document
      .getElementById(
        "endereco-cliente"
      )
      ?.value.trim() || "";


  const observacao =
    document
      .getElementById(
        "observacao-cliente"
      )
      ?.value.trim() || "";


  if (!nome || !endereco) {

    alert(
      "⚠️ Por favor, preencha seu NOME e ENDEREÇO!"
    );

    return;

  }


  const itens =
    produtos.filter(
      (produto) =>
        produto.qtd > 0
    );


  if (itens.length === 0) {

    alert(
      "⚠️ Seu carrinho está vazio!"
    );

    return;

  }


  let totalPedido = 0;


  let mensagem =
    `Olá! Meu nome é ${nome}.\n`;


  mensagem +=
    `Endereço para entrega: ${endereco}\n`;


  if (observacao) {

    mensagem +=
      `Observação: ${observacao}\n`;

  }


  mensagem +=
    `\n📋 *Meu pedido:*\n\n`;


  itens.forEach((produto) => {

    const subtotal =
      produto.preco *
      produto.qtd;


    mensagem +=
      `• ${produto.qtd}x ${produto.nome} - ${formatarPreco(subtotal)}\n`;


    totalPedido +=
      subtotal;

  });


  mensagem +=
    `\n*💰 Total: ${formatarPreco(totalPedido)}*`;


  const numeroWhatsApp =
    "5563999665779";


  const urlWhatsApp =
    `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
      mensagem
    )}`;


  window.open(
    urlWhatsApp,
    "_blank"
  );

}


// ===== CARROSSEL =====
function iniciarCarrossel() {

  const slides =
    document.querySelectorAll(
      ".slide"
    );


  if (!slides.length) {
    return;
  }


  mostrarSlide(
    slides,
    0
  );


  intervaloCarrossel =
    setInterval(() => {

      slideAtual =
        (slideAtual + 1) %
        slides.length;


      mostrarSlide(
        slides,
        slideAtual
      );

    }, 3000);

}


// ===== MOSTRA SLIDE =====
function mostrarSlide(
  slides,
  indice
) {

  slides.forEach((slide) => {

    slide.classList.remove(
      "active"
    );

  });


  if (slides[indice]) {

    slides[indice].classList.add(
      "active"
    );

  }

}


// ===== EVENTOS DOS PRODUTOS =====
function iniciarEventosProdutos() {

  document.addEventListener(
    "click",
    (evento) => {

      const botao =
        evento.target.closest(
          "[data-acao]"
        );


      if (!botao) {
        return;
      }


      const acao =
        botao.dataset.acao;


      const id =
        botao.dataset.id;


      if (acao === "aumentar") {

        aumentar(id);

      }


      if (acao === "diminuir") {

        diminuir(id);

      }


      if (acao === "remover") {

        removerItem(id);

      }

    }
  );

}


// ===== INICIA SISTEMA =====
document.addEventListener(
  "DOMContentLoaded",
  async () => {

    iniciarMenuCategorias();

    iniciarEventosProdutos();

    iniciarCarrossel();


    // Botão carrinho
    document
      .getElementById(
        "btn-carrinho-flutuante"
      )
      ?.addEventListener(
        "click",
        abrirCarrinho
      );


    // Botão finalizar
    document
      .getElementById(
        "btn-finalizar"
      )
      ?.addEventListener(
        "click",
        finalizarPedido
      );


    // Botão topo
    document
      .getElementById(
        "btn-topo"
      )
      ?.addEventListener(
        "click",
        () => {

          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });

        }
      );


    // Pausa carrossel quando sai da página
    document.addEventListener(
      "visibilitychange",
      () => {

        const slides =
          document.querySelectorAll(
            ".slide"
          );


        if (document.hidden) {

          clearInterval(
            intervaloCarrossel
          );

        } else if (
          slides.length > 1
        ) {

          clearInterval(
            intervaloCarrossel
          );


          intervaloCarrossel =
            setInterval(() => {

              slideAtual =
                (slideAtual + 1) %
                slides.length;


              mostrarSlide(
                slides,
                slideAtual
              );

            }, 3000);

        }

      }
    );


    // Carrega os produtos
    await carregarProdutosDoSupabase();

  }
);

    // Botão finalizar
    document
      .getElementById(
        "btn-finalizar"
      )
      ?.addEventListener(
        "click",
        finalizarPedido
      );


    // Botão topo
    document
      .getElementById(
        "btn-topo"
      )
      ?.addEventListener(
        "click",
        () => {

          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });

        }
      );


    // Pausa carrossel quando sai da página
    document.addEventListener(
      "visibilitychange",
      () => {

        const slides =
          document.querySelectorAll(
            ".slide"
          );


        if (document.hidden) {

          clearInterval(
            intervaloCarrossel
          );

        } else if (
          slides.length > 1
        ) {

          clearInterval(
            intervaloCarrossel
          );


          intervaloCarrossel =
            setInterval(() => {

              slideAtual =
                (slideAtual + 1) %
                slides.length;


              mostrarSlide(
                slides,
                slideAtual
              );

            }, 3000);

        }

      }
    );


    // IMPORTANTE:
    // Carrega os produtos depois que
    // toda a página estiver pronta.
    await carregarProdutosDoSupabase();

  }
);