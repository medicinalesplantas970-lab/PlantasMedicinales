 // =================================
// INFORMACIÓN DE LAS CREADORAS
// =================================

function mostrarInformacion(id) {

    const seleccionada = document.getElementById(id);

    if (!seleccionada) {
        return;
    }

    // Mostrar solo la información seleccionada. Volver a pulsar la misma foto
    // la mantiene abierta; se cierra con clic fuera o con Escape.

    document.querySelectorAll(".informacion").forEach(function (elemento) {

        elemento.classList.remove("activa");

    });

    seleccionada.classList.add("activa");

}

// =================================
// CERRAR INFORMACIÓN AL HACER CLIC FUERA
// =================================

document.addEventListener("click", function (evento) {

    const creadoras = document.querySelectorAll(".creadora");

    let dentroDeCreadora = false;

    creadoras.forEach(function (creadora) {

        if (creadora.contains(evento.target)) {

            dentroDeCreadora = true;

        }

    });

    if (!dentroDeCreadora) {

        document.querySelectorAll(".informacion").forEach(function (elemento) {

            elemento.classList.remove("activa");

        });

    }

});

// =================================
// CERRAR CON LA TECLA ESCAPE
// =================================

document.addEventListener("keydown", function (evento) {

    if (evento.key === "Escape") {

        document.querySelectorAll(".informacion").forEach(function (elemento) {

            elemento.classList.remove("activa");

        });

    }

});
