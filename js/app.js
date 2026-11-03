/*
 * app.js controla las páginas internas: menú, remedios, perfil y administración.
 * Todo se ejecuta dentro de una función para no mezclar sus variables con otros archivos.
 */
(function () {
  // Si nadie inició sesión, no se permite entrar a las páginas privadas.
  const user = NaturalStore.currentUser();
  if (!user) {
    location.href = "../index.html";
    return;
  }

  const page = document.body.dataset.page;
  const isAdmin = user.role === "admin";
  if (page) NaturalStore.recordVisit(page);

  // El menú se construye una sola vez y muestra enlaces extra al administrador.
  const navbar = document.getElementById("navbar");
  if (navbar) {
    navbar.innerHTML = `
      <header class="barra">
        <a class="logo" href="inicio.html">🌿 NaturalApp</a>
        <button class="menu-toggle" id="menu-toggle" type="button" aria-label="Abrir menú" aria-expanded="false">☰</button>
        <nav class="menu" id="menu">
          <a href="inicio.html" ${page === "inicio" ? 'class="activo"' : ""}>Inicio</a>
          <a href="remedios.html" ${page === "remedios" ? 'class="activo"' : ""}>Remedios</a>
          ${isAdmin ? `<a href="agregar-planta.html" ${page === "agregar" ? 'class="activo"' : ""}>Administrar plantas</a><a href="dashboard.html" ${page === "dashboard" ? 'class="activo"' : ""}>Visitas</a>` : ""}
          <a href="perfil.html" ${page === "perfil" ? 'class="activo"' : ""}>Perfil</a>
          <a href="#" id="logout">Salir</a>
        </nav>
      </header>`;
  }

  // Menú adaptable compartido por todas las vistas privadas.
  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
  if (menuToggle && menu) {
    const closeMenu = () => {
      menu.classList.remove("abierto");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menú");
      menuToggle.textContent = "☰";
    };

    menuToggle.onclick = () => {
      const isOpen = menu.classList.toggle("abierto");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
      menuToggle.textContent = isOpen ? "✕" : "☰";
    };
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("click", (event) => {
      if (!menu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });
  }

  // Al salir, se borra solo la sesión actual.
  const logoutLink = document.getElementById("logout");
  if (logoutLink) {
    logoutLink.onclick = (event) => {
      event.preventDefault();
      NaturalStore.logout();
      location.href = "../index.html";
    };
  }

  // Elegimos qué contenido mostrar según el atributo data-page de cada HTML.
  if (page === "remedios") renderRemedies();
  if (page === "perfil") renderProfile();
  if (page === "agregar") renderAdminForm();
  if (page === "dashboard") renderDashboard();

  // Dibuja todas las plantas como tarjetas de remedios.
  function renderRemedies() {
    const container = document.getElementById("plants");
    if (!container) return;
    const data = NaturalStore.get();

    container.innerHTML = data.plants
      .map(
        (plant) => `
          <article class="card">
            <img src="${plant.image}" alt="${plant.name}">
              <h2>${plant.name}</h2>
              <p class="plant-description"><strong>Descripción:</strong> ${plant.description}</p>
              <p class="plant-uses"><strong>Uso tradicional:</strong> ${plant.uses}</p>
              <p class="plant-preparation"><strong>Preparación:</strong> ${plant.preparation || "No especificada."}</p>
            <div class="actions">
              <button data-like="${plant.id}">♥ Me gusta (${plant.likes ?? 0})</button>
              ${isAdmin ? `<button data-edit="${plant.id}">Editar</button>` : ""}
            </div>
            <h3>Comentarios</h3>
            <ul class="comment-list">
              ${plant.comments
                .map(
                  (comment, index) => `
                    <li>
                      <strong>${comment.name}:</strong> ${comment.text}
                      ${isAdmin || comment.userId === user.id ? `<button data-comment-delete="${plant.id}|${index}">Eliminar</button>` : ""}
                    </li>`,
                )
                .join("") || "<li>Aún no hay comentarios.</li>"}
            </ul>
            <form class="comment-form" data-id="${plant.id}">
              <input required maxlength="200" placeholder="Escribe un comentario">
              <button>Comentar</button>
            </form>
          </article>`,
      )
      .join("");

    // Conectamos los botones que se crearon dinámicamente en las tarjetas.
    container.querySelectorAll("[data-like]").forEach((button) => {
      button.onclick = () => like(button.dataset.like);
    });
    container.querySelectorAll(".comment-form").forEach((form) => {
      form.onsubmit = (event) => {
        event.preventDefault();
        comment(form.dataset.id, form.querySelector("input").value);
      };
    });
    container.querySelectorAll("[data-edit]").forEach((button) => {
      button.onclick = () => {
        location.href = `agregar-planta.html?edit=${button.dataset.edit}`;
      };
    });
    container.querySelectorAll("[data-comment-delete]").forEach((button) => {
      button.onclick = () => deleteComment(...button.dataset.commentDelete.split("|"));
    });
  }

  // Alterna un "me gusta" y lo guarda como favorito del usuario actual.
  function like(plantId) {
    const data = NaturalStore.get();
    const plant = data.plants.find((item) => item.id === plantId);
    const key = `${user.id}_${plantId}`;

    if (data.likedBy[key]) {
      data.likedBy[key] = false;
      plant.likes -= 1;
      user.favorites = user.favorites.filter((id) => id !== plantId);
    } else {
      data.likedBy[key] = true;
      plant.likes += 1;
      user.favorites.push(plantId);
    }

    data.users.find((item) => item.id === user.id).favorites = user.favorites;
    NaturalStore.save(data);
    renderRemedies();
  }

  // Crea y guarda un comentario asociado al usuario que lo escribió.
  function comment(plantId, text) {
    const data = NaturalStore.get();
    const plant = data.plants.find((item) => item.id === plantId);
    plant.comments.push({ id: NaturalStore.id(), userId: user.id, name: user.name, text: text.trim() });
    NaturalStore.save(data);
    renderRemedies();
  }

  // El administrador puede borrar todos; un usuario solo puede borrar los propios.
  function deleteComment(plantId, index) {
    const data = NaturalStore.get();
    const plant = data.plants.find((item) => item.id === plantId);
    const commentToDelete = plant?.comments[Number(index)];

    if (!commentToDelete || (!isAdmin && commentToDelete.userId !== user.id)) return;
    if (confirm("¿Eliminar este comentario?")) {
      plant.comments.splice(Number(index), 1);
      NaturalStore.save(data);
      renderRemedies();
    }
  }

  // Muestra los datos del usuario y sus plantas marcadas como favoritas.
  function renderProfile() {
    const data = NaturalStore.get();
    const favorites = data.plants.filter((plant) => user.favorites.includes(plant.id));
    const profile = document.getElementById("profile");
    if (!profile) return;
    profile.innerHTML = `
      <h1>Mi perfil</h1>
      <p><strong>Nombre:</strong> ${user.name}</p>
      <p><strong>Correo:</strong> ${user.email}</p>
      <p><strong>Rol:</strong> ${isAdmin ? "Administrador" : "Usuario"}</p>
      <h2>Mis favoritos</h2>
      <div class="cards">
        ${favorites.map((plant) => `<article class="card"><h3>${plant.name}</h3><p>${plant.description}</p><a href="remedios.html">Ver remedios</a></article>`).join("") || "<p>Aún no has marcado plantas como favoritas.</p>"}
      </div>`;
  }

  // Comprueba que solamente el administrador acceda a esta página.
  function renderAdminForm() {
    if (!isAdmin) {
      location.href = "inicio.html";
      return;
    }

    const editId = new URLSearchParams(location.search).get("edit");
    const data = NaturalStore.get();
    const plant = data.plants.find((item) => item.id === editId);
    const content = document.getElementById("adminContent");
    if (!content) return;

    content.innerHTML = `
      <header class="admin-page-header">
        <div>
          <p class="admin-eyebrow">CATÁLOGO NATURALAPP</p>
          <h1>Administrar plantas</h1>
          <p>Agrega, edita o elimina las fichas del catálogo.</p>
        </div>
        <button class="boton" id="openPlantForm" type="button"><span aria-hidden="true">＋</span> Nueva planta</button>
      </header>
      <section class="admin-list-section">
        <div class="admin-list-heading">
          <h2>Plantas del catálogo</h2>
          <span>${data.plants.length} ${data.plants.length === 1 ? "planta" : "plantas"}</span>
        </div>
        <section id="adminPlants" class="cards" aria-label="Plantas administrables"></section>
      </section>
      <dialog class="plant-dialog" id="plantDialog" aria-labelledby="plantDialogTitle">
        <div class="dialog-header">
          <div>
            <p class="admin-eyebrow">${plant ? "EDITAR FICHA" : "NUEVA FICHA"}</p>
            <h2 id="plantDialogTitle">${plant ? "Editar planta" : "Agregar planta"}</h2>
          </div>
          <button class="dialog-close" id="closePlantDialog" type="button" aria-label="Cerrar formulario">×</button>
        </div>
        ${plantFormHtml(plant, plant ? "Guardar cambios" : "Agregar al catálogo")}
      </dialog>`;

    const dialog = document.getElementById("plantDialog");
    const closeDialog = () => {
      if (plant) {
        location.href = "agregar-planta.html";
        return;
      }
      dialog.close();
    };

    document.getElementById("openPlantForm").onclick = () => {
      if (plant) {
        location.href = "agregar-planta.html";
        return;
      }
      dialog.showModal();
    };
    document.getElementById("closePlantDialog").onclick = closeDialog;
    document.getElementById("cancelPlantForm").onclick = closeDialog;
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener("cancel", (event) => {
      if (plant) {
        event.preventDefault();
        closeDialog();
      }
    });

    const form = document.getElementById("plantForm");
    form.onsubmit = async (event) => {
      event.preventDefault();
      const image = await getFormImage(plant?.image || "");
      if (!image) return;
      const savedData = NaturalStore.get();

      if (plant) {
        savedData.plants = savedData.plants.map((item) =>
          item.id === plant.id ? { ...item, ...readPlantFields(), image } : item,
        );
        NaturalStore.save(savedData);
        location.href = "remedios.html";
        return;
      }

      savedData.plants.push({ id: NaturalStore.id(), ...readPlantFields(), image, likes: 0, comments: [] });
      NaturalStore.save(savedData);
      dialog.close();
      renderAdminForm();
    };

    const list = document.getElementById("adminPlants");
    list.innerHTML = data.plants.map((item) => `
      <article class="card admin-plant-card">
        <div>
          <h3>${item.name}</h3>
          <p>${item.uses || item.description || "Sin descripción disponible."}</p>
        </div>
        <div class="admin-card-actions">
          <button type="button" data-edit="${item.id}">Editar</button>
          <button class="button-danger" type="button" data-delete="${item.id}">Eliminar</button>
        </div>
      </article>`).join("");

    list.querySelectorAll("[data-edit]").forEach((button) => {
      button.onclick = () => {
        location.href = `agregar-planta.html?edit=${encodeURIComponent(button.dataset.edit)}`;
      };
    });
    list.querySelectorAll("[data-delete]").forEach((button) => {
      button.onclick = () => {
        if (confirm("¿Eliminar esta planta?")) {
          const savedData = NaturalStore.get();
          savedData.plants = savedData.plants.filter((item) => item.id !== button.dataset.delete);
          NaturalStore.save(savedData);
          renderAdminForm();
        }
      };
    });

    if (plant) dialog.showModal();
  }

  // Devuelve el contenido del diálogo compartido para agregar y editar plantas.
  function plantFormHtml(plant, buttonText) {
    return `<form id="plantForm">
      <label>Nombre<input id="pname" required value="${plant?.name || ""}"></label>
      <label>URL de imagen (opcional)<input id="pimage" type="url" value="${plant && !plant.image.startsWith("data:") ? plant.image : ""}"></label>
      <label>O sube una imagen desde tu dispositivo<input id="pfile" type="file" accept="image/*"></label>
      <label>Descripción<textarea id="pdescription" required>${plant?.description || ""}</textarea></label>
      <label>Uso tradicional<input id="puses" required value="${plant?.uses || ""}"></label>
      <label>Preparación (opcional)<textarea id="ppreparation">${plant?.preparation || ""}</textarea></label>
      <div class="form-actions">
        <button type="submit">${buttonText}</button>
        <button class="dialog-cancel" id="cancelPlantForm" type="button">Cancelar</button>
      </div>
    </form>`;
  }

  // Lee los textos que el administrador escribió en el formulario.
  function readPlantFields() {
    return {
      name: document.getElementById("pname").value.trim(),
      description: document.getElementById("pdescription").value.trim(),
      uses: document.getElementById("puses").value.trim(),
      preparation: document.getElementById("ppreparation").value.trim(),
    };
  }

  // Convierte una imagen elegida desde el equipo en texto para poder guardarla localmente.
  async function getFormImage(existingImage = "") {
    const file = document.getElementById("pfile").files[0];
    const url = document.getElementById("pimage").value.trim();
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("La imagen debe pesar menos de 2 MB.");
        return null;
      }
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
        reader.readAsDataURL(file);
      });
    }
    if (url) return url;
    if (existingImage) return existingImage;
    alert("Agrega una URL o selecciona una imagen desde tu dispositivo.");
    return null;
  }

  // Presenta las estadísticas que solo debe ver el administrador.
  function renderDashboard() {
    if (!isAdmin) {
      location.href = "inicio.html";
      return;
    }

    const dashboard = document.getElementById("dashboard");
    if (!dashboard) return;
    const data = NaturalStore.get();
    const safeCount = (value) => {
      const count = Number(value);
      return Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;
    };
    const formatCount = (value) => safeCount(value).toLocaleString("es-BO");
    const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);

    const labels = {
      inicio: "Inicio",
      remedios: "Remedios",
      perfil: "Perfil",
      agregar: "Administración de plantas",
      dashboard: "Visitas",
    };
    const icons = { inicio: "⌂", remedios: "✿", perfil: "♙", agregar: "＋", dashboard: "↗" };
    const rawPageViews = data.pageViews && typeof data.pageViews === "object" ? data.pageViews : {};
    const pageViews = Object.entries(rawPageViews)
      .map(([name, count]) => ({
        key: String(name).trim(),
        count: safeCount(count),
      }))
      .filter(({ key, count }) => key && !["undefined", "null", "nan"].includes(key.toLowerCase()) && count > 0)
      .sort((first, second) => second.count - first.count);
    const highestPageCount = Math.max(1, ...pageViews.map(({ count }) => count));
    const totalUsers = Array.isArray(data.users) ? data.users.length : 0;
    const totalPlants = Array.isArray(data.plants) ? data.plants.length : 0;

    dashboard.innerHTML = `
      <section class="dashboard-header">
        <div>
          <p class="dashboard-eyebrow">NATURALAPP · RESUMEN</p>
          <h1>Panel de visitas</h1>
          <p>Actividad registrada en este navegador.</p>
        </div>
        <span class="dashboard-status"><span aria-hidden="true">●</span> Datos locales</span>
      </section>

      <section class="dashboard" aria-label="Indicadores generales">
        <article class="metric metric-visits">
          <span class="metric-icon" aria-hidden="true">↗</span>
          <p>Visitas totales</p>
          <strong>${formatCount(data.visits)}</strong>
          <small>Actividad acumulada</small>
        </article>
        <article class="metric metric-users">
          <span class="metric-icon" aria-hidden="true">♙</span>
          <p>Usuarios registrados</p>
          <strong>${formatCount(totalUsers)}</strong>
          <small>Cuentas guardadas localmente</small>
        </article>
        <article class="metric metric-plants">
          <span class="metric-icon" aria-hidden="true">🌿</span>
          <p>Plantas publicadas</p>
          <strong>${formatCount(totalPlants)}</strong>
          <small>En el catálogo actual</small>
        </article>
      </section>

      <section class="page-analytics">
        <div class="analytics-heading">
          <div>
            <p class="dashboard-eyebrow">DETALLE</p>
            <h2>Visitas por sección</h2>
          </div>
          <span>${pageViews.length} ${pageViews.length === 1 ? "sección" : "secciones"}</span>
        </div>
        <div class="page-view-list">
          ${pageViews.map(({ key, count }) => {
            const label = escapeHtml(labels[key] || key);
            const percentage = Math.round((count / highestPageCount) * 100);
            return `
              <details class="page-view-card">
                <summary>
                  <span class="page-view-icon" aria-hidden="true">${icons[key] || "•"}</span>
                  <span class="page-view-name"><strong>${label}</strong><small>Mostrar detalle</small></span>
                  <span class="page-view-count">${formatCount(count)}</span>
                  <span class="page-view-chevron" aria-hidden="true">⌄</span>
                </summary>
                <div class="page-view-detail">
                  <div class="visit-track"><span style="width:${percentage}%"></span></div>
                  <p>${percentage}% del máximo de visitas registrado</p>
                </div>
              </details>`;
          }).join("") || `
            <div class="analytics-empty">
              <span aria-hidden="true">🌱</span>
              <p>Aún no hay visitas por sección para mostrar.</p>
            </div>`}
        </div>
      </section>`;
  }
})();
