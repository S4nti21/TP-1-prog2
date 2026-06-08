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
const BASE_URL = "http://localhost:3000/api"; // <-- CAMBIAR POR LA URL REAL

const API_ENDPOINTS = {
  login:    `${BASE_URL}/usuarios/login`,
  registro: `${BASE_URL}/usuarios/registro`,
  perfil:   `${BASE_URL}/usuarios`,  // se concatenará /{id}
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
    if (redirigir) window.location.href = "/pages/login.html";
    return false;
  }
  return true;
}

function cerrarSesion() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = "/pages/login.html";
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
// LLAMADAS A LA API
// ============================================================

async function loginUsuario(email, password) {
  const respuesta = await fetch(API_ENDPOINTS.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.mensaje || datos.message || "Credenciales incorrectas.");
  return datos;
}

async function registrarUsuario(datosUsuario) {
  const respuesta = await fetch(API_ENDPOINTS.registro, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datosUsuario),
  });

  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.mensaje || datos.message || "No se pudo registrar el usuario.");
  return datos;
}

async function obtenerPerfil(idUsuario) {
  const respuesta = await fetch(`${API_ENDPOINTS.perfil}/${idUsuario}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.mensaje || datos.message || "No se pudo obtener el perfil.");
  return datos;
}

async function actualizarPerfil(idUsuario, datosActualizados) {
  const respuesta = await fetch(`${API_ENDPOINTS.perfil}/${idUsuario}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datosActualizados),
  });

  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.mensaje || datos.message || "No se pudo actualizar el perfil.");
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