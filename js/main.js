// DOM-WARS: Controlador Principal


// 1. CLAVES DE LOCALSTORAGE
const STORAGE_PILOTOS = 'domwars_pilotos';
const STORAGE_MISIONES = 'domwars_misiones';


/*
   2. DATOS FIJOS DE NAVES
   Estas naves no cambian, por eso van en const
*/
const naves = [
    {
        id: 1,
        nombre: 'X-Wing',
        tipo: 'caza',
        velocidad: 100,
        tripulacion: 1,
        estado: 'operativa',
        icono: 'fa-fighter-jet',
        descripcion: 'Caza estelar versátil de la Alianza Rebelde.'
    },
    {
        id: 2,
        nombre: 'Millennium Falcon',
        tipo: 'transporte',
        velocidad: 105,
        tripulacion: 4,
        estado: 'operativa',
        icono: 'fa-shuttle-space',
        descripcion: 'Nave rápida y muy famosa.'
    },
    {
        id: 3,
        nombre: 'Nebulon-B',
        tipo: 'fragata',
        velocidad: 70,
        tripulacion: 920,
        estado: 'reparacion',
        icono: 'fa-space-shuttle',
        descripcion: 'Fragata de apoyo rebelde.'
    },
    {
        id: 4,
        nombre: 'A-Wing',
        tipo: 'caza',
        velocidad: 130,
        tripulacion: 1,
        estado: 'operativa',
        icono: 'fa-plane',
        descripcion: 'Interceptor muy rápido.'
    },
    {
        id: 5,
        nombre: 'Y-Wing',
        tipo: 'bombardero',
        velocidad: 80,
        tripulacion: 2,
        estado: 'destruida',
        icono: 'fa-plane',
        descripcion: 'Bombardero resistente.'
    }
];


/* 
   3. DATOS DE PILOTOS
   
   Si hay datos guardados en localStorage, se cargan.
   Si no, se usan estos datos base.
*/
let pilotos = cargarDatos(STORAGE_PILOTOS, [
    {
        id: 1,
        rango: 'Capitán',
        nombre: 'Alex Thorne',
        nave: 'X-Wing',
        victorias: 15,
        estado: 'activo'
    },
    {
        id: 2,
        rango: 'Teniente',
        nombre: 'Zara Khan',
        nave: 'A-Wing',
        victorias: 9,
        estado: 'herido'
    },
    {
        id: 3,
        rango: 'Capitán',
        nombre: 'Luke Skywalker',
        nave: 'Y-Wing',
        victorias: 13,
        estado: 'activo'
    },
    {
        id: 4,
        rango: 'Teniente',
        nombre: 'Wedge Antilles',
        nave: 'A-Wing',
        victorias: 4,
        estado: 'herido'
    },
    {
        id: 5,
        rango: 'Teniente',
        nombre: 'Jek Porkins',
        nave: 'Nebulon-B',
        victorias: 7,
        estado: 'activo'
    },
    {
        id: 6,
        rango: 'Polizón',
        nombre: 'Joel Ruiz',
        nave: 'Millennium Falcon',
        victorias: 5,
        estado: 'herido'
    },
    {
        id: 7,
        rango: 'RBD WAY',
        nombre: 'Átoma XPeach',
        nave: 'A-Wing',
        victorias: 4,
        estado: 'kia'
    }
]);


/* 
   4. DATOS DE MISIONES
*/
let misiones = cargarDatos(STORAGE_MISIONES, [
    {
        id: 'm1',
        nombre: 'Infiltración',
        descripcion: 'Recuperar planos.',
        piloto: 'Alex Thorne',
        dificultad: 'media',
        fecha: hoyTexto(),
        estado: 'pendiente'
    }
]);


/* 
   5. VARIABLES DE APOYO
   
   Sirve para cambiar el orden de velocidad de las naves
*/
let ordenAscendente = true;


/*
   6. CUANDO LA PÁGINA TERMINA DE CARGAR
*/
document.addEventListener('DOMContentLoaded', () => {

    /* Cargamos todo al inicio */
    renderAll();

    /* Ponemos la fecha actual en el formulario de misión */
    document.getElementById('mision-fecha').value = hoyTexto();


/* 
	EVENTOS DE NAVEGACIÓN
*/
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.getAttribute('data-section');
            showSection(sectionId, item);
        });
    });


 
    //EVENTOS DEL HANGAR

    document.getElementById('buscador-naves').addEventListener('input', renderHangar);
    document.getElementById('filtro-tipo').addEventListener('change', renderHangar);
    document.getElementById('btn-ordenar').addEventListener('click', cambiarOrdenNaves);



//  EVENTOS DE PILOTOS

    document.getElementById('btn-abrir-form-piloto').addEventListener('click', openModal);
    document.getElementById('editar-form').addEventListener('submit', guardarPiloto);
    document.getElementById('cerrar-modal').addEventListener('click', closeModal);

    // Cerrar modal si se hace clic fuera
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') {
            closeModal();
        }
    });

    // Botones editar y eliminar dentro de la tabla de pilotos
    document.getElementById('tabla-pilotos-body').addEventListener('click', (e) => {
        const botonEditar = e.target.closest('.btn-editar');
        const botonEliminar = e.target.closest('.btn-eliminar');

        if (botonEditar) {
            const id = Number(botonEditar.getAttribute('data-id'));
            abrirEdicionPilot(id);
        }

        if (botonEliminar) {
            const id = Number(botonEliminar.getAttribute('data-id'));
            eliminarPiloto(id);
        }
    });
 
    
	//EVENTOS DE MISIONES
    
    document.getElementById('form-mision').addEventListener('submit', guardarMision);
    document.getElementById('filtro-dificultad').addEventListener('change', renderMisiones);

    // Evento general del tablero kanban
    document.querySelector('.kanban-board').addEventListener('click', (e) => {

        // Abrir o cerrar detalles
        const resumen = e.target.closest('.card-summary');
        if (resumen) {
            const targetId = resumen.getAttribute('data-target');
            toggleDetails(targetId);
        }

        // Avanzar misión
        const botonAvanzar = e.target.closest('.btn-move-siguiente');
        if (botonAvanzar) {
            const missionId = botonAvanzar.getAttribute('data-mision-id');
            moveNext(missionId);
        }

        // Eliminar misión
        const botonEliminar = e.target.closest('.btn-eliminar-mision');
        if (botonEliminar) {
            const missionId = botonEliminar.getAttribute('data-mision-id');
            eliminarMision(missionId);
        }
    });
});


//   7. CAMBIAR ENTRE SECCIONES DE LA WEB

function showSection(sectionId, navElement) {
    /* Ocultamos todas las secciones */
    document.querySelectorAll('.section-container').forEach(seccion => {
        seccion.classList.remove('active-section');
    });

    /* Mostramos solo la sección pulsada */
    const seccionActiva = document.getElementById(sectionId);
    if (seccionActiva) {
        seccionActiva.classList.add('active-section');
    }

    /* Quitamos la clase active del menú */
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    /* Añadimos active al botón pulsado */
    navElement.classList.add('active');

    /* Si entra al dashboard, lo refrescamos */
    if (sectionId === 'mando-alianza') {
        renderDashboard();
    }
}


//   8. MODAL DE PILOTOS

function openModal() {
    limpiarFormularioPiloto();
    document.getElementById('modal-overlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

function abrirEdicionPilot(id) {
    /* Buscamos el piloto por id */
    const piloto = pilotos.find(p => p.id === id);

    if (!piloto) {
        return;
    }

    /* Abrimos modal */
    document.getElementById('modal-overlay').style.display = 'flex';

    /* Rellenamos el formulario con sus datos */
    document.getElementById('piloto-id').value = piloto.id;
    document.getElementById('piloto-nombre').value = piloto.nombre;
    document.getElementById('piloto-rango').value = piloto.rango;
    document.getElementById('piloto-nave').value = piloto.nave;
    document.getElementById('piloto-victorias').value = piloto.victorias;
    document.getElementById('piloto-estado').value = piloto.estado;
}

function limpiarFormularioPiloto() {
    document.getElementById('editar-form').reset();
    document.getElementById('piloto-id').value = '';
    document.getElementById('mensaje-formulario').textContent = '';
}


//   9. RENDER GENERAL

function renderAll() {
    llenarSelectTipos();
    llenarSelectNaves();
    llenarSelectPilotosActivos();
    renderHangar();
    renderPilotos();
    renderMisiones();
    renderDashboard();
}


//   10. HANGAR DE NAVES

function renderHangar() {
    const contenedor = document.getElementById('hangar-cuadricula');
    const textoBusqueda = document.getElementById('buscador-naves').value.toLowerCase().trim();
    const tipoSeleccionado = document.getElementById('filtro-tipo').value;

    /* Copiamos el array para no modificar el original */
    let lista = [...naves];

    /* Filtrar por nombre */
    if (textoBusqueda !== '') {
        lista = lista.filter(nave => nave.nombre.toLowerCase().includes(textoBusqueda));
    }

    /* Filtrar por tipo */
    if (tipoSeleccionado !== 'todas') {
        lista = lista.filter(nave => nave.tipo === tipoSeleccionado);
    }

    /* Ordenar por velocidad */
    if (ordenAscendente) {
        lista.sort((a, b) => a.velocidad - b.velocidad);
    } else {
        lista.sort((a, b) => b.velocidad - a.velocidad);
    }

    /* Limpiar contenido antes de volver a pintar */
    contenedor.innerHTML = '';

    /* Pintar cada nave */
    lista.forEach(nave => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'data-card';

        tarjeta.innerHTML = `
            <div class="icon-card-centered">
                <i class="fa ${nave.icono} card-icon-large"></i>
            </div>

            <h2 id="piolin">Datos Técnicos</h2>

            <ul>
                <li><strong id="rbd">Nombre</strong> ${nave.nombre}</li>
                <li><strong id="rbd">Tipo</strong> ${nave.tipo}</li>
                <li><strong id="rbd">Velocidad</strong> ${nave.velocidad} MGLT</li>
                <li><strong id="rbd">Tripulación</strong> ${nave.tripulacion}</li>
                <li><strong id="rbd">Estado</strong> ${nave.estado}</li>
            </ul>

            <p class="nave-desc">${nave.descripcion}</p>
        `;

        contenedor.appendChild(tarjeta);
    });

    /* Actualizar contador */
    document.getElementById('contador-naves').textContent = lista.length;
}

function cambiarOrdenNaves() {
    /* Cambia true/false */
    ordenAscendente = !ordenAscendente;

    /* Cambia el texto del botón */
    if (ordenAscendente) {
        document.getElementById('btn-ordenar').textContent = 'Ordenar velocidad ↑';
    } else {
        document.getElementById('btn-ordenar').textContent = 'Ordenar velocidad ↓';
    }

    renderHangar();
}


/*
   11. PILOTOS
 */
function renderPilotos() {
    const body = document.getElementById('tabla-pilotos-body');
    body.innerHTML = '';

    pilotos.forEach((piloto, index) => {
        const fila = document.createElement('tr');
        fila.className = 'pilot-row';

        fila.innerHTML = `
            <td>${index + 1}</td>
            <td>${piloto.rango}</td>
            <td>${piloto.nombre}</td>
            <td>${piloto.nave}</td>
            <td>${piloto.victorias}</td>
            <td>${piloto.estado}</td>
            <td>
                <button class="action-btn secundario btn-peque btn-editar" data-id="${piloto.id}" type="button">Editar</button>
                <button class="action-btn eliminar btn-peque btn-eliminar" data-id="${piloto.id}" type="button">Eliminar</button>
            </td>
        `;

        body.appendChild(fila);
    });

    /* Actualizamos select de pilotos activos para misiones */
    llenarSelectPilotosActivos();
}

function guardarPiloto(e) {
    e.preventDefault();

    /* Recogemos datos del formulario */
    const id = document.getElementById('piloto-id').value;
    const nombre = document.getElementById('piloto-nombre').value.trim();
    const rango = document.getElementById('piloto-rango').value.trim();
    const nave = document.getElementById('piloto-nave').value;
    const victorias = Number(document.getElementById('piloto-victorias').value);
    const estado = document.getElementById('piloto-estado').value.toLowerCase();
    const mensaje = document.getElementById('mensaje-formulario');

    /* Validación básica */
    if (nombre === '' || rango === '' || nave === '' || victorias < 0 || Number.isNaN(victorias)) {
        mensaje.textContent = 'Completa bien el formulario.';
        return;
    }

    /* Objeto nuevo o editado */
    const pilotoNuevo = {
        id: id ? Number(id) : Date.now(),
        nombre: nombre,
        rango: rango,
        nave: nave,
        victorias: victorias,
        estado: estado
    };

    /* Si tiene id, editamos. Si no, añadimos */
    if (id) {
        pilotos = pilotos.map(p => {
            if (p.id === Number(id)) {
                return pilotoNuevo;
            } else {
                return p;
            }
        });
    } else {
        pilotos.push(pilotoNuevo);
    }

    /* Guardar y refrescar */
    guardarTodo();
    renderPilotos();
    renderDashboard();
    closeModal();
}

function eliminarPiloto(id) {
    const confirmar = confirm('¿Seguro que quieres eliminar este piloto?');

    if (!confirmar) {
        return;
    }

    pilotos = pilotos.filter(p => p.id !== id);

    guardarTodo();
    renderPilotos();
    renderDashboard();
}


/*
   12. MISIONES
 */
function renderMisiones() {
    const filtro = document.getElementById('filtro-dificultad').value;

    /* Limpiar las 3 columnas */
    document.querySelectorAll('.columna-content').forEach(columna => {
        columna.innerHTML = '';
    });

    let lista = [...misiones];

    /* Filtrar por dificultad */
    if (filtro !== 'todas') {
        lista = lista.filter(mision => mision.dificultad === filtro);
    }

    lista.forEach(mision => {
        const columna = document.querySelector(`.columna-content[data-estado="${mision.estado}"]`);

        if (!columna) {
            return;
        }

        const detalleId = 'detalle-' + mision.id;

        let botonAvanzar = '';
        if (mision.estado !== 'completada') {
            botonAvanzar = `
                <button class="action-btn primary btn-peque btn-move-siguiente" data-mision-id="${mision.id}" type="button">
                    Avanzar
                </button>
            `;
        }

        const tarjeta = document.createElement('div');
        tarjeta.className = 'mission-card';

        tarjeta.innerHTML = `
            <div class="card-summary" data-target="${detalleId}">
                <span>${mision.nombre}</span>
                <i class="fa fa-chevron-down"></i>
            </div>

            <div class="card-details" id="${detalleId}">
                <p>Objetivo: ${mision.descripcion}</p>
                <p>Piloto: ${mision.piloto}</p>
                <p>Dificultad: ${mision.dificultad}</p>
                <p>Fecha: ${mision.fecha}</p>
                ${botonAvanzar}
                <button class="action-btn eliminar btn-peque btn-eliminar-mision" data-mision-id="${mision.id}" type="button">
                    Eliminar
                </button>
            </div>
        `;

        columna.appendChild(tarjeta);
    });

    updateMissionCounters();
}

function guardarMision(e) {
    e.preventDefault();

    const nombre = document.getElementById('mision-nombre').value.trim();
    const descripcion = document.getElementById('mision-descripcion').value.trim();
    const piloto = document.getElementById('mision-piloto').value;
    const dificultad = document.getElementById('mision-dificultad').value;
    const fecha = document.getElementById('mision-fecha').value;

    /* Validación básica */
    if (nombre === '' || descripcion === '' || piloto === '' || fecha === '') {
        alert('Completa todos los campos de la misión.');
        return;
    }

    const nuevaMision = {
        id: 'm' + Date.now(),
        nombre: nombre,
        descripcion: descripcion,
        piloto: piloto,
        dificultad: dificultad,
        fecha: fecha,
        estado: 'pendiente'
    };

    misiones.push(nuevaMision);

    guardarTodo();
    renderMisiones();
    renderDashboard();

    /* Limpiar formulario */
    document.getElementById('form-mision').reset();
    document.getElementById('mision-fecha').value = hoyTexto();
    llenarSelectPilotosActivos();
}

function moveNext(missionId) {
    const mision = misiones.find(m => m.id === missionId);

    if (!mision) {
        return;
    }

    if (mision.estado === 'pendiente') {
        mision.estado = 'en-curso';
    } else if (mision.estado === 'en-curso') {
        mision.estado = 'completada';
    }

    guardarTodo();
    renderMisiones();
    renderDashboard();
}

function eliminarMision(id) {
    misiones = misiones.filter(m => m.id !== id);

    guardarTodo();
    renderMisiones();
    renderDashboard();
}

function toggleDetails(targetId) {
    const caja = document.getElementById(targetId);

    if (!caja) {
        return;
    }

    if (caja.style.display === 'block') {
        caja.style.display = 'none';
    } else {
        caja.style.display = 'block';
    }
}

function updateMissionCounters() {
    const columnas = document.querySelectorAll('.kanban-columna');

    columnas.forEach(columna => {
        const total = columna.querySelectorAll('.mission-card').length;
        const contador = columna.querySelector('.mision-contador');

        if (contador) {
            contador.textContent = total;
        }
    });
}


/*
   13. DASHBOARD
 */
function renderDashboard() {
    const totalNaves = naves.length;
    const totalPilotos = pilotos.length;
    const totalMisiones = misiones.length;

    const operativas = naves.filter(n => n.estado === 'operativa').length;
    const reparacion = naves.filter(n => n.estado === 'reparacion').length;
    const destruidas = naves.filter(n => n.estado === 'destruida').length;

    const activos = pilotos.filter(p => p.estado === 'activo').length;
    const heridos = pilotos.filter(p => p.estado === 'herido').length;
    const kia = pilotos.filter(p => p.estado === 'kia').length;

    const pendientes = misiones.filter(m => m.estado === 'pendiente').length;
    const enCurso = misiones.filter(m => m.estado === 'en-curso').length;
    const completadas = misiones.filter(m => m.estado === 'completada').length;

    let mejorPiloto = null;
    if (pilotos.length > 0) {
        mejorPiloto = [...pilotos].sort((a, b) => b.victorias - a.victorias)[0];
    }

    const mejorNave = [...naves].sort((a, b) => b.velocidad - a.velocidad)[0];

    let porcentaje = 0;
    if (totalMisiones > 0) {
        porcentaje = Math.round((completadas * 100) / totalMisiones);
    }

    document.getElementById('total-naves').textContent = totalNaves;
    document.getElementById('total-pilotos').textContent = totalPilotos;
    document.getElementById('total-misiones').textContent = totalMisiones;

    document.getElementById('detalles-naves').innerHTML = `
        <p>Operativas: ${operativas}</p>
        <p>En reparación: ${reparacion}</p>
        <p>Destruidas: ${destruidas}</p>
    `;

    document.getElementById('detalles-pilotos').innerHTML = `
        <p>Activos: ${activos}</p>
        <p>Heridos: ${heridos}</p>
        <p>KIA: ${kia}</p>
    `;

    document.getElementById('detalles-misiones').innerHTML = `
        <p>Pendientes: ${pendientes}</p>
        <p>En curso: ${enCurso}</p>
        <p>Completadas: ${completadas}</p>
    `;

    document.getElementById('top-piloto').textContent = mejorPiloto
        ? `${mejorPiloto.nombre} (${mejorPiloto.victorias})`
        : '-';

    document.getElementById('top-nave').textContent = mejorNave
        ? `${mejorNave.nombre} (${mejorNave.velocidad} MGLT)`
        : '-';

    document.getElementById('barra-progreso').style.width = porcentaje + '%';
    document.getElementById('texto-progreso').textContent = porcentaje + '%';
}


/*
   14. SELECTS
 */
function llenarSelectTipos() {
    const select = document.getElementById('filtro-tipo');
    const tipos = [...new Set(naves.map(nave => nave.tipo))];

    select.innerHTML = '<option value="todas">Todos</option>';

    tipos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        select.appendChild(option);
    });
}

function llenarSelectNaves() {
    const select = document.getElementById('piloto-nave');
    select.innerHTML = '';

    naves.forEach(nave => {
        const option = document.createElement('option');
        option.value = nave.nombre;
        option.textContent = nave.nombre;
        select.appendChild(option);
    });
}

function llenarSelectPilotosActivos() {
    const select = document.getElementById('mision-piloto');
    select.innerHTML = '';

    const pilotosActivos = pilotos.filter(p => p.estado === 'activo');

    if (pilotosActivos.length === 0) {
        select.innerHTML = '<option value="">Sin pilotos activos</option>';
        return;
    }

    pilotosActivos.forEach(piloto => {
        const option = document.createElement('option');
        option.value = piloto.nombre;
        option.textContent = piloto.nombre;
        select.appendChild(option);
    });
}


/*
   15. GUARDAR Y CARGAR DATOS
 */
function guardarTodo() {
    localStorage.setItem(STORAGE_PILOTOS, JSON.stringify(pilotos));
    localStorage.setItem(STORAGE_MISIONES, JSON.stringify(misiones));
}

function cargarDatos(clave, datosBase) {
    const datosGuardados = localStorage.getItem(clave);

    if (!datosGuardados) {
        return datosBase;
    }

    try {
        return JSON.parse(datosGuardados);
    } catch (error) {
        return datosBase;
    }
}


// 16. FECHA DE HOY

function hoyTexto() {
    return new Date().toISOString().split('T')[0];
}


// CAMBIAR TEMA
const logo = document.getElementById('logo');

logo.addEventListener('click', () => {
    document.body.classList.toggle('tema-claro');
});



