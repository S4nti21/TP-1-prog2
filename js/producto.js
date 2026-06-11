const productos = [

    {
        id:1,
        nombre:"MEDIC CREME ZIP HOODIE",
        precio:148500,
        categoria:"hoodies",
        imagen:"medic.png"
    },

    {
        id:2,
        nombre:"WARFARE HOODIE",
        precio:129900,
        categoria:"hoodies",
        imagen:"warfare.png"
    },

    {
        id:3,
        nombre:"BLACK DENIM",
        precio:189000,
        categoria:"pantalones",
        imagen:"black denim.png"
    },

    {
        id:4,
        nombre:"STREET JACKET",
        precio:220000,
        categoria:"camperas",
        imagen:"street jacket.png"
    },

    {
        id:5,
        nombre:"ESSENTIAL TEE",
        precio:78000,
        categoria:"remeras",
        imagen:"essentialtee.png"
    },

    {
        id:6,
        nombre:"OVERSIZED TEE",
        precio:82000,
        categoria:"remeras",
        imagen:"oversizedtee.png"
    },

    {
        id:7,
        nombre:"UTILITY PANTS",
        precio:175000,
        categoria:"pantalones",
        imagen:"utilitypants.png"
    },

    {
        id:8,
        nombre:"TACTICAL HOODIE",
        precio:158000,
        categoria:"hoodies",
        imagen:"tacticalhoodie.png"
    },

    {
        id:9,
        nombre:"CARGO PANTS",
        precio:195000,
        categoria:"pantalones",
        imagen:"cargopants.png"
    },

    {
        id:10,
        nombre:"MINIMAL JACKET",
        precio:248000,
        categoria:"camperas",
        imagen:"minimaljacket.png"
    }

];

const params =
new URLSearchParams(
    window.location.search
);

const id =
Number(
    params.get("id")
);

const producto =
productos.find(
    p => p.id === id
);

const container =
document.getElementById(
    "productContainer"
);

if(!producto){

    container.innerHTML = `

        <div class="product-not-found">

            <h1>
                Producto no encontrado
            </h1>

            <a href="./index.html">
                Volver a la tienda
            </a>

        </div>

    `;

}else{

    container.innerHTML = `

<div class="product-page">

    <div class="product-image">

        <img
            src="../assets/${producto.imagen}"
            alt="${producto.nombre}"
        >

    </div>

    <div class="product-info">

        <p class="product-category">
            ${producto.categoria.toUpperCase()}
        </p>

        <h1>
            ${producto.nombre}
        </h1>

        <h2>
            $${producto.precio.toLocaleString("es-AR")}
        </h2>

        <p class="product-description">

            Diseño premium pensado para uso diario.
            Materiales de alta calidad y silueta oversized
            inspirada en el streetwear contemporáneo.

        </p>

        <p class="size-title">
            TALLE
        </p>

        <div class="size-selector">

            <button class="size-btn">S</button>
            <button class="size-btn active">M</button>
            <button class="size-btn">L</button>
            <button class="size-btn">XL</button>

        </div>

        <div class="product-actions">

            <button class="product-favorite">
                <i class="fa-regular fa-bookmark"></i>
            </button>

            <button
                class="product-buy"
                id="addToCart"
            >
                AGREGAR AL CARRITO
            </button>

        </div>

        <div class="product-details">

            <p>
                • Envíos a todo el país
            </p>

            <p>
                • Cambios dentro de los 30 días
            </p>

            <p>
                • Pago seguro
            </p>

        </div>

    </div>

</div>

`;

}

function renderizarRelacionados(){

    const container =
    document.getElementById(
        "relatedProducts"
    );

    if(!container) return;

    const relacionados =
    productos
    .filter(
        p => p.id !== producto.id
    )
    .slice(0,4);

    container.innerHTML =
relacionados.map(p => `

<div
    class="product-card"
    onclick="window.location.href='producto.html?id=${p.id}'"
>

    <div class="product-image-wrap">

        <img
            src="../assets/${p.imagen}"
            alt="${p.nombre}"
        >

    </div>

    <div class="product-info">

        <div class="product-info-top">

            <p class="product-name">
                ${p.nombre}
            </p>

            <p class="product-price">
                $${Number(p.precio).toLocaleString("es-AR")}
            </p>

        </div>

    </div>

</div>

`).join("");
}

const btnFavorito =
document.querySelector(".product-favorite");

if(btnFavorito){

    let favoritos =
    JSON.parse(
        localStorage.getItem("favoritos")
    ) || [];

    const existe =
    favoritos.some(
        p => p.id === producto.id
    );

    btnFavorito.innerHTML = existe
    ? `<i class="fa-solid fa-bookmark"></i>`
    : `<i class="fa-regular fa-bookmark"></i>`;

    btnFavorito.addEventListener("click", () => {

        let favoritos =
        JSON.parse(
            localStorage.getItem("favoritos")
        ) || [];

        const index =
        favoritos.findIndex(
            p => p.id === producto.id
        );

        if(index > -1){

            favoritos.splice(index,1);

            btnFavorito.innerHTML =
            `<i class="fa-regular fa-bookmark"></i>`;

        }else{

            favoritos.push(producto);

            btnFavorito.innerHTML =
            `<i class="fa-solid fa-bookmark"></i>`;

        }

        localStorage.setItem(
            "favoritos",
            JSON.stringify(favoritos)
        );

        actualizarFavoritos();

    });

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

if(producto){

    renderizarRelacionados();

}

actualizarFavoritos();