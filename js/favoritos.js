// ─── VERIFICAR SESIÓN ─────────────────────────────────────
const usuario = Auth.obtenerUsuarioLogueado();
if (!usuario) {
  window.location.href = "./login.html";
}

const FAVORITOS_KEY = `favoritos_${usuario.id_usuario}`;
const container     = document.getElementById("favoritesContainer");
const subtitle      = document.getElementById("favoritesSubtitle");

let favoritos = [];

// ─── CARGAR FAVORITOS DESDE EL BACKEND ───────────────────
async function cargarFavoritos() {
  try {
    // 1. Obtener IDs de favoritos del usuario
    const resFavs  = await Auth.fetchConToken(`http://localhost:4000/api/obtenerFavoritos/${usuario.id_usuario}`);
    const dataFavs = await resFavs.json();

    if (dataFavs.codigo !== 200 || !dataFavs.payload || dataFavs.payload.length === 0) {
      favoritos = JSON.parse(localStorage.getItem(FAVORITOS_KEY)) || [];
      renderizarFavoritos();
      return;
    }

    const idsFavoritos = dataFavs.payload.map(f => Number(f.idProducto));

    // 2. Obtener todos los productos para cruzar los datos
    const resProd  = await fetch("http://localhost:4000/api/obtenerProductos");
    const dataProd = await resProd.json();

    if (dataProd.codigo === 200 && dataProd.payload && dataProd.payload.length > 0) {
      favoritos = idsFavoritos.map(idProd => {
        const prod = dataProd.payload.find(p => Number(p.idProducto) === idProd);
        if (prod) {
          return {
            id:         idProd,
            productoId: idProd,
            nombre:     prod.producto,
            precio:     Number(prod.precio),
            imagen:     prod.ulrImagen || "placeholder.png",
          };
        }
        // Si no está en el backend, buscar en localStorage
        const local = (JSON.parse(localStorage.getItem(FAVORITOS_KEY)) || [])
          .find(f => Number(f.productoId) === idProd);
        return local || null;
      }).filter(Boolean);
    } else {
      favoritos = JSON.parse(localStorage.getItem(FAVORITOS_KEY)) || [];
    }

    // Sincronizar localStorage
    localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos));

  } catch (err) {
    favoritos = JSON.parse(localStorage.getItem(FAVORITOS_KEY)) || [];
  }

  renderizarFavoritos();
}

// ─── RENDER ───────────────────────────────────────────────
function renderizarFavoritos() {
  container.innerHTML = "";
  subtitle.textContent = `${favoritos.length} producto${favoritos.length !== 1 ? "s" : ""} guardado${favoritos.length !== 1 ? "s" : ""}`;

  if (favoritos.length === 0) {
    container.innerHTML = `
      <div class="empty-favorites">
        <i class="fa-regular fa-bookmark"></i>
        <h2>SIN FAVORITOS</h2>
        <p>Guardá tus prendas favoritas para encontrarlas más rápido.</p>
        <a href="./index.html" class="shop-btn">IR A LA TIENDA</a>
      </div>
    `;
    return;
  }

  favoritos.forEach(producto => {
    container.innerHTML += `
      <div class="product-card favorite-card" data-id="${producto.productoId || producto.id}">
        <div class="product-image-wrap">
          <img src="../assets/${producto.imagen}" alt="${producto.nombre}">
          <button class="remove-icon-btn" data-id="${producto.productoId || producto.id}" title="Quitar de favoritos">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="product-info">
          <p class="product-name">${producto.nombre}</p>
          <p class="product-price">$${Number(producto.precio).toLocaleString("es-AR")}</p>
        </div>
      </div>
    `;
  });

  activarBotonesEliminar();
  activarCards();
}

// ─── ELIMINAR FAVORITO ────────────────────────────────────
async function eliminarFavorito(idProducto) {
  // Eliminar del backend
  try {
    await Auth.fetchConToken("http://localhost:4000/api/eliminarFavorito", {
      method: "DELETE",
      body: JSON.stringify({
        id_usuario:  usuario.id_usuario,
        id_producto: Number(idProducto),
      }),
    });
  } catch (err) { /* silencioso */ }

  // Eliminar localmente
  favoritos = favoritos.filter(p => Number(p.productoId || p.id) !== Number(idProducto));
  localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos));
  renderizarFavoritos();
}

function activarBotonesEliminar() {
  document.querySelectorAll(".remove-icon-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      eliminarFavorito(btn.dataset.id);
    });
  });
}

function activarCards() {
  document.querySelectorAll(".favorite-card").forEach(card => {
    card.addEventListener("click", () => {
      window.location.href = `producto.html?id=${card.dataset.id}`;
    });
  });
}

// ─── INIT ─────────────────────────────────────────────────
cargarFavoritos();