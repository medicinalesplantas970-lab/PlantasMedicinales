import { NaturalStore } from "./storage.js";

const page = document.body.dataset.page;
let currentUser = null;
let isAdmin = false;
let stopRealtime = null;

start().catch(showError);

async function start() {
  await NaturalStore.initialize();
  currentUser = NaturalStore.currentUser();
  if (!currentUser) {
    location.href = "../index.html";
    return;
  }
  isAdmin = currentUser.role === "admin";
  if ((page === "agregar" || page === "dashboard") && !isAdmin) {
    location.href = "inicio.html";
    return;
  }

  if (page) await NaturalStore.recordVisit(page);
  renderNavbar();

  if (page === "remedios") {
    await renderRemedies();
    stopRealtime = NaturalStore.subscribe(["plants", "plant_comments"], () => renderRemedies().catch(showError));
  }
  if (page === "agregar") {
    await renderAdminForm();
    stopRealtime = NaturalStore.subscribe(["plants"], () => renderAdminForm().catch(showError));
  }
  if (page === "dashboard") {
    await renderDashboard();
    stopRealtime = NaturalStore.subscribe(["page_visits", "plants", "profiles"], () => renderDashboard().catch(showError));
  }
  window.addEventListener("pagehide", () => stopRealtime?.(), { once: true });
}

function renderNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;
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

  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
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
  document.getElementById("logout").onclick = async (event) => {
    event.preventDefault();
    try {
      await NaturalStore.signOut();
      location.href = "../index.html";
    } catch (error) {
      showError(error);
    }
  };
}

async function renderRemedies() {
  const container = document.getElementById("plants");
  if (!container) return;
  const plants = await NaturalStore.listPlants();
  container.innerHTML = plants.map((plant) => `
    <article class="card">
      <img src="${escapeHtml(plant.image)}" alt="${escapeHtml(plant.name)}">
      <h2>${escapeHtml(plant.name)}</h2>
      <p class="plant-description"><strong>Descripción:</strong> ${escapeHtml(plant.description)}</p>
      <p class="plant-uses"><strong>Uso tradicional:</strong> ${escapeHtml(plant.uses)}</p>
      <p class="plant-preparation"><strong>Preparación:</strong> ${escapeHtml(plant.preparation || "No especificada.")}</p>
      <div class="actions">
        <button data-like="${escapeHtml(plant.id)}">♥ Me gusta (${formatCount(plant.likes)})</button>
        ${isAdmin ? `<button data-edit="${escapeHtml(plant.id)}">Editar</button>` : ""}
      </div>
      <h3>Comentarios</h3>
      <ul class="comment-list">
        ${plant.comments.map((comment) => `
          <li><strong>${escapeHtml(comment.name)}:</strong> ${escapeHtml(comment.text)}
            ${isAdmin || comment.userId === currentUser.id ? `<button data-comment-delete="${escapeHtml(comment.id)}">Eliminar</button>` : ""}
          </li>`).join("") || "<li>Aún no hay comentarios.</li>"}
      </ul>
      <form class="comment-form" data-id="${escapeHtml(plant.id)}">
        <input required maxlength="200" placeholder="Escribe un comentario" aria-label="Escribe un comentario">
        <button type="submit">Comentar</button>
      </form>
    </article>`).join("") || "<p>Aún no hay plantas en el catálogo.</p>";

  container.querySelectorAll("[data-like]").forEach((button) => {
    button.onclick = async () => {
      button.disabled = true;
      try {
        await NaturalStore.toggleLike(button.dataset.like);
        await renderRemedies();
      } catch (error) { showError(error); }
    };
  });
  container.querySelectorAll(".comment-form").forEach((form) => {
    form.onsubmit = async (event) => {
      event.preventDefault();
      const input = form.querySelector("input");
      try {
        await NaturalStore.addComment(form.dataset.id, input.value);
        input.value = "";
        await renderRemedies();
      } catch (error) { showError(error); }
    };
  });
  container.querySelectorAll("[data-edit]").forEach((button) => {
    button.onclick = () => { location.href = `agregar-planta.html?edit=${encodeURIComponent(button.dataset.edit)}`; };
  });
  container.querySelectorAll("[data-comment-delete]").forEach((button) => {
    button.onclick = async () => {
      if (!confirm("¿Eliminar este comentario?")) return;
      try {
        await NaturalStore.deleteComment(button.dataset.commentDelete);
        await renderRemedies();
      } catch (error) { showError(error); }
    };
  });
}

async function renderAdminForm() {
  const content = document.getElementById("adminContent");
  if (!content) return;
  const plants = await NaturalStore.listPlants();
  const editId = new URLSearchParams(location.search).get("edit");
  const plant = plants.find((item) => String(item.id) === editId) || null;
  content.innerHTML = `
    <header class="admin-page-header">
      <div><p class="admin-eyebrow">CATÁLOGO NATURALAPP</p><h1>Administrar plantas</h1><p>Agrega, edita o elimina las fichas del catálogo.</p></div>
      <button class="boton" id="openPlantForm" type="button"><span aria-hidden="true">＋</span> Nueva planta</button>
    </header>
    <section class="admin-list-section">
      <div class="admin-list-heading"><h2>Plantas del catálogo</h2><span>${plants.length} ${plants.length === 1 ? "planta" : "plantas"}</span></div>
      <section id="adminPlants" class="cards" aria-label="Plantas administrables"></section>
    </section>
    <dialog class="plant-dialog" id="plantDialog" aria-labelledby="plantDialogTitle">
      <div class="dialog-header">
        <div><p class="admin-eyebrow">${plant ? "EDITAR FICHA" : "NUEVA FICHA"}</p><h2 id="plantDialogTitle">${plant ? "Editar planta" : "Agregar planta"}</h2></div>
        <button class="dialog-close" id="closePlantDialog" type="button" aria-label="Cerrar formulario">×</button>
      </div>
      ${plantFormHtml(plant, plant ? "Guardar cambios" : "Agregar al catálogo")}
    </dialog>`;

  const dialog = document.getElementById("plantDialog");
  const closeDialog = () => plant ? (location.href = "agregar-planta.html") : dialog.close();
  document.getElementById("openPlantForm").onclick = () => plant ? (location.href = "agregar-planta.html") : dialog.showModal();
  document.getElementById("closePlantDialog").onclick = closeDialog;
  document.getElementById("cancelPlantForm").onclick = closeDialog;
  dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });

  document.getElementById("plantForm").onsubmit = async (event) => {
    event.preventDefault();
    const submitButton = event.currentTarget.querySelector('[type="submit"]');
    submitButton.disabled = true;
    try {
      const image = await getFormImage(plant?.image || "");
      if (!image) return;
      const fields = { ...readPlantFields(), image_url: image };
      if (plant) {
        await NaturalStore.updatePlant(plant.id, fields);
        location.href = "remedios.html";
        return;
      }
      await NaturalStore.createPlant(fields);
      dialog.close();
      await renderAdminForm();
    } catch (error) { showError(error); }
    finally { submitButton.disabled = false; }
  };

  const list = document.getElementById("adminPlants");
  list.innerHTML = plants.map((item) => `
    <article class="card admin-plant-card">
      <div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.uses || item.description || "Sin descripción disponible.")}</p></div>
      <div class="admin-card-actions"><button type="button" data-edit="${escapeHtml(item.id)}">Editar</button><button class="button-danger" type="button" data-delete="${escapeHtml(item.id)}">Eliminar</button></div>
    </article>`).join("");
  list.querySelectorAll("[data-edit]").forEach((button) => {
    button.onclick = () => { location.href = `agregar-planta.html?edit=${encodeURIComponent(button.dataset.edit)}`; };
  });
  list.querySelectorAll("[data-delete]").forEach((button) => {
    button.onclick = async () => {
      if (!confirm("¿Eliminar esta planta?")) return;
      try {
        await NaturalStore.deletePlant(button.dataset.delete);
        await renderAdminForm();
      } catch (error) { showError(error); }
    };
  });
  if (plant) dialog.showModal();
}

function plantFormHtml(plant, buttonText) {
  return `<form id="plantForm">
    <label>Nombre<input id="pname" required value="${escapeHtml(plant?.name || "")}"></label>
    <label>URL de imagen (opcional)<input id="pimage" type="url" value="${escapeHtml(plant?.image || "")}"></label>
    <label>O sube una imagen desde tu dispositivo<input id="pfile" type="file" accept="image/*"></label>
    <label>Descripción<textarea id="pdescription" required>${escapeHtml(plant?.description || "")}</textarea></label>
    <label>Uso tradicional<input id="puses" required value="${escapeHtml(plant?.uses || "")}"></label>
    <label>Preparación (opcional)<textarea id="ppreparation">${escapeHtml(plant?.preparation || "")}</textarea></label>
    <div class="form-actions"><button type="submit">${buttonText}</button><button class="dialog-cancel" id="cancelPlantForm" type="button">Cancelar</button></div>
  </form>`;
}

function readPlantFields() {
  return {
    name: document.getElementById("pname").value.trim(),
    description: document.getElementById("pdescription").value.trim(),
    uses: document.getElementById("puses").value.trim(),
    preparation: document.getElementById("ppreparation").value.trim(),
  };
}

async function getFormImage(existingImage = "") {
  const file = document.getElementById("pfile").files[0];
  const url = document.getElementById("pimage").value.trim();
  if (file) return NaturalStore.uploadImage(file, "plants");
  if (url) return url;
  if (existingImage) return existingImage;
  alert("Agrega una URL o selecciona una imagen desde tu dispositivo.");
  return null;
}

async function renderDashboard() {
  const dashboard = document.getElementById("dashboard");
  if (!dashboard) return;
  const data = await NaturalStore.dashboardData();
  const safeCount = (value) => Number.isFinite(Number(value)) ? Math.max(0, Math.trunc(Number(value))) : 0;
  const formatCount = (value) => safeCount(value).toLocaleString("es-BO");
  const labels = { inicio: "Inicio", remedios: "Remedios", perfil: "Perfil", agregar: "Administración de plantas", dashboard: "Visitas" };
  const icons = { inicio: "⌂", remedios: "✿", perfil: "♙", agregar: "＋", dashboard: "↗" };
  const pageViews = Object.entries(data.pageViews).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]);
  const highest = Math.max(1, ...pageViews.map(([, count]) => count));
  dashboard.innerHTML = `
    <section class="dashboard-header"><div><p class="dashboard-eyebrow">NATURALAPP · RESUMEN</p><h1>Panel de visitas</h1><p>Actividad sincronizada de todos los usuarios.</p></div><span class="dashboard-status"><span aria-hidden="true">●</span> Datos compartidos</span></section>
    <section class="dashboard" aria-label="Indicadores generales">
      <article class="metric metric-visits"><span class="metric-icon" aria-hidden="true">↗</span><p>Visitas totales</p><strong>${formatCount(data.visits)}</strong><small>Acumuladas en todas las sesiones</small></article>
      <article class="metric metric-users"><span class="metric-icon" aria-hidden="true">♙</span><p>Usuarios registrados</p><strong>${formatCount(data.users)}</strong><small>Cuentas de NaturalApp</small></article>
      <article class="metric metric-plants"><span class="metric-icon" aria-hidden="true">🌿</span><p>Plantas publicadas</p><strong>${formatCount(data.plants)}</strong><small>En el catálogo compartido</small></article>
    </section>
    <section class="page-analytics"><div class="analytics-heading"><div><p class="dashboard-eyebrow">DETALLE</p><h2>Visitas por sección</h2></div><span>${pageViews.length} ${pageViews.length === 1 ? "sección" : "secciones"}</span></div>
      <div class="page-view-list">${pageViews.map(([key, count]) => {
        const percentage = Math.round((count / highest) * 100);
        return `<details class="page-view-card"><summary><span class="page-view-icon" aria-hidden="true">${icons[key] || "•"}</span><span class="page-view-name"><strong>${escapeHtml(labels[key] || key)}</strong><small>Mostrar detalle</small></span><span class="page-view-count">${formatCount(count)}</span><span class="page-view-chevron" aria-hidden="true">⌄</span></summary><div class="page-view-detail"><div class="visit-track"><span style="width:${percentage}%"></span></div><p>${percentage}% del máximo de visitas registrado</p></div></details>`;
      }).join("") || `<div class="analytics-empty"><span aria-hidden="true">🌱</span><p>Aún no hay visitas por sección para mostrar.</p></div>`}</div>
    </section>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function formatCount(value) {
  return (Number(value) || 0).toLocaleString("es-BO");
}

function showError(error) {
  console.error(error);
  const container = document.querySelector("main.page, main.auth-card") || document.body;
  let message = container.querySelector(".supabase-error");
  if (!message) {
    message = document.createElement("p");
    message.className = "supabase-error message";
    message.setAttribute("role", "alert");
    container.prepend(message);
  }
  message.textContent = error?.message || "No se pudo conectar con Supabase.";
}
