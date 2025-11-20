// Array para almacenar los estudiantes
let estudiantes = [];

// Cargar datos del localStorage al iniciar
document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    actualizarSelectEstudiantes();
    renderizarEstudiantes();
});

// Función para guardar datos en localStorage
function guardarDatos() {
    localStorage.setItem('estudiantes', JSON.stringify(estudiantes));
}

// Función para cargar datos del localStorage
function cargarDatos() {
    const datosGuardados = localStorage.getItem('estudiantes');
    if (datosGuardados) {
        estudiantes = JSON.parse(datosGuardados);
    }
}

// Formulario para agregar estudiante
document.getElementById('formEstudiante').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const codigo = document.getElementById('codigo').value.trim();
    
    // Validar que el código no esté duplicado
    if (estudiantes.some(est => est.codigo === codigo)) {
        alert('El código del estudiante ya existe. Por favor, use otro código.');
        return;
    }
    
    // Crear nuevo estudiante
    const nuevoEstudiante = {
        id: Date.now(),
        nombre: nombre,
        codigo: codigo,
        notas: []
    };
    
    estudiantes.push(nuevoEstudiante);
    guardarDatos();
    actualizarSelectEstudiantes();
    renderizarEstudiantes();
    
    // Limpiar formulario
    document.getElementById('formEstudiante').reset();
    
    // Mostrar mensaje de éxito
    mostrarMensaje('Estudiante agregado exitosamente', 'success');
});

// Formulario para agregar nota
document.getElementById('formNota').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const estudianteId = parseInt(document.getElementById('estudianteSelect').value);
    const materia = document.getElementById('materia').value.trim();
    const nota = parseFloat(document.getElementById('nota').value);
    
    // Validar rango de nota
    if (nota < 0 || nota > 100) {
        alert('La nota debe estar entre 0 y 100');
        return;
    }
    
    // Buscar estudiante y agregar nota
    const estudiante = estudiantes.find(est => est.id === estudianteId);
    if (estudiante) {
        estudiante.notas.push({
            id: Date.now(),
            materia: materia,
            nota: nota,
            fecha: new Date().toLocaleDateString('es-ES')
        });
        
        guardarDatos();
        renderizarEstudiantes();
        
        // Limpiar formulario
        document.getElementById('formNota').reset();
        
        // Mostrar mensaje de éxito
        mostrarMensaje('Nota agregada exitosamente', 'success');
    }
});

// Función para actualizar el select de estudiantes
function actualizarSelectEstudiantes() {
    const select = document.getElementById('estudianteSelect');
    select.innerHTML = '<option value="">Seleccione un estudiante</option>';
    
    estudiantes.forEach(estudiante => {
        const option = document.createElement('option');
        option.value = estudiante.id;
        option.textContent = `${estudiante.nombre} (${estudiante.codigo})`;
        select.appendChild(option);
    });
}

// Función para calcular el promedio de un estudiante
function calcularPromedio(notas) {
    if (notas.length === 0) return 0;
    const suma = notas.reduce((acc, nota) => acc + nota.nota, 0);
    return (suma / notas.length).toFixed(2);
}

// Función para obtener el color del promedio
function obtenerColorPromedio(promedio) {
    if (promedio >= 90) return 'success';
    if (promedio >= 70) return 'info';
    if (promedio >= 60) return 'warning';
    return 'danger';
}

// Función para renderizar todos los estudiantes
function renderizarEstudiantes() {
    const contenedor = document.getElementById('listaEstudiantes');
    const btnToggle = document.getElementById('btnToggleResumen');
    
    if (estudiantes.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center text-muted py-5">
                <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                <p class="mt-3">No hay estudiantes registrados aún</p>
            </div>
        `;
        btnToggle.style.display = 'none';
        document.getElementById('resumenContainer').style.display = 'none';
        return;
    }
    
    // Mostrar botón de resumen si hay estudiantes
    btnToggle.style.display = 'inline-block';
    
    contenedor.innerHTML = '';
    
    estudiantes.forEach(estudiante => {
        const promedio = calcularPromedio(estudiante.notas);
        const colorPromedio = obtenerColorPromedio(promedio);
        
        const estudianteCard = document.createElement('div');
        estudianteCard.className = 'col-12 estudiante-card';
        
        estudianteCard.innerHTML = `
            <div class="estudiante-header">
                <div class="estudiante-info">
                    <h4><i class="bi bi-person-circle"></i> ${estudiante.nombre}</h4>
                    <p><i class="bi bi-tag"></i> Código: ${estudiante.codigo}</p>
                </div>
                <div>
                    <span class="badge bg-${colorPromedio} promedio-badge">
                        <i class="bi bi-graph-up"></i> Promedio: ${promedio}%
                    </span>
                </div>
            </div>
            
            <div class="notas-list">
                <h6 class="mb-3"><i class="bi bi-journal-text"></i> Notas (${estudiante.notas.length})</h6>
                ${estudiante.notas.length === 0 ? 
                    '<p class="text-muted"><i class="bi bi-info-circle"></i> No hay notas registradas aún. Agrega una nota usando el formulario superior.</p>' : 
                    estudiante.notas.map(nota => {
                        // Determinar color de la nota según su valor
                        let notaColor = '#28a745'; // verde por defecto
                        if (nota.nota < 60) notaColor = '#dc3545'; // rojo
                        else if (nota.nota < 70) notaColor = '#ffc107'; // amarillo
                        else if (nota.nota < 90) notaColor = '#0dcaf0'; // azul
                        
                        return `
                        <div class="nota-item" style="border-left-color: ${notaColor};">
                            <div class="nota-info">
                                <p class="nota-materia mb-1">
                                    <i class="bi bi-book"></i> <strong>${nota.materia}</strong>
                                </p>
                                <small class="text-muted">
                                    <i class="bi bi-calendar3"></i> ${nota.fecha}
                                </small>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <span class="nota-valor" style="color: ${notaColor};">
                                    <strong>${nota.nota}%</strong>
                                </span>
                                <button class="btn btn-sm btn-danger" onclick="eliminarNota(${estudiante.id}, ${nota.id})" title="Eliminar nota">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    }).join('')
                }
            </div>
            
            <button class="btn btn-danger btn-eliminar w-100 mt-3" onclick="eliminarEstudiante(${estudiante.id})">
                <i class="bi bi-person-x"></i> Eliminar Estudiante
            </button>
        `;
        
        contenedor.appendChild(estudianteCard);
    });
    
    // Actualizar resumen si está visible
    const resumenContainer = document.getElementById('resumenContainer');
    if (resumenContainer.style.display === 'block') {
        mostrarResumen();
    }
}

// Función para eliminar un estudiante
function eliminarEstudiante(id) {
    if (confirm('¿Está seguro de que desea eliminar este estudiante y todas sus notas?')) {
        estudiantes = estudiantes.filter(est => est.id !== id);
        guardarDatos();
        actualizarSelectEstudiantes();
        renderizarEstudiantes();
        mostrarMensaje('Estudiante eliminado exitosamente', 'danger');
    }
}

// Función para eliminar una nota
function eliminarNota(estudianteId, notaId) {
    if (confirm('¿Está seguro de que desea eliminar esta nota?')) {
        const estudiante = estudiantes.find(est => est.id === estudianteId);
        if (estudiante) {
            estudiante.notas = estudiante.notas.filter(nota => nota.id !== notaId);
            guardarDatos();
            renderizarEstudiantes();
            mostrarMensaje('Nota eliminada exitosamente', 'danger');
        }
    }
}

// Función para mostrar mensajes temporales
function mostrarMensaje(mensaje, tipo) {
    // Crear elemento de mensaje
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    mensajeDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    mensajeDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(mensajeDiv);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        mensajeDiv.remove();
    }, 3000);
}

// Función para mostrar/ocultar resumen
function toggleResumen() {
    const resumenContainer = document.getElementById('resumenContainer');
    const btnToggle = document.getElementById('btnToggleResumen');
    
    if (resumenContainer.style.display === 'none' || resumenContainer.style.display === '') {
        mostrarResumen();
        resumenContainer.style.display = 'block';
        btnToggle.innerHTML = '<i class="bi bi-eye-slash"></i> Ocultar Resumen';
    } else {
        resumenContainer.style.display = 'none';
        btnToggle.innerHTML = '<i class="bi bi-eye"></i> Ver Resumen';
    }
}

// Función para mostrar resumen de todas las notas
function mostrarResumen() {
    const resumenDiv = document.getElementById('resumenNotas');
    
    if (estudiantes.length === 0) {
        resumenDiv.innerHTML = '<p class="text-muted">No hay datos para mostrar</p>';
        return;
    }
    
    let totalNotas = 0;
    let sumaTotal = 0;
    let html = '<div class="row">';
    
    estudiantes.forEach(estudiante => {
        if (estudiante.notas.length > 0) {
            html += `
                <div class="col-md-6 mb-3">
                    <div class="card border-primary">
                        <div class="card-body">
                            <h6 class="card-title">
                                <i class="bi bi-person"></i> ${estudiante.nombre}
                                <small class="text-muted">(${estudiante.codigo})</small>
                            </h6>
                            <ul class="list-group list-group-flush">
            `;
            
            estudiante.notas.forEach(nota => {
                totalNotas++;
                sumaTotal += nota.nota;
                let notaColor = 'text-success';
                if (nota.nota < 60) notaColor = 'text-danger';
                else if (nota.nota < 70) notaColor = 'text-warning';
                else if (nota.nota < 90) notaColor = 'text-info';
                
                html += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span><i class="bi bi-book"></i> ${nota.materia} <small class="text-muted">(${nota.fecha})</small></span>
                        <span class="badge bg-light ${notaColor}">${nota.nota}%</span>
                    </li>
                `;
            });
            
            const promedio = calcularPromedio(estudiante.notas);
            html += `
                            </ul>
                            <div class="mt-2">
                                <strong>Promedio: ${promedio}%</strong>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    
    if (totalNotas > 0) {
        const promedioGeneral = (sumaTotal / totalNotas).toFixed(2);
        html += `
            <div class="alert alert-info mt-3">
                <h6><i class="bi bi-graph-up-arrow"></i> Resumen General</h6>
                <p class="mb-0">
                    <strong>Total de notas registradas:</strong> ${totalNotas}<br>
                    <strong>Promedio general:</strong> ${promedioGeneral}%
                </p>
            </div>
        `;
    } else {
        html = '<p class="text-muted">No hay notas registradas aún</p>';
    }
    
    resumenDiv.innerHTML = html;
}

