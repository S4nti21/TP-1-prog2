// login.js
// Lógica de la pantalla de inicio de sesión

document.addEventListener("DOMContentLoaded", function() {

    if (Auth.verificarSesion(false)) {
        window.location.href = "./index.html";
        return;
    }

    document.getElementById("formLogin").addEventListener("submit", manejarLogin);

});


async function manejarLogin(e) {

    e.preventDefault();
    limpiarErrores();

    var email    = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;
    var mensajeEl = document.getElementById("mensajeGlobal");
    var boton     = document.getElementById("btnLogin");

    // Validar antes de llamar a la API
    if (!validarCampos(email, password)) {
        return;
    }

    Auth.setBotonCargando(boton, true, "Iniciar Sesión");

    try {
        var usuario = await Auth.loginUsuario(email, password);

        Auth.guardarSesion(usuario);

        Auth.mostrarMensaje(mensajeEl, "Sesión iniciada correctamente. Redirigiendo...", "exito");

        setTimeout(function() {
            window.location.href = "./index.html";
        }, 1000);

    } catch (error) {
        Auth.mostrarMensaje(mensajeEl, error.message, "error");

    } finally {
        Auth.setBotonCargando(boton, false, "Iniciar Sesión");
    }

}


// Valida los campos del formulario
function validarCampos(email, password) {

    var valido = true;

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
    } else if (password.length < 4) {
        mostrarError("password", "La contraseña debe tener al menos 4 caracteres.");
        valido = false;
    }

    return valido;

}


// Verifica que el email tenga un formato correcto
function emailValido(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}


// Muestra un mensaje de error debajo del campo
function mostrarError(campoId, mensaje) {

    var input = document.getElementById(campoId);
    var errorId = "error" + campoId.charAt(0).toUpperCase() + campoId.slice(1);
    var errorEl = document.getElementById(errorId);

    input.classList.add("input--error");
    errorEl.textContent = mensaje;
    errorEl.classList.add("visible");

}


// Limpia todos los errores del formulario
function limpiarErrores() {

    var inputs = document.querySelectorAll(".campo input");
    inputs.forEach(function(input) {
        input.classList.remove("input--error");
    });

    var errores = document.querySelectorAll(".campo__error");
    errores.forEach(function(error) {
        error.textContent = "";
        error.classList.remove("visible");
    });

    Auth.ocultarMensaje(document.getElementById("mensajeGlobal"));

}