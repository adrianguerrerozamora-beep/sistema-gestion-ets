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

    // Escuchar cada vez que se escribe una letra en el campo de materia
    if (inputMateria) {
        inputMateria.addEventListener("input", buscarExamenes);
    }
    // Escuchar cada vez que se cambia el semestre o la carrera en los selectores
    if (selectCarrera) {
        selectCarrera.addEventListener("change", buscarExamenes);
    }
    if (selectSemestre) {
        selectSemestre.addEventListener("change", buscarExamenes);
    }

    // 3. Darle vida al botón del PDF
    const btnPdf = document.getElementById("btn-pdf-alumno");
    if (btnPdf) {
        btnPdf.addEventListener("click", generarPDF);
    }

    // Cargar toda la tabla la primera vez que se abre la página
    buscarExamenes();
});

function buscarExamenes() {
    const carrera_id = document.getElementById("carrera_id") ? document.getElementById("carrera_id").value : '';
    const semestre = document.getElementById("semestre") ? document.getElementById("semestre").value : '';
    const materia = document.getElementById("materia") ? document.getElementById("materia").value : '';

    const url = `../backend/src/Public/buscar_ets.php?carrera_id=${carrera_id}&semestre=${semestre}&materia=${materia}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const tabla = document.querySelector("#tabla-busqueda tbody");
            const btnPdf = document.getElementById("btn-pdf-alumno");
            
            tabla.innerHTML = "";

            // SI NO HAY RESULTADOS: Mostramos mensaje y OCULTAMOS el botón PDF
            if (data.length === 0 || data.error) {
                tabla.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-3">No se encontraron exámenes programados con esos filtros.</td></tr>`;
                btnPdf.classList.add("d-none"); 
                return;
            }

            // SI SÍ HAY RESULTADOS: Mostramos el botón PDF y llenamos la tabla
            btnPdf.classList.remove("d-none"); 

            data.forEach(exam => {
                // Truco para que la hora se vea "08:30" en vez de "08:30:00"
                const horaMuestra = exam.hora ? exam.hora.substring(0, 5) : '00:00';
                
                const row = document.createElement("tr");
                row.innerHTML = `
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
                tabla.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error en la búsqueda:", error);
            const tabla = document.querySelector("#tabla-busqueda tbody");
            if (tabla) tabla.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-3">Error de comunicación con el servidor.</td></tr>`;
        });
}

function generarPDF() {
    const tablaOriginal = document.getElementById("tabla-busqueda"); 
    const clonTabla = tablaOriginal.cloneNode(true);
    
    clonTabla.style.fontSize = "12px";

    const contenedorReporte = document.createElement("div");
    contenedorReporte.style.padding = "20px";
    contenedorReporte.style.fontFamily = "Arial, sans-serif";

    contenedorReporte.innerHTML = `
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 15px;">
            <h2 style="margin: 0; color: #800020;">INSTITUTO POLITÉCNICO NACIONAL</h2>
            <h3 style="margin: 5px 0 0 0; color: #555;">Escuela Superior de Cómputo</h3>
            <h4 style="margin: 10px 0 0 0; font-weight: normal; text-transform: uppercase; letter-spacing: 1px;">
                Comprobante de Horario ETS
            </h4>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #777;">Generado el: ${new Date().toLocaleDateString()}</p>
        </div>
    `;
    
    contenedorReporte.appendChild(clonTabla);

    const opciones = {
        margin:       10,
        filename:     'Mi_Horario_ETS.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'letter', orientation: 'landscape' }
    };

    html2pdf().set(opciones).from(contenedorReporte).save();
}

function escapeHTML(str) {
    if (!str) return '';
    return str.toString().replace(/[&<>'"]/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t] || t));
}