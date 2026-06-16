Auth.inicializarModo();

// VERIFICAR SESIÓN
if (!Auth.obtenerUsuarioLogueado()) {
    window.location.href = "./login.html";
}

const themeButton =
    document.getElementById("themeButton");

const themeIcon =
    document.getElementById("themeIcon");

if (themeButton && themeIcon) {

    actualizarIconoTema();

    themeButton.addEventListener("click", () => {

        Auth.toggleModo();

        actualizarIconoTema();

    });

}

// ACTUALIZAR ICONO
function actualizarIconoTema() {

    const modo =
        document.documentElement.getAttribute("data-modo");

    // MODO CLARO
    if (modo === "claro") {

        themeIcon.classList.remove("fa-moon");

        themeIcon.classList.add("fa-sun");

    }

    // MODO OSCURO
    else {

        themeIcon.classList.remove("fa-sun");

        themeIcon.classList.add("fa-moon");

    }

}

/* LOCAL STORAGE */

const usuario = Auth.obtenerUsuarioLogueado();
const CARRITO_KEY = `carrito_${usuario.id_usuario}`;

let carrito =
    JSON.parse(
        localStorage.getItem(CARRITO_KEY)
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


function renderizarCarrito() {

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

<div class="product-card cart-card">

    <div class="product-image-wrap">

        <img
            src="${producto.imagen}"
            alt="${producto.nombre}"
        >

        <button
            class="btn-remove"
            data-id="${producto.id}"
        >
            <i class="fa-solid fa-xmark"></i>
        </button>

    </div>

    <div class="product-info">

        <div class="product-info-top">

            <p class="product-name">
                ${producto.nombre}
            </p>

            <p class="product-price">
                $${producto.precio.toLocaleString("es-AR")}
            </p>

            <p class="product-category">
                ${producto.categoria}
            </p>

            <p class="product-details">
                Talle: ${producto.talle || "-"}
            </p>

            <p class="product-details">
                Cantidad: ${producto.cantidad}
            </p>

        </div>

    </div>

</div>

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


function eliminarProducto(idProducto) {

    carrito =
        carrito.filter((producto) => {

            return String(producto.id) !== String(idProducto);

        });

    /* ACTUALIZAR STORAGE */

    localStorage.setItem(
        CARRITO_KEY,
        JSON.stringify(carrito)
    );

    /* SI ESTÁ VACÍO */

    if (carrito.length === 0) {

        localStorage.removeItem(CARRITO_KEY);

    }

    renderizarCarrito();

}


function agregarEventosEliminar() {

    const botonesEliminar =
        document.querySelectorAll(".btn-remove");

    botonesEliminar.forEach((boton) => {

        boton.addEventListener("click", () => {

            const id = boton.dataset.id;
            eliminarProducto(id);

        });

    });

}


checkoutButton.addEventListener("click", () => {

    // VALIDAR
    if (carrito.length === 0) {

        alert("El carrito está vacío");

        return;

    }

    // REDIRECCIONAR
    window.location.href =
        "./pago.html";

});


renderizarCarrito();