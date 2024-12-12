/**
 * Rendert das gesamte Board basierend auf den verfügbaren Aufgaben.
 */
function renderBoard() {
    if (!tasks || Object.keys(tasks).length === 0) return; // Wenn keine Tasks verfügbar sind, abbrechen
    Object.values(tasks).forEach(list => renderTaskList(list)); // Jede Liste rendern
}



/**
 * Rendert eine spezifische Aufgabenliste.
 * @param {Object} list - Die zu rendernde Liste.
 */
function renderTaskList(list) {
    const content = document.getElementById(`${list.id}List`)?.querySelector('.taskContainer');
    if (!content) return; // Wenn der Container nicht existiert, abbrechen
    content.innerHTML = ""; // Container leeren
    if (!list.task || Object.keys(list.task).length === 0) {
        renderEmptyMessage(content); // Wenn keine Aufgaben vorhanden sind, leere Nachricht anzeigen
    } else {
        Object.entries(list.task).forEach(([taskId, task]) => renderTask(content, taskId, task, list.id)); // Jede Aufgabe rendern
    }
}



/**
 * Rendert eine einzelne Aufgabe innerhalb eines Containers.
 * @param {HTMLElement} container - Der Container, in dem die Aufgabe gerendert wird.
 * @param {string} taskId - Die ID der Aufgabe.
 * @param {Object} task - Die zu rendernde Aufgabe.
 * @param {string} listId - Die ID der zugehörigen Liste.
 */
function renderTask(container, taskId, task, listId) {
    const progressHTML = renderSubtaskProgress(task.subtasks || {}); // Fortschrittsanzeige generieren
    const workersHTML = renderTaskWorkers(task.workers); // Arbeiter-Informationen generieren
    const taskHTML = generateBoardCardHTML(taskId, task, listId, progressHTML, workersHTML); // HTML für die Aufgabe generieren
    container.innerHTML += taskHTML; // HTML in den Container einfügen
}



/**
 * Generiert HTML für die Arbeiter einer Aufgabe.
 * @param {Array<Object>} workers - Die Arbeiter der Aufgabe.
 * @returns {string} - Das generierte HTML.
 */
function renderTaskWorkers(workers) {
    if (!workers || workers.length === 0) return ""; // Wenn keine Arbeiter vorhanden sind, nichts zurückgeben
    return workers
        .filter(worker => worker && worker.name) // Ungültige Einträge filtern
        .map(worker => `
            <p class="workerEmblem" style="background-color: ${getColorRGB(worker.name, "")};">
                ${getInitials(worker.name)}
            </p>
        `).join(""); // HTML für jeden Arbeiter generieren
}



/**
 * Öffnet ein Popup für eine spezifische Aufgabe.
 * @param {string} taskId - Die ID der Aufgabe.
 * @param {string} listId - Die ID der zugehörigen Liste.
 */
async function openTaskPopup(taskId, listId) {
    if (!listId || !taskId) return; // Wenn IDs fehlen, abbrechen
    const task = await fetchTaskData(taskId, listId); // Aufgabendaten abrufen
    if (!task) return;
    console.log("Task Data in Popup:", task); // Überprüfen der Task-Daten
    const popupOverlay = document.getElementById("viewTaskPopupOverlay");
    const popupContainer = document.getElementById("viewTaskContainer");
    if (!popupOverlay || !popupContainer) return; // Wenn Popup-Elemente fehlen, abbrechen
    const subtasksHTML = generateSubtasksHTML(task, taskId, listId); // Subtasks generieren
    const workersHTML = generateWorkersHTML(task.workers || []); // Arbeiter generieren
    showTaskPopup(popupOverlay, popupContainer, task, subtasksHTML, workersHTML, listId, taskId); // Popup anzeigen
}



/**
 * Ruft Aufgabendaten aus Firebase ab.
 * @param {string} taskId - Die ID der Aufgabe.
 * @param {string} listId - Die ID der zugehörigen Liste.
 * @returns {Promise<Object|null>} - Die Aufgabendaten oder null, wenn ein Fehler auftritt.
 */
async function fetchTaskData(taskId, listId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) return null; // Wenn die Anfrage fehlschlägt, null zurückgeben
        const task = await response.json();
        if (task.subtasks) {
            task.subtasks = JSON.parse(JSON.stringify(task.subtasks)); // Subtasks kopieren
        }
        return task;
    } catch (error) {
        return null; // Bei Fehler null zurückgeben
    }
}



/**
 * Zeigt ein Popup mit den Details einer Aufgabe an.
 * @param {HTMLElement} popupOverlay - Das Popup-Overlay.
 * @param {HTMLElement} popupContainer - Der Popup-Container.
 * @param {Object} task - Die Aufgabendaten.
 * @param {string} subtasksHTML - Das HTML für die Subtasks.
 * @param {string} workersHTML - Das HTML für die Arbeiter.
 * @param {string} listId - Die ID der Liste.
 * @param {string} taskId - Die ID der Aufgabe.
 */
function showTaskPopup(popupOverlay, popupContainer, task, subtasksHTML, workersHTML, listId, taskId) {
    popupOverlay.classList.add("visible");
    document.getElementById("mainContent").classList.add("blur");
    const headerHTML = generatePopupHeaderHTML(task);
    const detailsHTML = generatePopupDetailsHTML(task);
    
    // Hier wird der false-Wert explizit übergeben
    const workerContainerHTML = generateWorkersHTML(task.workers || [], true); 

    const subtasksContainerHTML = generateSubtasksContainerHTML(subtasksHTML);
    const actionsHTML = generatePopupActionsHTML(listId, taskId);

    popupContainer.innerHTML = `
        ${headerHTML}
        ${detailsHTML}
        ${workerContainerHTML}
        ${subtasksContainerHTML}
        ${actionsHTML}
    `;
}




/**
 * Öffnet ein Bearbeitungspopup für eine Aufgabe.
 * @param {string} listId - Die ID der Liste.
 * @param {string} taskId - Die ID der Aufgabe.
 */
async function editTask(listId, taskId) {
    if (!listId || !taskId) return; // Wenn IDs fehlen, abbrechen
    try {
        const task = await fetchTaskForEditing(listId, taskId); // Aufgabendaten abrufen
        if (!task) return;
        initializeLocalTaskState(task); // Lokalen Zustand initialisieren
        renderEditTaskPopup(listId, taskId, task); // Bearbeitungspopup rendern
    } catch (error) {
        console.error("Fehler beim Bearbeiten des Tasks:", error);
    }
}



/**
 * Rendert das Bearbeitungspopup für eine Aufgabe.
 * @param {string} listId - Die ID der Liste.
 * @param {string} taskId - Die ID der Aufgabe.
 * @param {Object} task - Die Aufgabendaten.
 */
function renderEditTaskPopup(listId, taskId, task) {
    const editTaskPopupOverlay = document.getElementById("editTaskPopupOverlay");
    const editTaskPopupContainer = document.getElementById("editTaskPopupContainer");
    if (!editTaskPopupOverlay || !editTaskPopupContainer) return;
    initializeLocalContacts(task);

    editTaskPopupOverlay.setAttribute("data-task-id", taskId);
    editTaskPopupOverlay.setAttribute("data-list-id", listId);
    editTaskPopupOverlay.classList.add("visible");
    document.getElementById("mainContent").classList.add("blur");

    // Subtasks und ausgewählte Kontakte vorbereiten
    const subtasksHTML = generateEditSubtasksHTML(window.localEditedSubtasks);

    // Lokale Kontakte initialisieren, basierend auf den Arbeitern der Aufgabe
    window.localContacts = {};
    (task.workers || []).forEach(worker => {
        // Die ID des Kontakts wird aus den Arbeiterdaten übernommen
        window.localContacts[worker.id] = { ...worker }; 
    });

    // HTML generieren
    editTaskPopupContainer.innerHTML = generateEditTaskForm(task, subtasksHTML, listId, taskId);
    renderContactsDropdown(); // Kontakte-Dropdown aktualisieren
}





/**
 * Ruft eine Aufgabe aus Firebase für die Bearbeitung ab.
 * @param {string} listId - Die ID der Liste.
 * @param {string} taskId - Die ID der Aufgabe.
 * @returns {Promise<Object|null>} - Die Aufgabendaten oder null bei Fehler.
 */
async function fetchTaskForEditing(listId, taskId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) return null; // Bei fehlgeschlagener Anfrage null zurückgeben
        return await response.json();
    } catch (error) {
        return null; // Bei Fehler null zurückgeben
    }
}