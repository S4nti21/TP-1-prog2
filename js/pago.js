// ─── VERIFICAR SESIÓN ─────────────────────────────────────
const usuario = Auth.obtenerUsuarioLogueado();
if (!usuario) {
  window.location.href = "./login.html";
}

// ─── CARRITO ──────────────────────────────────────────────
// FIX: usar la clave con el id del usuario ANTES de verificar si está vacío
const CARRITO_KEY = `carrito_${usuario.id_usuario}`;
const productos   = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];

if (productos.length === 0) {
  window.location.href = "./carrito.html";
}

// ─── REFERENCIAS ──────────────────────────────────────────
const summaryProducts = document.getElementById("summaryProducts");
const paymentTotal    = document.getElementById("paymentTotal");
const paymentMethod   = document.getElementById("paymentMethod");
const cardFields      = document.getElementById("cardFields");
const paymentForm     = document.getElementById("paymentForm");
const paymentMessage  = document.getElementById("paymentMessage");
const cardNumber      = document.getElementById("cardNumber");
const cardName        = document.getElementById("cardName");
const cardDate        = document.getElementById("cardDate");
const cardCvv         = document.getElementById("cardCvv");

// ─── RENDER RESUMEN ───────────────────────────────────────
function renderizarProductos() {
  if (productos.length === 0) {
    summaryProducts.innerHTML = `<p style="color:#999; font-size:.85rem;">No hay productos en el carrito.</p>`;
    paymentTotal.textContent = "$0";
    return;
  }

  summaryProducts.innerHTML = "";
  let total = 0;

  productos.forEach(producto => {
    const cantidad = producto.cantidad || 1;
    total += producto.precio * cantidad;

    summaryProducts.innerHTML += `
      <div class="summary-product">
        <div class="summary-product-image">
          <img src="${producto.imagen}" alt="${producto.nombre}">
        </div>
        <div class="summary-product-info">
          <h3>${producto.nombre}</h3>
          ${producto.talle ? `<p>Talle: ${producto.talle}</p>` : ""}
          ${producto.color ? `<p>Color: ${producto.color}</p>`  : ""}
          <p>Cantidad: ${cantidad}</p>
        </div>
        <span>$${(producto.precio * cantidad).toLocaleString("es-AR")}</span>
      </div>
    `;
  });

  paymentTotal.textContent = `$${total.toLocaleString("es-AR")}`;
}

// ─── MOSTRAR / OCULTAR CAMPOS DE TARJETA ──────────────────
paymentMethod.addEventListener("change", () => {
  const metodo = paymentMethod.value;
  cardFields.style.display = (metodo === "debito" || metodo === "credito") ? "block" : "none";
  verificarFormulario();
});

// ─── SUBMIT ───────────────────────────────────────────────
paymentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  paymentMessage.textContent = "";
  paymentMessage.className   = "payment-message";

  const metodo = paymentMethod.value;

  if (metodo === "") {
    paymentMessage.textContent = "Seleccioná un método de pago";
    paymentMessage.classList.add("error");
    return;
  }

  if (metodo === "debito" || metodo === "credito") {
    if (
      cardNumber.value.trim() === "" ||
      cardName.value.trim()   === "" ||
      cardDate.value.trim()   === "" ||
      cardCvv.value.trim()    === ""
    ) {
      paymentMessage.textContent = "Completá todos los datos de la tarjeta";
      paymentMessage.classList.add("error");
      return;
    }
  }

  // ── Eliminar cada producto del carrito en el backend ──
  for (const producto of productos) {
    if (producto.idInventario) {
      try {
        await Auth.fetchConToken("http://localhost:4000/api/eliminarProductoCarrito", {
          method: "DELETE",
          body: JSON.stringify({
            id_usuario:    usuario.id_usuario,
            id_inventario: producto.idInventario,
          }),
        });
      } catch (e) { /* silencioso */ }
    }
  }

  // ── Vaciar localStorage ───────────────────────────────
  localStorage.removeItem(CARRITO_KEY);

  paymentMessage.textContent = "¡Pago aprobado con éxito! Gracias por tu compra.";
  paymentMessage.classList.add("success");

  paymentForm.reset();
  cardFields.style.display = "none";

  setTimeout(() => {
    window.location.href = "./index.html";
  }, 3000);
});

// ─── HABILITAR BOTÓN PAGAR ────────────────────────────────
function verificarFormulario() {
  const metodo   = paymentMethod.value;
  const btnPagar = document.getElementById("btnPagar");

  if (metodo === "") {
    btnPagar.disabled = true;
    return;
  }

  if (metodo === "debito" || metodo === "credito") {
    btnPagar.disabled = !(
      cardNumber.value.trim() !== "" &&
      cardName.value.trim()   !== "" &&
      cardDate.value.trim()   !== "" &&
      cardCvv.value.trim()    !== ""
    );
  } else {
    btnPagar.disabled = false;
  }
}

paymentMethod.addEventListener("change", verificarFormulario);
cardNumber.addEventListener("input",  verificarFormulario);
cardName.addEventListener("input",    verificarFormulario);
cardDate.addEventListener("input",    verificarFormulario);
cardCvv.addEventListener("input",     verificarFormulario);

// ─── INIT ─────────────────────────────────────────────────
renderizarProductos();