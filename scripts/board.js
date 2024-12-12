/**
 * Zähler für das Erstellen eindeutiger Task-IDs.
 * @type {number}
 */
let taskIdCounter = 1;



/**
 * ID der aktuell fokussierten Liste.
 * @type {string|null}
 */
let currentListId = null;



/**
 * Temporäre Speicherung der Priorität für den zu bearbeitenden oder zu erstellenden Task.
 * @type {string|null}
 */
let tempPriority = null;



/**
 * Öffnet das "Task hinzufügen"-Popup für eine spezifische Liste.
 * @param {string} listId - Die ID der Liste, zu der der Task hinzugefügt werden soll.
 */
function openAddTaskPopup(listId) {
    const popup = document.getElementById('addTaskPopupOverlay');
    if (!popup) {
        console.error("Das Popup konnte nicht gefunden werden.");
        return;
    }
    currentListId = listId;
    const form = document.getElementById("addTaskFormTask");
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    newForm.addEventListener("submit", (event) => addTaskToSpecificList(listId, event));
    popup.classList.remove('hidden');
}

/**
 * Setzt die Priorität für eine Task.
 * @param {string} priority - Die Priorität, die gesetzt werden soll.
 */
function setPriority(priority) {
    tempPriority = priority;
    document.querySelectorAll(".priorityBtn").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`prio${priority}`)?.classList.add("active");
}

/**
 * Erstellt ein neues Task-Objekt aus den Formulareingaben.
 * @returns {Object} - Das erstellte Task-Objekt.
 */
function buildNewTask() {
    const task = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        dueDate: document.getElementById("date").value.trim(),
        priority: tempPriority,
        category: buildCategory(document.getElementById("category").value.trim()),
        workers: getWorkersFromSelectedContactsList(),
        subtasks: collectSubtasksFromDOM(), // Ersetzt getLocalSubtasks()
    };
    return task;
}



/**
 * Erstellt ein Kategorie-Objekt mit einem Namen und einer zugehörigen CSS-Klasse.
 * @param {string} categoryName - Der Name der Kategorie.
 * @returns {Object} - Das erstellte Kategorie-Objekt.
 */
function buildCategory(categoryName) {
    return {
        name: categoryName,
        class: `category${categoryName.replace(/\s/g, "")}`,
    };
}



/**
 * Holt die ausgewählten Kontakte aus der Liste und erstellt ein Array von Objekten.
 * @returns {Array<Object>} - Eine Liste von Objekten mit den ausgewählten Kontakten.
 */
function getWorkersFromSelectedContactsList() {
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (!selectedContactsList) {
        console.error("Die Liste der ausgewählten Kontakte wurde nicht gefunden.");
        return [];
    }

    const workers = [];
    // Iteriere über die Elemente der Liste
    Array.from(selectedContactsList.children).forEach(listItem => {
        const contactName = listItem.textContent.trim(); // Textinhalt des <li>-Elements
        if (contactName) {
            workers.push({ name: contactName });
        }
    });

    return workers;
}




/**
 * Schließt das "Task hinzufügen"-Popup und entfernt den Blur-Effekt vom Hauptinhalt.
 */
function closeAddTaskPopup() {
    const popup = document.getElementById('addTaskPopupOverlay');
    const mainContent = document.getElementById('mainContent');
    if (popup) {
        popup.classList.add('hidden');
    }
    if (mainContent) {
        mainContent.classList.remove('blur');
    }
}



/**
 * Fügt einen Task zu einer spezifischen Liste hinzu, nachdem Eingaben validiert und das Task-Objekt erstellt wurden.
 * @param {string} listId - Die ID der Liste, zu der der Task hinzugefügt werden soll.
 * @param {Event} event - Das Form-Submit-Ereignis.
 */
async function addTaskToSpecificList(listId, event) {
    event.preventDefault();
    if (!validateTaskInputs()) return;
    const newTask = buildNewTask();
    try {
        const result = await addTaskToList(listId, newTask);
        if (result) {
            location.reload();
            handleTaskSubmit(event);
            showSnackbar("Der Task wurde erfolgreich erstellt!");
            await refreshBoard();
        }
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Tasks:", error);
    }
}



/**
 * Validiert die erforderlichen Eingaben im Formular für das Hinzufügen von Tasks.
 * @returns {boolean} - Ob die Eingaben gültig sind.
 */
function validateTaskInputs() {
    const title = document.getElementById("title").value.trim();
    const dueDate = document.getElementById("date").value.trim();
    const priority = tempPriority;
    const categoryName = document.getElementById("category").value.trim();
    if (!title || !dueDate || !priority || !categoryName) {
        console.error("Pflichtfelder sind nicht vollständig ausgefüllt.");
        return false;
    }
    return true;
}





/**
 * Setzt den lokalen Zustand für Subtasks, Kontakte und Priorität zurück.
 */
function resetLocalState() {
    window.localSubtasks = {};
    window.localEditedContacts = [];
    tempPriority = null;
}



/**
 * Schließt das "Task bearbeiten"-Popup und setzt Formular und UI-Zustand zurück.
 */
function closeEditTaskPopup() {
    refreshUIAfterPopupClose();
    const overlay = document.getElementById("editTaskPopupOverlay");
    const mainContent = document.getElementById("mainContent");
    if (overlay) overlay.classList.remove('visible');
    if (mainContent) mainContent.classList.remove('blur');
    tempPriority = null;
    refreshUIAfterPopupClose();
}



/**
 * Aktualisiert das Task-Board, indem Tasks neu geladen und die UI neu gerendert wird.
 */
async function refreshBoard() {
    await getTasks();
    renderBoard();
}



/**
 * Schließt das Task-Details-Popup und aktualisiert die UI.
 */
function closeTaskPopup() {
    document.getElementById("viewTaskPopupOverlay").classList.remove('visible');
    document.getElementById("mainContent").classList.remove('blur');
    refreshUIAfterPopupClose();
    location.reload();
}




/**
 * Öffnet das "Task hinzufügen"-Popup für die "To-Do"-Liste.
 */
function addTaskToTodo() {
    openAddTaskPopup('todo');
}



/**
 * Öffnet das "Task hinzufügen"-Popup für die "In Progress"-Liste.
 */
function addTaskToInProgress() {
    openAddTaskPopup('inProgress');
}



/**
 * Öffnet das "Task hinzufügen"-Popup für die "Await Feedback"-Liste.
 */
function addTaskToAwaitFeedback() {
    openAddTaskPopup('awaitFeedback');
}



/**
 * Generiert eine RGB-Farbe basierend auf den Buchstaben des Namens.
 * @param {string} vorname - Der Vorname.
 * @param {string} nachname - Der Nachname.
 * @returns {string} - Die generierte RGB-Farbe im Format "rgb(r, g, b)".
 */
function getColorRGB(vorname, nachname) {
    const completeName = (vorname + nachname).toLowerCase();
    let hash = 0;
    for (let i = 0; i < completeName.length; i++) {
        hash += completeName.charCodeAt(i);
    }
    const r = (hash * 123) % 256;
    const g = (hash * 456) % 256;
    const b = (hash * 789) % 256;
    return `rgb(${r}, ${g}, ${b})`;
}



/**
 * Generiert die Initialen eines Namens.
 * @param {string} fullName - Der vollständige Name der Person (Vorname Nachname).
 * @returns {string} - Die generierten Initialen (z.B. "AB").
 */
function getInitials(fullName) {
    if (!fullName || typeof fullName !== "string") {
        console.warn("Ungültiger Name für Initialen:", fullName);
        return ""; // Fallback bei ungültigen Eingaben
    }

    const [vorname, nachname] = fullName.trim().split(" ");
    const initialen = `${vorname?.charAt(0)?.toUpperCase() || ""}${nachname?.charAt(0)?.toUpperCase() || ""}`;
    return initialen;
}




/**
 * Sucht nach Tasks basierend auf einem Suchbegriff.
 */
function findTask() {
    const searchTerm = getSearchTerm();
    const allTaskContainers = document.querySelectorAll('.taskContainer');
    allTaskContainers.forEach(container => processTaskContainer(container, searchTerm));
    restoreEmptyListHints(allTaskContainers, searchTerm);
}



/**
 * Stellt leere Liste-Hinweise wieder her, falls keine Tasks vorhanden sind.
 * @param {NodeList} allTaskContainers - Alle Task-Container.
 * @param {string} searchTerm - Der aktuelle Suchbegriff.
 */
function restoreEmptyListHints(allTaskContainers, searchTerm) {
    if (searchTerm !== '') return;
    allTaskContainers.forEach(container => {
        const taskCards = container.querySelectorAll('.boardCard');
        const hasTasks = Array.from(taskCards).some(card => card.style.display !== 'none');
        if (!hasTasks) {
            const nothingToDo = container.querySelector('.nothingToDo');
            if (!nothingToDo) {
                container.innerHTML += /*html*/`
                    <div class="nothingToDo">
                        <p class="nothingToDoText">No tasks to do</p>
                    </div>
                `;
            }
        }
    });
}



/**
 * Wechselt die Anzeige einer "Keine passenden Aufgaben"-Nachricht basierend auf der Suchergebnis-Logik.
 * @param {HTMLElement} container - Der Container der Task-Elemente.
 * @param {boolean} hasMatchingTask - Ob passende Tasks gefunden wurden.
 * @param {string} searchTerm - Der aktuelle Suchbegriff.
 */
function toggleNoMatchingMessage(container, hasMatchingTask, searchTerm) {
    const nothingToDo = container.querySelector('.nothingToDo');
    if (searchTerm === '' && container.querySelectorAll('.boardCard').length === 0) {
        if (!nothingToDo) {
            container.innerHTML += generateNoMatchingMessageHTML('No tasks available in this list');
        }
    } else if (searchTerm !== '' && !hasMatchingTask) {
        if (!nothingToDo) {
            container.innerHTML += generateNoMatchingMessageHTML('No matching tasks found');
        }
    } else if (nothingToDo) {
        nothingToDo.remove();
    }
}



/**
 * Holt den aktuellen Suchbegriff aus dem Suchfeld.
 * @returns {string} - Der Suchbegriff in Kleinbuchstaben.
 */
function getSearchTerm() {
    return document.getElementById('findTask').value.trim().toLowerCase();
}



/**
 * Verarbeitet einen Task-Container und filtert Tasks basierend auf einem Suchbegriff.
 * @param {HTMLElement} container - Der Container mit Tasks.
 * @param {string} searchTerm - Der Suchbegriff.
 */
function processTaskContainer(container, searchTerm) {
    const taskCards = container.querySelectorAll('.boardCard');
    let hasMatchingTask = false;
    taskCards.forEach(card => {
        const title = card.querySelector('.taskCardTitle')?.textContent.toLowerCase() || '';
        const description = card.querySelector('.taskCardDescription')?.textContent.toLowerCase() || '';
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = '';
            hasMatchingTask = true;
        } else {
            card.style.display = 'none';
        }
    });
    toggleNoMatchingMessage(container, hasMatchingTask, searchTerm);
}



/**
 * Schaltet den Status eines Subtasks um und aktualisiert die entsprechenden Daten.
 * @param {string} listId - Die ID der Liste, in der sich der Task befindet.
 * @param {string} taskId - Die ID des Tasks, der den Subtask enthält.
 * @param {string} subtaskId - Die ID des Subtasks.
 * @param {boolean} isChecked - Der neue Status des Subtasks (abgeschlossen oder nicht).
 */
async function toggleSubtaskStatus(listId, taskId, subtaskId, isChecked) {
    try {
        const task = await fetchTask(listId, taskId);
        task.subtasks[subtaskId].done = isChecked;
        const isUpdated = await updateTask(listId, taskId, task);
        if (isUpdated) {
            showSnackbar("Subtask erfolgreich aktualisiert!");
            await updateSingleTaskElement(listId, taskId, task);
            await openTaskPopup(taskId, listId);
        } else {
            showSnackbar("Fehler beim Aktualisieren des Subtasks!");
        }
    } catch (error) {
        console.error("Fehler beim Umschalten des Subtask-Status:", error);
    }
}



/**
 * Lädt die Daten eines spezifischen Tasks.
 * @param {string} listId - Die ID der Liste, in der sich der Task befindet.
 * @param {string} taskId - Die ID des Tasks.
 * @returns {Object|null} - Der Task oder null, falls ein Fehler auftritt.
 */
async function fetchTask(listId, taskId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    const response = await fetch(url);
    if (response.ok) return await response.json();
    return null;
}



/**
 * Aktualisiert die Daten eines Tasks auf dem Server.
 * @param {string} listId - Die ID der Liste, in der sich der Task befindet.
 * @param {string} taskId - Die ID des Tasks.
 * @param {Object} task - Der aktualisierte Task.
 * @returns {boolean} - Ob die Aktualisierung erfolgreich war.
 */
async function updateTask(listId, taskId, task) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
    });
    return response.ok;
}



/**
 * Aktualisiert ein spezifisches Task-Element auf dem Board mit neuen Daten.
 * @param {string} listId - Die ID der Liste, in der sich der Task befindet.
 * @param {string} taskId - Die ID des Tasks.
 * @param {Object} updatedTask - Die aktualisierten Task-Daten.
 */
async function updateSingleTaskElement(listId, taskId, updatedTask) {
    const taskElement = document.getElementById(`boardCard-${taskId}`);
    if (!taskElement) {
        return;
    }
    const progressHTML = generateProgressHTML(updatedTask.subtasks);
    const workersHTML = generateWorkersHTML(updatedTask.workers, false); // Name wird nicht angezeigt
    const newTaskHTML = generateTaskCardHTML(taskId, updatedTask, listId, progressHTML, workersHTML);
    taskElement.outerHTML = newTaskHTML;
}



/**
 * Aktualisiert die Benutzeroberfläche, nachdem ein Popup geschlossen wurde.
 */
function refreshUIAfterPopupClose() {
    refreshLists();
    const form = document.getElementById("addTaskFormTask");
    if (form) form.reset();
    renderBoard();
}



function refreshLists() {
    const subTasksList = document.getElementById("subTasksList");
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (subTasksList) {
        subTasksList.innerHTML = ""; // Sicherstellen, dass die Liste leer ist
    }
    if (selectedContactsList) {
        selectedContactsList.innerHTML = ""; // Sicherstellen, dass die Liste leer ist
    }
    const priorityButtons = document.querySelectorAll(".priorityBtn");
    priorityButtons.forEach(button => button.classList.remove("active"));
    const middleButton = document.getElementById("prioMiddle"); // Passe die ID an, falls sie anders lautet
    if (middleButton) {
        middleButton.classList.add("active");
    }
    tempPriority = "Middle";
}
