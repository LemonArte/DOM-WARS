/**DOM-WARS: Controlador Principal*/

/* BLOQUE 1: Prevenimos la ejecución del JS hasta que la pagína haya sido cargada por completo */
document.addEventListener('DOMContentLoaded', () => {
    //1. CREA EL HANGAR
    // Inicializa el hangar
    generarHangar(naves);

    // Evento input: Busca mientra escribe
    document.getElementById('buscador-nave').addEventListener('input', filtrarNaves);

    // Evento change: Filtra al cambiar el tipo
    document.getElementById('filtro-tipo').addEventListener('change', filtrarNaves);

    // Evento click para ordenar
    document.getElementById('btn-ordenar-velocidad').addEventListener('click', ordenarPorVelocidad);
    
    //2. RESET CONTADOR MISIONES
    updateMissionCounters();

    // 3. NAVEGACIÓN PRINCIPAL
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const sectionId = e.currentTarget.getAttribute('data-section');
            showSection(sectionId, e.currentTarget);
        });
    });

    // 4. ACORDEÓN DE MISIONES
    const cardSummaries = document.querySelectorAll('.card-summary');
    cardSummaries.forEach(summary => {
        summary.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            toggleDetails(targetId);
        });
    });

    // 5. BOTONES DE AVANCE MISIONES
    const advanceBtns = document.querySelectorAll('.btn-move-siguiente');
    advanceBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que el clic abra los detalles por accidente
            const missionId = e.currentTarget.getAttribute('data-mision-id');
            moveNext(missionId);
        });
    });

    // 6. ACORDEÓN DASHBOARD
    const statHeaders = document.querySelectorAll('.estado-header');
    statHeaders.forEach(header => {
        header.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            toggleDashboard(targetId);
        });
    });

    // 7. DRAG & DROP KANBAN
    const draggableMissions = document.querySelectorAll('.draggable-mission');
    const dropZones = document.querySelectorAll('.drop-zone');

    draggableMissions.forEach(mission => {
        mission.addEventListener('dragstart', drag);
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', allowDrop);
        zone.addEventListener('drop', drop);
    });

    // 8. MODAL: ACTIVACIÓN
    // Escuchar clics en las filas de la tabla de pilotos
    const pilotRows = document.querySelectorAll('.pilot-row');
    pilotRows.forEach(row => {
        row.addEventListener('click', () => openModal());
    });

    // Escuchar clic en el botón "Añadir Piloto"
    const addPilotBtn = document.querySelector('.action-btn.primary');
    if (addPilotBtn && addPilotBtn.textContent.includes('Añadir')) {
        addPilotBtn.addEventListener('click', () => openModal());
    }

    // 9. MODAL: CIERRE
    const closeModalBtn = document.getElementById('cerrar-modal');
    const saveModalBtn = document.getElementById('btn-guardar-modal');
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (saveModalBtn) saveModalBtn.addEventListener('click', closeModal);

    // Cerrar modal si se hace clic fuera del contenido (en el overlay)
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

});

/*ARRAY DE NAVES*/

const naves = 
[
    { 
        nombre: "X-Wing",
        tipo: "Caza", 
        velocidad: 100, 
        tripulacion: 1, 
        estado: "operativa", 
        icono: "fa-fighter-jet" 
    },
    { 
        nombre: "Millennium Falcon", 
        tipo: "Transporte", 
        velocidad: 120, 
        tripulacion: 4, 
        estado: "operativa", 
        icono: "fa-rocket" 
    },
    { 
        nombre: "TIE Interceptor", 
        tipo: "Caza", 
        velocidad: 110, 
        tripulacion: 1, 
        estado: "en reparación", 
        icono: "fa-fighter-jet" 
    },
    { 
        nombre: "Nebulon-B", 
        tipo: "Fragata", 
        velocidad: 40, 
        tripulacion: 900, 
        estado: "operativa", 
        icono: "fa-ship" 
    }
];

/*VARIABLES FILTRO*/
let navesFiltradas = [...naves];
let ordenAscendente = true;


/*DECLARACIÓN DE FUNCIONES*/

function showSection(sectionId, navElement) {
    // 1. Gestionar Secciones: Usamos solo clases para que el CSS haga el trabajo
    document.querySelectorAll('.section-container').forEach(sec => {
        sec.classList.remove('active-section');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active-section');
    }

    // 2. Gestionar Menú
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    navElement.classList.add('active');
}

function openModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
        modal.style.display = 'flex'; // Usamos flex para centrar según CSS
    }
}

function closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
        modal.style.display = 'none';
    }
}

function toggleDetails(targetId) {
    const detailsDiv = document.getElementById(targetId);
    if (detailsDiv) {
        const isVisible = detailsDiv.style.display === 'block';
        detailsDiv.style.display = isVisible ? 'none' : 'block';
    }
}

function moveNext(missionId) {
    const missionCard = document.getElementById(missionId);
    const colEnCurso = document.getElementById('col-en-curso');
    
    if (missionCard && colEnCurso) {
        const dropZone = colEnCurso.querySelector('.drop-zone');
        dropZone.appendChild(missionCard);
        
        //Actualizamos los contadores después de mover si no se rompe
        updateMissionCounters(); 
    }
}

function toggleDashboard(targetId) {
    const contentDiv = document.getElementById(targetId);
    if (contentDiv) {
        const isVisible = contentDiv.style.display === 'block';
        contentDiv.style.display = isVisible ? 'none' : 'block';
    }
}

/*Funciones Drag & Drop API*/
function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const element = document.getElementById(data);
    
    const dropTarget = event.target.closest('.drop-zone');
    if (dropTarget) {
        dropTarget.appendChild(element);
        
        //Actualizamos los contadores después de soltar la tarjeta
        updateMissionCounters();
    }
}

function updateMissionCounters() {
    // 1. Buscamos todas las columnas del Kanban
    const columns = document.querySelectorAll('.kanban-columna');
    
    columns.forEach(column => {
        // 2. Contamos cuántas tarjetas de misión hay dentro de esta columna específica
        const missionCount = column.querySelectorAll('.mission-card').length;
        
        // 3. Buscamos el span del contador en el header de esa columna
        const counterSpan = column.querySelector('.mision-contador');
        
        // 4. Actualizamos el número
        if (counterSpan) {
            counterSpan.textContent = missionCount;
        }
    });
}

/*GENERADOR HANGAR*/
function generarHangar(listaNaves) {
    const contenedor = document.getElementById('contenedor-naves');
    const contador = document.getElementById('contador-naves');
    
    // Limpia el contenedor para evitar duplicados
    contenedor.innerHTML = "";
    
    listaNaves.forEach(nave => {
        const tarjeta = document.createElement('div');
        tarjeta.className = "data-card"; // Reutilizamos tu CSS
        
        tarjeta.innerHTML = `
            <div class="icon-card-centered" style="margin-bottom: 15px;">
                <i class="fa ${nave.icono} card-icon-large"></i>
            </div>
            <h2 id="piolin">${nave.nombre}</h2>
            <ul>
                <li><strong id="rbd">Tipo:</strong> ${nave.tipo}</li>
                <li><strong id="rbd">Velocidad:</strong> ${nave.velocidad} MGLT</li>
                <li><strong id="rbd">Tripulación:</strong> ${nave.tripulacion}</li>
                <li><strong id="rbd">Estado:</strong> 
                    <span style="color: ${nave.estado === 'operativa' ? 'var(--active)' : 'orange'}">
                        ${nave.estado}
                    </span>
                </li>
            </ul>
        `;
        contenedor.appendChild(tarjeta);
    });

    contador.textContent = `Mostrando: ${listaNaves.length} naves`;
}

/*FILTRO DE BUSQUEDA*/
function filtrarNaves() {
    const textoBusqueda = document.getElementById('buscador-nave').value.toLowerCase();
    const tipoSeleccionado = document.getElementById('filtro-tipo').value;

    navesFiltradas = naves.filter(nave => {
        const coincideNombre = nave.nombre.toLowerCase().includes(textoBusqueda);
        const coincideTipo = tipoSeleccionado === "todos" || nave.tipo === tipoSeleccionado;
        return coincideNombre && coincideTipo;
    });

    generarHangar(navesFiltradas);
}

/*ORDENARO POR VELOCIDAD*/
function ordenarPorVelocidad() {
    navesFiltradas.sort((a, b) => {
        return ordenAscendente ? a.velocidad - b.velocidad : b.velocidad - a.velocidad;
    });
    
    ordenAscendente = !ordenAscendente; // Alternamos para el próximo clic
    generarHangar(navesFiltradas);
}