/**
 * DOM-WARS: Controlador Principal
 * Archivo: js/main.js
 */

document.addEventListener('DOMContentLoaded', () => {
   
    //Reset de contadores
    updateMissionCounters();
    // 1. NAVEGACIÓN PRINCIPAL
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const sectionId = e.currentTarget.getAttribute('data-section');
            showSection(sectionId, e.currentTarget);
        });
    });

    // 2. ACORDEÓN DE MISIONES
    const cardSummaries = document.querySelectorAll('.card-summary');
    cardSummaries.forEach(summary => {
        summary.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            toggleDetails(targetId);
        });
    });

    // 3. BOTONES DE AVANCE MISIONES
    const advanceBtns = document.querySelectorAll('.btn-move-next');
    advanceBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que el clic abra los detalles por accidente
            const missionId = e.currentTarget.getAttribute('data-mission-id');
            moveNext(missionId);
        });
    });

    // 4. ACORDEÓN DASHBOARD
    const statHeaders = document.querySelectorAll('.stat-header');
    statHeaders.forEach(header => {
        header.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            toggleDashboard(targetId);
        });
    });

    // 5. DRAG & DROP KANBAN
    const draggableMissions = document.querySelectorAll('.draggable-mission');
    const dropZones = document.querySelectorAll('.drop-zone');

    draggableMissions.forEach(mission => {
        mission.addEventListener('dragstart', drag);
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', allowDrop);
        zone.addEventListener('drop', drop);
    });

    // 6. MODAL: ACTIVACIÓN (Lo que faltaba)
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

    // 7. MODAL: CIERRE
    const closeModalBtn = document.getElementById('close-modal');
    const saveModalBtn = document.getElementById('btn-save-modal');
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (saveModalBtn) saveModalBtn.addEventListener('click', closeModal);

    // Cerrar modal si se hace clic fuera del contenido (en el overlay)
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

});


/* ==========================================================================
   DECLARACIÓN DE FUNCIONES (Lógica de la aplicación)
   ========================================================================== */

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
        modal.style.display = 'flex'; // Usamos flex para centrar según tu CSS
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
        
        // ¡NUEVO! Actualizamos los contadores después de mover
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

/* --- Funciones Drag & Drop API --- */
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
        
        // ¡NUEVO! Actualizamos los contadores después de soltar la tarjeta
        updateMissionCounters();
    }
}

function updateMissionCounters() {
    // 1. Buscamos todas las columnas del Kanban
    const columns = document.querySelectorAll('.kanban-column');
    
    columns.forEach(column => {
        // 2. Contamos cuántas tarjetas de misión hay dentro de esta columna específica
        const missionCount = column.querySelectorAll('.mission-card').length;
        
        // 3. Buscamos el span del contador en el header de esa columna
        const counterSpan = column.querySelector('.mission-count');
        
        // 4. Actualizamos el número
        if (counterSpan) {
            counterSpan.textContent = missionCount;
        }
    });
}