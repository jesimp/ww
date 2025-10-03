document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------------------------------
    // Configuración Inicial y Posicionamiento
    // ------------------------------------------------------------------
    const pageButtons = document.querySelectorAll('.page-options button');
    const pages = document.querySelectorAll('.page-content');
    const pageOptionsContainer = document.querySelector('.page-options');

    // Contenedor para mostrar la suma total (se insertará a la derecha de los botones)
    const totalDisplayContainer = document.createElement('div');
    totalDisplayContainer.id = 'total-sums-container';
    
    // Estilos para la posición a la derecha
    totalDisplayContainer.style.marginLeft = '20px'; 
    totalDisplayContainer.style.display = 'inline-flex'; 
    totalDisplayContainer.style.flexDirection = 'column';
    totalDisplayContainer.style.textAlign = 'right';
    totalDisplayContainer.style.verticalAlign = 'top';
    totalDisplayContainer.style.padding = '0 10px'; 

    pageOptionsContainer.appendChild(totalDisplayContainer);

    // HTML estandarizado para una celda de datos (TD), incluye input y elementos de comentario
    function getDataCellHTML() {
        return `
            <input type="number" class="number-input">
            <div class="comment-marker" title="Doble clic para comentar"></div>
            <div class="comment-tooltip"></div>
        `;
    }

// ------------------------------------------------------------------
// 1. Lógica de Totales de Columna (Enteros y Nombre de Columna CORREGIDO)
// ------------------------------------------------------------------
const updateTotalSums = () => {
    // Solo considera la primera tabla en la Hoja 1 ("Mesa Principal")
    const firstTable = document.querySelector('#page1 .table-container:first-child table');
    if (!firstTable) {
        totalDisplayContainer.innerHTML = '';
        return;
    }

    const thead = firstTable.querySelector('thead tr');
    const tbody = firstTable.querySelector('tbody');
    if (!thead || !tbody) {
        totalDisplayContainer.innerHTML = '';
        return;
    }

    totalDisplayContainer.innerHTML = ''; // Limpia los totales anteriores

    const headerCells = Array.from(thead.children);
    const rows = Array.from(tbody.children);
    const columnTotals = {};

    // Recorre cada fila para sumar los valores por columna
    rows.forEach(row => {
        Array.from(row.children).forEach((cell, colIndex) => {
            if (colIndex === 0) return; // Ignora la columna "Nombre Mesa"

            const headerCell = headerCells[colIndex];
            
            // --- Lógica de Extracción de Nombre de Columna ---
            let columnName = '';
            const select = headerCell ? headerCell.querySelector('.header-select') : null;
            const codeElement = headerCell ? headerCell.querySelector('b') : null;
            
            // 1. Obtener el nombre base del SELECT
            if (select) {
                columnName = select.value.trim();
            } else {
                columnName = headerCell.textContent.trim().split(/\s+/).filter(Boolean).join(' ');
            }
            
            if (columnName === '') return; // No considera columnas sin nombre base

            // 2. Añadir el código si existe
            if (codeElement) {
                const codeText = codeElement.textContent.trim();
                columnName += ` ${codeText}`; 
            }
            // --- Fin de Lógica de Extracción de Nombre de Columna ---

            const input = cell.querySelector('.number-input');
            if (input) {
                const value = parseFloat(input.dataset.total);
                if (!isNaN(value)) {
                    // Agrupa por el nombre de columna final (Nombre Base + Código)
                    columnTotals[columnName] = (columnTotals[columnName] || 0) + value;
                }
            }
        });
    });

    // Muestra los totales con formato de número entero
    for (const [name, total] of Object.entries(columnTotals)) {
        const totalDiv = document.createElement('div');
        const integerTotal = Math.round(total);
        
        totalDiv.textContent = `${name}: ${integerTotal}`; 
        totalDiv.style.fontWeight = 'bold';
        totalDisplayContainer.appendChild(totalDiv);
    }
};

// ------------------------------------------------------------------
// 2. Lógica de Navegación de Pestañas
// ------------------------------------------------------------------

const navigatePages = (button) => {
    pages.forEach(page => page.classList.remove('active'));
    pageButtons.forEach(btn => btn.classList.remove('active'));
    const targetPageId = button.id.replace('Btn', '');
    document.getElementById(targetPageId).classList.add('active');
    button.classList.add('active');
    
    if (targetPageId === 'page1') {
        totalDisplayContainer.style.display = 'inline-flex';
        updateTotalSums();
        
        // LLAMAR A LA LÓGICA DE FECHA AL CARGAR LA PÁGINA PRINCIPAL
        if (document.getElementById('fechaActualInput')) {
            setCurrentDate();
        }
    } else {
        totalDisplayContainer.style.display = 'none';
    }
};

pageButtons.forEach(button => {
    button.addEventListener('click', () => navigatePages(button));
});

// ------------------------------------------------------------------
// 3. Lógica para Agregar Filas y Encabezados
// ------------------------------------------------------------------

document.addEventListener('click', (event) => {
    const target = event.target;
    
    // Manejador para Agregar Encabezado (Columna)
    if (target.id.startsWith('addHeaderTabla')) {
        const tableContainer = target.closest('.table-container');
        const table = tableContainer.querySelector('table');
        const theadRow = table.querySelector('thead tr');
        const tbody = table.querySelector('tbody');

        if (theadRow) {
            const newTh = document.createElement('th');
            newTh.innerHTML = `<select class="header-select"><option value=""></option><option value="SKJ LEL">SKJ LEL</option><option value="SKJ RTP">SKJ RTP</option><option value="BET LEL">BET LEL</option></select>`;
            theadRow.appendChild(newTh);
            
            const rows = tbody.querySelectorAll('tr');
            rows.forEach((row) => {
                const newTd = document.createElement('td');
                newTd.innerHTML = getDataCellHTML(); 
                row.appendChild(newTd);
            });
        }
    }

    // Manejador para Agregar Mesa (Fila)
    if (target.id.startsWith('addMesaTabla')) {
        const tableContainer = target.closest('.table-container');
        const table = tableContainer.querySelector('table');
        const tbody = table.querySelector('tbody');
        const theadRow = table.querySelector('thead tr');
        
        if (tbody && theadRow) {
            const newRow = document.createElement('tr');
            const mesaCount = tbody.querySelectorAll('tr').length;
            const newMesaNumber = mesaCount + 1;
            
            const mesaNameCell = document.createElement('td');
            mesaNameCell.textContent = `Mesa ${newMesaNumber}`;
            newRow.appendChild(mesaNameCell);
            
            const colCount = theadRow.children.length - 1;
            for (let i = 0; i < colCount; i++) {
                const newTd = document.createElement('td');
                newTd.innerHTML = getDataCellHTML();
                newRow.appendChild(newTd);
            }
            tbody.appendChild(newRow);
        }
    }

    // Si la acción fue en la Mesa Principal de Hoja 1, actualiza los totales
    if (target.closest('#page1 .table-container:first-child')) {
        updateTotalSums();
    }
});

// ------------------------------------------------------------------
// 4. Lógica de Suma Acumulativa por Input
// ------------------------------------------------------------------

document.addEventListener('blur', (event) => {
    if (event.target.classList.contains('number-input')) {
        const input = event.target;
        const totalAsString = input.dataset.total || '0';
        const currentTotal = parseFloat(totalAsString);
        
        let inputValue = parseFloat(input.value);
        if (isNaN(inputValue)) {
             inputValue = 0;
        }
        // Redondea la entrada a un entero antes de sumarla
        const inputInteger = Math.round(inputValue); 

        if (input.value.trim() === '') {
            // Si el total acumulado es > 0, lo muestra. Si es 0, lo deja vacío ('').
            if (currentTotal > 0) {
                 input.value = currentTotal;
            } else {
                 input.value = ''; 
            }
        } else {
            // Si el usuario ingresó un valor, suma y actualiza
            const newTotal = currentTotal + inputInteger;
            input.value = newTotal;
            input.dataset.total = newTotal; 
        }
        
        if (input.closest('#page1 .table-container:first-child')) {
            updateTotalSums();
        }
    }
}, true);

document.addEventListener('focus', (event) => {
    // Borra el valor al ganar foco
    if (event.target.classList.contains('number-input')) {
        event.target.value = '';
    }
}, true);


// ------------------------------------------------------------------
// 5. Lógica de Comentarios / Códigos (Doble Clic)
// ------------------------------------------------------------------

document.addEventListener('dblclick', (event) => {
    const target = event.target;
    
    // A. DOBLE CLIC EN UN ENCABEZADO (<th>) para CÓDIGO
    const headerCell = target.closest('th');
    if (headerCell && headerCell.querySelector('.header-select')) {
        
        // 1. Extraer el nombre base de la opción seleccionada
        const select = headerCell.querySelector('.header-select');
        let baseName = select.value.trim();
        
        const code = prompt(`Ingresa el CÓDIGO (ej: M233) para la columna "${baseName}":`);
        
        if (code !== null) {
            
            // Remover el código anterior (el elemento <b>) si existe
            headerCell.querySelector('b')?.remove();

            if (code.trim() !== '') {
                // 2. Aplicar el nuevo código
                const newCode = code.trim().toUpperCase();
                
                // Agrega el nuevo código al final del TH
                headerCell.innerHTML = headerCell.innerHTML.trim() + ` <b>${newCode}</b>`;

            }
            
            // 3. Actualizar totales si es la tabla principal de Hoja 1
            if (headerCell.closest('#page1 .table-container:first-child')) {
                updateTotalSums();
            }
        }
        
    } 
    
    // B. DOBLE CLIC EN UNA CELDA DE DATOS (<td>) para COMENTARIO
    else {
        const parentTd = target.closest('td');

        if (parentTd && parentTd.querySelector('.number-input')) {
            
            const tooltip = parentTd.querySelector('.comment-tooltip');
            const currentComment = parentTd.dataset.comment || '';
            
            const comment = prompt("Ingresa un COMENTARIO para esta celda:", currentComment);

            if (comment !== null) { 
                if (comment.trim() === '') {
                    // Eliminar comentario
                    delete parentTd.dataset.comment;
                    parentTd.classList.remove('has-comment');
                    if (tooltip) tooltip.textContent = '';
                } else {
                    // Guardar comentario
                    parentTd.dataset.comment = comment;
                    parentTd.classList.add('has-comment');
                    if (tooltip) tooltip.textContent = comment;
                }
            }
        }
    }
});

// Evita la selección de texto accidental al hacer doble clic
document.addEventListener('mousedown', (event) => {
    if (event.detail > 1) {
        event.preventDefault();
    }
}, true);


// ------------------------------------------------------------------
// 6. Lógica de Fecha Actual (NUEVA)
// ------------------------------------------------------------------

const setCurrentDate = () => {
    const now = new Date();
    // Formato de fecha YYYY-MM-DD
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}`;
    
    const dateInput = document.getElementById('fechaActualInput');
    if (dateInput) {
        // Establece el valor por defecto y el valor máximo para evitar fechas futuras
        dateInput.value = formattedDate;
        dateInput.max = formattedDate; 
    }
};


// Inicialización: activa la Hoja 1 al cargar
navigatePages(document.getElementById('page1Btn'));
});