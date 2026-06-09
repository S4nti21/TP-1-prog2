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
      "http://localhost:4000/obtenerProductos"
    );

    const products =
    await response.json();

    renderProducts(products);

  }catch(error){

    console.log(
      "Error obteniendo productos:",
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
              ${product.categoria || "STREETWEAR"}
            </p>

            <h3>
              ${product.nombre}
            </h3>

          </div>

          <div>

            <p class="product-price">
              $${product.precio}
            </p>

            <button>
              AGREGAR AL CARRITO
            </button>

          </div>

        </div>

      </div>

    `;

  });

  activarAnimaciones();

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

/* INIT */

obtenerProductos();