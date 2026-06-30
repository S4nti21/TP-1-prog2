// ─── VERIFICAR ADMIN ──────────────────────────────────────
Auth.inicializarModo();

const usuario = Auth.obtenerUsuarioLogueado();
if (!usuario || !Auth.esAdmin()) {
  alert("Acceso denegado. Solo administradores.");
  window.location.href = "./index.html";
}

// ─── MODO OSCURO ──────────────────────────────────────────
const themeButton = document.getElementById("themeButton");
const themeIcon   = document.getElementById("themeIcon");

function actualizarIconoTema() {
  const modo = document.documentElement.getAttribute("data-modo");
  if (modo === "claro") {
    themeIcon.classList.replace("fa-moon", "fa-sun");
  } else {
    themeIcon.classList.replace("fa-sun", "fa-moon");
  }
}
themeButton.addEventListener("click", () => { Auth.toggleModo(); actualizarIconoTema(); });
actualizarIconoTema();

// ─── CERRAR SESIÓN ────────────────────────────────────────
document.getElementById("btnCerrarSesion").addEventListener("click", () => {
  Auth.cerrarSesion();
  window.location.href = "./index.html";
});

// ─── TABS ─────────────────────────────────────────────────
const sidebarBtns = document.querySelectorAll(".sidebar-btn");
const tabs        = document.querySelectorAll(".admin-tab");

sidebarBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    sidebarBtns.forEach(b => b.classList.remove("active"));
    tabs.forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    if (btn.dataset.tab === "gestionar") cargarTabla();
  });
});

// ─── TOAST ────────────────────────────────────────────────
function mostrarToast(mensaje, tipo = "ok") {
  const toast = document.getElementById("toast");
  toast.textContent = mensaje;
  toast.className = `toast show ${tipo === "error" ? "toast-error" : ""}`;
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function mostrarMsg(id, texto, tipo = "ok") {
  const el = document.getElementById(id);
  el.textContent = texto;
  el.className = `admin-msg ${tipo === "error" ? "admin-msg--error" : "admin-msg--ok"}`;
  setTimeout(() => { el.textContent = ""; el.className = "admin-msg"; }, 4000);
}

// ─── HELPERS ──────────────────────────────────────────────
function obtenerTalles(contenedorId) {
  return Array.from(
    document.querySelectorAll(`#${contenedorId} input[type=checkbox]:checked`)
  ).map(cb => cb.value);
}

function marcarTalles(contenedorId, talles = []) {
  document.querySelectorAll(`#${contenedorId} input[type=checkbox]`).forEach(cb => {
    cb.checked = talles.includes(cb.value);
  });
}

// ─── INPUT DE IMAGEN ──────────────────────────────────────
document.getElementById("c-imagen-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Guardar solo el nombre del archivo en el campo oculto
  document.getElementById("c-imagen").value = file.name;
  document.getElementById("c-imagen-nombre").textContent = file.name;

  // Mostrar preview
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById("c-imagen-preview-img").src = ev.target.result;
    document.getElementById("c-imagen-preview").style.display = "block";
  };
  reader.readAsDataURL(file);
});

// ─── CARGAR PRODUCTO ──────────────────────────────────────
// El flujo correcto es:
//   1. Obtener id_categoria desde la BD (o crear la categoría si no existe)
//   2. POST /api/cargarProducto  → devuelve idProducto
//   3. POST /api/crearInventario → una vez por cada talle seleccionado

document.getElementById("formCargar").addEventListener("submit", async (e) => {
  e.preventDefault();

  const talles = obtenerTalles("c-talles");
  if (talles.length === 0) {
    mostrarMsg("msg-cargar", "Seleccioná al menos un talle.", "error");
    return;
  }

  const nombre      = document.getElementById("c-nombre").value.trim();
  const precio      = Number(document.getElementById("c-precio").value);
  const descripcion = document.getElementById("c-descripcion").value.trim();
  const categoriaNombre = document.getElementById("c-categoria").value;
  const genero      = document.getElementById("c-genero").value;
  const color       = document.getElementById("c-color").value.trim();
  const stock       = Number(document.getElementById("c-stock").value);
  const imagen      = document.getElementById("c-imagen").value.trim() || "placeholder.png";

  const btnSubmit = e.target.querySelector("button[type=submit]");
  btnSubmit.disabled = true;
  btnSubmit.textContent = "Cargando...";

  try {
    // PASO 1: Obtener o crear la categoría
    const idCategoria = await obtenerOCrearCategoria(categoriaNombre);
    if (!idCategoria) {
      mostrarMsg("msg-cargar", "No se pudo obtener la categoría.", "error");
      return;
    }

    // PASO 2: Crear el producto
    const resProducto = await Auth.fetchConToken("http://localhost:4000/api/cargarProducto", {
      method: "POST",
      body: JSON.stringify({
        nombre,
        descripcion,
        precio,
        genero,
        id_categoria: idCategoria,
        imagen,
      }),
    });
    const dataProducto = await resProducto.json();

    if (dataProducto.codigo !== 200 || !dataProducto.payload?.[0]?.idProducto) {
      mostrarMsg("msg-cargar", dataProducto.mensaje || "Error al cargar el producto.", "error");
      return;
    }

    const idProducto = dataProducto.payload[0].idProducto;

    // PASO 3: Crear inventario — un registro por cada talle con el mismo color y stock
    const erroresInventario = [];
    for (const talle of talles) {
      const resInv = await Auth.fetchConToken("http://localhost:4000/api/crearInventario", {
        method: "POST",
        body: JSON.stringify({
          talle,
          color,
          stock,
          id_producto: idProducto,
        }),
      });
      const dataInv = await resInv.json();
      if (dataInv.codigo !== 200) {
        erroresInventario.push(talle);
      }
    }

    if (erroresInventario.length > 0) {
      mostrarToast(`Producto creado pero falló el inventario para talles: ${erroresInventario.join(", ")}`, "error");
    } else {
      mostrarToast(`"${nombre}" cargado con éxito ✓`);
      document.getElementById("formCargar").reset();
      marcarTalles("c-talles", []);
    }

  } catch (err) {
    mostrarMsg("msg-cargar", "No se pudo conectar con el servidor.", "error");
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<i class="fa-solid fa-plus"></i> Cargar producto';
  }
});

// ─── OBTENER O CREAR CATEGORÍA ───────────────────────────
// Primero busca si la categoría ya existe; si no, la crea.

async function obtenerOCrearCategoria(nombreCategoria) {
  try {
    // Intentar obtener categorías existentes
    const res  = await Auth.fetchConToken("http://localhost:4000/api/obtenerCategorias");
    const data = await res.json();

    if (data.codigo === 200 && data.payload) {
      const existente = data.payload.find(
        c => c.nombre.toLowerCase() === nombreCategoria.toLowerCase()
      );
      if (existente) return existente.id_categoria;
    }

    // No existe → crearla
    const resCrear  = await Auth.fetchConToken("http://localhost:4000/api/crearCategoria", {
      method: "POST",
      body: JSON.stringify({ nombre: nombreCategoria }),
    });
    const dataCrear = await resCrear.json();

    if (dataCrear.codigo === 200 && dataCrear.payload?.[0]?.idCategoria) {
      return dataCrear.payload[0].idCategoria;
    }

    return null;
  } catch (err) {
    return null;
  }
}

// ─── TABLA DE PRODUCTOS ───────────────────────────────────

let todosLosProductos = [];

async function cargarTabla(filtro = "") {
  const tbody = document.getElementById("tbodyProductos");
  tbody.innerHTML = `<tr><td colspan="6" class="loading-cell">Cargando...</td></tr>`;

  try {
    const res  = await fetch("http://localhost:4000/api/obtenerProductos");
    const data = await res.json();

    // Mapeo correcto: el backend devuelve idProducto (no _id ni id)
    todosLosProductos = (data.payload || []).map(p => ({
      id:          p.idProducto,
      idCategoria: p.idCategoria,
      nombre:      p.producto,
      precio:      Number(p.precio),
      descripcion: p.descripcion || "",
      categoria:   p.categoria   || "",
      genero:      p.genero      || "unisex",
      imagen:      p.ulrImagen   || "",
    }));

    // Para mostrar stock e inventario, necesitamos el detalle de cada producto
    // (el listado general no trae stock; lo cargamos bajo demanda al abrir el modal)
    renderTabla(filtro);

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="loading-cell">Error al cargar productos.</td></tr>`;
  }
}

function renderTabla(filtro = "") {
  const tbody = document.getElementById("tbodyProductos");
  const lista = filtro
    ? todosLosProductos.filter(p =>
        p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        p.categoria.toLowerCase().includes(filtro.toLowerCase())
      )
    : todosLosProductos;

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="loading-cell">No se encontraron productos.</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(p => `
    <tr>
      <td>${p.nombre}</td>
      <td>${p.categoria}</td>
      <td>${p.genero}</td>
      <td>$${p.precio.toLocaleString("es-AR")}</td>
      <td>—</td>
      <td>
        <button class="btn-modificar" data-id="${p.id}">
          <i class="fa-solid fa-pen"></i> Modificar
        </button>
      </td>
    </tr>`).join("");

  document.querySelectorAll(".btn-modificar").forEach(btn => {
    btn.addEventListener("click", () => {
      const producto = todosLosProductos.find(p => p.id == btn.dataset.id);
      if (producto) abrirModal(producto);
    });
  });
}

// Buscador
document.getElementById("btnSearchAdmin").addEventListener("click", () => {
  renderTabla(document.getElementById("searchAdmin").value);
});
document.getElementById("searchAdmin").addEventListener("keydown", (e) => {
  if (e.key === "Enter") renderTabla(e.target.value);
});

// ─── MODAL MODIFICAR STOCK ────────────────────────────────
// El backend solo tiene PUT /api/modificarStock con { stock, id_inventario }
// El modal muestra los talles/variantes del producto y permite editar el stock de cada uno.

const modalOverlay = document.getElementById("modalOverlay");
let variantesModal = [];  // variantes del producto abierto en el modal

async function abrirModal(producto) {
  document.getElementById("m-id").value       = producto.id;
  document.getElementById("m-nombre").value   = producto.nombre;
  document.getElementById("m-precio").value   = producto.precio;
  document.getElementById("m-categoria").value= producto.categoria;
  document.getElementById("m-genero").value   = producto.genero;
  document.getElementById("msg-modal").textContent = "";

  // Cargar variantes del producto (reemplaza el contenido de m-stock-group)
  await cargarVariantesEnModal(producto.id);

  modalOverlay.classList.add("active");
}

async function cargarVariantesEnModal(idProducto) {
  const stockGroup = document.getElementById("m-stock-group");

  stockGroup.innerHTML = `<label>Cargando variantes...</label>`;

  try {
    const res  = await fetch(`http://localhost:4000/api/obtenerDatosProducto/${idProducto}`);
    const data = await res.json();

    if (!data.payload || data.payload.length === 0) {
      stockGroup.innerHTML = `<label>Stock</label><p class="admin-msg admin-msg--error">Este producto no tiene inventario cargado.</p>`;
      variantesModal = [];
      return;
    }

    variantesModal = data.payload.map(v => ({
      idInventario: v.idInventario,
      talle:        v.talle,
      color:        v.color,
      stock:        v.stock,
    }));

    // Renderizar un campo de stock por variante
    stockGroup.innerHTML = `
      <label>Modificar stock por variante</label>
      <div class="variantes-lista">
        ${variantesModal.map(v => `
          <div class="variante-row">
            <span class="variante-label">${v.talle} — ${v.color}</span>
            <input
              type="number"
              class="variante-stock-input"
              data-id-inventario="${v.idInventario}"
              value="${v.stock}"
              min="0"
              style="width:80px"
            >
          </div>
        `).join("")}
      </div>
    `;

  } catch (err) {
    stockGroup.innerHTML = `<label>Stock</label><p class="admin-msg admin-msg--error">Error al cargar variantes.</p>`;
  }
}

function cerrarModal() {
  modalOverlay.classList.remove("active");
}

document.getElementById("modalClose").addEventListener("click", cerrarModal);
document.getElementById("modalCancelar").addEventListener("click", cerrarModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) cerrarModal(); });

// GUARDAR — llama a modificarStock por cada variante que cambió
document.getElementById("modalGuardar").addEventListener("click", async () => {
  const inputs = document.querySelectorAll(".variante-stock-input");

  if (inputs.length === 0) {
    mostrarMsg("msg-modal", "No hay variantes para modificar.", "error");
    return;
  }

  const btnGuardar = document.getElementById("modalGuardar");
  btnGuardar.disabled = true;
  btnGuardar.textContent = "Guardando...";

  let errores = 0;

  for (const input of inputs) {
    const idInventario = Number(input.dataset.idInventario);
    const nuevoStock   = Number(input.value);

    // Solo actualizar si el stock cambió
    const varianteOriginal = variantesModal.find(v => v.idInventario === idInventario);
    if (varianteOriginal && varianteOriginal.stock === nuevoStock) continue;

    try {
      const res  = await Auth.fetchConToken("http://localhost:4000/api/modificarStock", {
        method: "PUT",
        body: JSON.stringify({
          stock:        nuevoStock,
          id_inventario: idInventario,
        }),
      });
      const data = await res.json();
      if (data.codigo !== 200) errores++;
    } catch (err) {
      errores++;
    }
  }

  btnGuardar.disabled = false;
  btnGuardar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar cambios';

  if (errores > 0) {
    mostrarMsg("msg-modal", `${errores} variante(s) no se pudieron actualizar.`, "error");
  } else {
    mostrarToast("Stock actualizado ✓");
    cerrarModal();
    cargarTabla();
  }
});

// ─── INIT ─────────────────────────────────────────────────
cargarTabla();