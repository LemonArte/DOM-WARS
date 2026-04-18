// --- 1. LÓGICA DE NAVEGACIÓN SPA ---
function showSection(sectionId, navElement) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.section-container');
    sections.forEach(sec => sec.classList.remove('active-section'));
    
    // Mostrar la seleccionada
    document.getElementById(sectionId).classList.add('active-section');
    
    // Cambiar estilos del menú superior
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    navElement.classList.add('active');
}

// --- 2. LÓGICA DEL MODAL DE PILOTOS ---
const modal = document.getElementById('modal-overlay');
const rows = document.querySelectorAll('.pilot-row');

// Abrir modal al hacer clic en una fila
rows.forEach(row => {
    row.addEventListener('click', function() {
        // Cargar datos en el formulario (ejemplo básico)
        document.getElementById('m-nombre').value = this.cells[2].innerText;
        document.getElementById('m-rango').value = this.cells[1].innerText;
        modal.style.display = 'flex'; // Muestra el modal
    });
});

// Función para cerrar modal
function closeModal() {
    modal.style.display = 'none';
}

// Cerrar con la X
document.getElementById('close-modal').addEventListener('click', closeModal);

// Cerrar haciendo clic fuera del panel
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});


// --- 3. LÓGICA KANBAN (DRAG AND DROP) ---
function allowDrop(ev) {
    ev.preventDefault(); // Necesario para permitir que se suelte el elemento
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id); // Guarda el ID del elemento arrastrado
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const arrastrado = document.getElementById(data);
    
    // Asegurar que se suelta dentro del contenedor correcto
    let target = ev.target;
    while (target && !target.classList.contains('column-content')) {
        target = target.parentElement;
    }
    
    if (target) {
        target.appendChild(arrastrado); // Mueve el HTML de columna
        actualizarContadores();
    }
}

// Expandir tarjeta de misión
function toggleDetails(id) {
    const el = document.getElementById(id);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

// Mover automáticamente a la siguiente columna
function moveNext(missionId) {
    const arrastrado = document.getElementById(missionId);
    document.getElementById('col-en-curso').querySelector('.column-content').appendChild(arrastrado);
    actualizarContadores();
}

// Actualizar números de las cabeceras
function actualizarContadores() {
    document.querySelectorAll('.kanban-column').forEach(col => {
        const count = col.querySelectorAll('.mission-card').length;
        col.querySelector('.mission-count').innerText = count;
    });
}


// --- 4. LÓGICA DASHBOARD ---
function toggleDashboard(id) {
    const el = document.getElementById(id);
    const icon = el.previousElementSibling.querySelector('.fa-caret-down');
    
    if (el.style.display === 'none') {
        el.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
    } else {
        el.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    }
}