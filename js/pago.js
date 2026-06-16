Auth.inicializarModo();

// VERIFICAR SESIÓN
if (!Auth.obtenerUsuarioLogueado()) {
    window.location.href = "./login.html";
}

const themeButton =
    document.getElementById("themeButton");

const themeIcon =
    document.getElementById("themeIcon");

// ACTUALIZAR ICONO
function actualizarIconoTema() {

    const modo =
        document.documentElement.getAttribute("data-modo");

    // CLARO
    if (modo === "claro") {

        themeIcon.classList.remove("fa-moon");

        themeIcon.classList.add("fa-sun");

    }

    // OSCURO
    else {

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

/* LEER CARRITO REAL DEL LOCALSTORAGE */

const productos =
    JSON.parse(localStorage.getItem("carrito")) || [];

const summaryProducts =
    document.getElementById("summaryProducts");

const paymentTotal =
    document.getElementById("paymentTotal");

const paymentMethod =
    document.getElementById("paymentMethod");

const cardFields =
    document.getElementById("cardFields");

const paymentForm =
    document.getElementById("paymentForm");

const paymentMessage =
    document.getElementById("paymentMessage");

// INPUTS
const cardNumber =
    document.getElementById("cardNumber");

const cardName =
    document.getElementById("cardName");

const cardDate =
    document.getElementById("cardDate");

const cardCvv =
    document.getElementById("cardCvv");

function renderizarProductos() {

    // CARRITO VACIO
    if (productos.length === 0) {

        summaryProducts.innerHTML = `
            <p style="color:#999; font-size:.85rem;">
                No hay productos en el carrito.
            </p>
        `;

        paymentTotal.textContent = "$0";

        return;

    }

    // LIMPIAR
    summaryProducts.innerHTML = "";

    // TOTAL
    let total = 0;

    // RECORRER
    productos.forEach((producto) => {

        total += producto.precio * producto.cantidad;

        // HTML
        const productoHTML = `

            <div class="summary-product">

                <!-- IMAGE -->
                <div class="summary-product-image">

                    <img
                        src="${producto.imagen}"
                        alt="${producto.nombre}">

                </div>

                <!-- INFO -->
                <div class="summary-product-info">

                    <h3>
                        ${producto.nombre}
                    </h3>

                    <p>
                        Talle ${producto.talle}
                    </p>

                    <p>
                        Cantidad: ${producto.cantidad}
                    </p>

                </div>

                <!-- PRICE -->
                <span>

                    $${(producto.precio * producto.cantidad).toLocaleString("es-AR")}

                </span>

            </div>

        `;

        // INSERTAR
        summaryProducts.innerHTML +=
            productoHTML;

    });

    // MOSTRAR TOTAL
    paymentTotal.textContent =
        `$${total.toLocaleString("es-AR")}`;

}

paymentMethod.addEventListener("change", () => {

    const metodo =
        paymentMethod.value;

    // MOSTRAR
    if (
        metodo === "debito" ||
        metodo === "credito"
    ) {

        cardFields.style.display =
            "block";

    }

    // OCULTAR
    else {

        cardFields.style.display =
            "none";

    }

});

paymentForm.addEventListener("submit", (event) => {

    // EVITAR RECARGA
    event.preventDefault();

    // LIMPIAR MENSAJE
    paymentMessage.textContent = "";

    paymentMessage.className =
        "payment-message";

    // METODO
    const metodo =
        paymentMethod.value;

    // VALIDAR METODO
    if (metodo === "") {

        paymentMessage.textContent =
            "Selecciona un método de pago";

        paymentMessage.classList.add("error");

        return;

    }

    // VALIDAR TARJETA
    if (
        metodo === "debito" ||
        metodo === "credito"
    ) {

        if (
            cardNumber.value.trim() === "" ||
            cardName.value.trim() === "" ||
            cardDate.value.trim() === "" ||
            cardCvv.value.trim() === ""
        ) {

            paymentMessage.textContent =
                "Completa todos los datos de la tarjeta";

            paymentMessage.classList.add("error");

            return;

        }

    }

    // EXITO — vaciar el carrito
    localStorage.removeItem("carrito");

    paymentMessage.textContent =
        "¡Pago aprobado con éxito! Gracias por tu compra.";

    paymentMessage.classList.add("success");

    // LIMPIAR FORM
    paymentForm.reset();

    // OCULTAR TARJETA
    cardFields.style.display =
        "none";

    // REDIRIGIR AL INICIO DESPUES DE 3 SEGUNDOS
    setTimeout(() => {

        window.location.href = "./index.html";

    }, 3000);

});


// HABILITAR BOTON PAGAR
function verificarFormulario() {
    const metodo = paymentMethod.value;
    const btnPagar = document.getElementById("btnPagar");

    if (metodo === "") {
        btnPagar.disabled = true;
        return;
    }

    if (metodo === "debito" || metodo === "credito") {
        const camposCompletos =
            cardNumber.value.trim() !== "" &&
            cardName.value.trim() !== "" &&
            cardDate.value.trim() !== "" &&
            cardCvv.value.trim() !== "";

        btnPagar.disabled = !camposCompletos;
    } else {
        // transferencia — solo necesita el método seleccionado
        btnPagar.disabled = false;
    }
}

paymentMethod.addEventListener("change", verificarFormulario);
cardNumber.addEventListener("input", verificarFormulario);
cardName.addEventListener("input", verificarFormulario);
cardDate.addEventListener("input", verificarFormulario);
cardCvv.addEventListener("input", verificarFormulario);

renderizarProductos();