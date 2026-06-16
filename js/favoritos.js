let favoritos =
    JSON.parse(
        localStorage.getItem("favoritos")
    ) || [];

const container =
    document.getElementById(
        "favoritesContainer"
    );

const subtitle =
    document.getElementById(
        "favoritesSubtitle"
    );

function renderizarFavoritos() {

    container.innerHTML = "";

    subtitle.textContent =
        `${favoritos.length} productos guardados`;

    if (favoritos.length === 0) {

        container.innerHTML = `
        <div class="empty-favorites">
        
            <i class="fa-regular fa-bookmark"></i>
        
            <h2>
                No tienes favoritos guardados
            </h2>
        
            <p>
                Guarda tus prendas favoritas para encontrarlas más rápido.
            </p>
        
            <a href="./index.html" class="shop-btn">
                IR A LA TIENDA
            </a>
        
        </div>
        `;

        return;
    }

    favoritos.forEach(producto => {

        container.innerHTML += `

            <div
            class="product-card favorite-card"
            data-id="${producto.id}"
            >

            <div class="product-image-wrap">

        <img
<<<<<<< HEAD
            src="../assets/${producto.imagen}"
            alt="${producto.nombre}"
=======
        src="${producto.imagen.startsWith('../') ? producto.imagen : '../assets/' + producto.imagen}"
        alt="${producto.nombre}"
>>>>>>> 67c48002feb747d740de260565ab78796339912c
        >

        <button
            class="bookmark-btn remove-btn"
            data-id="${producto.id}"
        >
            <i class="fa-solid fa-bookmark"></i>
        </button>

    </div>

    <div class="product-info">

        <div class="product-info-top">

            <p class="product-name">
                ${producto.nombre}
            </p>

            <p class="product-price">
                $${Number(producto.precio)
                .toLocaleString("es-AR")}
            </p>

        </div>

    </div>

    <button
        class="add-cart-btn remove-btn"
        data-id="${producto.id}"
    >
        QUITAR DE FAVORITOS
    </button>

</div>

`;
    });

    activarBotonesEliminar();
    activarCardsFavoritas();

}

function activarBotonesEliminar() {

    const botones =
        document.querySelectorAll(
            ".remove-btn"
        );

    botones.forEach(btn => {

        btn.addEventListener(
            "click",
            (e) => {

                e.stopPropagation();

                const id =
                    Number(btn.dataset.id);

                favoritos =
                    favoritos.filter(
                        producto =>
                            producto.id !== id
                    );

                localStorage.setItem(
                    "favoritos",
                    JSON.stringify(favoritos)
                );

                renderizarFavoritos();

            }
        );

    });

}
function activarCardsFavoritas() {

    const cards =
        document.querySelectorAll(
            ".favorite-card"
        );

    cards.forEach(card => {

        card.addEventListener(
            "click",
            () => {

                window.location.href =
                    `producto.html?id=${card.dataset.id}`;

            }
        );

    });

}

renderizarFavoritos();