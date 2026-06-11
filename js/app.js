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

  top:sectionPosition,

  behavior:"smooth"

});

      },150);

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

if(searchBtn && searchInput){

  searchBtn.addEventListener(
    "click",
    () => {

      searchInput.classList.toggle(
        "active"
      );

      if(
        searchInput.classList.contains(
          "active"
        )
      ){

        searchInput.focus();

      }

    }
  );

}

function buscarProductos(){

  const texto =
  searchInput.value
  .toLowerCase()
  .trim();

  /* SI EL INPUT ESTA VACIO */

  if(texto === ""){

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

  if(resultados.length === 0){

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

    behavior:"smooth"

  });

}

if(searchBtn && searchInput){

  searchInput.addEventListener(
    "keydown",
    e => {

      if(e.key === "Enter"){

        buscarProductos();

      }

    }
  );

  searchBtn.addEventListener(
    "click",
    () => {

      if(
        !searchInput.classList.contains(
          "active"
        )
      ){

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

async function obtenerProductos(){

  try{

    const response =
    await fetch(
      "http://localhost:4000/api/obtenerProductos"
    );

    const data =
    await response.json();

    console.log(data);

    /* SI NO HAY PRODUCTOS EN DB */

    if(data.payload.length === 0){

      todosLosProductos = [

        {
          nombre:"MEDIC CREME ZIP HOODIE",
          precio:148500,
          categoria:"hoodies",
          imagen:"medic.png"

        },
      
        {
          nombre:"WARFARE HOODIE",
          precio:129900,
          categoria:"hoodies",
          imagen:"warfare.png"
        },
      
        {
          nombre:"BLACK DENIM",
          precio:189000,
          categoria:"pantalones",
          imagen:"black denim.png"
        },
      
        {
          nombre:"STREET JACKET",
          precio:220000,
          categoria:"camperas",
          imagen:"street jacket.png"
        },
      
        {
          nombre:"ESSENTIAL TEE",
          precio:78000,
          categoria:"remeras",
          imagen:"essentialtee.png"
        },
      
        {
          nombre:"OVERSIZED TEE",
          precio:82000,
          categoria:"remeras",
          imagen:"oversizedtee.png"
        },
      
        {
          nombre:"UTILITY PANTS",
          precio:175000,
          categoria:"pantalones",
          imagen:"utilitypants.png"
        },
      
        {
          nombre:"TACTICAL HOODIE",
          precio:158000,
          categoria:"hoodies",
          imagen:"tacticalhoodie.png"
        },
      
        {
          nombre:"CARGO PANTS",
          precio:195000,
          categoria:"pantalones",
          imagen:"cargopants.png"
        },
      
        {
          nombre:"MINIMAL JACKET",
          precio:248000,
          categoria:"camperas",
          imagen:"minimaljacket.png"
        }
      
      ];

      renderProducts(todosLosProductos);

    }else{

      /* ADAPTAR BACKEND */

      const productosBackend =
      data.payload.map(product => ({

        nombre: product.producto,
        precio: product.precio

      }));

      todosLosProductos = productosBackend;

      renderProducts(todosLosProductos);

    }

  }catch(error){

    console.log(
      "ERROR:",
      error
    );

  }

}

/* RENDER */

function renderProducts(products){

  container.innerHTML = "";

  products.forEach(product => {

    const esFavorito =
    favoritos.some(
      producto =>
      producto.nombre === product.nombre
    );
  
    container.innerHTML += `
      <div class="product-card" data-category="${product.categoria}">
      
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
            data-name="${product.nombre}"
            data-price="${product.precio}"
            data-image="${product.imagen}"
          >
  
            <i class="${
              esFavorito
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
        >
          AGREGAR AL CARRITO
        </button>
  
      </div>
    `;
  
  });

  activarAnimaciones();

  activarBotonesCarrito();

  activarBotonesFavoritos();

  }

  function activarBotonesFavoritos(){

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

  function mostrarToast(mensaje){

    const toast =
    document.getElementById("toast");

    toast.textContent =
    mensaje;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    },2500);

}

function agregarAFavoritos(e){

  const boton =
  e.currentTarget;

  const nombre =
  boton.dataset.name;

  const precio =
  boton.dataset.price;

  const imagen =
  boton.dataset.image;

  const existe =
  favoritos.find(
      producto =>
      producto.nombre === nombre
  );

  if(existe){

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

  }else{

      favoritos.push({

          id: Date.now(),

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

  function actualizarFavoritos(){

    const favoritos =
    JSON.parse(
      localStorage.getItem("favoritos")
    ) || [];
  
    const contador =
    document.getElementById(
      "favoritesCounter"
    );
  
    if(contador){
  
      contador.textContent =
      favoritos.length;
  
    }
  
  }

  actualizarFavoritos();

/* SCROLL ANIMATION */

function activarAnimaciones(){

  const cards =
  document.querySelectorAll(
    ".product-card"
  );

  const observer =
  new IntersectionObserver(entries => {

    entries.forEach(entry => {

      if(entry.isIntersecting){

        entry.target.classList.add(
          "show"
        );

      }

    });

  },{
    threshold:0.15
  });

  cards.forEach(card => {

    observer.observe(card);

  });

}

/* BOTONES CARRITO */

function activarBotonesCarrito(){

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

function agregarAlCarrito(e){

  const nombre =
  e.target.dataset.name;

  const precio =
  e.target.dataset.price;

  const imagen =
  e.target.dataset.image;

  const producto = {

    id: Date.now(),

    nombre,

    precio:Number(precio),

    categoria:"Streetwear",

    talle:"M",

    color:"Negro",

    cantidad:1,

    imagen:`../assets/${imagen}`

  };

  carrito.push(producto);

  localStorage.setItem(
    "carrito",
    JSON.stringify(carrito)
  );

  actualizarContador();

}

/* CONTADOR */

function actualizarContador(){

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

function filtrarProductos(categoria){

  const cards =
  document.querySelectorAll(
    ".product-card"
  );

  cards.forEach(card => {

    if(categoria === "all"){

      card.style.display =
      "flex";

      return;

    }

    if(
      card.dataset.category ===
      categoria
    ){

      card.style.display =
      "flex";

    }else{

      card.style.display =
      "none";

    }

  });

  /* SCROLL */

  document.querySelector(
    ".products-section"
  ).scrollIntoView({

    behavior:"smooth",
    block:"start"

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

    if(sectionTop <= headerHeight){

      header.classList.add(
        "scrolled"
      );

    }else{

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

    },1500);

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
  if(index === slides.length - 1){

    setTimeout(() => {

      slider.style.transition =
      "none";

      index = 0;

      slider.style.transform =
      "translateX(0)";

    },1000);

  }

},3000);

/* INIT */

obtenerProductos();

actualizarContador();

  /* ACTIVAR ANIMACIONES */

  actualizarFavoritos();