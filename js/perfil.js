document.addEventListener("DOMContentLoaded", () => {
  const store = window.NaturalStore;
  if (!store) return;

  const user = store.currentUser();
  const data = store.get();
  if (!user || !data) return;

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  setText("nombre-usuario", user.name || user.nombre || "Usuario");
  setText("correo-usuario", user.email || user.correo || "");
  setText("rol-usuario", user.role === "admin" ? "Administrador" : "Usuario");
  setText("nombre-lateral", user.name || user.nombre || "Usuario");

  setupAvatar(user);
  renderFavorites(data, user);

  function setupAvatar(currentUser) {
    const input = document.getElementById("foto-archivo");
    const image = document.getElementById("foto-usuario");
    const placeholder = document.getElementById("avatar-vacio");
    const removeButton = document.getElementById("quitar-foto");
    const buttonText = document.getElementById("texto-boton-foto");
    const message = document.getElementById("mensaje-foto");
    if (!input || !image || !placeholder) return;

    const showAvatar = (avatar) => {
      const hasAvatar = Boolean(avatar);
      image.hidden = !hasAvatar;
      placeholder.hidden = hasAvatar;
      if (removeButton) removeButton.hidden = !hasAvatar;
      if (buttonText) buttonText.textContent = hasAvatar ? "Cambiar foto" : "Añadir foto";
      if (message) message.textContent = hasAvatar ? "Foto guardada en este navegador" : "Sin foto de perfil";

      if (hasAvatar) image.src = avatar;
      else image.removeAttribute("src");
    };

    const saveAvatar = (avatar) => {
      const savedData = store.get();
      const savedUser = savedData.users.find((item) => item.id === currentUser.id);
      if (!savedUser) throw new Error("No se encontró la cuenta activa.");

      if (avatar) savedUser.avatar = avatar;
      else delete savedUser.avatar;

      store.save(savedData);
      currentUser.avatar = avatar || "";
    };

    showAvatar(currentUser.avatar || "");

    image.addEventListener("error", () => {
      showAvatar("");
      if (message) message.textContent = "No se pudo mostrar la foto. Puedes elegir otra.";
    });

    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Selecciona un archivo de imagen.");
        input.value = "";
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert("La fotografía debe pesar menos de 2 MB.");
        input.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          saveAvatar(String(reader.result));
          showAvatar(currentUser.avatar);
        } catch (error) {
          alert("No se pudo guardar la fotografía en este navegador.");
        }
        input.value = "";
      };
      reader.onerror = () => {
        alert("No se pudo leer el archivo de imagen.");
        input.value = "";
      };
      reader.readAsDataURL(file);
    });

    if (removeButton) {
      removeButton.addEventListener("click", () => {
        try {
          saveAvatar("");
          showAvatar("");
          input.value = "";
        } catch (error) {
          alert("No se pudo quitar la fotografía guardada.");
        }
      });
    }
  }

  function renderFavorites(savedData, currentUser) {
    const list = document.getElementById("lista-favoritos");
    const counter = document.getElementById("contador-favoritos");
    const favoriteIds = Array.isArray(currentUser.favorites) ? currentUser.favorites : [];
    const plants = (Array.isArray(savedData.plants) ? savedData.plants : []).filter((plant) =>
      favoriteIds.includes(String(plant.id)),
    );

    if (counter) counter.textContent = plants.length;
    if (!list) return;

    list.replaceChildren();
    if (!plants.length) {
      list.innerHTML = `
        <div class="favoritos-vacios">
          <span>💚</span>
          <h3>Aún no tienes favoritos</h3>
          <p>Explora los remedios naturales y pulsa “Me gusta” para guardar tus plantas aquí.</p>
          <a href="remedios.html" class="boton boton-explorar">Explorar plantas 🌿</a>
        </div>`;
      return;
    }

    plants.forEach((plant) => {
      const card = document.createElement("article");
      card.className = "planta-favorita";

      const image = document.createElement("img");
      image.src = plant.imagen || plant.image || "../imagenes/planta.svg";
      image.alt = plant.nombre || plant.name || "Planta medicinal";

      const info = document.createElement("div");
      info.className = "info-planta";

      const title = document.createElement("h3");
      title.textContent = plant.nombre || plant.name || "Planta medicinal";

      const description = document.createElement("p");
      description.textContent = plant.descripcion || plant.description || "Planta medicinal favorita";

      const heart = document.createElement("span");
      heart.textContent = "❤️";
      heart.setAttribute("aria-hidden", "true");

      info.append(title, description);
      card.append(image, info, heart);
      list.append(card);
    });
  }
});
