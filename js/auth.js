/**
 * auth.js
 * -------
 * Módulo central de autenticación para Lana & Lino.
 *
 * CONFIGURACIÓN DE API:
 * Modificar BASE_URL con la URL base del backend provisto por la cátedra.
 */

// ============================================================
// CONFIGURACIÓN — EDITAR AQUÍ LA URL DEL BACKEND
// ============================================================
const BASE_URL = "http://localhost:4000/api"; // <-- CAMBIAR POR LA URL REAL

// Rutas reales del backend
const API_ENDPOINTS = {
  login: `${BASE_URL}/login`,
  registro: `${BASE_URL}/registrarUsuario`,
  perfil: `${BASE_URL}/obtenerDatosUsuario`,   // + /:id
  modificar: `${BASE_URL}/modificarUsuario`,       // + /:id
};

const STORAGE_KEY = "lanaLino_usuario";

// ============================================================
// SESIÓN
// ============================================================

function guardarSesion(usuario) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
}

function obtenerUsuarioLogueado() {
  const datos = localStorage.getItem(STORAGE_KEY);
  return datos ? JSON.parse(datos) : null;
}

function verificarSesion(redirigir = true) {
  const usuario = obtenerUsuarioLogueado();
  if (!usuario) {
    if (redirigir) window.location.href = "./login.html";
    return false;
  }
  return true;
}

function cerrarSesion() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = "./login.html";
}

// ============================================================
// ROLES
// ============================================================

function esAdmin() {
  const usuario = obtenerUsuarioLogueado();
  return usuario?.rol?.toLowerCase() === "admin";
}

/**
 * Busca elementos con data-rol="admin", data-rol="logueado", data-rol="no-logueado"
 * y los muestra u oculta según el estado de sesión y rol.
 */
function aplicarPermisosPorRol() {
  const usuario = obtenerUsuarioLogueado();

  document.querySelectorAll("[data-rol='admin']").forEach(el => {
    el.style.display = (usuario && esAdmin()) ? "" : "none";
  });

  document.querySelectorAll("[data-rol='logueado']").forEach(el => {
    el.style.display = usuario ? "" : "none";
  });

  document.querySelectorAll("[data-rol='no-logueado']").forEach(el => {
    el.style.display = !usuario ? "" : "none";
  });
}

// ============================================================
// FETCH CON TOKEN
// Usar esta función para todos los endpoints protegidos.
// Agrega automáticamente el header Authorization con el JWT.
// ============================================================

async function fetchConToken(url, opciones = {}) {
  const usuario = obtenerUsuarioLogueado();
  const headers = {
    "Content-Type": "application/json",
    ...opciones.headers,
  };
  if (usuario?.token) {
    headers["Authorization"] = usuario.token;
  }
  return fetch(url, { ...opciones, headers });
}

// ============================================================
// LLAMADAS A LA API
// ============================================================

async function loginUsuario(email, password) {
  // El backend recibe { email, password } y devuelve:
  // { codigo, mensaje, payload: [{ id_usuario, nombre, apellido, rol }], jwt }
  const respuesta = await fetch(API_ENDPOINTS.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const datos = await respuesta.json();

  // El backend devuelve codigo -1 cuando las credenciales son incorrectas (HTTP 200 igual)
  if (datos.codigo === -1 || !datos.payload || datos.payload.length === 0) {
    throw new Error(datos.mensaje || "Credenciales incorrectas.");
  }

  // Armar objeto de sesión unificado con los datos del usuario + el token
  const usuario = datos.payload[0];
  return {
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    rol: usuario.rol,
    token: datos.jwt,
  };
}

async function registrarUsuario(datosUsuario) {
  // El backend recibe: { nombre, apellido, direccion, email, telefono, rol, password }
  // El rol para usuarios normales siempre es "usuario"
  const payload = {
    ...datosUsuario,
    rol: datosUsuario.rol || "usuario",
  };

  const respuesta = await fetch(API_ENDPOINTS.registro, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const datos = await respuesta.json();
  if (datos.codigo === -1) {
    throw new Error(datos.mensaje || "No se pudo registrar el usuario.");
  }
  return datos;
}

async function obtenerPerfil(idUsuario) {
  // GET /api/obtenerDatosUsuario/:id  — requiere token
  const respuesta = await fetchConToken(`${API_ENDPOINTS.perfil}/${idUsuario}`);

  const datos = await respuesta.json();
  if (datos.codigo === -1) {
    throw new Error(datos.mensaje || "No se pudo obtener el perfil.");
  }
  // El backend devuelve el usuario en payload (array de 1 elemento)
  return Array.isArray(datos.payload) ? datos.payload[0] : datos.payload;
}

async function actualizarPerfil(idUsuario, datosActualizados) {
  // POST /api/modificarUsuario/:id  — requiere token (el backend usa POST, no PUT)
  const respuesta = await fetchConToken(`${API_ENDPOINTS.modificar}/${idUsuario}`, {
    method: "POST",
    body: JSON.stringify(datosActualizados),
  });

  const datos = await respuesta.json();
  if (datos.codigo === -1) {
    throw new Error(datos.mensaje || "No se pudo actualizar el perfil.");
  }
  return datos;
}

// ============================================================
// MODO OSCURO / CLARO
// ============================================================

function inicializarModo() {
  const modoGuardado = localStorage.getItem("lanaLino_modo") || "claro";
  document.documentElement.setAttribute("data-modo", modoGuardado);
}

function toggleModo() {
  const modoActual = document.documentElement.getAttribute("data-modo") || "claro";
  const nuevoModo = modoActual === "claro" ? "oscuro" : "claro";
  document.documentElement.setAttribute("data-modo", nuevoModo);
  localStorage.setItem("lanaLino_modo", nuevoModo);
}

// ============================================================
// UTILIDADES DE UI
// ============================================================

function mostrarMensaje(elemento, texto, tipo = "error") {
  elemento.textContent = texto;
  elemento.className = `mensaje mensaje--${tipo}`;
  elemento.style.display = "block";
  if (tipo === "exito") {
    setTimeout(() => { elemento.style.display = "none"; }, 4000);
  }
}

function ocultarMensaje(elemento) {
  elemento.style.display = "none";
  elemento.textContent = "";
}

function setBotonCargando(boton, cargando, textoOriginal = "Enviar") {
  boton.disabled = cargando;
  boton.textContent = cargando ? "Cargando..." : textoOriginal;
}

// ============================================================
// EXPORTAR AL ÁMBITO GLOBAL
// ============================================================
window.Auth = {
  BASE_URL,
  API_ENDPOINTS,
  fetchConToken,
  guardarSesion,
  obtenerUsuarioLogueado,
  verificarSesion,
  cerrarSesion,
  esAdmin,
  aplicarPermisosPorRol,
  loginUsuario,
  registrarUsuario,
  obtenerPerfil,
  actualizarPerfil,
  inicializarModo,
  toggleModo,
  mostrarMensaje,
  ocultarMensaje,
  setBotonCargando,
};