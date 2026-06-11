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

function renderizarFavoritos(){

    container.innerHTML = "";

    subtitle.textContent =
    `${favoritos.length} productos guardados`;

    if(favoritos.length === 0){

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

        <img
        src="../assets/${producto.imagen}"
        alt="${producto.nombre}"
        >

        <h3>${producto.nombre}</h3>

        <p>
        $${Number(producto.precio)
        .toLocaleString("es-AR")}
        </p>

        <button
        class="remove-btn"
        data-id="${producto.id}"
        >
        Quitar
        </button>

        </div>

        `;
    });

    activarBotonesEliminar();

}

function activarBotonesEliminar(){

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
activarCardsFavoritas();

function activarCardsFavoritas(){

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