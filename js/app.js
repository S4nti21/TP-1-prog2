let carrito = [];

/* CONTAINER */

const container =
document.getElementById(
  "productsContainer"
);

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

      renderProducts([
        {
          nombre:"MEDIC CREME ZIP HOODIE",
          precio:148500
        },
        {
          nombre:"WARFARE HOODIE",
          precio:129900
        },
        {
          nombre:"BLACK DENIM",
          precio:189000
        },
        {
          nombre:"STREET JACKET",
          precio:220000
        }
      ]);

    }else{

      /* ADAPTAR BACKEND */

      const productosBackend =
      data.payload.map(product => ({

        nombre: product.producto,
        precio: product.precio

      }));

      renderProducts(productosBackend);

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

    container.innerHTML += `

      <div class="product-card">

        <div class="product-info">

          <div>

            <p class="product-category">
              STREETWEAR
            </p>

            <h3>
              ${product.nombre}
            </h3>

          </div>

          <div>

            <p class="product-price">
              $${product.precio}
            </p>

            <button
              class="add-cart-btn"
              data-name="${product.nombre}"
              data-price="${product.precio}"
            >
              AGREGAR AL CARRITO
            </button>

          </div>

        </div>

      </div>

    `;

  });

  /* ACTIVAR ANIMACIONES */

  activarAnimaciones();

  /* ACTIVAR BOTONES */

  activarBotonesCarrito();

}

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

  const producto = {

    nombre,
    precio

  };

  carrito.push(producto);

  console.log(carrito);

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

/* INIT */

obtenerProductos();