Auth.inicializarModo();

const themeButton =
    document.getElementById("themeButton");

const themeIcon =
    document.getElementById("themeIcon");

// ACTUALIZAR ICONO
function actualizarIconoTema(){

    const modo =
        document.documentElement.getAttribute("data-modo");

    // MODO CLARO
    if(modo === "claro"){

        themeIcon.classList.remove("fa-moon");

        themeIcon.classList.add("fa-sun");

    }

    // MODO OSCURO
    else{

        themeIcon.classList.remove("fa-sun");

        themeIcon.classList.add("fa-moon");

    }

}

// EVENTO
themeButton.addEventListener("click", () => {

    Auth.toggleModo();

    actualizarIconoTema();

});

// ICONO INICIAL
actualizarIconoTema();


/* LOCAL STORAGE */

let carrito =
JSON.parse(
    localStorage.getItem("carrito")
) || [];

const cartProducts =
    document.getElementById("cartProducts");

const subtotal =
    document.getElementById("subtotal");

const total =
    document.getElementById("total");

const cartCounter =
    document.getElementById("cartCounter");

const cartSubtitle =
    document.getElementById("cartSubtitle");

const checkoutButton =
    document.getElementById("checkoutButton");


function renderizarCarrito(){

    // LIMPIAR HTML
    cartProducts.innerHTML = "";

    // TOTAL
    let totalGeneral = 0;

    // RECORRER PRODUCTOS
    carrito.forEach((producto) => {

        totalGeneral +=
            producto.precio * producto.cantidad;

        // HTML
        const productoHTML = `

            <article class="cart-product">

                <!-- IMAGEN -->
                <div class="cart-product-image">

                    <img
                        src="${producto.imagen}"
                        alt="${producto.nombre}">

                </div>

                <!-- INFO -->
                <div class="cart-product-info">

                    <!-- TOP -->
                    <div class="cart-product-top">

                        <div>

                            <h2>
                                ${producto.nombre}
                            </h2>

                            <p class="product-category">
                                ${producto.categoria}
                            </p>

                        </div>

                        <!-- ELIMINAR -->
                        <button
                            class="btn-remove"
                            data-id="${producto.id}">

                            <i class="fa-solid fa-xmark"></i>

                        </button>

                    </div>

                    <!-- DETALLES -->
                    <div class="product-details">

                        <p>
                            Talle: ${producto.talle}
                        </p>

                        <p>
                            Color: ${producto.color}
                        </p>

                        <p>
                            Cantidad: ${producto.cantidad}
                        </p>

                    </div>

                    <!-- PRECIO -->
                    <div class="product-price">

                        $${producto.precio.toLocaleString("es-AR")}

                    </div>

                </div>

            </article>

        `;

        // INSERTAR
        cartProducts.innerHTML +=
            productoHTML;

    });

    // TOTAL
    subtotal.textContent =
        `$${totalGeneral.toLocaleString("es-AR")}`;

    total.textContent =
        `$${totalGeneral.toLocaleString("es-AR")}`;

    // CONTADOR
    cartCounter.textContent =
        carrito.length;

    // SUBTITULO
    cartSubtitle.textContent =
        `${carrito.length} productos agregados`;

    // EVENTOS
    agregarEventosEliminar();

}


function eliminarProducto(idProducto){

    carrito =
        carrito.filter((producto) => {

            return producto.id !== idProducto;

        });

    /* ACTUALIZAR STORAGE */

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );

    /* SI ESTÁ VACÍO */

    if(carrito.length === 0){

        localStorage.removeItem(
            "carrito"
        );

    }

    renderizarCarrito();

}


function agregarEventosEliminar(){

    const botonesEliminar =
        document.querySelectorAll(".btn-remove");

    botonesEliminar.forEach((boton) => {

        boton.addEventListener("click", () => {

            const id =
                Number(boton.dataset.id);

            eliminarProducto(id);

        });

    });

}


checkoutButton.addEventListener("click", () => {

    // VALIDAR
    if(carrito.length === 0){

        alert("El carrito está vacío");

        return;

    }

    // REDIRECCIONAR
    window.location.href =
        "./pago.html";

});


renderizarCarrito();