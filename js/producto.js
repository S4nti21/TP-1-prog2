/* ─── FALLBACK LOCAL ──────────────────────────────────────
   Solo se usa si el backend no responde o la BD está vacía */

const productosLocales = [];

/* ─── CONSTANTES ─────────────────────────────────────────── */

const interesPorCuota = { 1: 0, 3: 0, 6: 0.10, 9: 0.20, 12: 0.35 };

const container = document.getElementById("productContainer");
const params    = new URLSearchParams(window.location.search);
const id        = Number(params.get("id"));

// Guardamos las variantes del backend para saber el id_inventario al agregar al carrito
let variantesBackend = [];
let talleSeleccionado = null;

/* ─── RENDER PRODUCTO ────────────────────────────────────── */

function renderizarProducto(producto) {
  if (!producto) {
    container.innerHTML = `
      <div class="product-not-found">
        <h1>Producto no encontrado</h1>
        <a href="./index.html">Volver a la tienda</a>
      </div>`;
    return;
  }

  const sinStock = producto.stock === 0;

  const tallesHTML = (producto.talles || ["S","M","L","XL"]).map(t =>
    `<button class="size-btn" data-talle="${t}">${t}</button>`
  ).join("");

  container.innerHTML = `
    <div class="product-page">

      <div class="product-image">
        <img src="../assets/${producto.imagen}" alt="${producto.nombre}">
      </div>

      <div class="product-info">

        <p class="product-category">${producto.categoria.toUpperCase()}</p>
        <h1>${producto.nombre}</h1>
        <h2 id="precioMostrado">$${producto.precio.toLocaleString("es-AR")}</h2>

        ${sinStock
          ? `<p class="sin-stock-msg">⚠️ Sin stock disponible</p>`
          : `<p class="stock-msg">Stock disponible: ${producto.stock} unidades</p>`
        }

        <p class="product-description">
          ${producto.descripcion || "Diseño premium pensado para uso diario. Materiales de alta calidad y silueta oversized inspirada en el streetwear contemporáneo."}
        </p>

        <!-- CUOTAS -->
        <div class="cuotas-selector">
          <label for="selectCuotas">Pagá en cuotas:</label>
          <select id="selectCuotas">
            <option value="1">1 cuota sin interés</option>
            <option value="3">3 cuotas sin interés</option>
            <option value="6">6 cuotas (10% interés)</option>
            <option value="9">9 cuotas (20% interés)</option>
            <option value="12">12 cuotas (35% interés)</option>
          </select>
          <p id="precioCuota" class="precio-cuota"></p>
        </div>

        <p class="size-title">TALLE</p>
        <div class="size-selector">${tallesHTML}</div>
        <p id="talleError" class="talle-error" style="display:none; color:red; font-size:.8rem;">
          Seleccioná un talle antes de agregar.
        </p>

        <div class="product-actions">
          <button class="product-favorite" id="btnFavorito">
            <i class="fa-regular fa-bookmark"></i>
          </button>
          <button
            class="product-buy"
            id="addToCart"
            ${sinStock ? 'disabled style="opacity:.4;cursor:not-allowed"' : ""}
          >
            ${sinStock ? "SIN STOCK" : "AGREGAR AL CARRITO"}
          </button>
        </div>

        <div class="product-details">
          <p>• Envíos a todo el país</p>
          <p>• Cambios dentro de los 30 días</p>
          <p>• Pago seguro</p>
        </div>

      </div>
    </div>`;

  activarTalles(producto);
  activarCuotas(producto);
  activarFavorito(producto);
  if (!sinStock) activarCarrito(producto);
  renderizarRelacionados(producto);
  actualizarFavoritos();
}

/* ─── TALLES ──────────────────────────────────────────────── */

function activarTalles(producto) {
  const botones = document.querySelectorAll(".size-btn");
  botones.forEach(btn => {
    btn.addEventListener("click", () => {
      botones.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      talleSeleccionado = btn.dataset.talle;
      document.getElementById("talleError").style.display = "none";
    });
  });
}

/* ─── CUOTAS ──────────────────────────────────────────────── */

function activarCuotas(producto) {
  const select        = document.getElementById("selectCuotas");
  const precioCuota   = document.getElementById("precioCuota");
  const precioMostrado= document.getElementById("precioMostrado");

  function actualizarCuotas() {
    const cuotas   = Number(select.value);
    const interes  = interesPorCuota[cuotas];
    const total    = producto.precio * (1 + interes);
    const porCuota = total / cuotas;
    precioMostrado.textContent = `$${total.toLocaleString("es-AR")}`;
    precioCuota.textContent = cuotas === 1
      ? "Pago único sin interés"
      : `${cuotas} cuotas de $${Math.ceil(porCuota).toLocaleString("es-AR")}`;
  }

  select.addEventListener("change", actualizarCuotas);
  actualizarCuotas();
}

/* ─── CARRITO ──────────────────────────────────────────────
   Si tenemos variantes del backend usamos el endpoint agregarACarrito
   con id_inventario. Si no (fallback local), guardamos en localStorage. */

function activarCarrito(producto) {
  const btn = document.getElementById("addToCart");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const usuarioActual = Auth.obtenerUsuarioLogueado();
    if (!usuarioActual) {
      mostrarToast("Debes iniciar sesión para agregar al carrito");
      setTimeout(() => { window.location.href = "./login.html"; }, 1500);
      return;
    }

    if (!talleSeleccionado) {
      document.getElementById("talleError").style.display = "block";
      return;
    }

    // Buscar la variante que coincide con el talle seleccionado
    const variante = variantesBackend.find(v => v.talle === talleSeleccionado);

    if (variante) {
      // ── Ruta con backend ──────────────────────────────────
      try {
        const res  = await Auth.fetchConToken("http://localhost:4000/api/agregarACarrito", {
          method: "POST",
          body: JSON.stringify({
            id_inventario: variante.idInventario,
            id_usuario:    usuarioActual.id_usuario,
          }),
        });
        const data = await res.json();

        if (data.codigo === 200) {
          // También guardamos en localStorage para el resumen de pago
          _agregarALocalStorage(usuarioActual, producto, variante);
          mostrarToast("Producto agregado al carrito ✓");
          actualizarContador();
        } else {
          mostrarToast("Error al agregar al carrito");
        }
      } catch (err) {
        mostrarToast("No se pudo conectar con el servidor");
      }

    } else {
      // ── Fallback local (BD vacía) ─────────────────────────
      _agregarALocalStorage(usuarioActual, producto, { talle: talleSeleccionado, color: producto.color || "" });
      mostrarToast("Producto agregado al carrito ✓");
      actualizarContador();
    }
  });
}

function _agregarALocalStorage(usuarioActual, producto, variante) {
  const CARRITO_KEY = `carrito_${usuarioActual.id_usuario}`;
  let carrito = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];

  const existente = carrito.find(p =>
    p.nombre === producto.nombre && p.talle === variante.talle
  );

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      id:          variante.idInventario || Date.now(),
      idInventario:variante.idInventario || null,
      nombre:      producto.nombre,
      precio:      producto.precio,
      imagen:      `../assets/${producto.imagen}`,
      talle:       variante.talle,
      color:       variante.color || "",
      categoria:   producto.categoria,
      cantidad:    1,
    });
  }

  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
}

/* ─── FAVORITO ────────────────────────────────────────────── */

function activarFavorito(producto) {
  const btn = document.getElementById("btnFavorito");
  if (!btn) return;

  const usuarioActual = Auth.obtenerUsuarioLogueado();
  if (!usuarioActual) return;

  const FAV_KEY = `favoritos_${usuarioActual.id_usuario}`;
  let favoritos = JSON.parse(localStorage.getItem(FAV_KEY)) || [];

  const existe = favoritos.some(p => Number(p.productoId) === Number(producto.id));
  btn.innerHTML = existe
    ? `<i class="fa-solid fa-bookmark"></i>`
    : `<i class="fa-regular fa-bookmark"></i>`;

  btn.addEventListener("click", async () => {
    favoritos = JSON.parse(localStorage.getItem(FAV_KEY)) || [];
    const idx = favoritos.findIndex(p => Number(p.productoId) === Number(producto.id));

    if (idx > -1) {
      favoritos.splice(idx, 1);
      btn.innerHTML = `<i class="fa-regular fa-bookmark"></i>`;
      try {
        await Auth.fetchConToken("http://localhost:4000/api/eliminarFavorito", {
          method: "DELETE",
          body: JSON.stringify({ id_usuario: usuarioActual.id_usuario, id_producto: producto.id }),
        });
      } catch (e) {}
    } else {
      favoritos.push({
        id:         Date.now(),
        productoId: producto.id,
        nombre:     producto.nombre,
        precio:     producto.precio,
        imagen:     producto.imagen,
      });
      btn.innerHTML = `<i class="fa-solid fa-bookmark"></i>`;
      try {
        await Auth.fetchConToken("http://localhost:4000/api/agregarFavorito", {
          method: "POST",
          body: JSON.stringify({ id_producto: producto.id, id_usuario: usuarioActual.id_usuario }),
        });
      } catch (e) {}
    }

    localStorage.setItem(FAV_KEY, JSON.stringify(favoritos));
    actualizarFavoritos();
  });
}

/* ─── CONTADORES ─────────────────────────────────────────── */

function actualizarContador() {
  const u = Auth.obtenerUsuarioLogueado();
  if (!u) return;
  const key    = `carrito_${u.id_usuario}`;
  const cart   = JSON.parse(localStorage.getItem(key)) || [];
  const total  = cart.reduce((acc, p) => acc + (p.cantidad || 1), 0);
  const counter= document.getElementById("cartCounter");
  if (counter) counter.textContent = total;
}

function actualizarFavoritos() {
  const u = Auth.obtenerUsuarioLogueado();
  if (!u) {
    const contador = document.getElementById("favoritesCounter");
    if (contador) contador.textContent = "0";
    return;
  }
  const favs = JSON.parse(localStorage.getItem(`favoritos_${u.id_usuario}`)) || [];
  const contador = document.getElementById("favoritesCounter");
  if (contador) contador.textContent = favs.length;
}

/* ─── PRODUCTOS RELACIONADOS ─────────────────────────────── */

function renderizarRelacionados(producto) {
  const rel = document.getElementById("relatedProducts");
  if (!rel) return;

  // Preferimos los productos del backend si están disponibles
  const fuente = window._productosBackend || productosLocales;

  const relacionados = fuente
    .filter(p => Number(p.id) !== Number(producto.id))
    .slice(0, 4);

  rel.innerHTML = relacionados.map(p => `
    <div class="product-card" onclick="window.location.href='producto.html?id=${p.id}'">
      <div class="product-image-wrap">
        <img src="../assets/${p.imagen}" alt="${p.nombre}">
      </div>
      <div class="product-info">
        <p class="product-name">${p.nombre}</p>
        <p class="product-price">$${Number(p.precio).toLocaleString("es-AR")}</p>
      </div>
    </div>`).join("");
}

/* ─── TOAST ──────────────────────────────────────────────── */

function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = mensaje;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

/* ─── INIT ───────────────────────────────────────────────────
   1. Intentamos obtener el detalle del producto desde el backend
      (endpoint: GET /api/obtenerDatosProducto/:id)
      Devuelve una fila por variante (talle+color+stock+idInventario)
   2. Si falla o la BD está vacía, usamos el fallback local        */

async function init() {
  try {
    const res  = await fetch(`http://localhost:4000/api/obtenerDatosProducto/${id}`);
    const data = await res.json();

    if (data.payload && data.payload.length > 0) {
      // Guardamos las variantes para usarlas al agregar al carrito
      variantesBackend = data.payload.map(v => ({
        talle:       v.talle,
        color:       v.color,
        stock:       v.stock,
        idInventario:v.idInventario,
      }));

      const primera = data.payload[0];

      // Agrupamos talles únicos y sumamos stock total
      const talles     = [...new Set(data.payload.map(v => v.talle))];
      const stockTotal = data.payload.reduce((acc, v) => acc + Number(v.stock), 0);

      const producto = {
        id:          id,
        nombre:      primera.producto,
        precio:      Number(primera.precio),
        descripcion: primera.descripcion,
        categoria:   primera.categoria,
        genero:      primera.genero,
        imagen:      primera.ulrImagen,   // el backend devuelve "ulrImagen"
        talles,
        stock:       stockTotal,
        color:       primera.color,
      };

      // Guardamos para productos relacionados
      try {
        const resAll  = await fetch("http://localhost:4000/api/obtenerProductos");
        const dataAll = await resAll.json();
        if (dataAll.payload && dataAll.payload.length > 0) {
          window._productosBackend = dataAll.payload.map(p => ({
            id:     p.idProducto,
            nombre: p.producto,
            precio: Number(p.precio),
            imagen: p.ulrImagen || p.imagen || "placeholder.png",
          }));
        }
      } catch (e) {}

      renderizarProducto(producto);

    } else {
      // BD vacía → fallback
      const producto = productosLocales.find(p => p.id === id);
      renderizarProducto(producto || null);
    }

  } catch (e) {
    const producto = productosLocales.find(p => p.id === id);
    renderizarProducto(producto || null);
  }
}

const usuario = Auth.obtenerUsuarioLogueado();
const btnFavHeader = document.getElementById("btnFavHeader");
if (btnFavHeader) {
  btnFavHeader.classList.toggle("oculto", !usuario);
}

init();
actualizarContador();
actualizarFavoritos();