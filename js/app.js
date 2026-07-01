const usuario = Auth.obtenerUsuarioLogueado();

const FAVORITOS_KEY = usuario ? `favoritos_${usuario.id_usuario}` : "favoritos";
const CARRITO_KEY   = usuario ? `carrito_${usuario.id_usuario}`   : "carrito";

let favoritos = JSON.parse(localStorage.getItem(FAVORITOS_KEY)) || [];

// ─── DROPDOWN ────────────────────────────────────────────

const dropdown    = document.querySelector(".dropdown");
const dropdownBtn = document.querySelector(".dropdown-btn");

dropdownBtn.addEventListener("click", () => {
  dropdown.classList.toggle("active");
});

const categoryLinks = document.querySelectorAll(".mega-menu a");
categoryLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const category = link.dataset.filter;
    filtrarProductos(category);
    dropdown.classList.remove("active");
    setTimeout(() => {
      const section = document.querySelector(".products-section");
      window.scrollTo({ top: section.offsetTop - 90, behavior: "smooth" });
    }, 150);
  });
});

// ─── CARRITO / PRODUCTOS ──────────────────────────────────

let carrito = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
let todosLosProductos = [];

const container   = document.getElementById("productsContainer");
const searchBtn   = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", () => {
    searchInput.classList.toggle("active");
    if (searchInput.classList.contains("active")) searchInput.focus();
  });
}

function buscarProductos() {
  const texto = searchInput.value.toLowerCase().trim();
  if (texto === "") { renderProducts(todosLosProductos); return; }

  const resultados = todosLosProductos.filter(p =>
    p.nombre.toLowerCase().includes(texto)
  );

  if (resultados.length === 0) {
    container.innerHTML = `<div class="no-results">No se encontraron productos.</div>`;
    return;
  }
  renderProducts(resultados);
  const section = document.querySelector(".products-section");
  window.scrollTo({ top: section.offsetTop - document.querySelector(".header").offsetHeight, behavior: "smooth" });
}

if (searchBtn && searchInput) {
  searchInput.addEventListener("keydown", e => { if (e.key === "Enter") buscarProductos(); });
  searchBtn.addEventListener("click", () => {
    if (!searchInput.classList.contains("active")) {
      searchInput.classList.add("active");
      searchInput.focus();
      return;
    }
    buscarProductos();
  });
}

// ─── OBTENER PRODUCTOS DESDE EL BACKEND ───────────────────

async function obtenerProductos() {
  try {
    const response = await fetch("http://localhost:4000/api/obtenerProductos");
    const data     = await response.json();

    // El backend devuelve idProducto (no id ni _id), y "producto" para el nombre
    if (data.payload && data.payload.length > 0) {
      todosLosProductos = data.payload.map(p => ({
        id:        p.idProducto,
        nombre:    p.producto,
        precio:    Number(p.precio),
        categoria: p.categoria   || "general",
        imagen:    p.ulrImagen   || p.imagen || "placeholder.png",
        genero:    p.genero      || "unisex",
        color:     p.color       || "",
        stock:     p.stock !== undefined ? p.stock : 10,
      }));
    } else {
      // Fallback: la BD está vacía, usar datos locales
      todosLosProductos = productosLocalesFallback();
    }

    // Sincronizar favoritos desde el backend si hay sesión
    if (usuario) await sincronizarFavoritos();

    renderProducts(todosLosProductos);

  } catch (error) {
    console.error("Error obteniendo productos:", error);
    todosLosProductos = productosLocalesFallback();
    renderProducts(todosLosProductos);
  }
}

function productosLocalesFallback() {
  return [];
}

// ─── SINCRONIZAR FAVORITOS CON LA API ─────────────────────

async function sincronizarFavoritos() {
  if (!usuario) return;
  try {
    const res  = await Auth.fetchConToken(`http://localhost:4000/api/obtenerFavoritos/${usuario.id_usuario}`);
    const data = await res.json();
    if (data.codigo === 200 && data.payload) {
      // La API devuelve solo idProducto; guardamos los ids en localStorage
      const ids = data.payload.map(f => f.idProducto);
      // Reconstruir favoritos locales manteniendo los datos del producto
      const favoritosActualizados = ids.map(idProd => {
        // Si ya lo teníamos localmente con datos completos, lo reutilizamos
        const existente = favoritos.find(f => Number(f.productoId) === Number(idProd));
        if (existente) return existente;
        // Si no, creamos entrada mínima; se completará cuando el usuario visite el producto
        return { id: Date.now() + idProd, productoId: idProd, nombre: "", precio: 0, imagen: "" };
      });
      favoritos = favoritosActualizados;
      localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos));
    }
  } catch (e) {
    // Si falla la API, usamos los favoritos locales sin problema
  }
}

// ─── RENDER DE PRODUCTOS ──────────────────────────────────

function renderProducts(products) {
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = `<div class="no-results" style="grid-column:1/-1; text-align:center; padding:60px 0; color:#999; letter-spacing:2px; text-transform:uppercase; font-size:.85rem;">No hay productos disponibles</div>`;
    return;
  }

  products.forEach(product => {
    const esFavorito = favoritos.some(f =>
      Number(f.productoId) === Number(product.id) || f.nombre === product.nombre
    );

    const stock    = product.stock !== undefined ? Number(product.stock) : 10;
    const sinStock = stock === 0;

    let stockTexto, stockClase;
    if (sinStock) {
      stockTexto = "Sin unidades disponibles";
      stockClase = "product-stock stock-bajo";
    } else if (stock <= 3) {
      stockTexto = `¡Últimas ${stock} unidades!`;
      stockClase = "product-stock stock-bajo";
    } else {
      stockTexto = `Stock: ${stock} unidades`;
      stockClase = "product-stock stock-ok";
    }

    const overlayHTML = sinStock
      ? `<div class="out-of-stock-overlay"><span class="out-of-stock-label">SIN STOCK</span></div>`
      : "";

    container.innerHTML += `
      <div
        class="product-card"
        data-id="${product.id}"
        data-category="${product.categoria}"
        data-genero="${product.genero || 'unisex'}"
        data-color="${product.color || ''}">

        <div class="product-image-wrap">
          ${overlayHTML}
          <span class="product-badge" style="display:none">BACK IN STOCK</span>
          <img src="../assets/${product.imagen}" alt="${product.nombre}">
          <button
            class="bookmark-btn"
            data-id="${product.id}"
            data-name="${product.nombre}"
            data-price="${product.precio}"
            data-image="${product.imagen}"
          >
            <i class="${esFavorito ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'}"></i>
          </button>
        </div>

        <div class="product-info">
          <div class="product-info-top">
            <p class="product-name">${product.nombre}</p>
            <p class="product-price">$${Number(product.precio).toLocaleString("es-AR")}</p>
            <p class="${stockClase}">${stockTexto}</p>
          </div>
        </div>

        <button
          class="add-cart-btn"
          data-id="${product.id}"
          data-name="${product.nombre}"
          data-price="${product.precio}"
          data-image="${product.imagen}"
          ${sinStock ? "disabled" : ""}
        >
          ${sinStock ? "SIN STOCK" : "AGREGAR AL CARRITO"}
        </button>

      </div>
    `;
  });

  activarAnimaciones();
  activarBotonesCarrito();
  activarBotonesFavoritos();
  activarClickProducto();
}

// ─── CLICK EN CARD → ir a producto ───────────────────────

function activarClickProducto() {
  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => {
      window.location.href = `producto.html?id=${card.dataset.id}`;
    });
  });
}

// ─── FAVORITOS ────────────────────────────────────────────

function activarBotonesFavoritos() {
  document.querySelectorAll(".bookmark-btn").forEach(btn => {
    btn.addEventListener("click", agregarAFavoritos);
  });
}

function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");
  toast.textContent = mensaje;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

async function agregarAFavoritos(e) {
  e.stopPropagation();

  const usuarioActual = Auth.obtenerUsuarioLogueado();
  if (!usuarioActual) {
    mostrarToast("Debes iniciar sesión para agregar a favoritos");
    setTimeout(() => { window.location.href = "./login.html"; }, 1500);
    return;
  }

  const FAV_KEY = `favoritos_${usuarioActual.id_usuario}`;
  favoritos = JSON.parse(localStorage.getItem(FAV_KEY)) || [];

  const boton   = e.currentTarget;
  const nombre  = boton.dataset.name;
  const precio  = boton.dataset.price;
  const imagen  = boton.dataset.image;
  const idProd  = Number(boton.dataset.id);

  const existe = favoritos.find(p => Number(p.productoId) === idProd);

  if (existe) {
    // Eliminar favorito
    favoritos = favoritos.filter(p => Number(p.productoId) !== idProd);
    boton.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
    mostrarToast(`${nombre} eliminado de favoritos`);

    // Sincronizar con la API
    try {
      await Auth.fetchConToken("http://localhost:4000/api/eliminarFavorito", {
        method: "DELETE",
        body: JSON.stringify({ id_usuario: usuarioActual.id_usuario, id_producto: idProd }),
      });
    } catch (err) { /* silencioso, el localStorage ya está actualizado */ }

  } else {
    // Agregar favorito
    favoritos.push({ id: Date.now(), productoId: idProd, nombre, precio, imagen });
    boton.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
    mostrarToast(`${nombre} agregado a favoritos`);

    // Sincronizar con la API
    try {
      await Auth.fetchConToken("http://localhost:4000/api/agregarFavorito", {
        method: "POST",
        body: JSON.stringify({ id_producto: idProd, id_usuario: usuarioActual.id_usuario }),
      });
    } catch (err) { /* silencioso */ }
  }

  localStorage.setItem(FAV_KEY, JSON.stringify(favoritos));
  actualizarContadorFavoritos();
}

function actualizarContadorFavoritos() {
  const u   = Auth.obtenerUsuarioLogueado();
  const key = u ? `favoritos_${u.id_usuario}` : "favoritos";
  const favs = JSON.parse(localStorage.getItem(key)) || [];
  const contador = document.getElementById("favoritesCounter");
  if (contador) contador.textContent = favs.length;
}

// ─── CARRITO ─────────────────────────────────────────────
// Desde el listado general redirigimos al producto para que
// el usuario elija talle antes de agregar (es ropa).

function activarAnimaciones() {
  const cards = document.querySelectorAll(".product-card");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("show");
    });
  }, { threshold: 0.15 });
  cards.forEach(card => observer.observe(card));
}


function activarBotonesCarrito() {
  document.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.addEventListener("click", irAProducto);
  });
}

function irAProducto(e) {
  e.stopPropagation();

  const usuarioActual = Auth.obtenerUsuarioLogueado();
  if (!usuarioActual) {
    mostrarToast("Debes iniciar sesión para agregar al carrito");
    setTimeout(() => { window.location.href = "./login.html"; }, 1500);
    return;
  }

  const id = e.currentTarget.dataset.id;
  window.location.href = `producto.html?id=${id}`;
}

function actualizarContador() {
  const u   = Auth.obtenerUsuarioLogueado();
  const key = u ? `carrito_${u.id_usuario}` : "carrito";
  const cart = JSON.parse(localStorage.getItem(key)) || [];
  const total = cart.reduce((acc, p) => acc + (p.cantidad || 1), 0);
  const counter = document.getElementById("cartCounter");
  if (counter) counter.textContent = total;
}

// ─── FILTROS ──────────────────────────────────────────────

const filtros = document.querySelectorAll("[data-filter]");
filtros.forEach(filtro => {
  filtro.addEventListener("click", e => {
    e.preventDefault();
    filtrarProductos(filtro.dataset.filter);
  });
});

function filtrarProductos(categoria) {
  document.querySelectorAll(".product-card").forEach(card => {
    card.style.display = (categoria === "all" || card.dataset.category === categoria) ? "flex" : "none";
  });
  document.querySelector(".products-section").scrollIntoView({ behavior: "smooth", block: "start" });
}

let filtroGeneroActivo = "all";
let filtroColorActivo  = "all";

function aplicarFiltrosCombinados() {
  document.querySelectorAll(".product-card").forEach(card => {
    const pasaGenero = filtroGeneroActivo === "all" || (card.dataset.genero || "all") === filtroGeneroActivo;
    const pasaColor  = filtroColorActivo  === "all" || (card.dataset.color  || "all") === filtroColorActivo;
    card.style.display = (pasaGenero && pasaColor) ? "flex" : "none";
  });
}

document.querySelectorAll("#filtroGenero .filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#filtroGenero .filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filtroGeneroActivo = btn.dataset.genero;
    aplicarFiltrosCombinados();
  });
});

document.querySelectorAll("#filtroColor .filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#filtroColor .filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filtroColorActivo = btn.dataset.color;
    aplicarFiltrosCombinados();
  });
});

const resetFiltros = document.getElementById("resetFiltros");
if (resetFiltros) {
  resetFiltros.addEventListener("click", () => {
    filtroGeneroActivo = "all";
    filtroColorActivo  = "all";
    document.querySelectorAll("#filtroGenero .filter-btn").forEach(b => b.classList.toggle("active", b.dataset.genero === "all"));
    document.querySelectorAll("#filtroColor .filter-btn").forEach(b => b.classList.toggle("active", b.dataset.color === "all"));
    document.querySelectorAll(".product-card").forEach(c => c.style.display = "flex");
  });
}

// ─── HEADER SCROLL ───────────────────────────────────────

const header          = document.querySelector(".header");
const productsSection = document.querySelector(".products-section");

window.addEventListener("scroll", () => {
  const sectionTop   = productsSection.getBoundingClientRect().top;
  const headerHeight = header.offsetHeight;
  header.classList.toggle("scrolled", sectionTop <= headerHeight);
});

// ─── PRELOADER ───────────────────────────────────────────

window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("preloader")?.classList.add("hide");
  }, 1500);
});

// ─── SLIDER ──────────────────────────────────────────────

const slider = document.getElementById("heroSlider");
const slides = document.querySelectorAll(".hero-slide");
let sliderIndex = 0;

setInterval(() => {
  sliderIndex++;
  slider.style.transition = "transform 1s ease";
  slider.style.transform  = `translateX(-${sliderIndex * 100}vw)`;
  if (sliderIndex === slides.length - 1) {
    setTimeout(() => {
      slider.style.transition = "none";
      sliderIndex = 0;
      slider.style.transform  = "translateX(0)";
    }, 1000);
  }
}, 3000);

// ─── PERFIL Y ROL ────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const profileBtn = document.getElementById("profileBtn");
  if (profileBtn) {
    profileBtn.style.display = Auth.verificarSesion(false) ? "inline-flex" : "none";
  }
  Auth.aplicarPermisosPorRol();
});

const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", () => Auth.cerrarSesion());
}

// ─── INIT ────────────────────────────────────────────────

obtenerProductos();
actualizarContador();
actualizarContadorFavoritos();