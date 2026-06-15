// ============================================================
// ADMIN.JS — Gestión de productos para administradores
// ============================================================

// 1. VERIFICAR QUE SEA ADMIN
Auth.inicializarModo();

const usuario = Auth.obtenerUsuarioLogueado();
if (!usuario || !Auth.esAdmin()) {
  alert("Acceso denegado. Solo administradores.");
  window.location.href = "./index.html";
}

// 2. MODO OSCURO
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

// 3. CERRAR SESIÓN
document.getElementById("btnCerrarSesion").addEventListener("click", () => {
  Auth.cerrarSesion();
  window.location.href = "./index.html";
});

// 4. TABS
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

// 5. TOAST
function mostrarToast(mensaje, tipo = "ok") {
  const toast = document.getElementById("toast");
  toast.textContent = mensaje;
  toast.className = `toast show ${tipo === "error" ? "toast-error" : ""}`;
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// 6. MENSAJE en formulario
function mostrarMsg(id, texto, tipo = "ok") {
  const el = document.getElementById(id);
  el.textContent = texto;
  el.className = `admin-msg ${tipo === "error" ? "admin-msg--error" : "admin-msg--ok"}`;
  setTimeout(() => { el.textContent = ""; el.className = "admin-msg"; }, 3000);
}

// 7. OBTENER TALLES SELECCIONADOS
function obtenerTalles(contenedorId) {
  return Array.from(
    document.querySelectorAll(`#${contenedorId} input[type=checkbox]:checked`)
  ).map(cb => cb.value);
}

// 8. MARCAR TALLES EN EL MODAL
function marcarTalles(contenedorId, talles = []) {
  document.querySelectorAll(`#${contenedorId} input[type=checkbox]`).forEach(cb => {
    cb.checked = talles.includes(cb.value);
  });
}

// ============================================================
// CARGAR PRODUCTO
// ============================================================
document.getElementById("formCargar").addEventListener("submit", async (e) => {
  e.preventDefault();

  const talles = obtenerTalles("c-talles");
  if (talles.length === 0) {
    mostrarMsg("msg-cargar", "Seleccioná al menos un talle.", "error");
    return;
  }

  const body = {
    producto:    document.getElementById("c-nombre").value.trim(),
    precio:      Number(document.getElementById("c-precio").value),
    descripcion: document.getElementById("c-descripcion").value.trim(),
    categoria:   document.getElementById("c-categoria").value,
    genero:      document.getElementById("c-genero").value,
    color:       document.getElementById("c-color").value.trim(),
    stock:       Number(document.getElementById("c-stock").value),
    talles,
    imagen:      document.getElementById("c-imagen").value.trim() || "placeholder.png",
  };

  try {
    const res  = await Auth.fetchConToken("http://localhost:4000/api/cargarProducto", {
      method: "POST",
      body:   JSON.stringify(body),
    });
    const data = await res.json();

    if (data.codigo === 1 || res.ok) {
      mostrarToast("Producto cargado con éxito ✓");
      document.getElementById("formCargar").reset();
      marcarTalles("c-talles", []);
    } else {
      mostrarMsg("msg-cargar", data.mensaje || "Error al cargar el producto.", "error");
    }
  } catch (err) {
    mostrarMsg("msg-cargar", "No se pudo conectar con el servidor.", "error");
  }
});

// ============================================================
// TABLA DE PRODUCTOS
// ============================================================
let todosLosProductos = [];

async function cargarTabla(filtro = "") {
  const tbody = document.getElementById("tbodyProductos");
  tbody.innerHTML = `<tr><td colspan="6" class="loading-cell">Cargando...</td></tr>`;

  try {
    const res  = await fetch("http://localhost:4000/api/obtenerProductos");
    const data = await res.json();

    todosLosProductos = (data.payload || []).map(p => ({
      id:          p._id || p.id,
      nombre:      p.producto || p.nombre,
      precio:      Number(p.precio),
      descripcion: p.descripcion || "",
      categoria:   p.categoria   || "",
      genero:      p.genero      || "unisex",
      color:       p.color       || "",
      stock:       p.stock       ?? 0,
      talles:      p.talles      || [],
      imagen:      p.imagen      || "",
    }));

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
      <td>${p.color}</td>
      <td>$${p.precio.toLocaleString("es-AR")}</td>
      <td class="${p.stock === 0 ? "sin-stock-cell" : ""}">${p.stock === 0 ? "Sin stock" : p.stock}</td>
      <td>
        <button class="btn-modificar" data-id="${p.id}">
          <i class="fa-solid fa-pen"></i> Modificar
        </button>
      </td>
    </tr>`).join("");

  // Eventos botones modificar
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

// ============================================================
// MODAL EDITAR
// ============================================================
const modalOverlay = document.getElementById("modalOverlay");

function abrirModal(producto) {
  document.getElementById("m-id").value          = producto.id;
  document.getElementById("m-nombre").value      = producto.nombre;
  document.getElementById("m-precio").value      = producto.precio;
  document.getElementById("m-descripcion").value = producto.descripcion;
  document.getElementById("m-categoria").value   = producto.categoria;
  document.getElementById("m-genero").value      = producto.genero;
  document.getElementById("m-color").value       = producto.color;
  document.getElementById("m-stock").value       = producto.stock;
  marcarTalles("m-talles", producto.talles);
  document.getElementById("msg-modal").textContent = "";
  modalOverlay.classList.add("active");
}

function cerrarModal() {
  modalOverlay.classList.remove("active");
}

document.getElementById("modalClose").addEventListener("click", cerrarModal);
document.getElementById("modalCancelar").addEventListener("click", cerrarModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) cerrarModal(); });

document.getElementById("modalGuardar").addEventListener("click", async () => {
  const id = document.getElementById("m-id").value;

  const talles = obtenerTalles("m-talles");
  if (talles.length === 0) {
    mostrarMsg("msg-modal", "Seleccioná al menos un talle.", "error");
    return;
  }

  const body = {
    producto:    document.getElementById("m-nombre").value.trim(),
    precio:      Number(document.getElementById("m-precio").value),
    descripcion: document.getElementById("m-descripcion").value.trim(),
    categoria:   document.getElementById("m-categoria").value,
    genero:      document.getElementById("m-genero").value,
    color:       document.getElementById("m-color").value.trim(),
    stock:       Number(document.getElementById("m-stock").value),
    talles,
  };

  try {
    const res  = await Auth.fetchConToken(`http://localhost:4000/api/modificarProducto/${id}`, {
      method: "POST",
      body:   JSON.stringify(body),
    });
    const data = await res.json();

    if (data.codigo === 1 || res.ok) {
      mostrarToast("Producto actualizado ✓");
      cerrarModal();
      cargarTabla();
    } else {
      mostrarMsg("msg-modal", data.mensaje || "Error al guardar.", "error");
    }
  } catch (err) {
    mostrarMsg("msg-modal", "No se pudo conectar con el servidor.", "error");
  }
});

// Cargar tabla al iniciar si ya estamos en ese tab
cargarTabla();