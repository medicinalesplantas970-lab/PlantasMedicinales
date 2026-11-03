/* Este archivo controla los formularios de iniciar sesión y crear una cuenta. */
(function () {
  // Atajo para buscar un elemento de HTML mediante su selector.
  const $ = (selector) => document.querySelector(selector);

  // Muestra mensajes debajo de los formularios, por ejemplo un error.
  const showMessage = (message) => {
    $("#formMessage").textContent = message;
  };

  const loginForm = $("#loginForm");

  // Este bloque solo funciona si estamos en la página de inicio de sesión.
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault(); // Evita que la página se recargue al enviar el formulario.

      const email = $("#email").value.trim().toLowerCase();
      const password = $("#password").value;
      const user = NaturalStore.get().users.find(
        (item) => item.email.toLowerCase() === email && item.password === password,
      );

      if (!user) {
        showMessage("Correo o contraseña incorrectos.");
        return;
      }

      NaturalStore.setUser(user.id);
      location.href = "paginas/inicio.html";
    });
  }

  const registerForm = $("#registerForm");

  // Este bloque solo funciona si estamos en la página de registro.
  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = $("#name").value.trim();
      const email = $("#email").value.trim().toLowerCase();
      const password = $("#password").value;
      const confirmation = $("#confirmPassword").value;
      const data = NaturalStore.get();

      if (password !== confirmation) {
        showMessage("Las contraseñas no coinciden.");
        return;
      }

      if (data.users.some((user) => user.email === email)) {
        showMessage("Este correo ya está registrado.");
        return;
      }

      // Las cuentas registradas por visitantes siempre comienzan como usuarios normales.
      const newUser = {
        id: NaturalStore.id(),
        name,
        email,
        password,
        role: "user",
        favorites: [],
      };

      data.users.push(newUser);
      NaturalStore.save(data);
      NaturalStore.setUser(newUser.id);
      location.href = "paginas/inicio.html";
    });
  }

  const forgotPassword = $("#forgotPassword");

  // En esta demostración local no existe correo de recuperación; por eso se informa al visitante.
  if (forgotPassword) {
    forgotPassword.addEventListener("click", (event) => {
      event.preventDefault();
      showMessage("Como es una demo local, crea una cuenta nueva o usa el acceso de administrador.");
    });
  }
})();
