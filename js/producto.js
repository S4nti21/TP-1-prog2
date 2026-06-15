/* PRODUCTOS LOCALES (fallback si el backend no responde) */

const productosLocales = [

    { id: 1, nombre: "MEDIC CREME ZIP HOODIE", precio: 148500, categoria: "hoodies", imagen: "medic.png", color: "Crema", talles: ["S", "M", "L", "XL"], stock: 10 },
    { id: 2, nombre: "WARFARE HOODIE", precio: 129900, categoria: "hoodies", imagen: "warfare.png", color: "Negro", talles: ["S", "M", "L"], stock: 5 },
    { id: 3, nombre: "BLACK DENIM", precio: 189000, categoria: "pantalones", imagen: "black denim.png", color: "Negro", talles: ["28", "30", "32"], stock: 8 },
    { id: 4, nombre: "STREET JACKET", precio: 220000, categoria: "camperas", imagen: "street jacket.png", color: "Gris", talles: ["M", "L", "XL"], stock: 3 },
    { id: 5, nombre: "ESSENTIAL TEE", precio: 78000, categoria: "remeras", imagen: "essentialtee.png", color: "Blanco", talles: ["S", "M", "L", "XL"], stock: 15 },
    { id: 6, nombre: "OVERSIZED TEE", precio: 82000, categoria: "remeras", imagen: "oversizedtee.png", color: "Negro", talles: ["M", "L", "XL"], stock: 12 },
    { id: 7, nombre: "UTILITY PANTS", precio: 175000, categoria: "pantalones", imagen: "utilitypants.png", color: "Verde", talles: ["28", "30", "32"], stock: 6 },
    { id: 8, nombre: "TACTICAL HOODIE", precio: 158000, categoria: "hoodies", imagen: "tacticalhoodie.png", color: "Gris", talles: ["S", "M", "L"], stock: 4 },
    { id: 9, nombre: "CARGO PANTS", precio: 195000, categoria: "pantalones", imagen: "cargopants.png", color: "Beige", talles: ["28", "30", "32"], stock: 7 },
    { id: 10, nombre: "MINIMAL JACKET", precio: 248000, categoria: "camperas", imagen: "minimaljacket.png", color: "Negro", talles: ["M", "L", "XL"], stock: 2 }

];

/* CUOTAS */
const interesPorCuota = { 1: 0, 3: 0, 6: 0.10, 9: 0.20, 12: 0.35 };

/* ELEMENTOS */
const container = document.getElementById("productContainer");
const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

/* TALLE SELECCIONADO */
let talleSeleccionado = null;

/* RENDER PRODUCTO */
function renderizarProducto(producto) {

    if (!producto) {
        container.innerHTML = `
            <div class="product-not-found">
                <h1>Producto no encontrado</h1>
                <a href="./index.html">Volver a la tienda</a>
            </div>`;
        return;
    }

    const sinStock = producto.stock === 0;

    const tallesHTML = (producto.talles || ["S", "M", "L", "XL"]).map(t =>
        `<button class="size-btn" data-talle="${t}">${t}</button>`
    ).join("");

    container.innerHTML = `
        <div class="product-page">

            <div class="product-image">
                <img src="../assets/${producto.imagen}" alt="${producto.nombre}">
            </div>

            <div class="product-info">

                <p class="product-category">${producto.categoria.toUpperCase()}</p>
                <h1>${producto.nombre}</h1>
                <h2 id="precioMostrado">$${producto.precio.toLocaleString("es-AR")}</h2>

                ${sinStock
            ? `<p class="sin-stock-msg">⚠️ Sin stock disponible</p>`
            : `<p class="stock-msg">Stock disponible: ${producto.stock} unidades</p>`
        }

                <p class="product-description">
                    Diseño premium pensado para uso diario.
                    Materiales de alta calidad y silueta oversized
                    inspirada en el streetwear contemporáneo.
                </p>

                <!-- CUOTAS -->
                <div class="cuotas-selector">
                    <label for="selectCuotas">Pagá en cuotas:</label>
                    <select id="selectCuotas">
                        <option value="1">1 cuota sin interés</option>
                        <option value="3">3 cuotas sin interés</option>
                        <option value="6">6 cuotas (10% interés)</option>
                        <option value="9">9 cuotas (20% interés)</option>
                        <option value="12">12 cuotas (35% interés)</option>
                    </select>
                    <p id="precioCuota" class="precio-cuota"></p>
                </div>

                <p class="size-title">TALLE</p>
                <div class="size-selector">${tallesHTML}</div>
                <p id="talleError" class="talle-error" style="display:none; color:red; font-size:.8rem;">
                    Seleccioná un talle antes de agregar.
                </p>

                <div class="product-actions">
                    <button class="product-favorite" id="btnFavorito">
                        <i class="fa-regular fa-bookmark"></i>
                    </button>
                    <button
                        class="product-buy"
                        id="addToCart"
                        ${sinStock ? "disabled style=\"opacity:.4;cursor:not-allowed\"" : ""}
                    >
                        ${sinStock ? "SIN STOCK" : "AGREGAR AL CARRITO"}
                    </button>
                </div>

                <div class="product-details">
                    <p>• Envíos a todo el país</p>
                    <p>• Cambios dentro de los 30 días</p>
                    <p>• Pago seguro</p>
                </div>

            </div>
        </div>`;

    activarTalles(producto);
    activarCuotas(producto);
    activarFavorito(producto);
    if (!sinStock) activarCarrito(producto);
    renderizarRelacionados(producto);
    actualizarFavoritos();
}

/* TALLES */
function activarTalles(producto) {
    const botones = document.querySelectorAll(".size-btn");
    botones.forEach(btn => {
        btn.addEventListener("click", () => {
            botones.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            talleSeleccionado = btn.dataset.talle;
            document.getElementById("talleError").style.display = "none";
        });
    });
}

/* CUOTAS */
function activarCuotas(producto) {
    const select = document.getElementById("selectCuotas");
    const precioCuota = document.getElementById("precioCuota");
    const precioMostrado = document.getElementById("precioMostrado");

    function actualizarCuotas() {
        const cuotas = Number(select.value);
        const interes = interesPorCuota[cuotas];
        const total = producto.precio * (1 + interes);
        const porCuota = total / cuotas;

        precioMostrado.textContent = `$${total.toLocaleString("es-AR")}`;
        precioCuota.textContent =
            cuotas === 1
                ? "Pago único sin interés"
                : `${cuotas} cuotas de $${Math.ceil(porCuota).toLocaleString("es-AR")}`;
    }

    select.addEventListener("change", actualizarCuotas);
    actualizarCuotas();
}

/* CARRITO */
function activarCarrito(producto) {
    const btn = document.getElementById("addToCart");
    if (!btn) return;

    btn.addEventListener("click", () => {

        // VERIFICAR LOGIN
        const usuario = Auth.obtenerUsuarioLogueado();
        if (!usuario) {
            mostrarToast("Debes iniciar sesión para agregar al carrito");
            setTimeout(() => { window.location.href = "./login.html"; }, 1500);
            return;
        }

        // VERIFICAR TALLE
        if (!talleSeleccionado) {
            document.getElementById("talleError").style.display = "block";
            return;
        }

        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

        carrito.push({
            id: Date.now(),
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: `../assets/${producto.imagen}`,
            talle: talleSeleccionado,
            cantidad: 1
        });

        localStorage.setItem("carrito", JSON.stringify(carrito));
        mostrarToast("Producto agregado al carrito ✓");
    });
}

/* FAVORITO */
function activarFavorito(producto) {
    const btn = document.getElementById("btnFavorito");
    if (!btn) return;

    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    const existe = favoritos.some(p => p.id === producto.id);

    btn.innerHTML = existe
        ? `<i class="fa-solid fa-bookmark"></i>`
        : `<i class="fa-regular fa-bookmark"></i>`;

    btn.addEventListener("click", () => {
        let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
        const index = favoritos.findIndex(p => p.id === producto.id);

        if (index > -1) {
            favoritos.splice(index, 1);
            btn.innerHTML = `<i class="fa-regular fa-bookmark"></i>`;
        } else {
            favoritos.push(producto);
            btn.innerHTML = `<i class="fa-solid fa-bookmark"></i>`;
        }

        localStorage.setItem("favoritos", JSON.stringify(favoritos));
        actualizarFavoritos();
    });
}

/* RELACIONADOS */
function renderizarRelacionados(producto) {
    const rel = document.getElementById("relatedProducts");
    if (!rel) return;

    const relacionados = productosLocales
        .filter(p => p.id !== producto.id)
        .slice(0, 4);

    rel.innerHTML = relacionados.map(p => `
        <div class="product-card" onclick="window.location.href='producto.html?id=${p.id}'">
            <div class="product-image-wrap">
                <img src="../assets/${p.imagen}" alt="${p.nombre}">
            </div>
            <div class="product-info">
                <p class="product-name">${p.nombre}</p>
                <p class="product-price">$${p.precio.toLocaleString("es-AR")}</p>
            </div>
        </div>`).join("");
}

/* TOAST */
function mostrarToast(mensaje) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = mensaje;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

/* CONTADOR FAVORITOS */
function actualizarFavoritos() {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    const contador = document.getElementById("favoritesCounter");
    if (contador) contador.textContent = favoritos.length;
}

/* ARRANCAR — primero intentar backend, si falla usar local */
async function init() {
    try {
        const res = await fetch("http://localhost:4000/api/obtenerProductos");
        const data = await res.json();

        if (data.payload && data.payload.length > 0) {
            // Mapear campos del backend
            const productosBackend = data.payload.map(p => ({
                id: p._id || p.id,
                nombre: p.producto || p.nombre,
                precio: Number(p.precio),
                categoria: p.categoria || "general",
                imagen: p.imagen || "placeholder.png",
                color: p.color || "",
                talles: p.talles || ["S", "M", "L", "XL"],
                stock: p.stock !== undefined ? p.stock : 10
            }));

            const producto = productosBackend.find(p => p.id == id || p.id === id);
            renderizarProducto(producto || null);
        } else {
            // Backend vacío → usar locales
            const producto = productosLocales.find(p => p.id === id);
            renderizarProducto(producto || null);
        }

    } catch (e) {
        // Backend caído → usar locales
        const producto = productosLocales.find(p => p.id === id);
        renderizarProducto(producto || null);
    }
}

init();