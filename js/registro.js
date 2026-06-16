// registro.js
// Lógica de la pantalla de registro de nuevos usuarios

document.addEventListener("DOMContentLoaded", function() {

    Auth.inicializarModo();
    actualizarIconoModo();

    // Si ya tiene sesión, mandarlo al inicio
    if (Auth.verificarSesion(false)) {
        window.location.href = "./index.html";
        return;
    }

    document.getElementById("formRegistro").addEventListener("submit", manejarRegistro);
    document.getElementById("btnModo").addEventListener("click", cambiarModo);

});


// Maneja el submit del formulario de registro
async function manejarRegistro(e) {

    e.preventDefault();
    limpiarErrores();

    var nombre    = document.getElementById("nombre").value.trim();
    var apellido  = document.getElementById("apellido").value.trim();
    var email     = document.getElementById("email").value.trim();
    var password  = document.getElementById("password").value;
    var telefono  = document.getElementById("telefono").value.trim();
    var direccion = document.getElementById("direccion").value.trim();

    var mensajeEl = document.getElementById("mensajeGlobal");
    var boton     = document.getElementById("btnRegistro");

    if (!validarCampos(nombre, apellido, email, password)) {
        return;
    }

    Auth.setBotonCargando(boton, true, "Crear cuenta");

    try {
        // Armar el objeto con los datos del usuario
        var datosUsuario = {
            nombre: nombre,
            apellido: apellido,
            email: email,
            password: password,
            telefono: telefono,
            direccion: direccion
        };

        await Auth.registrarUsuario(datosUsuario);

        Auth.mostrarMensaje(mensajeEl, "Cuenta creada correctamente. Redirigiendo al login...", "exito");

        setTimeout(function() {
            window.location.href = "login.html";
        }, 2000);

    } catch (error) {
        Auth.mostrarMensaje(mensajeEl, error.message, "error");

    } finally {
        Auth.setBotonCargando(boton, false, "Crear cuenta");
    }

}


// Valida los campos obligatorios del formulario
function validarCampos(nombre, apellido, email, password) {

    var valido = true;

    if (nombre === "") {
        mostrarError("nombre", "El nombre es obligatorio.");
        valido = false;
    } else if (nombre.length < 2) {
        mostrarError("nombre", "El nombre debe tener al menos 2 caracteres.");
        valido = false;
    }

    if (apellido === "") {
        mostrarError("apellido", "El apellido es obligatorio.");
        valido = false;
    } else if (apellido.length < 2) {
        mostrarError("apellido", "El apellido debe tener al menos 2 caracteres.");
        valido = false;
    }

    if (email === "") {
        mostrarError("email", "El email es obligatorio.");
        valido = false;
    } else if (!emailValido(email)) {
        mostrarError("email", "Ingresá un email válido.");
        valido = false;
    }

    if (password === "") {
        mostrarError("password", "La contraseña es obligatoria.");
        valido = false;
    } else if (password.length < 6) {
        mostrarError("password", "La contraseña debe tener al menos 6 caracteres.");
        valido = false;
    }

    return valido;

}


function emailValido(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}


function mostrarError(campoId, mensaje) {

    var input = document.getElementById(campoId);
    var errorId = "error" + campoId.charAt(0).toUpperCase() + campoId.slice(1);
    var errorEl = document.getElementById(errorId);

    if (input)   input.classList.add("input--error");
    if (errorEl) {
        errorEl.textContent = mensaje;
        errorEl.classList.add("visible");
    }

}


function limpiarErrores() {

    document.querySelectorAll(".campo input").forEach(function(input) {
        input.classList.remove("input--error");
    });

    document.querySelectorAll(".campo__error").forEach(function(error) {
        error.textContent = "";
        error.classList.remove("visible");
    });

    Auth.ocultarMensaje(document.getElementById("mensajeGlobal"));

}