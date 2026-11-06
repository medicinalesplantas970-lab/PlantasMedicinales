import { NaturalStore } from "./storage.js";

startProfile().catch(showError);

async function startProfile() {
  await NaturalStore.initialize();
  const user = NaturalStore.currentUser();
  if (!user) {
    location.href = "../index.html";
    return;
  }

  setText("nombre-usuario", user.name);
  setText("correo-usuario", user.email);
  setText("rol-usuario", user.role === "admin" ? "Administrador" : "Usuario");
  setText("nombre-lateral", user.name);
  setupAvatar(user);
  await renderFavorites();
  const stop = NaturalStore.subscribe(["plants", "plant_likes"], () => renderFavorites().catch(showError), {
    plant_likes: `user_id=eq.${user.id}`,
  });
  window.addEventListener("pagehide", stop, { once: true });
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value || "";
}

function setupAvatar(user) {
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
    if (message) message.textContent = hasAvatar ? "Foto guardada en tu cuenta" : "Sin foto de perfil";
    if (hasAvatar) image.src = avatar;
    else image.removeAttribute("src");
  };
  showAvatar(user.avatar);

  image.addEventListener("error", () => {
    showAvatar("");
    if (message) message.textContent = "No se pudo mostrar la foto. Puedes elegir otra.";
  });

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      user.avatar = await NaturalStore.updateAvatar(file);
      showAvatar(user.avatar);
    } catch (error) {
      alert(error.message || "No se pudo guardar la fotografía.");
    } finally {
      input.value = "";
    }
  });

  removeButton?.addEventListener("click", async () => {
    try {
      await NaturalStore.removeAvatar();
      user.avatar = "";
      showAvatar("");
      input.value = "";
    } catch (error) {
      alert(error.message || "No se pudo quitar la fotografía.");
    }
  });
}

async function renderFavorites() {
  const list = document.getElementById("lista-favoritos");
  const counter = document.getElementById("contador-favoritos");
  if (!list) return;
  const plants = (await NaturalStore.listPlants()).filter((plant) => plant.likedByMe);
  if (counter) counter.textContent = String(plants.length);
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
    image.src = plant.image || "../imagenes/planta.svg";
    image.alt = plant.name || "Planta medicinal";
    const info = document.createElement("div");
    info.className = "info-planta";
    const title = document.createElement("h3");
    title.textContent = plant.name || "Planta medicinal";
    const description = document.createElement("p");
    description.textContent = plant.description || "Planta medicinal favorita";
    const heart = document.createElement("span");
    heart.textContent = "❤️";
    heart.setAttribute("aria-hidden", "true");
    info.append(title, description);
    card.append(image, info, heart);
    list.append(card);
  });
}

function showError(error) {
  console.error(error);
  const container = document.querySelector("main.page") || document.body;
  const message = document.createElement("p");
  message.className = "supabase-error message";
  message.setAttribute("role", "alert");
  message.textContent = error?.message || "No se pudo cargar el perfil desde Supabase.";
  container.prepend(message);
}
