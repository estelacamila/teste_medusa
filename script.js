// ===============================
// ESTADO GLOBAL
// ===============================
let currentProduct = null;
const cart = [];

// ===============================
// CONFIGURAÇÃO DAS TRANÇAS
// ===============================
const trancasConfig = {
  "Box Braids": { duracao: "4h30", permiteEspessura: true, extras: [] },
  "Box Braids masculina": { duracao: "3h", permiteEspessura: true, extras: [] },

  "Gypsy Braids": { duracao: "4h30", permiteEspessura: true, extras: [] },

  "Goddess Braids": {
    duracao: "4h",
    permiteEspessura: true,
    extras: ["Cachos Orgânicos", "Cachos Sintéticos"],
    precosExtras: { "Cachos Orgânicos": 60, "Cachos Sintéticos": 0 }
  },

  "Ghana Braids": {
    duracao: "2h",
    permiteEspessura: false,
    extras: ["Cachos Orgânicos"],
    precosExtras: { "Cachos Orgânicos": 50 }
  },

  "Faux Locs": { duracao: "4h", permiteEspessura: false, extras: [] },

  "Trança Nagô": {
    duracao: "1h",
    permiteEspessura: false,
    extras: ["Trança Desenhada", "Jumbo"],
    precosExtras: { "Trança Desenhada": 40, "Jumbo": 30 }
  },

  "Trança Nagô masculina": {
    duracao: "45min",
    permiteEspessura: false,
    extras: ["Trança Desenhada"],
    precosExtras: { "Trança Desenhada": 30 }
  },

  "Fulani Braids": {
    duracao: "4h",
    permiteEspessura: false,
    extras: ["Trança Desenhada", "Cachos Orgânicos"],
    precosExtras: { "Trança Desenhada": 50, "Cachos Orgânicos": 60 }
  },

  "Lemonade Braids": {
    duracao: "2h",
    permiteEspessura: false,
    extras: ["Cachos Orgânicos"],
    precosExtras: { "Cachos Orgânicos": 60 }
  },

  "French Curl": { duracao: "4h", permiteEspessura: true, extras: [] },
  "Slim Braids": { duracao: "4h30", permiteEspessura: false, extras: [] },
  "Boho Braids": { duracao: "4h30", permiteEspessura: true, extras: [] },

  "Flat Twist": {
    duracao: "2h",
    permiteEspessura: false,
    extras: ["Jumbo"],
    precosExtras: { "Jumbo": 50 }
  },

  "Bantu Knots": { duracao: "2h30", permiteEspessura: false, extras: [] },

  "Twist Feminino": { duracao: "5h", permiteEspessura: false, extras: [] },
  "Twist masculina": { duracao: "3h", permiteEspessura: false, extras: [] },

  "Boxeadora": {
    duracao: "1h30",
    permiteEspessura: false,
    extras: ["Trança Desenhada"],
    precosExtras: { "Trança Desenhada": 20 }
  },

  "Mohswk Braids": { duracao: "5h", permiteEspessura: false, extras: [] }
};

// ===============================
// ABRIR MODAL
// ===============================
function openOptions(btn) {
  const card = btn.closest(".card");
  const name = card.dataset.name;

  currentProduct = {
    name,
    basePrices: {
      curto: Number(card.dataset.priceShort),
      medio: Number(card.dataset.priceMedium),
      longo: Number(card.dataset.priceLong)
    }
  };

  document.getElementById("selectedProduct").innerText = "Produto: " + name;
  document.getElementById("duracaoValue").innerText =
    trancasConfig[name]?.duracao || "—";

  montarComprimento();
  montarEspessura();
  montarExtras();

  document.getElementById("opCor").value = "";
  updateTotal();

  document.getElementById("optionsPanel").style.display = "flex";
}

// ===============================
// FECHAR MODAL
// ===============================
function closeOptions() {
  document.getElementById("optionsPanel").style.display = "none";
}

// ===============================
// MONTAR COMPRIMENTO
// ===============================
function montarComprimento() {
  const select = document.getElementById("opComprimento");
  select.innerHTML = "";

  [
    { tipo: "Curto", key: "curto" },
    { tipo: "Médio", key: "medio" },
    { tipo: "Longo", key: "longo" }
  ].forEach(item => {
    const valor = currentProduct.basePrices[item.key];
    if (valor) {
      const opt = document.createElement("option");
      opt.value = item.tipo;
      opt.dataset.preco = valor;
      opt.textContent = `${item.tipo} — R$ ${valor}`;
      select.appendChild(opt);
    }
  });

  select.onchange = updateTotal;
}

// ===============================
// ESPESSURA
// ===============================
function montarEspessura() {
  const select = document.getElementById("opEspessura");
  const permite = trancasConfig[currentProduct.name]?.permiteEspessura;

  select.innerHTML = "";

  if (!permite) {
    select.style.display = "none";
    return;
  }

  select.style.display = "block";
  select.innerHTML = `
    <option value="0">Normal</option>
    <option value="50">Fina (+R$50)</option>
  `;

  select.onchange = updateTotal;
}

// ===============================
// EXTRAS
// ===============================
function montarExtras() {
  const container = document.getElementById("extrasContainer");
  container.innerHTML = "";

  const extras = trancasConfig[currentProduct.name]?.extras || [];

  extras.forEach(extra => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${extra}"> ${extra}
    `;
    container.appendChild(label);
  });

  container.querySelectorAll("input").forEach(cb =>
    cb.addEventListener("change", updateTotal)
  );
}

// ===============================
// CALCULAR TOTAL
// ===============================
function updateTotal() {
  const select = document.getElementById("opComprimento");
  if (!select || select.selectedIndex < 0) return;

  let total = Number(
    select.options[select.selectedIndex].dataset.preco || 0
  );

  total += Number(document.getElementById("opEspessura")?.value || 0);

  const config = trancasConfig[currentProduct.name];

  document
    .querySelectorAll("#extrasContainer input:checked")
    .forEach(cb => {
      total += config?.precosExtras?.[cb.value] || 0;
    });

  document.getElementById("opTotal").innerText =
    total.toFixed(2).replace(".", ",");
}

// ===============================
// ADICIONAR AO CARRINHO / AGENDA
// ===============================
function addToCartFromModal() {
  const select = document.getElementById("opComprimento");

  const item = {
    name: currentProduct.name,
    comprimento: select.value,
    precoComprimento: Number(
      select.options[select.selectedIndex].dataset.preco
    ),
    cor: document.getElementById("opCor").value || null,
    espessura:
      trancasConfig[currentProduct.name].permiteEspessura
        ? document.getElementById("opEspessura").value == 50
          ? "Fina"
          : "Normal"
        : null,
    extras: Array.from(
      document.querySelectorAll("#extrasContainer input:checked")
    ).map(cb => cb.value),
    price: Number(document.getElementById("opTotal").innerText.replace(",", "."))
  };

  sessionStorage.setItem("braidData", JSON.stringify(item));
  window.location.href = "agenda.html";
}
