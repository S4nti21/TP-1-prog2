// ─── VERIFICAR SESIÓN ─────────────────────────────────────
const usuario = Auth.obtenerUsuarioLogueado();
if (!usuario) {
  window.location.href = "./login.html";
}

// ─── MODO OSCURO ──────────────────────────────────────────
const themeButton = document.getElementById("themeButton");
const themeIcon   = document.getElementById("themeIcon");

if (themeButton && themeIcon) {
  Auth.inicializarModo();
  actualizarIconoTema();
  themeButton.addEventListener("click", () => {
    Auth.toggleModo();
    actualizarIconoTema();
  });
}

function actualizarIconoTema() {
  const modo = document.documentElement.getAttribute("data-modo");
  if (modo === "claro") {
    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");
  } else {
    themeIcon.classList.remove("fa-sun");
    themeIcon.classList.add("fa-moon");
  }
}

// ─── REFERENCIAS ──────────────────────────────────────────
const CARRITO_KEY   = `carrito_${usuario.id_usuario}`;
const cartProducts  = document.getElementById("cartProducts");
const subtotalEl    = document.getElementById("subtotal");
const totalEl       = document.getElementById("total");
const cartCounter   = document.getElementById("cartCounter");
const cartSubtitle  = document.getElementById("cartSubtitle");
const checkoutButton= document.getElementById("checkoutButton");

let carrito = [];

// ─── CARGAR CARRITO DESDE EL BACKEND ─────────────────────
async function cargarCarrito() {
  try {
    const res  = await Auth.fetchConToken(`http://localhost:4000/api/obtenerProductosCarrito/${usuario.id_usuario}`);
    const data = await res.json();

    if (data.codigo === 200 && data.payload && data.payload.length > 0) {
      carrito = data.payload.map(item => ({
        id:           item.idCarrito,
        idInventario: item.idInventario,
        nombre:       item.producto,
        precio:       Number(item.precio),
        imagen:       `../assets/${item.urlImagen}`,
        talle:        item.talle,
        color:        item.color,
        cantidad:     1,
        categoria:    "",
      }));
      // Sincronizar con localStorage para pago.js
      localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
    } else {
      // Fallback a localStorage
      carrito = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
    }
  } catch (err) {
    carrito = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
  }

  renderizarCarrito();
}

// ─── RENDER ───────────────────────────────────────────────
function renderizarCarrito() {
  cartProducts.innerHTML = "";
  let totalGeneral = 0;

  carrito.forEach(producto => {
    const cantidad = producto.cantidad || 1;
    totalGeneral += producto.precio * cantidad;

    cartProducts.innerHTML += `
      <div class="product-card cart-card">
        <div class="product-image-wrap">
          <img src="${producto.imagen}" alt="${producto.nombre}">
          <button class="btn-remove" data-id="${producto.id}" data-inventario="${producto.idInventario || ''}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="product-info">
          <div class="product-info-top">
            <p class="product-name">${producto.nombre}</p>
            <p class="product-price">$${producto.precio.toLocaleString("es-AR")}</p>
            <p class="product-details">Talle: ${producto.talle || "-"}</p>
            ${producto.color ? `<p class="product-details">Color: ${producto.color}</p>` : ""}
            <p class="product-details">Cantidad: ${cantidad}</p>
          </div>
        </div>
      </div>
    `;
  });

  subtotalEl.textContent   = `$${totalGeneral.toLocaleString("es-AR")}`;
  totalEl.textContent      = `$${totalGeneral.toLocaleString("es-AR")}`;
  cartCounter.textContent  = carrito.length;
  cartSubtitle.textContent = `${carrito.length} producto${carrito.length !== 1 ? "s" : ""} agregado${carrito.length !== 1 ? "s" : ""}`;

  agregarEventosEliminar();
}

// ─── ELIMINAR PRODUCTO ────────────────────────────────────
async function eliminarProducto(idProducto, idInventario) {
  // Eliminar del backend si tenemos idInventario
  if (idInventario) {
    try {
      await Auth.fetchConToken("http://localhost:4000/api/eliminarProductoCarrito", {
        method: "DELETE",
        body: JSON.stringify({
          id_usuario:    usuario.id_usuario,
          id_inventario: Number(idInventario),
        }),
      });
    } catch (err) { /* silencioso */ }
  }

  // Eliminar localmente
  carrito = carrito.filter(p => String(p.id) !== String(idProducto));
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  if (carrito.length === 0) localStorage.removeItem(CARRITO_KEY);

  renderizarCarrito();
}

function agregarEventosEliminar() {
  document.querySelectorAll(".btn-remove").forEach(boton => {
    boton.addEventListener("click", () => {
      eliminarProducto(boton.dataset.id, boton.dataset.inventario);
    });
  });
}

// ─── CHECKOUT ─────────────────────────────────────────────
checkoutButton.addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }
  window.location.href = "./pago.html";
});

// ─── INIT ─────────────────────────────────────────────────
cargarCarrito();