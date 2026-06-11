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
                cargarEstadisticas();
                cargarListaCarreras();
                cargarListaEspacios();
            }
        })
        .catch(error => console.error("Error de sesión:", error));

    // 3. NUEVO: Buscador en tiempo real para el Administrador
    const buscadorAdmin = document.getElementById("buscador-admin");
    if (buscadorAdmin) {
        buscadorAdmin.addEventListener("input", function(e) {
            const termino = quitarAcentos(e.target.value.toLowerCase());
            const filas = document.querySelectorAll("#tabla-admin-examenes tr"); 

            filas.forEach(fila => {
                if (fila.cells.length === 1) return;
                const textoFila = quitarAcentos(fila.textContent.toLowerCase());
                if (textoFila.includes(termino)) {
                    fila.style.display = "";
                } else {
                    fila.style.display = "none";
                }
            });
        });
    }

    function quitarAcentos(texto) {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
                cargarEstadisticas();
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(err => alert("Error de comunicación con el servidor."));
    });

    // 5. Botón PDF
    document.getElementById("btn-pdf").addEventListener("click", () => {
        const tablaOriginal = document.getElementById("tabla-admin-examenes"); // Asegúrate de que este ID sea el correcto de tu tabla
        const clonTabla = tablaOriginal.cloneNode(true);

        // Limpiamos la columna de acciones para que no salgan los botones en el PDF
        const colAcciones = clonTabla.querySelector(".col-acciones");
        if (colAcciones) colAcciones.remove();
        
        clonTabla.querySelectorAll("tr").forEach(tr => {
            const ultimaCelda = tr.lastElementChild;
            if (ultimaCelda && (ultimaCelda.innerHTML.includes("Editar") || ultimaCelda.tagName === "TD")) {
                ultimaCelda.remove();
            }
        });

        // Le quitamos las clases responsivas que puedan romper el PDF en monitores pequeños
        clonTabla.classList.remove("table-responsive");
        clonTabla.style.fontSize = "12px";
        clonTabla.style.width = "100%";

        const contenedorReporte = document.createElement("div");
        contenedorReporte.style.padding = "20px";
        contenedorReporte.style.fontFamily = "Arial, sans-serif";
        contenedorReporte.style.width = "1000px"; // Ancho fijo para evitar cortes
        contenedorReporte.style.backgroundColor = "#ffffff";

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
        
        contenedorReporte.appendChild(clonTabla);

        const opciones = {
            margin:       10,
            filename:     'Calendario_ETS_Oficial.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'letter', orientation: 'landscape' }
        };

        // --- EL PARCHE DEL SCROLL ---
        const scrollActual = window.scrollY; // Guardamos dónde está el administrador
        window.scrollTo(0, 0);               // Subimos al tope de la página

        setTimeout(() => {
            html2pdf().set(opciones).from(contenedorReporte).save().then(() => {
                window.scrollTo(0, scrollActual); // Lo regresamos a su lugar al terminar
            });
        }, 300); // 300ms de pausa para que el navegador respire
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
        .then(data => { 
            if (data.success) {
                cargarExamenesAdmin(); 
                cargarEstadisticas();
            }
        }
        );
    }
}

function cargarEstadisticas() {
    fetch("../backend/src/CRUD/get_estadisticas.php")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const contenedor = document.getElementById("contenedor-estadisticas");
                
                let html = `
                    <div class="col-lg-2 col-md-3 col-sm-6 mb-3">
                        <div class="card text-white bg-primary shadow-sm h-100">
                            <div class="card-body p-3 d-flex flex-column justify-content-center">
                                <h6 class="card-title text-uppercase fw-bold mb-1" style="font-size: 0.75rem;">Total Exámenes</h6>
                                <h3 class="card-text fw-bold mb-0">${data.total}</h3>
                            </div>
                        </div>
                    </div>
                `;

                data.por_carrera.forEach(item => {
                    html += `
                    <div class="col-lg-2 col-md-3 col-sm-6 mb-3">
                        <div class="card bg-white shadow-sm h-100 border-0 border-start border-primary border-4">
                            <div class="card-body p-3 d-flex flex-column justify-content-center">
                                <h6 class="card-title text-muted text-uppercase fw-bold mb-1" style="font-size: 0.65rem; line-height: 1.2;">${item.carrera}</h6>
                                <h4 class="card-text text-dark mb-0">${item.cantidad}</h4>
                            </div>
                        </div>
                    </div>`;
                });

                contenedor.innerHTML = html;
            }
        })
        .catch(error => console.error("Error al cargar estadísticas:", error));
}

document.getElementById("btn-carreras").addEventListener("click", () => {
    cargarListaCarreras();
    new bootstrap.Modal(document.getElementById('modalCarreras')).show();
});

function cargarListaCarreras() {
    fetch("../backend/src/Public/get_carreras.php")
        .then(r => r.json())
        .then(data => {
            // 1. Actualizamos la lista del modal de gestión
            const lista = document.getElementById("lista-carreras");
            lista.innerHTML = "";
            
            // 2. ¡NUEVO! Actualizamos el <select> de Nuevo Examen al mismo tiempo
            const selectFormulario = document.getElementById("carrera_id");
            selectFormulario.innerHTML = '<option value="">Seleccione una carrera...</option>';

            data.forEach(c => {
                // Agregamos a la lista con el botón de borrar
                lista.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ${c.nombre}
                        <button class="btn btn-sm btn-outline-danger" onclick="borrarCarrera(${c.id})">🗑️</button>
                    </li>`;
                
                // Agregamos como opción seleccionable al formulario
                selectFormulario.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
            });
        });
}

document.getElementById("btn-guardar-carrera").addEventListener("click", () => {
    const formData = new FormData();
    formData.append("nombre", document.getElementById("nueva-carrera").value);
    fetch("../backend/src/CRUD/add_carrera.php", { method: "POST", body: formData })
        .then(r => r.json())
        .then(d => {
            if (d.success) { 
                document.getElementById("nueva-carrera").value = ""; 
                cargarListaCarreras(); 
            } else alert("Error al guardar.");
        });
});

window.borrarCarrera = function(id) {
    if(!confirm("¿Seguro que deseas borrar esta carrera?")) return;
    const formData = new FormData(); formData.append("id", id);
    fetch("../backend/src/CRUD/delete_carrera.php", { method: "POST", body: formData })
        .then(r => r.json())
        .then(d => { if(d.success) cargarListaCarreras(); else alert(d.message); });
};

// --- Lógica de Espacios ---
document.getElementById("btn-espacios").addEventListener("click", () => {
    cargarListaEspacios();
    new bootstrap.Modal(document.getElementById('modalEspacios')).show();
});

function cargarListaEspacios() {
    fetch("../backend/src/Public/get_espacios.php")
        .then(r => r.json())
        .then(data => {
            // 1. Actualizamos la lista del modal de gestión
            const lista = document.getElementById("lista-espacios");
            lista.innerHTML = "";

            // 2. ¡NUEVO! Actualizamos el <select> de Nuevo Examen
            const selectFormulario = document.getElementById("espacio_id");
            selectFormulario.innerHTML = '<option value="">Seleccione un espacio...</option>';

            data.forEach(e => {
                const nombreEspacio = `Edificio ${e.edificio} - Salón ${e.salon}`;
                
                // Agregamos a la lista con el botón de borrar
                lista.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ${nombreEspacio}
                        <button class="btn btn-sm btn-outline-danger" onclick="borrarEspacio(${e.id})">🗑️</button>
                    </li>`;
                
                // Agregamos como opción seleccionable al formulario
                selectFormulario.innerHTML += `<option value="${e.id}">${nombreEspacio}</option>`;
            });
        });
}

document.getElementById("btn-guardar-espacio").addEventListener("click", () => {
    const formData = new FormData();
    formData.append("edificio", document.getElementById("nuevo-edificio").value);
    formData.append("salon", document.getElementById("nuevo-salon").value);
    fetch("../backend/src/CRUD/add_espacio.php", { method: "POST", body: formData })
        .then(r => r.json())
        .then(d => {
            if (d.success) { 
                document.getElementById("nuevo-edificio").value = ""; 
                document.getElementById("nuevo-salon").value = ""; 
                cargarListaEspacios(); 
            } else alert("Error al guardar.");
        });
});

window.borrarEspacio = function(id) {
    if(!confirm("¿Seguro que deseas borrar este salón?")) return;
    const formData = new FormData(); formData.append("id", id);
    fetch("../backend/src/CRUD/delete_espacio.php", { method: "POST", body: formData })
        .then(r => r.json())
        .then(d => { if(d.success) cargarListaEspacios(); else alert(d.message); });
};