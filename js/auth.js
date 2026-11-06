import { NaturalStore } from "./storage.js";

const showMessage = (message) => {
  const element = document.getElementById("formMessage");
  if (element) element.textContent = message;
};

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = loginForm.querySelector('button[type="submit"]');
    button.disabled = true;
    showMessage("Conectando...");
    try {
      await NaturalStore.signIn(
        document.getElementById("email").value.trim().toLowerCase(),
        document.getElementById("password").value,
      );
      location.href = "paginas/inicio.html";
    } catch (error) {
      showMessage(error.message || "No se pudo iniciar sesión.");
      button.disabled = false;
    }
  });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = registerForm.querySelector('button[type="submit"]');
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const confirmation = document.getElementById("confirmPassword").value;
    if (password !== confirmation) {
      showMessage("Las contraseñas no coinciden.");
      return;
    }

    button.disabled = true;
    showMessage("Creando la cuenta...");
    try {
      const result = await NaturalStore.signUp(name, email, password);
      if (result.signedIn) {
        location.href = "paginas/inicio.html";
        return;
      }
      showMessage("Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión.");
      button.disabled = false;
    } catch (error) {
      showMessage(error.message || "No se pudo crear la cuenta.");
      button.disabled = false;
    }
  });
}

const forgotPassword = document.getElementById("forgotPassword");
if (forgotPassword) {
  forgotPassword.addEventListener("click", (event) => {
    event.preventDefault();
    showMessage("Para restablecer la contraseña, configura el proveedor de correo en Supabase Auth.");
  });
}
