/**DOM-WARS: Controlador Principal*/


const STORAGE_PILOTOS = 'domwars_pilotos';
const STORAGE_MISIONES = 'domwars_misiones';


const naves = [
	{ id: 1, nombre: 'X-Wing', tipo: 'caza', velocidad: 100, tripulacion: 1, estado: 'operativa', icono: 'fa-fighter-jet', descripcion: 'Caza estelar versátil de la Alianza Rebelde.' },
	{ id: 2, nombre: 'Millennium Falcon', tipo: 'transporte', velocidad: 105, tripulacion: 4, estado: 'operativa', icono: 'fa-shuttle-space', descripcion: 'Nave rápida y muy famosa.' },
	{ id: 3, nombre: 'Nebulon-B', tipo: 'fragata', velocidad: 70, tripulacion: 920, estado: 'reparacion', icono: 'fa-space-shuttle', descripcion: 'Fragata de apoyo rebelde.' },
	{ id: 4, nombre: 'A-Wing', tipo: 'caza', velocidad: 130, tripulacion: 1, estado: 'operativa', icono: 'fa-jet-fighter-up', descripcion: 'Interceptor muy rápido.' },
	{ id: 5, nombre: 'Y-Wing', tipo: 'bombardero', velocidad: 80, tripulacion: 2, estado: 'destruida', icono: 'fa-plane', descripcion: 'Bombardero resistente.' }
];


let pilotos = cargarDatos(STORAGE_PILOTOS, [
	{ id: 1, rango: 'Capitán', nombre: 'Alex Thorne', nave: 'X-Wing', victorias: 15, estado: 'activo' },
	{ id: 2, rango: 'Teniente', nombre: 'Zara Khan', nave: 'A-Wing', victorias: 9, estado: 'herido' }
]);


let misiones = cargarDatos(STORAGE_MISIONES, [
	{ id: 'm1', nombre: 'Infiltración', descripcion: 'Recuperar planos.', piloto: 'Alex Thorne', dificultad: 'media', fecha: hoyTexto(), estado: 'pendiente' }
]);


let ordenAscendente = true;


/* BLOQUE 1: Prevenimos la ejecución del JS hasta que la pagína haya sido cargada por completo */
document.addEventListener('DOMContentLoaded', () => {

	//0. Reset de contadores de misión
	updateMissionCounters();
	renderAll();
	document.getElementById('mision-fecha').value = hoyTexto();


	// 1. NAVEGACIÓN PRINCIPAL
	const navItems = document.querySelectorAll('.nav-item');
	navItems.forEach(item => {
		item.addEventListener('click', (e) => {
			const sectionId = e.currentTarget.getAttribute('data-section');
			showSection(sectionId, e.currentTarget);
		});
	});


	// 2. ACORDEÓN DE MISIONES
	const board = document.querySelector('.kanban-board');
	board.addEventListener('click', (e) => {
		const summary = e.target.closest('.card-summary');
		if (summary) {
			const targetId = summary.getAttribute('data-target');
			toggleDetails(targetId);
		}
	});


	// 3. BOTONES DE AVANCE MISIONES
	board.addEventListener('click', (e) => {
		const btn = e.target.closest('.btn-move-siguiente');
		if (btn) {
			e.stopPropagation(); // Evita que el clic abra los detalles por accidente
			const missionId = e.currentTarget ? btn.getAttribute('data-mision-id') : btn.getAttribute('data-mision-id');
			moveNext(missionId);
		}
	});


	board.addEventListener('click', (e) => {
		const btn = e.target.closest('.btn-eliminar-mision');
		if (btn) {
			const missionId = btn.getAttribute('data-mision-id');
			eliminarMision(missionId);
		}
	});


	// 4. ACORDEÓN DASHBOARD
	// No hace falta acordeón real para cumplir lo obligatorio


	// 5. DRAG & DROP KANBAN
	// No se añade porque es ampliación opcional


	// 6. MODAL: ACTIVACIÓN
	const tablaPilotosBody = document.getElementById('tabla-pilotos-body');
	tablaPilotosBody.addEventListener('click', (e) => {
		const btnEditar = e.target.closest('.btn-editar');
		const btnEliminar = e.target.closest('.btn-eliminar');


		if (btnEditar) {
			const id = Number(btnEditar.getAttribute('data-id'));
			abrirEdicionPilot(id);
		}


		if (btnEliminar) {
			const id = Number(btnEliminar.getAttribute('data-id'));
			eliminarPiloto(id);
		}
	});


	// Escuchar clic en el botón "Añadir Piloto"
	const addPilotBtn = document.getElementById('btn-abrir-form-piloto');
	if (addPilotBtn && addPilotBtn.textContent.includes('Añadir')) {
		addPilotBtn.addEventListener('click', () => openModal());
	}


	// 7. MODAL: CIERRE
	const closeModalBtn = document.getElementById('cerrar-modal');
	const saveModalBtn = document.getElementById('btn-guardar-modal');


	if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
	if (saveModalBtn) saveModalBtn.addEventListener('click', () => {});


	// Cerrar modal si se hace clic fuera del contenido (en el overlay)
	const modalOverlay = document.getElementById('modal-overlay');
	modalOverlay.addEventListener('click', (e) => {
		if (e.target === modalOverlay) closeModal();
	});


	document.getElementById('buscador-naves').addEventListener('input', renderHangar);
	document.getElementById('filtro-tipo').addEventListener('change', renderHangar);
	document.getElementById('btn-ordenar').addEventListener('click', cambiarOrdenNaves);
	document.getElementById('editar-form').addEventListener('submit', guardarPiloto);
	document.getElementById('form-mision').addEventListener('submit', guardarMision);
	document.getElementById('filtro-dificultad').addEventListener('change', renderMisiones);


});


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


	if (sectionId === 'mando-alianza') {
		renderDashboard();
	}
}


function openModal() {
	const modal = document.getElementById('modal-overlay');
	if (modal) {
		limpiarFormularioPiloto();
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
	const mission = misiones.find(item => item.id === missionId);
	if (!mission) {
		return;
	}


	if (mission.estado === 'pendiente') {
		mission.estado = 'en-curso';
	} else if (mission.estado === 'en-curso') {
		mission.estado = 'completada';
	}


	guardarTodo();
	renderMisiones();
	renderDashboard();


	//Actualizamos los contadores después de mover si no se rompe
	updateMissionCounters();
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


function renderAll() {
	llenarSelectTipos();
	llenarSelectNaves();
	llenarSelectPilotosActivos();
	renderHangar();
	renderPilotos();
	renderMisiones();
	renderDashboard();
}


function renderHangar() {
	const contenedor = document.getElementById('hangar-cuadricula');
	const texto = document.getElementById('buscador-naves').value.toLowerCase().trim();
	const tipo = document.getElementById('filtro-tipo').value;
	let lista = [...naves];


	if (texto) {
		lista = lista.filter(nave => nave.nombre.toLowerCase().includes(texto));
	}


	if (tipo !== 'todas') {
		lista = lista.filter(nave => nave.tipo === tipo);
	}


	lista.sort((a, b) => ordenAscendente ? a.velocidad - b.velocidad : b.velocidad - a.velocidad);
	contenedor.innerHTML = '';


	lista.forEach(nave => {
		const div = document.createElement('div');
		div.className = 'data-card';
		div.innerHTML = `
        <div class="icon-card-centered">
        <!--icono nave si no hay foto-->
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
		contenedor.appendChild(div);
	});


	document.getElementById('contador-naves').textContent = lista.length;
}


function cambiarOrdenNaves() {
	ordenAscendente = !ordenAscendente;
	document.getElementById('btn-ordenar').textContent = ordenAscendente ? 'Ordenar velocidad ↑' : 'Ordenar velocidad ↓';
	renderHangar();
}


function renderPilotos() {
	const body = document.getElementById('tabla-pilotos-body');
	body.innerHTML = '';


	pilotos.forEach((piloto, index) => {
		const tr = document.createElement('tr');
		tr.className = 'pilot-row';
		tr.innerHTML = `
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
		body.appendChild(tr);
	});


	llenarSelectPilotosActivos();
}


function abrirEdicionPilot(id) {
	const piloto = pilotos.find(p => p.id === id);
	if (!piloto) {
		return;
	}
	openModal();
	document.getElementById('piloto-id').value = piloto.id;
	document.getElementById('piloto-nombre').value = piloto.nombre;
	document.getElementById('piloto-rango').value = piloto.rango;
	document.getElementById('piloto-nave').value = piloto.nave;
	document.getElementById('piloto-victorias').value = piloto.victorias;
	document.getElementById('piloto-estado').value = piloto.estado;
}


function guardarPiloto(e) {
	e.preventDefault();
	const id = document.getElementById('piloto-id').value;
	const nombre = document.getElementById('piloto-nombre').value.trim();
	const rango = document.getElementById('piloto-rango').value.trim();
	const nave = document.getElementById('piloto-nave').value;
	const victorias = Number(document.getElementById('piloto-victorias').value);
	const estado = document.getElementById('piloto-estado').value;
	const mensaje = document.getElementById('mensaje-formulario');


	if (!nombre || !rango || !nave || victorias < 0 || Number.isNaN(victorias)) {
		mensaje.textContent = 'Completa bien el formulario.';
		return;
	}


	const pilotoNuevo = {
		id: id ? Number(id) : Date.now(),
		nombre,
		rango,
		nave,
		victorias,
		estado
	};


	if (id) {
		pilotos = pilotos.map(p => p.id === Number(id) ? pilotoNuevo : p);
	} else {
		pilotos.push(pilotoNuevo);
	}


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


function renderMisiones() {
	const filtro = document.getElementById('filtro-dificultad').value;
	document.querySelectorAll('.columna-content').forEach(col => col.innerHTML = '');


	let lista = [...misiones];
	if (filtro !== 'todas') {
		lista = lista.filter(m => m.dificultad === filtro);
	}


	lista.forEach(mision => {
		const columna = document.querySelector(`.columna-content[data-estado="${mision.estado}"]`);
		const detalleId = 'detalle-' + mision.id;
		let boton = '';
		if (mision.estado !== 'completada') {
			boton = `<button class="action-btn primary btn-peque btn-move-siguiente" data-mision-id="${mision.id}" type="button">Avanzar</button>`;
		}
		const card = document.createElement('div');
		card.className = 'mission-card';
		card.innerHTML = `
        <div class="card-summary" data-target="${detalleId}">
        <span>${mision.nombre}</span>
        <i class="fa fa-chevron-down"></i>
        </div>
        <div class="card-details" id="${detalleId}">
        <p>Objetivo: ${mision.descripcion}</p>
        <p>Piloto: ${mision.piloto}</p>
        <p>Dificultad: ${mision.dificultad}</p>
        <p>Fecha: ${mision.fecha}</p>
        ${boton}
        <button class="action-btn eliminar btn-peque btn-eliminar-mision" data-mision-id="${mision.id}" type="button">Eliminar</button>
        </div>
        `;
		columna.appendChild(card);
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


	if (!nombre || !descripcion || !piloto || !fecha) {
		alert('Completa todos los campos de la misión.');
		return;
	}


	misiones.push({
		id: 'm' + Date.now(),
		nombre,
		descripcion,
		piloto,
		dificultad,
		fecha,
		estado: 'pendiente'
	});


	guardarTodo();
	renderMisiones();
	renderDashboard();
	document.getElementById('form-mision').reset();
	document.getElementById('mision-fecha').value = hoyTexto();
	llenarSelectPilotosActivos();
}


function eliminarMision(id) {
	misiones = misiones.filter(m => m.id !== id);
	guardarTodo();
	renderMisiones();
	renderDashboard();
}


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
	const mejorPiloto = pilotos.length ? [...pilotos].sort((a, b) => b.victorias - a.victorias)[0] : null;
	const mejorNave = [...naves].sort((a, b) => b.velocidad - a.velocidad)[0];
	const porcentaje = totalMisiones === 0 ? 0 : Math.round((completadas * 100) / totalMisiones);


	document.getElementById('total-naves').textContent = totalNaves;
	document.getElementById('total-pilotos').textContent = totalPilotos;
	document.getElementById('total-misiones').textContent = totalMisiones;
	document.getElementById('detalles-naves').innerHTML = `<p>Operativas: ${operativas}</p><p>En reparación: ${reparacion}</p><p>Destruidas: ${destruidas}</p>`;
	document.getElementById('detalles-pilotos').innerHTML = `<p>Activos: ${activos}</p><p>Heridos: ${heridos}</p><p>KIA: ${kia}</p>`;
	document.getElementById('detalles-misiones').innerHTML = `<p>Pendientes: ${pendientes}</p><p>En curso: ${enCurso}</p><p>Completadas: ${completadas}</p>`;
	document.getElementById('top-piloto').textContent = mejorPiloto ? `${mejorPiloto.nombre} (${mejorPiloto.victorias})` : '-';
	document.getElementById('top-nave').textContent = mejorNave ? `${mejorNave.nombre} (${mejorNave.velocidad} MGLT)` : '-';
	document.getElementById('barra-progreso').style.width = porcentaje + '%';
	document.getElementById('texto-progreso').textContent = porcentaje + '%';
}


function llenarSelectTipos() {
	const select = document.getElementById('filtro-tipo');
	const tipos = [...new Set(naves.map(n => n.tipo))];
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
	const activos = pilotos.filter(p => p.estado === 'activo');
	activos.forEach(piloto => {
		const option = document.createElement('option');
		option.value = piloto.nombre;
		option.textContent = piloto.nombre;
		select.appendChild(option);
	});
	if (activos.length === 0) {
		select.innerHTML = '<option value="">Sin pilotos activos</option>';
	}
}


function limpiarFormularioPiloto() {
	document.getElementById('editar-form').reset();
	document.getElementById('piloto-id').value = '';
	document.getElementById('mensaje-formulario').textContent = '';
}


function guardarTodo() {
	localStorage.setItem(STORAGE_PILOTOS, JSON.stringify(pilotos));
	localStorage.setItem(STORAGE_MISIONES, JSON.stringify(misiones));
}


function cargarDatos(clave, base) {
	const datos = localStorage.getItem(clave);
	if (!datos) {
		return base;
	}
	try {
		return JSON.parse(datos);
	} catch (error) {
		return base;
	}
}


function hoyTexto() {
	return new Date().toISOString().split('T')[0];
}