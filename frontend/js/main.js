// Arreglo global para mantener la selección de exámenes entre diferentes búsquedas
let seleccionados = [];

document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar las carreras en el menú desplegable
    fetch("../backend/src/Public/get_carreras.php")
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById("carrera_id");
            if (select) {
                select.innerHTML = '<option value="">Todas las carreras</option>';
                data.forEach(c => {
                    select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
                });
            }
        })
        .catch(error => console.error("Error al cargar carreras:", error));

    // 2. Búsqueda en tiempo real (Live Search)
    const inputMateria = document.getElementById("materia");
    const selectCarrera = document.getElementById("carrera_id");
    const selectSemestre = document.getElementById("semestre");

    if (inputMateria) inputMateria.addEventListener("input", () => buscarExamenes());
    if (selectCarrera) selectCarrera.addEventListener("change", () => buscarExamenes());
    if (selectSemestre) selectSemestre.addEventListener("change", () => buscarExamenes());

    // 3. Darle vida a los botones de exportación
    const btnPdf = document.getElementById("btn-pdf-alumno");
    if (btnPdf) btnPdf.addEventListener("click", generarPDF);

    const btnIcs = document.getElementById("btn-ics-publico");
    if (btnIcs) btnIcs.addEventListener("click", generarICS);

    // Cargar toda la tabla la primera vez que se abre la página
    buscarExamenes();
});

function actualizarVisibilidadBotones(currentDataLength = 0) {
    const btnPdf = document.getElementById("btn-pdf-alumno");
    const btnIcs = document.getElementById("btn-ics-publico");
    
    // Los botones se muestran si la búsqueda actual tiene filas O si hay exámenes guardados en el carrito global
    if (currentDataLength > 0 || seleccionados.length > 0) {
        if (btnPdf) btnPdf.classList.remove("d-none");
        if (btnIcs) btnIcs.classList.remove("d-none");
    } else {
        if (btnPdf) btnPdf.classList.add("d-none");
        if (btnIcs) btnIcs.classList.add("d-none");
    }
}

function buscarExamenes() {
    const carrera_id = document.getElementById("carrera_id") ? document.getElementById("carrera_id").value : '';
    const semestre = document.getElementById("semestre") ? document.getElementById("semestre").value : '';
    const materia = document.getElementById("materia") ? document.getElementById("materia").value : '';

    const url = `../backend/src/Public/buscar_ets.php?carrera_id=${carrera_id}&semestre=${semestre}&materia=${materia}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const tabla = document.querySelector("#tabla-busqueda tbody");
            if (!tabla) return;
            
            tabla.innerHTML = "";

            if (data.length === 0 || data.error) {
                tabla.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-3">No se encontraron exámenes programados con esos filtros.</td></tr>`;
                actualizarVisibilidadBotones(0);
                return;
            }

            actualizarVisibilidadBotones(data.length);

            data.forEach(exam => {
                const horaMuestra = exam.hora ? exam.hora.substring(0, 5) : '00:00';
                const row = document.createElement("tr");
                
                // Conservamos el estado si el alumno ya lo había seleccionado previamente
                const estaSeleccionado = seleccionados.some(e => e.id === exam.id);
                const checkedAttr = estaSeleccionado ? 'checked' : '';

                row.innerHTML = `
                    <td class="text-center align-middle">
                        <input class="form-check-input chk-examen" type="checkbox" ${checkedAttr} style="transform: scale(1.2);">
                    </td>
                    <td><strong>${escapeHTML(exam.materia)}</strong></td>
                    <td><small>${escapeHTML(exam.carrera)}</small></td>
                    <td class="text-center">${exam.semestre}°</td>
                    <td style="white-space: nowrap;">
                        ${exam.fecha}<br>
                        <small class="text-muted fw-bold">${horaMuestra} hrs</small>
                    </td>
                    <td><span class="badge bg-secondary">${exam.turno}</span></td>
                    <td><small>${escapeHTML(exam.edificio)} - ${escapeHTML(exam.salon)}</small></td>
                    <td><small>${escapeHTML(exam.profesor)}</small></td>
                `;

                // Evento clínico: escucha cambios y los guarda/remueve del arreglo global
                const checkbox = row.querySelector(".chk-examen");
                checkbox.addEventListener("change", (e) => {
                    if (e.target.checked) {
                        if (!seleccionados.some(e => e.id === exam.id)) {
                            seleccionados.push(exam);
                        }
                    } else {
                        seleccionados = seleccionados.filter(e => e.id !== exam.id);
                    }
                    actualizarVisibilidadBotones(data.length);
                });

                tabla.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error en la búsqueda:", error);
            const tabla = document.querySelector("#tabla-busqueda tbody");
            if (tabla) tabla.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-3">Error de comunicación con el servidor.</td></tr>`;
        });
}

function generarPDF() {
    if (seleccionados.length === 0) {
        alert("Por favor, selecciona al menos un examen para descargar.");
        return;
    }

    // Estructura idéntica al Dashboard: Creamos el nodo limpio en memoria
    const contenedorReporte = document.createElement("div");
    contenedorReporte.style.padding = "20px";
    contenedorReporte.style.fontFamily = "Arial, sans-serif";

    // Construimos la tabla directamente dentro del HTML del contenedor
    let tablaHTML = `
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 15px;">
            <h2 style="margin: 0; color: #800020;">INSTITUTO POLITÉCNICO NACIONAL</h2>
            <h3 style="margin: 5px 0 0 0; color: #555;">Escuela Superior de Cómputo</h3>
            <h4 style="margin: 10px 0 0 0; font-weight: normal; text-transform: uppercase; letter-spacing: 1px;">
                Comprobante de Horario ETS
            </h4>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #777;">Generado el: ${new Date().toLocaleDateString()}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
                <tr style="background-color: #212529; color: #ffffff; text-align: left;">
                    <th style="padding: 8px; border: 1px solid #dee2e6;">Materia</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6;">Carrera</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">Sem.</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6;">Fecha y Hora</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6;">Turno</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6;">Lugar (Edificio / Salón)</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6;">Profesor Evaluador</th>
                </tr>
            </thead>
            <tbody>
    `;

    seleccionados.forEach(exam => {
        const horaMuestra = exam.hora ? exam.hora.substring(0, 5) : '00:00';
        tablaHTML += `
            <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>${escapeHTML(exam.materia)}</strong></td>
                <td style="padding: 8px; border: 1px solid #dee2e6;"><small>${escapeHTML(exam.carrera)}</small></td>
                <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">${exam.semestre}°</td>
                <td style="padding: 8px; border: 1px solid #dee2e6; white-space: nowrap;">
                    ${exam.fecha}<br>
                    <small style="color: #6c757d; font-weight: bold;">${horaMuestra} hrs</small>
                </td>
                <td style="padding: 8px; border: 1px solid #dee2e6;"><span style="background-color: #6c757d; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${exam.turno}</span></td>
                <td style="padding: 8px; border: 1px solid #dee2e6;"><small>${escapeHTML(exam.edificio)} - ${escapeHTML(exam.salon)}</small></td>
                <td style="padding: 8px; border: 1px solid #dee2e6;"><small>${escapeHTML(exam.profesor)}</small></td>
            </tr>
        `;
    });

    tablaHTML += `</tbody></table>`;
    contenedorReporte.innerHTML = tablaHTML;

    // Configuración limpia y estándar idéntica a la que usas en el Dashboard
    const opciones = {
        margin:       10,
        filename:     'Mi_Horario_ETS.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'letter', orientation: 'landscape' }
    };

    const scrollActual = window.scrollY;
    window.scrollTo(0, 0);

    setTimeout(() => {
        html2pdf().set(opciones).from(contenedorReporte).save().then(() => {
            window.scrollTo(0, scrollActual);
        });
    }, 300);
}

function generarICS() {
    if (seleccionados.length === 0) {
        alert("Por favor, selecciona al menos un examen para exportar al calendario.");
        return;
    }

    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ESCOM//Gestión ETS//ES\nCALSCALE:GREGORIAN\n";
    
    seleccionados.forEach(exam => {
        const materia = exam.materia;
        const espacio = `Edificio ${exam.edificio} - Salón ${exam.salon}`;
        const prof = exam.profesor;
        const horaMuestra = exam.hora ? exam.hora.substring(0, 5) : '00:00';
        
        try {
            const [year, month, day] = exam.fecha.split("-");
            const [hour, minute] = horaMuestra.split(":");
            
            const startString = `${year}${month}${day}T${hour}${minute}00`;
            let endHour = parseInt(hour) + 2;
            let endHourStr = endHour < 10 ? "0" + endHour : endHour;
            const endString = `${year}${month}${day}T${endHourStr}${minute}00`;

            icsContent += "BEGIN:VEVENT\n";
            icsContent += `SUMMARY:ETS - ${materia}\n`;
            icsContent += `LOCATION:${espacio}\n`;
            icsContent += `DESCRIPTION:Profesor: ${prof}\n`;
            icsContent += `DTSTART:${startString}\n`;
            icsContent += `DTEND:${endString}\n`;
            icsContent += "END:VEVENT\n";
        } catch(e) { }
    });
    
    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Calendario_ETS_Alumno.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function escapeHTML(str) {
    if (!str) return '';
    return str.toString().replace(/[&<>'"]/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t] || t));
}