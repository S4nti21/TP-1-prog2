// MODO OSCURO
Auth.inicializarModo();

const themeButton = document.getElementById("themeButton");
const themeIcon = document.getElementById("themeIcon");

function actualizarIconoTema() {
  const modo = document.documentElement.getAttribute("data-modo");
  if (modo === "claro") {
    themeIcon.classList.replace("fa-moon", "fa-sun");
  } else {
    themeIcon.classList.replace("fa-sun", "fa-moon");
  }
}

themeButton.addEventListener("click", () => {
  Auth.toggleModo();
  actualizarIconoTema();
});

actualizarIconoTema();

let favoritos =
  JSON.parse(
    localStorage.getItem("favoritos")
  ) || [];

const dropdown =
  document.querySelector(
    ".dropdown"
  );

const dropdownBtn =
  document.querySelector(
    ".dropdown-btn"
  );

dropdownBtn.addEventListener(
  "click",
  () => {

    dropdown.classList.toggle(
      "active"
    );

  }
);

const categoryLinks =
  document.querySelectorAll(
    ".mega-menu a"
  );

categoryLinks.forEach(link => {

  link.addEventListener(
    "click",
    e => {

      e.preventDefault();

      const category =
        link.dataset.filter;

      filtrarProductos(category);

      /* CERRAR MENU */

      dropdown.classList.remove(
        "active"
      );

      /* SCROLL */

      setTimeout(() => {

        const section =
          document.querySelector(
            ".products-section"
          );

        const headerHeight = 90;

        const sectionPosition =
          section.offsetTop - headerHeight;

        window.scrollTo({

          top: sectionPosition,

          behavior: "smooth"

        });

      }, 150);

    }
  );

});

let carrito =
  JSON.parse(
    localStorage.getItem("carrito")
  ) || [];

let todosLosProductos = [];

/* CONTAINER */

const container =
  document.getElementById(
    "productsContainer"
  );

const searchBtn =
  document.getElementById("searchBtn");

const searchInput =
  document.getElementById("searchInput");

if (searchBtn && searchInput) {

  searchBtn.addEventListener(
    "click",
    () => {

      searchInput.classList.toggle(
        "active"
      );

      if (
        searchInput.classList.contains(
          "active"
        )
      ) {

        searchInput.focus();

      }

    }
  );

}

function buscarProductos() {

  const texto =
    searchInput.value
      .toLowerCase()
      .trim();

  /* SI EL INPUT ESTA VACIO */

  if (texto === "") {

    renderProducts(
      todosLosProductos
    );

    return;

  }

  const resultados =
    todosLosProductos.filter(product =>

      product.nombre
        .toLowerCase()
        .includes(texto)

    );

  /* SI NO HAY RESULTADOS */

  if (resultados.length === 0) {

    container.innerHTML = `
      <div class="no-results">
        No se encontraron productos.
      </div>
    `;

    return;

  }

  /* MOSTRAR RESULTADOS */

  renderProducts(resultados);

  /* SCROLL A PRODUCTOS */

  const section =
    document.querySelector(
      ".products-section"
    );

  const headerHeight =
    document.querySelector(
      ".header"
    ).offsetHeight;

  window.scrollTo({

    top:
      section.offsetTop -
      headerHeight,

    behavior: "smooth"

  });

}

if (searchBtn && searchInput) {

  searchInput.addEventListener(
    "keydown",
    e => {

      if (e.key === "Enter") {

        buscarProductos();

      }

    }
  );

  searchBtn.addEventListener(
    "click",
    () => {

      if (
        !searchInput.classList.contains(
          "active"
        )
      ) {

        searchInput.classList.add(
          "active"
        );

        searchInput.focus();

        return;

      }

      buscarProductos();

    }
  );

}

/* OBTENER PRODUCTOS */

async function obtenerProductos() {

  try {

    const response =
      await fetch(
        "http://localhost:4000/api/obtenerProductos"
      );

    const data =
      await response.json();

    console.log(data);

    /* SI NO HAY PRODUCTOS EN DB */

    if (data.payload.length === 0) {

      todosLosProductos = [

        { id: 1, nombre: "MEDIC CREME ZIP HOODIE", precio: 148500, categoria: "hoodies", imagen: "medic.png", genero: "unisex", color: "Crema" },
        { id: 2, nombre: "WARFARE HOODIE", precio: 129900, categoria: "hoodies", imagen: "warfare.png", genero: "hombre", color: "Negro" },
        { id: 3, nombre: "BLACK DENIM", precio: 189000, categoria: "pantalones", imagen: "black denim.png", genero: "hombre", color: "Negro" },
        { id: 4, nombre: "STREET JACKET", precio: 220000, categoria: "camperas", imagen: "street jacket.png", genero: "unisex", color: "Gris" },
        { id: 5, nombre: "ESSENTIAL TEE", precio: 78000, categoria: "remeras", imagen: "essentialtee.png", genero: "unisex", color: "Blanco" },
        { id: 6, nombre: "OVERSIZED TEE", precio: 82000, categoria: "remeras", imagen: "oversizedtee.png", genero: "unisex", color: "Negro" },
        { id: 7, nombre: "UTILITY PANTS", precio: 175000, categoria: "pantalones", imagen: "utilitypants.png", genero: "hombre", color: "Verde" },
        { id: 8, nombre: "TACTICAL HOODIE", precio: 158000, categoria: "hoodies", imagen: "tacticalhoodie.png", genero: "hombre", color: "Gris" },
        { id: 9, nombre: "CARGO PANTS", precio: 195000, categoria: "pantalones", imagen: "cargopants.png", genero: "unisex", color: "Beige" },
        { id: 10, nombre: "MINIMAL JACKET", precio: 248000, categoria: "camperas", imagen: "minimaljacket.png", genero: "unisex", color: "Negro" },

      ];

      renderProducts(todosLosProductos);

    } else {

      /* ADAPTAR BACKEND */

      const productosBackend =
        data.payload.map(product => ({

          id: product._id || product.id,
          nombre: product.producto || product.nombre,
          precio: Number(product.precio),
          categoria: product.categoria || "general",
          imagen: product.imagen || "placeholder.png",
          color: product.color || "",
          talles: product.talles || ["S", "M", "L", "XL"],
          stock: product.stock !== undefined ? product.stock : 10

        }));

      todosLosProductos = productosBackend;

      renderProducts(todosLosProductos);

    }

  } catch (error) {

    console.log(
      "ERROR:",
      error
    );

  }

}

/* RENDER */

function renderProducts(products) {

  container.innerHTML = "";

  products.forEach(product => {

    const esFavorito =
      favoritos.some(
        producto =>
          producto.nombre === product.nombre
      );

    container.innerHTML += `
      <div 
        class="product-card"
        data-id="${product.id}"
        data-category="${product.categoria}"
        data-genero="${product.genero || 'unisex'}"
        data-color="${product.color || ''}">
      
        <div class="product-image-wrap">
  
          <span class="product-badge" style="display:none">
            BACK IN STOCK
          </span>
  
          <img
            src="../assets/${product.imagen}"
            alt="${product.nombre}"
          >
  
          <button
            class="bookmark-btn"
            data-id="${product.id}"
            data-name="${product.nombre}"
            data-price="${product.precio}"
            data-image="${product.imagen}"
          >
  
            <i class="${esFavorito
        ? "fa-solid fa-bookmark"
        : "fa-regular fa-bookmark"
      }"></i>
  
          </button>
  
        </div>
  
        <div class="product-info">
  
          <div class="product-info-top">
  
            <p class="product-name">
              ${product.nombre}
            </p>
  
            <p class="product-price">
              $${Number(product.precio).toLocaleString("es-AR")}
            </p>
  
          </div>
  
        </div>
  
        <button
          class="add-cart-btn"
          data-name="${product.nombre}"
          data-price="${product.precio}"
          data-image="${product.imagen}"
          ${product.stock === 0 ? "disabled style=\"opacity:.4;cursor:not-allowed\"" : ""}
        >
          ${product.stock === 0 ? "SIN STOCK" : "AGREGAR AL CARRITO"}
        </button>
  
      </div>
    `;

  });

  activarAnimaciones();

  activarBotonesCarrito();

  activarBotonesFavoritos();

  activarClickProducto();

}

function activarClickProducto() {

  const cards =
    document.querySelectorAll(
      ".product-card"
    );

  cards.forEach(card => {

    card.addEventListener(
      "click",
      () => {

        const id =
          card.dataset.id;

        window.location.href =
          `producto.html?id=${id}`;

      }
    );

  });

}

function activarBotonesFavoritos() {

  const botones =
    document.querySelectorAll(
      ".bookmark-btn"
    );

  botones.forEach(btn => {

    btn.addEventListener(
      "click",
      agregarAFavoritos
    );

  });
}

function mostrarToast(mensaje) {

  const toast =
    document.getElementById("toast");

  toast.textContent =
    mensaje;

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove(
      "show"
    );

  }, 2500);

}

function agregarAFavoritos(e) {

  e.stopPropagation();

  // VERIFICAR LOGIN
  const usuario = Auth.obtenerUsuarioLogueado();
  if (!usuario) {
    mostrarToast("Debes iniciar sesión para agregar a favoritos");
    setTimeout(() => { window.location.href = "./login.html"; }, 1500);
    return;
  }

  const boton =
    e.currentTarget;

  const nombre =
    boton.dataset.name;

  const precio =
    boton.dataset.price;

  const imagen =
    boton.dataset.image;

  const url =
    boton.dataset.url;

  const existe =
    favoritos.find(
      producto =>
        producto.nombre === nombre
    );

  if (existe) {

    favoritos =
      favoritos.filter(
        producto =>
          producto.nombre !== nombre
      );

    boton.innerHTML =
      '<i class="fa-regular fa-bookmark"></i>';

    mostrarToast(
      `${nombre} eliminado de favoritos`
    );

  } else {

    favoritos.push({
      id: Date.now(),
      productoId: boton.dataset.id,
      nombre,
      precio,
      imagen
    });

    boton.innerHTML =
      '<i class="fa-solid fa-bookmark"></i>';

    mostrarToast(
      `${nombre} agregado a favoritos`
    );

  }

  localStorage.setItem(

    "favoritos",

    JSON.stringify(
      favoritos
    )

  );

  actualizarFavoritos();

}

function actualizarFavoritos() {

  const favoritos =
    JSON.parse(
      localStorage.getItem("favoritos")
    ) || [];

  const contador =
    document.getElementById(
      "favoritesCounter"
    );

  if (contador) {

    contador.textContent =
      favoritos.length;

  }

}

actualizarFavoritos();

/* SCROLL ANIMATION */

function activarAnimaciones() {

  const cards =
    document.querySelectorAll(
      ".product-card"
    );

  const observer =
    new IntersectionObserver(entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add(
            "show"
          );

        }

      });

    }, {
      threshold: 0.15
    });

  cards.forEach(card => {

    observer.observe(card);

  });

}

/* BOTONES CARRITO */

function activarBotonesCarrito() {

  const botones =
    document.querySelectorAll(
      ".add-cart-btn"
    );

  botones.forEach(btn => {

    btn.addEventListener(
      "click",
      agregarAlCarrito
    );

  });

}

/* AGREGAR AL CARRITO */

function agregarAlCarrito(e) {

  e.stopPropagation();

  // VERIFICAR LOGIN
  const usuario = Auth.obtenerUsuarioLogueado();
  if (!usuario) {
    mostrarToast("Debes iniciar sesion para agregar al carrito");
    setTimeout(() => { window.location.href = "./login.html"; }, 1500);
    return;
  }

  const nombre =
    e.target.dataset.name;

  const precio =
    e.target.dataset.price;

  const imagen =
    e.target.dataset.image;

  const producto = {

    id: Date.now(),

    nombre,

    precio: Number(precio),

    categoria: "Streetwear",

    talle: "M",

    color: "Negro",

    cantidad: 1,

    imagen: `../assets/${imagen}`

  };

  carrito.push(producto);

  localStorage.setItem(
    "carrito",
    JSON.stringify(carrito)
  );

  actualizarContador();

}

/* CONTADOR */

function actualizarContador() {

  const counter =
    document.getElementById(
      "cartCounter"
    );

  counter.textContent =
    carrito.length;

}

/* FILTROS */

const filtros =
  document.querySelectorAll(
    "[data-filter]"
  );

filtros.forEach(filtro => {

  filtro.addEventListener(
    "click",
    (e) => {

      e.preventDefault();

      const categoria =
        filtro.dataset.filter;

      filtrarProductos(
        categoria
      );

    }
  );

});

function filtrarProductos(categoria) {

  const cards =
    document.querySelectorAll(
      ".product-card"
    );

  cards.forEach(card => {

    if (categoria === "all") {

      card.style.display =
        "flex";

      return;

    }

    if (
      card.dataset.category ===
      categoria
    ) {

      card.style.display =
        "flex";

    } else {

      card.style.display =
        "none";

    }

  });

  /* SCROLL */

  document.querySelector(
    ".products-section"
  ).scrollIntoView({

    behavior: "smooth",
    block: "start"

  });

}

/* FILTROS GÉNERO Y COLOR */

let filtroGeneroActivo = "all";
let filtroColorActivo = "all";

function aplicarFiltrosCombinados() {

  const cards = document.querySelectorAll(".product-card");

  cards.forEach(card => {

    const generoCard = card.dataset.genero || "all";
    const colorCard = card.dataset.color || "all";

    const pasaGenero = filtroGeneroActivo === "all" || generoCard === filtroGeneroActivo;
    const pasaColor = filtroColorActivo === "all" || colorCard === filtroColorActivo;

    card.style.display = (pasaGenero && pasaColor) ? "flex" : "none";

  });

}

// BOTONES GÉNERO
const botonesGenero = document.querySelectorAll("#filtroGenero .filter-btn");
botonesGenero.forEach(btn => {
  btn.addEventListener("click", () => {
    botonesGenero.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filtroGeneroActivo = btn.dataset.genero;
    aplicarFiltrosCombinados();
  });
});

// BOTONES COLOR
const botonesColor = document.querySelectorAll("#filtroColor .filter-btn");
botonesColor.forEach(btn => {
  btn.addEventListener("click", () => {
    botonesColor.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filtroColorActivo = btn.dataset.color;
    aplicarFiltrosCombinados();
  });
});

// RESET
const resetFiltros = document.getElementById("resetFiltros");
if (resetFiltros) {
  resetFiltros.addEventListener("click", () => {
    filtroGeneroActivo = "all";
    filtroColorActivo = "all";
    botonesGenero.forEach(b => b.classList.toggle("active", b.dataset.genero === "all"));
    botonesColor.forEach(b => b.classList.toggle("active", b.dataset.color === "all"));
    document.querySelectorAll(".product-card").forEach(c => c.style.display = "flex");
  });
}

const header =
  document.querySelector(".header");

const productsSection =
  document.querySelector(".products-section");

window.addEventListener(
  "scroll",
  () => {

    const sectionTop =
      productsSection.getBoundingClientRect().top;

    const headerHeight =
      header.offsetHeight;

    if (sectionTop <= headerHeight) {

      header.classList.add(
        "scrolled"
      );

    } else {

      header.classList.remove(
        "scrolled"
      );

    }

  }
);

window.addEventListener(
  "load",
  () => {

    setTimeout(() => {

      document
        .getElementById(
          "preloader"
        )
        .classList.add(
          "hide"
        );

    }, 1500);

  }
);

const slider =
  document.getElementById("heroSlider");

const slides =
  document.querySelectorAll(".hero-slide");

let index = 0;

setInterval(() => {

  index++;

  slider.style.transition =
    "transform 1s ease";

  slider.style.transform =
    `translateX(-${index * 100}vw)`;

  // Llegó al clon
  if (index === slides.length - 1) {

    setTimeout(() => {

      slider.style.transition =
        "none";

      index = 0;

      slider.style.transform =
        "translateX(0)";

    }, 1000);

  }

}, 3000);

document.addEventListener("DOMContentLoaded", () => {

  const profileBtn =
    document.getElementById(
      "profileBtn"
    );

  if (!profileBtn) return;

  const haySesion =
    Auth.verificarSesion(false);

  profileBtn.style.display =
    haySesion
      ? "inline-flex"
      : "none";

});

document.addEventListener("DOMContentLoaded", () => {

  Auth.aplicarPermisosPorRol();

});

const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    Auth.cerrarSesion();
  });
}

/* INIT */

obtenerProductos();

actualizarContador();

/* ACTIVAR ANIMACIONES */

actualizarFavoritos();