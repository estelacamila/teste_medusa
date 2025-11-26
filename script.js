// ===============================
// ESTADO
// ===============================
let currentProductName = "";
let currentCard = null;
const cart = [];

// ===============================
// CONFIGURAÇÃO DE EXTRAS
// ===============================
const trancasExtras = {
  "Ghana Braids": { detalhes: ["Cachos Orgânicos"], precoExtra: { "Cachos Orgânicos": 50 } },
  "Goddess Braids": { detalhes: ["Cachos Orgânicos", "Cachos Sintéticos"], precoExtra: { "Cachos Orgânicos": 60, "Cachos Sintéticos": 0 } },
  "Trança Nagô": { detalhes: ["Trança Desenhada", "Jumbo"], precoExtra: { "Trança Desenhada": 40, "Jumbo": 30 }, tempoExtra: { "Jumbo": 1 } },
  "Fulani Braids": { detalhes: ["Trança Desenhada", "Cachos Orgânicos"], precoExtra: { "Trança Desenhada": 50, "Cachos Orgânicos": 60 } },
  "Lemonade Braids": { detalhes: ["Cachos Orgânicos"], precoExtra: { "Cachos Orgânicos": 60 } },
  "Flat Twist": { detalhes: ["Jumbo"], precoExtra: { "Jumbo": 50 } },
  "Boxeadora": { detalhes: ["Trança Desenhada"], precoExtra: { "Trança Desenhada": 20 } }
};

// ===============================
// ABRIR MODAL DE OPÇÕES
// ===============================

function goToAgenda() {
  if (cart.length === 0) {
    alert("Escolha pelo menos uma trança!");
    return;
  }

  // Aqui você pode pegar a última trança adicionada ao carrinho
  const lastItem = cart[cart.length - 1];

  const braidData = {
    name: lastItem.name,
    comprimento: lastItem.comprimento,
    espessura: lastItem.espessura,
    cor: lastItem.cor,
    extras: lastItem.extras,
    price: lastItem.price,
    tempoExtra: lastItem.tempoExtra
  };

  // Salva no sessionStorage
  sessionStorage.setItem("braidData", JSON.stringify(braidData));

  // Redireciona para a página da agenda
  window.location.href = "login.html"; // nome do arquivo da agenda
}

function openOptions(btn) {
  const card = btn.closest(".card");
  if (!card) return;

  currentCard = card;
  const produto = card.dataset.name;
  currentProductName = produto;

  document.getElementById("selectedProduct").innerText = "Produto: " + produto;

  // Durações personalizadas por trança
  const duracoes = {
    "Box Braids": "4h30",
    "Gypsy Braids": "4h30",
    "Goddess Braids": "4h",
    "Ghana Braids": "3h a 6h",
    "Faux Locs": "5h a 8h",
    "Trança Nagô": "2h a 4h",
    "Fulani Braids": "3h a 6h",
    "Lemonade Braids": "4h a 6h",
    "French Curl": "4h a 7h",
    "Slim Braids": "6h a 10h",
    "Boho Braids": "4h a 7h",
    "Flat Twist": "2h a 4h",
    "Bantu Knots": "1h a 2h",
    "Twist Feminino": "4h a 6h",
    "Boxeadora": "2h a 4h",
    "Mohswk Braids": "4h a 7h"
  };
  document.getElementById("duracaoValue").innerText = duracoes[produto] || "—";

  // Preencher select de comprimento
  const comprimentoSelect = document.getElementById("opComprimento");
  comprimentoSelect.innerHTML = "";
  const prices = [
    { label: "Curto", value: card.dataset.priceShort },
    { label: "Médio", value: card.dataset.priceMedium },
    { label: "Longo", value: card.dataset.priceLong }
  ];
  prices.forEach(p => {
    if (p.value) {
      const opt = document.createElement("option");
      opt.value = Number(p.value);
      opt.text = `${p.label} — R$ ${numberToBRL(p.value)}`;
      comprimentoSelect.appendChild(opt);
    }
  });

  // Resetar espessura, cor e extras
  document.getElementById("opEspessura").value = "0";
  document.getElementById("opCor").value = "";
  const extrasContainer = document.getElementById("extrasContainer");
  extrasContainer.innerHTML = "";

  // Mostrar extras se houver
  if (trancasExtras[produto]) {
    trancasExtras[produto].detalhes.forEach(det => {
      const div = document.createElement("div");
      div.className = "form-row";
      div.innerHTML = `<label style="min-width:150px"><input type="checkbox" class="extraOption" data-name="${det}"> ${det}</label>`;
      extrasContainer.appendChild(div);
    });

    document.querySelectorAll(".extraOption").forEach(cb => {
      cb.addEventListener("change", updateModalTotal);
    });
  }

  updateModalTotal();

  const panel = document.getElementById("optionsPanel");
  panel.style.display = "flex";
  panel.setAttribute("aria-hidden", "false");
}

// ===============================
// FECHAR MODAL
// ===============================
function closeOptions() {
  const panel = document.getElementById("optionsPanel");
  panel.style.display = "none";
  panel.setAttribute("aria-hidden", "true");
}

// ===============================
// CALCULAR EXTRAS E TEMPO
// ===============================
function calcularExtras(produto) {
  let precoExtra = 0;
  let tempoExtra = 0;

  // Fina adiciona 1h
  const fina = Number(document.getElementById("opEspessura").value || 0) === 50;
  if (fina) tempoExtra += 1;

  document.querySelectorAll(".extraOption:checked").forEach(cb => {
    const det = cb.dataset.name;
    const info = trancasExtras[produto];
    if (info && info.precoExtra[det]) precoExtra += info.precoExtra[det];
    if (info && info.tempoExtra && info.tempoExtra[det]) tempoExtra += info.tempoExtra[det];
  });

  return { precoExtra, tempoExtra };
}

// ===============================
// ATUALIZAR TOTAL MODAL
// ===============================
function updateModalTotal() {
  const comp = Number(document.getElementById("opComprimento").value || 0);
  const esp = Number(document.getElementById("opEspessura").value || 0);

  let total = comp + esp;

  if (currentProductName) {
    const extras = calcularExtras(currentProductName);
    total += extras.precoExtra;
  }

  document.getElementById("opTotal").innerText = numberToBRL(total);
}

// ===============================
// EVENTOS PARA ATUALIZAR TOTAL
// ===============================
document.getElementById("opComprimento").addEventListener("change", updateModalTotal);
document.getElementById("opEspessura").addEventListener("change", updateModalTotal);
document.getElementById("opCor").addEventListener("input", updateModalTotal);

// ===============================
// ADICIONAR AO CARRINHO
// ===============================
function addToCartFromModal() {
  const comp = Number(document.getElementById("opComprimento").value || 0);
  const esp = Number(document.getElementById("opEspessura").value || 0);
  const corNome = (document.getElementById("opCor").value || "").trim();

  let preco = comp + esp;
  let tempoExtra = 0;

  if (currentProductName) {
    const extras = calcularExtras(currentProductName);
    preco += extras.precoExtra;
    tempoExtra += extras.tempoExtra;
  }

  const extrasSelecionados = Array.from(document.querySelectorAll(".extraOption:checked")).map(cb => cb.dataset.name);

  const item = {
    name: currentProductName,
    comprimento: comp,
    espessura: esp,
    cor: corNome || "Não informada",
    extras: extrasSelecionados,
    price: preco,
    tempoExtra
  };

  cart.push(item);
  renderCart();
  closeOptions();
  flashCartCount();
}

// ===============================
// RENDERIZAR CARRINHO
// ===============================
function renderCart() {
  const list = document.getElementById("cartItems");
  list.innerHTML = "";

  if (cart.length === 0) {
    list.innerHTML = '<div class="small-muted">Seu carrinho está vazio.</div>';
  } else {
    cart.forEach((it, idx) => {
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <p><strong>${escapeHtml(it.name)}</strong></p>
        <p class="small-muted">
          Comprimento: R$ ${numberToBRL(it.comprimento)}<br>
          Espessura: ${it.espessura === 0 ? "Normal" : "+ R$ " + numberToBRL(it.espessura)}<br>
          Cor: ${escapeHtml(it.cor)}<br>
          Extras: ${it.extras.length ? it.extras.join(", ") : "-"}<br>
          Tempo extra: ${it.tempoExtra ? it.tempoExtra + "h" : "-"}
        </p>
        <p><strong>R$ ${numberToBRL(it.price)}</strong></p>
        <button class="btn-ghost" style="padding:6px;border-radius:8px;font-size:12px" onclick="removeItem(${idx})">Remover</button>
      `;
      list.appendChild(div);
    });
  }

  document.getElementById("cart-count").innerText = cart.length;
  const total = cart.reduce((sum, prd) => sum + prd.price, 0);
  document.getElementById("cartTotal").innerText = numberToBRL(total);
}

// ===============================
// REMOVER ITEM
// ===============================
function removeItem(index) {
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    renderCart();
  }
}

// ===============================
// ABRIR / FECHAR CARRINHO
// ===============================
function toggleCart() {
  const panel = document.getElementById("cart-panel");
  panel.classList.toggle("open");
}

// ===============================
// FINALIZAR WHATSAPP
// ===============================
function finalizeWhatsApp() {
  if (cart.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  const lines = cart.map((it, i) => {
    return `${i + 1}) ${it.name} — Comprimento: R$ ${numberToBRL(it.comprimento)}, Espessura: ${it.espessura === 0 ? "Normal" : "+ R$ " + numberToBRL(it.espessura)}, Cor: ${it.cor}, Extras: ${it.extras.join(", ") || "-"} — Total: R$ ${numberToBRL(it.price)} — Tempo extra: ${it.tempoExtra ? it.tempoExtra + "h" : "-"}`;
  });

  const total = numberToBRL(cart.reduce((sum, i) => sum + i.price, 0));

  const message = `Olá! Gostaria de fazer o pedido:\n\n${lines.join("\n")}\n\nTotal: R$ ${total}\n\nNome:\nTelefone:\nData/Hora desejada:`;

  const encoded = encodeURIComponent(message);
  const waNumber = "55DDDNÚMERODOSEUWHATSAPP";
  window.open(`https://wa.me/${waNumber}?text=${encoded}`, "_blank");
}

// ===============================
// FUNÇÕES ÚTEIS
// ===============================
function numberToBRL(num) {
  return Number(num).toFixed(2).replace(".", ",");
}

function escapeHtml(text) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function flashCartCount() {
  const el = document.getElementById("cart-count");
  el.style.transform = "scale(1.2)";
  setTimeout(() => (el.style.transform = "scale(1)"), 150);
}

// ===============================
// INICIALIZAÇÃO
// ===============================
renderCart();
updateModalTotal();
