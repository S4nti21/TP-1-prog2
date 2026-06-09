// perfil.js
// Lógica de la pantalla de perfil del usuario

// Variable global para guardar los datos del usuario en esta página
var usuarioActual = null;


document.addEventListener("DOMContentLoaded", async function () {

    Auth.inicializarModo();
    actualizarIconoModo();

    // Si no hay sesión, redirigir al login
    if (!Auth.verificarSesion(true)) {
        return;
    }

    usuarioActual = Auth.obtenerUsuarioLogueado();

    // Cargar el perfil desde la API
    await cargarPerfil();

    // Aplicar visibilidad según rol (admin o no)
    Auth.aplicarPermisosPorRol();

    // Eventos de los botones
    document.getElementById("btnEditar").addEventListener("click", activarEdicion);
    document.getElementById("btnGuardar").addEventListener("click", guardarCambios);
    document.getElementById("btnCancelar").addEventListener("click", cancelarEdicion);
    document.getElementById("btnCerrarSesion").addEventListener("click", Auth.cerrarSesion);
    document.getElementById("btnModo").addEventListener("click", cambiarModo);

});


// Pide el perfil a la API y lo muestra en pantalla
async function cargarPerfil() {

    try {
        var id = usuarioActual.id_usuario || usuarioActual.id;
        var datos = await Auth.obtenerPerfil(id);

        // Actualizar localStorage con los datos frescos de la API
        Auth.guardarSesion(Object.assign({}, usuarioActual, datos));
        usuarioActual = Auth.obtenerUsuarioLogueado();

    } catch (error) {
        // Si falla la API, usar los datos que ya tenemos en localStorage
        console.log("No se pudo cargar desde la API, se usan datos locales.");
    }

    // Mostrar los datos en pantalla
    mostrarDatosPerfil(usuarioActual);

    // Ocultar el loading y mostrar el contenido
    document.getElementById("cargandoPerfil").style.display = "none";
    document.getElementById("paginaPerfil").style.display = "block";

}


// Rellena el HTML con los datos del usuario
function mostrarDatosPerfil(usuario) {

    document.getElementById("verNombre").textContent = usuario.nombre || "—";
    document.getElementById("verApellido").textContent = usuario.apellido || "—";
    document.getElementById("verEmail").textContent = usuario.email || "—";
    document.getElementById("verTelefono").textContent = usuario.telefono || "—";
    document.getElementById("verDireccion").textContent = usuario.direccion || "—";

    // Cargar los valores en los inputs de edición también
    document.getElementById("editNombre").value = usuario.nombre || "";
    document.getElementById("editApellido").value = usuario.apellido || "";
    document.getElementById("editTelefono").value = usuario.telefono || "";
    document.getElementById("editDireccion").value = usuario.direccion || "";

    // Mostrar iniciales en el avatar
    var inicial1 = usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : "?";
    var inicial2 = usuario.apellido ? usuario.apellido.charAt(0).toUpperCase() : "";
    var avatar = document.getElementById("avatarIniciales");
    if (avatar) avatar.textContent = inicial1 + inicial2;

}


// Activa el modo edición: muestra los inputs y oculta los textos
function activarEdicion() {

    document.getElementById("seccionDatos").classList.add("edicion-activa");

    document.getElementById("btnEditar").style.display = "none";
    document.getElementById("btnGuardar").style.display = "block";
    document.getElementById("btnCancelar").style.display = "block";

}


// Cancela la edición sin guardar
function cancelarEdicion() {

    document.getElementById("seccionDatos").classList.remove("edicion-activa");

    document.getElementById("btnEditar").style.display = "block";
    document.getElementById("btnGuardar").style.display = "none";
    document.getElementById("btnCancelar").style.display = "none";

    // Restaurar valores originales en los inputs
    mostrarDatosPerfil(usuarioActual);
    limpiarErrores();
    Auth.ocultarMensaje(document.getElementById("mensajePerfil"));

}


// Guarda los cambios del perfil llamando a la API
async function guardarCambios() {

    limpiarErrores();

    var nombre = document.getElementById("editNombre").value.trim();
    var apellido = document.getElementById("editApellido").value.trim();
    var telefono = document.getElementById("editTelefono").value.trim();
    var direccion = document.getElementById("editDireccion").value.trim();

    var mensajeEl = document.getElementById("mensajePerfil");
    var boton = document.getElementById("btnGuardar");

    // Validaciones básicas
    var valido = true;

    if (nombre === "") {
        mostrarError("nombre", "El nombre es obligatorio.");
        valido = false;
    }

    if (apellido === "") {
        mostrarError("apellido", "El apellido es obligatorio.");
        valido = false;
    }

    if (!valido) return;

    Auth.setBotonCargando(boton, true, "Guardar cambios");

    try {
        var id = usuarioActual.id_usuario || usuarioActual.id;

        var datosActualizados = {
            nombre: nombre,
            apellido: apellido,
            telefono: telefono,
            direccion: direccion
        };

        var respuesta = await Auth.actualizarPerfil(id, datosActualizados);

        // Actualizar el usuario en localStorage
        var usuarioNuevo = Object.assign({}, usuarioActual, datosActualizados, respuesta);
        Auth.guardarSesion(usuarioNuevo);
        usuarioActual = usuarioNuevo;

        // Actualizar la pantalla
        mostrarDatosPerfil(usuarioActual);

        Auth.mostrarMensaje(mensajeEl, "Datos actualizados correctamente.", "exito");

        // Salir del modo edición después de un momento
        setTimeout(function () {
            cancelarEdicion();
        }, 1500);

    } catch (error) {
        Auth.mostrarMensaje(mensajeEl, error.message, "error");

    } finally {
        Auth.setBotonCargando(boton, false, "Guardar cambios");
    }

}


function mostrarError(campoId, mensaje) {

    var input = document.getElementById("edit" + campoId.charAt(0).toUpperCase() + campoId.slice(1));
    var errorEl = document.getElementById("error" + campoId.charAt(0).toUpperCase() + campoId.slice(1));

    if (input) input.classList.add("input--error");
    if (errorEl) {
        errorEl.textContent = mensaje;
        errorEl.classList.add("visible");
    }

}


function limpiarErrores() {

    document.querySelectorAll(".campo input").forEach(function (input) {
        input.classList.remove("input--error");
    });

    document.querySelectorAll(".campo__error").forEach(function (error) {
        error.textContent = "";
        error.classList.remove("visible");
    });

}


function cambiarModo() {
    Auth.toggleModo();
    actualizarIconoModo();
}


function actualizarIconoModo() {
    var modo = document.documentElement.getAttribute("data-modo");
    document.getElementById("iconoModo").textContent = modo === "oscuro" ? "🌙" : "☀️";
}