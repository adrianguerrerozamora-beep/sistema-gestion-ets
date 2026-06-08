let modalExamen;

document.addEventListener("DOMContentLoaded", () => {
    modalExamen = new bootstrap.Modal(document.getElementById('modalExamen'));

    // 1. Verificar sesión
    fetch("../backend/src/Auth/check_session.php")
        .then(response => {
            if (!response.ok) {
                window.location.href = "admin.html";
                throw new Error("No autorizado");
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                document.getElementById("body-dashboard").style.display = "block";
                document.getElementById("admin-name").textContent = `Hola, ${data.user.nombre_completo}`;
                cargarExamenesAdmin();
            }
        })
        .catch(error => console.error("Error de sesión:", error));

    // 2. Cargar catálogos
    fetch("../backend/src/Public/get_carreras.php").then(r => r.json()).then(data => {
        const select = document.getElementById("carrera_id");
        select.innerHTML = '<option value="">Seleccione una carrera...</option>';
        data.forEach(c => select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`);
    });

    fetch("../backend/src/Public/get_espacios.php").then(r => r.json()).then(data => {
        const select = document.getElementById("espacio_id");
        select.innerHTML = '<option value="">Seleccione un espacio...</option>';
        data.forEach(e => select.innerHTML += `<option value="${e.id}">${e.edificio} - ${e.salon}</option>`);
    });

    // 3. NUEVO: Buscador en tiempo real para el Administrador
    const buscadorAdmin = document.getElementById("buscador-admin");
    if (buscadorAdmin) {
        buscadorAdmin.addEventListener("input", function() {
            const textoBusqueda = this.value.toLowerCase();
            // Buscamos todas las filas dentro de la tabla
            const filas = document.querySelectorAll("#tabla-admin-examenes tr"); 

            filas.forEach(fila => {
                const contenidoFila = fila.textContent.toLowerCase();
                if (contenidoFila.includes(textoBusqueda)) {
                    fila.style.display = "";
                } else {
                    fila.style.display = "none";
                }
            });
        });
    }

    // 4. Botones del Modal
    document.getElementById("btn-nuevo").addEventListener("click", () => {
        document.getElementById("form-examen").reset();
        document.getElementById("examen-id").value = "";
        document.getElementById("modalTitle").textContent = "Registrar Nuevo Examen";
        modalExamen.show();
    });

    document.getElementById("btn-guardar-examen").addEventListener("click", () => {
        const formData = new FormData();
        formData.append("id", document.getElementById("examen-id").value);
        formData.append("materia", document.getElementById("materia").value);
        formData.append("semestre", document.getElementById("semestre").value);
        formData.append("fecha", document.getElementById("fecha").value);
        formData.append("hora", document.getElementById("hora").value);
        formData.append("turno", document.getElementById("turno").value);
        formData.append("profesor", document.getElementById("profesor").value);
        formData.append("carrera_id", document.getElementById("carrera_id").value);
        formData.append("espacio_id", document.getElementById("espacio_id").value);

        if (!document.getElementById("materia").value || !document.getElementById("carrera_id").value) {
            alert("Por favor, llena los campos obligatorios.");
            return;
        }

        fetch("../backend/src/CRUD/save_examen.php", { method: "POST", body: formData })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                modalExamen.hide();
                cargarExamenesAdmin();
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(err => alert("Error de comunicación con el servidor."));
    });

    // 5. Botón PDF
    document.getElementById("btn-pdf").addEventListener("click", () => {
        const tablaOriginal = document.getElementById("tabla-reporte");
        const clonTabla = tablaOriginal.cloneNode(true);

        clonTabla.querySelector(".col-acciones").remove();
        clonTabla.querySelectorAll("tr").forEach(tr => {
            const ultimaCelda = tr.lastElementChild;
            if (ultimaCelda && (ultimaCelda.innerHTML.includes("Editar") || ultimaCelda.tagName === "TD")) {
                ultimaCelda.remove();
            }
        });

        const contenedorReporte = document.createElement("div");
        contenedorReporte.style.padding = "20px";
        contenedorReporte.style.fontFamily = "Arial, sans-serif";

        contenedorReporte.innerHTML = `
            <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 15px;">
                <h2 style="margin: 0; color: #800020;">INSTITUTO POLITÉCNICO NACIONAL</h2>
                <h3 style="margin: 5px 0 0 0; color: #555;">Escuela Superior de Cómputo</h3>
                <h4 style="margin: 10px 0 0 0; font-weight: normal; text-transform: uppercase; letter-spacing: 1px;">
                    Calendario Oficial de Exámenes a Título de Suficiencia (ETS)
                </h4>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #777;">Generado el: ${new Date().toLocaleDateString()}</p>
            </div>
        `;
        
        clonTabla.style.fontSize = "12px";
        contenedorReporte.appendChild(clonTabla);

        const opciones = {
            margin:       10,
            filename:     'Calendario_ETS_Oficial.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'letter', orientation: 'landscape' }
        };

        html2pdf().set(opciones).from(contenedorReporte).save();
    });

    // 6. Botón Cerrar Sesión
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            fetch("../backend/src/Auth/logout.php").then(r => r.json()).then(data => {
                if (data.success) window.location.href = "admin.html";
            });
        });
    }
});

function cargarExamenesAdmin() {
    const tabla = document.getElementById("tabla-admin-examenes");
    fetch("../backend/src/CRUD/get_examenes.php")
        .then(r => r.json())
        .then(data => {
            tabla.innerHTML = "";
            if (data.length === 0) {
                tabla.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No hay exámenes programados.</td></tr>`;
                return;
            }
            data.forEach(exam => {
                const horaMuestra = exam.hora ? exam.hora.substring(0, 5) : '00:00';
                
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><strong>${escapeHTML(exam.materia)}</strong></td>
                    <td><small>${escapeHTML(exam.carrera)}</small></td>
                    <td class="text-center">${exam.semestre}°</td>
                    <td><small>${escapeHTML(exam.edificio)} - ${escapeHTML(exam.salon)}</small></td>
                    <td><small>${escapeHTML(exam.profesor)}</small></td>
                    <td style="white-space: nowrap;">
                        ${exam.fecha}<br>
                        <small class="text-muted fw-bold">${horaMuestra} hrs</small>
                    </td>
                    <td><span class="badge bg-secondary">${exam.turno}</span></td>
                    <td class="col-acciones">
                        <button class="btn btn-sm btn-primary me-1" onclick="editarExamen(${exam.id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarExamen(${exam.id})">Borrar</button>
                    </td>
                `;
                tabla.appendChild(row);
            });
        })
        .catch(err => {
            tabla.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error al cargar la información.</td></tr>`;
        });
}

function escapeHTML(str) {
    if (!str) return '';
    return str.toString().replace(/[&<>'"]/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t] || t));
}

function editarExamen(id) {
    document.getElementById("modalTitle").textContent = "Editar Examen";
    document.getElementById("examen-id").value = id;

    fetch(`../backend/src/CRUD/get_examen.php?id=${id}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById("materia").value = data.materia;
            document.getElementById("semestre").value = data.semestre;
            document.getElementById("fecha").value = data.fecha;
            document.getElementById("hora").value = data.hora;
            document.getElementById("turno").value = data.turno;
            document.getElementById("profesor").value = data.profesor;
            document.getElementById("carrera_id").value = data.carrera_id;
            document.getElementById("espacio_id").value = data.espacio_id;
            modalExamen.show();
        });
}

function eliminarExamen(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este examen?")) {
        const formData = new FormData();
        formData.append("id", id);
        fetch("../backend/src/CRUD/delete_examen.php", { method: "POST", body: formData })
        .then(r => r.json())
        .then(data => { if (data.success) cargarExamenesAdmin(); });
    }
}