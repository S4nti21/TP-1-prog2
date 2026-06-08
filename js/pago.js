
Auth.inicializarModo();

const themeButton =
    document.getElementById("themeButton");

const themeIcon =
    document.getElementById("themeIcon");

// ACTUALIZAR ICONO
function actualizarIconoTema(){

    const modo =
        document.body.getAttribute("data-modo");

    // CLARO
    if(modo === "claro"){

        themeIcon.classList.remove("fa-moon");

        themeIcon.classList.add("fa-sun");

    }

    // OSCURO
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

const productos = [

    {
        nombre: "REMERA OVERSIZE",
        talle: "M",
        precio: 25000,
        imagen: "../img/remera.jpg"
    },

    {
        nombre: "BUZO ESSENTIAL",
        talle: "L",
        precio: 40000,
        imagen: "../img/buzo.jpg"
    }

];

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

function renderizarProductos(){

    // LIMPIAR
    summaryProducts.innerHTML = "";

    // TOTAL
    let total = 0;

    // RECORRER
    productos.forEach((producto) => {

        total += producto.precio;

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

                </div>

                <!-- PRICE -->
                <span>

                    $${producto.precio.toLocaleString("es-AR")}

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
    if(
        metodo === "debito" ||
        metodo === "credito"
    ){

        cardFields.style.display =
            "block";

    }

    // OCULTAR
    else{

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
    if(metodo === ""){

        paymentMessage.textContent =
            "Selecciona un método de pago";

        paymentMessage.classList.add("error");

        return;

    }

    // VALIDAR TARJETA
    if(
        metodo === "debito" ||
        metodo === "credito"
    ){

        if(
            cardNumber.value.trim() === "" ||
            cardName.value.trim() === "" ||
            cardDate.value.trim() === "" ||
            cardCvv.value.trim() === ""
        ){

            paymentMessage.textContent =
                "Completa todos los datos";

            paymentMessage.classList.add("error");

            return;

        }

    }

    // EXITO
    paymentMessage.textContent =
        "Pago realizado correctamente";

    paymentMessage.classList.add("success");

    // LIMPIAR
    paymentForm.reset();

    // OCULTAR TARJETA
    cardFields.style.display =
        "none";

});

renderizarProductos();

