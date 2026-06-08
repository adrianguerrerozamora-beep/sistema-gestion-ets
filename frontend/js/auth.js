document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("form-login");
    const alertError = document.getElementById("login-error");

    formLogin.addEventListener("submit", (e) => {
        e.preventDefault(); // Evita que el formulario recargue la página

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Creamos un objeto FormData para enviar al backend
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        fetch("../backend/src/Auth/login.php", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Si el login es correcto, redirigimos al dashboard
                window.location.href = "dashboard.html";
            } else {
                // Mostramos el mensaje de error del backend (ej. contraseña incorrecta)
                alertError.textContent = data.message;
                alertError.classList.remove("d-none");
            }
        })
        .catch(error => {
            console.error("Error en login:", error);
            alertError.textContent = "Error de comunicación con el servidor.";
            alertError.classList.remove("d-none");
        });
    });
});