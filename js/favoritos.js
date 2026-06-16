const usuario = Auth.obtenerUsuarioLogueado();
const FAVORITOS_KEY = `favoritos_${usuario.id_usuario}`;

let favoritos = JSON.parse(localStorage.getItem(FAVORITOS_KEY)) || [];

const container = document.getElementById("favoritesContainer");
const subtitle = document.getElementById("favoritesSubtitle");

function renderizarFavoritos() {

    container.innerHTML = "";
    subtitle.textContent = `${favoritos.length} producto${favoritos.length !== 1 ? "s" : ""} guardado${favoritos.length !== 1 ? "s" : ""}`;

    if (favoritos.length === 0) {
        container.innerHTML = `
            <div class="empty-favorites">
                <i class="fa-regular fa-bookmark"></i>
                <h2>SIN FAVORITOS</h2>
                <p>Guardá tus prendas favoritas para encontrarlas más rápido.</p>
                <a href="./index.html" class="shop-btn">IR A LA TIENDA</a>
            </div>
        `;
        return;
    }

    favoritos.forEach(producto => {
        container.innerHTML += `
            <div class="product-card favorite-card" data-id="${producto.id}">
                <div class="product-image-wrap">
                    <img src="../assets/${producto.imagen}" alt="${producto.nombre}">
                    <button class="remove-icon-btn" data-id="${producto.id}" title="Quitar de favoritos">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="product-info">
                    <p class="product-name">${producto.nombre}</p>
                    <p class="product-price">$${Number(producto.precio).toLocaleString("es-AR")}</p>
                </div>
            </div>
        `;
    });

    activarBotonesEliminar();
    activarCards();
}

function activarBotonesEliminar() {
    document.querySelectorAll(".remove-icon-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = Number(btn.dataset.id);
            favoritos = favoritos.filter(p => p.id !== id);
            localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos));
            renderizarFavoritos();
        });
    });
}

function activarCards() {
    document.querySelectorAll(".favorite-card").forEach(card => {
        card.addEventListener("click", () => {
            window.location.href = `producto.html?id=${card.dataset.id}`;
        });
    });
}

renderizarFavoritos();