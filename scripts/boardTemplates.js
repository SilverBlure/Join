/**
 * Zeigt eine Nachricht an, wenn keine Aufgaben in der Liste vorhanden sind.
 * @param {HTMLElement} container - Der Container, in dem die Nachricht angezeigt wird.
 */
function renderEmptyMessage(container) {
    container.innerHTML += `
        <div class="nothingToDo">
            <p class="nothingToDoText">No Tasks To-Do</p>
        </div>
    `;
}

/**
 * Generiert das HTML einer Aufgabenkarte für das Board.
 * @param {string} taskId - Die ID der Aufgabe.
 * @param {Object} task - Die Aufgabendaten.
 * @param {string} listId - Die ID der Liste, zu der die Aufgabe gehört.
 * @param {string} progressHTML - Das HTML des Fortschrittsbalkens.
 * @param {string} workersHTML - Das HTML der zugewiesenen Kontakte.
 * @returns {string} - Das generierte HTML für die Aufgabenkarte.
 */
function generateBoardCardHTML(taskId, task, listId, progressHTML, workersHTML) {
    return `
        <div id="boardCard-${taskId}" 
             draggable="true"
             ondragstart="startDragging('${taskId}', '${listId}')"
             ontouchstart="startTouchDragging(event, '${taskId}')"
             ontouchend="handleTouchEnd('${taskId}', '${listId}')"
             onclick="openTaskPopup('${taskId}', '${listId}')"
             class="boardCard">
            <p class="${task.category?.class || 'defaultCategory'} taskCategory">${task.category?.name || "No Category"}</p>
            <p class="taskCardTitle">${task.title}</p>
            <p class="taskCardDescription">${task.description}</p>
            ${progressHTML}
            <div class="BoardCardFooter">
                <div class="worker">${workersHTML}</div>
                <img class="priority" src="./../assets/icons/png/PrioritySymbols${task.priority || 'Low'}.png">
            </div>
        </div>
    `;
}

/**
 * Berechnet den Fortschritt von Subtasks und generiert das Fortschritts-HTML.
 * @param {Object} [subtasks={}] - Die Subtasks der Aufgabe.
 * @returns {string} - Das generierte HTML des Fortschrittsbalkens.
 */
function generateProgressHTML(subtasks = {}) {
    const subtasksArray = Object.values(subtasks);
    const totalCount = subtasksArray.length;
    const doneCount = subtasksArray.filter(st => st.done).length;
    const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

    return generateProgressBarHTML(progressPercent, doneCount, totalCount);
}

/**
 * Generiert das Fortschritts-HTML für Subtasks.
 * @param {number} progressPercent - Der Prozentsatz des Fortschritts.
 * @param {number} doneCount - Anzahl der erledigten Subtasks.
 * @param {number} totalCount - Gesamtanzahl der Subtasks.
 * @returns {string} - Das HTML für den Fortschrittsbalken.
 */
function generateSubtasksProgressHTML(progressPercent, doneCount, totalCount) {
    return generateProgressBarHTML(progressPercent, doneCount, totalCount);
}

/**
 * Generiert das HTML für einen Fortschrittsbalken.
 * @param {number} progressPercent - Fortschrittsprozentsatz.
 * @param {number} doneCount - Anzahl der erledigten Subtasks.
 * @param {number} totalCount - Gesamtanzahl der Subtasks.
 * @returns {string} - HTML für den Fortschrittsbalken.
 */
function generateProgressBarHTML(progressPercent, doneCount, totalCount) {
    const progressClass = progressPercent === 100 ? "complete" : "";

    return `
        <div class="subtasksContainer">
            <div class="progress" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                <div class="${progressClass} progress-bar" style="width: ${progressPercent}%;"></div>
            </div>
            <p class="taskCardSubtasks">${doneCount}/${totalCount} Subtasks</p>
        </div>
    `;
}

/**
 * Generiert das HTML für die Anzeige der zugewiesenen Kontakte.
 * @param {Array} [workers=[]] - Die Liste der zugewiesenen Kontakte.
 * @param {boolean} showNames - Ob die Namen der Kontakte angezeigt werden sollen.
 * @returns {string} - Das generierte HTML für die Kontakte.
 */
function generateWorkersHTML(workers = [], showNames = false) {
    workers = Array.isArray(workers) ? workers : [];
    if (workers.length === 0) {
        return '<p>No selected Contacts.</p>';
    }
    return workers
        .filter(worker => worker && worker.name)
        .map(worker => {
            const [vorname, nachname] = worker.name.split(" ");
            const color = worker.color || getColorHex(vorname?.toLowerCase() || "", nachname?.toLowerCase() || "");
            const initials = getInitials(worker.name);
            return generateWorkerContainerHTML(initials, color, worker.name, showNames);
        })
        .join("");
}

/**
 * Generiert das HTML für eine einzelne Subtask im Popup.
 * @param {Object} subtask - Die Subtask-Daten.
 * @param {string} subtaskId - Die ID der Subtask.
 * @param {string} taskId - Die ID der Aufgabe.
 * @param {string} listId - Die ID der Liste.
 * @returns {string} - Das HTML für die Subtask.
 */
function generatePopupSingleSubtaskHTML(subtask, subtaskId, taskId, listId) {
    return `
        <div id="subtask-${taskId}-${subtaskId}" class="subtask-item">
            <img 
                class="subtask-toggle-icon ${subtask.done ? 'done' : 'todo'}" 
                alt="Toggle Subtask" 
                onclick="toggleSubtaskStatus('${listId}', '${taskId}', '${subtaskId}', ${!subtask.done})">
            <p class="subtaskText" style="text-decoration: ${subtask.done ? 'line-through' : 'none'};">
                ${subtask.title || 'Unnamed Subtask'}
            </p>
        </div>
    `;
}

/**
 * Generiert das HTML für eine bearbeitbare Subtask.
 * @param {string} subtaskId - Die ID der Subtask.
 * @param {Object} subtask - Die Subtask-Daten.
 * @returns {string} - Das HTML für die bearbeitbare Subtask.
 */
function generateEditSingleSubtaskHTML(subtaskId, subtask) {
    return `
        <div class="subtask-item" id="subtask-${subtaskId}">
            <p 
                id="subtask-p-${subtaskId}" 
                class="subtaskText">
                ${subtask.title}
            </p>
        <li class="subtask-item" id="subtask-${subtaskId}">
            <div class="subtaskButtons">
                <img 
                    src="./../assets/icons/png/editIcon.png" 
                    class="subtask-btn" 
                    onclick="editSubtask('${subtaskId}')"> 
                <div class="separatorSubtask"></div>
                <img 
                    src="./../assets/icons/png/D.png" 
                    class="subtask-btn" 
                    onclick="deleteSubtaskFromLocal('${subtaskId}')"> 
            </div>
        </li>
        </div>
    `;
}

/**
 * Generiert das Header-HTML für das Popup.
 * @param {Object} task - Die Aufgabendaten.
 * @returns {string} - Das HTML des Popups-Headers.
 */
function generatePopupHeaderHTML(task) {
    return `
        <div class="popupHeader">
            <p class="${task.category?.class || 'defaultCategory'} taskCategory">
                ${task.category?.name || 'No Category'}
            </p>
            <img class="popupIcons" onclick="closeTaskPopup()" src="./../assets/icons/png/iconoir_cancel.png">
        </div>
    `;
}

/**
 * Generiert das Detail-HTML für das Popup.
 * @param {Object} task - Die Aufgabendaten.
 * @returns {string} - Das HTML der Popups-Details.
 */
function generatePopupDetailsHTML(task) {
    return `
        <div class="popupTitle">
        <h1 class="popupTitle">${task.title}</h1>
        </div>
        <p class="popupDescription">${task.description || 'Keine Beschreibung'}</p>
        <p class="popupInformation">Due Date: <strong>${task.dueDate || 'Kein Datum'}</strong></p>
        <p class="popupInformation">Priority: <strong>${task.priority || 'Low'}
            <img src="./../assets/icons/png/PrioritySymbols${task.priority || 'Low'}.png">
        </strong></p>
    `;
}

/**
 * Generiert das HTML für die Anzeige eines einzelnen Kontakts im Bearbeitungsmodus.
 * @param {string} initials - Die Initialen des Kontakts.
 * @param {string} color - Die Hintergrundfarbe des Kontakts.
 * @param {string} name - Der Name des Kontakts.
 * @param {boolean} showName - Ob der Name angezeigt wird.
 * @returns {string} - Das generierte HTML für den Kontakt.
 */
function generateWorkerContainerHTML(initials, color, name, showName) {
    return `
            <div class="workerInformation">
                <p class="workerEmblem" style="background-color: ${color};">${initials}</p>
                            ${showName ? `<p class="workerName">${name}</p>` : ""} 
            </div>
    `;
}

/**
 * Generiert das HTML für den Subtask-Container im Popup.
 * @param {string} subtasksHTML - Das HTML der Subtasks.
 * @returns {string} - Das HTML für den Subtask-Container.
 */
function generateSubtasksContainerHTML(subtasksHTML) {
    return `
            <h2>Subtasks:</h2>
            ${subtasksHTML}    `;
}

/**
 * Generiert die Aktionsbuttons im Popup.
 * @param {string} listId - Die ID der Liste.
 * @param {string} taskId - Die ID der Aufgabe.
 * @returns {string} - Das HTML der Aktionsbuttons.
 */
function generatePopupActionsHTML(listId, taskId) {
    return `
        <div class="popupActions">
            <img onclick="editTask('${listId}', '${taskId}')" class="popupIcons" src="./../assets/icons/png/edit.png">
            <img onclick="deleteTask('${listId}', '${taskId}')" class="popupIcons" src="./../assets/icons/png/Delete contact.png">
        </div>
    `;
}

/**
 * Generiert die HTML-Buttons für Prioritäten.
 * @param {string} selectedPriority - Die aktuell ausgewählte Priorität.
 * @returns {string} - Das HTML der Prioritätsbuttons.
 */
function generatePriorityButtonsHTML(selectedPriority) {
    const priorities = [
        { name: "Urgent", src: "./../assets/icons/png/PrioritySymbolsUrgent.png" },
        { name: "Middle", src: "./../assets/icons/png/PrioritySymbolsMiddle.png" },
        { name: "Low", src: "./../assets/icons/png/PrioritySymbolsLow.png" },
    ];
    return priorities
        .map(priority => `
            <button 
                type="button" 
                class="priorityBtn ${priority.name === selectedPriority ? 'active' : ''}" 
                id="prio${priority.name}"
                onclick="setPriority('${priority.name}')">
                <img src="${priority.src}" alt="${priority.name} Priority Icon">
                ${priority.name}
            </button>
        `)
        .join("");
}

/**
 * Generiert die HTML-Leiste zur Kontakt-Auswahl.
 * @param {string} dropdownOptions - Die Dropdown-Optionen für Kontakte.
 * @param {string} selectedContactsHTML - Das HTML der ausgewählten Kontakte.
 * @returns {string} - Das HTML für die Kontaktleiste.
 */
function generateCreateContactBarHTML(dropdownOptions, selectedContactsHTML) {
    return `
        <div class="createContactBar">
            <select id="contactSelection" onchange="handleContactSelectionForEdit()">
                <option value="" disabled selected hidden>Select Contact</option>
                ${dropdownOptions}
            </select>
            <ul id="selectedContactsList">${selectedContactsHTML}</ul>
        </div>
    `;
}

/**
 * Generiert das HTML eines einzelnen Kontakts.
 * @param {Object} worker - Die Kontaktdaten.
 * @returns {string} - Das generierte HTML für den Kontakt.
 */
function generateSingleWorkerHTML(worker) {
    const [vorname, nachname] = worker.name.split(" "); // Vor- und Nachname extrahieren
    const color = worker.color || getColorHex(vorname?.toLowerCase() || "", nachname?.toLowerCase() || ""); // Farbe basierend auf Vor- und Nachnamen
    const initials = getInitials(worker.name); // Initialen generieren

    return `
        <div class="workerInformation">
            <p class="workerEmblem workerIcon" style="background-color: ${color};">
                ${initials}
            </p>
            <p class="workerName">${worker.name}</p>
            <img 
                class="hoverBtn" 
                src="./../assets/icons/png/iconoir_cancel.png" 
                onclick="removeContactFromEdit('${worker.name}')"
                alt="Remove Worker">
        </div>
    `;
}

/**
 * Generiert das Formular-HTML für das Bearbeiten einer Aufgabe.
 * @param {Object} task - Die Aufgabendaten.
 * @param {string} subtasksHTML - Das HTML der Subtasks.
 * @param {string} listId - Die ID der Liste.
 * @param {string} taskId - Die ID der Aufgabe.
 * @returns {string} - Das generierte Formular-HTML.
 */
function generateEditTaskForm(task, subtasksHTML, listId, taskId) {
    return /*html*/`
        <div class="popupHeader">
            <h1>Edit Task</h1>
        </div>
        <form id="editTaskForm" class="editTask" onsubmit="saveTaskChanges(event, '${listId}', '${taskId}')">
        <button type="reset" style="all: unset;">
        <img class="icon close" onclick="closeEditTaskPopup()" src="./../assets/icons/png/iconoir_cancel.png">
        </button>
        <div class="formParts">
                <div class="formPart">
                    <label for="title">Title<span class="requiredStar">*</span></label>
                    <input maxlength="30" type="text" id="title" value="${task.title || ''}" required>
                    <label for="description">Description</label>
                    <textarea id="description" rows="5">${task.description || ''}</textarea>
                    <label for="contactSelection">Assign Contacts</label>
                            <div class="createContactBar" onclick="toggleContactsDropdown()">
                                <span id="dropdownLabel">Select Contacts</span>
                            </div>
                            <div class="customDropdown">
                                <ul class="dropdownList" id="contactsDropdownList"></ul>
                            </div>                            
                            <ul id="selectedContactsList"></ul>
                            </div>
                <div class="separator"></div>
                <div class="formPart">
                    <label for="dueDate">Due Date<span class="requiredStar">*</span></label>
                    <input type="date" id="dueDate" value="${task.dueDate || ''}">
                    <label for="priority">Priority</label>
                    <div class="priorityBtnContainer">
                        ${generatePriorityButtonsHTML(task.priority)}
                    </div>
                    <label for="category">Category<span class="requiredStar">*</span></label>
                    <select id="category" class="category" required>
                        <option value="Technical Task" ${task.category?.name === 'Technical Task' ? 'selected' : ''}>Technical Task</option>
                        <option value="User Story" ${task.category?.name === 'User Story' ? 'selected' : ''}>User Story</option>
                    </select>
                    <label for="subtask">Subtasks</label>
                    <div class="createSubtaskBar">
                        <input id="subTaskInputAddTask" 
                            name="subTaskInput" 
                            class="addSubTaskInput" 
                            placeholder="Add new subtask" 
                            type="text" 
                            oninput="toggleSubtaskButtons()"
                            onkeydown="handleSubtaskKey(event)">
                            <div class="subtaskButtons">
                                <img src="./../assets/icons/png/Subtasks icons11.png" id="saveSubtaskBtn" class="subtask-btn hidden" onclick="addNewSubtask()">
                                <div id="separatorSubtask" class="separatorSubtask hidden"></div>
                                <img src="./../assets/icons/png/iconoir_cancel.png" id="clearSubtaskBtn" class="subtask-btn hidden" onclick="clearSubtaskInput()">
                            </div>
                            <img id="subtaskImg" src="./../assets/icons/png/addSubtasks.png">
                        </div>
                    <div id="subTasksList">
                        ${subtasksHTML}
                    </div>
                </div>
            </div>
            <button class="saveChangesButton" type="submit"><img src="./../assets/icons/png/check.png">OK</button>
        </form>
    `;
}

/**
 * Generiert das HTML für eine neue Subtask.
 * @param {string} subtaskId - Die ID der Subtask.
 * @param {string} subtaskTitle - Der Titel der Subtask.
 * @returns {string} - Das HTML für die neue Subtask.
 */
function generateNewSubtaskHTML(subtaskId, subtaskTitle) {
    return `
        <li class="subtask-item" id="subtask-${subtaskId}">
            <p class="subtaskText">${subtaskTitle}</p>
            <div class="subtaskButtons">
                <img 
                    src="./../assets/icons/png/editIcon.png" 
                    class="subtask-btn" 
                    onclick="editSubtask('${subtaskId}')"> 
                <div class="separatorSubtask"></div>
                <img 
                    src="./../assets/icons/png/D.png" 
                    class="subtask-btn" 
                    onclick="deleteSubtaskFromLocal('${subtaskId}')"> 
            </div>
        </li>
    `;
}

/**
 * Generiert das HTML für eine bearbeitbare Subtask.
 * @param {string} subtaskId - Die ID der Subtask.
 * @param {string} currentTitle - Der aktuelle Titel der Subtask.
 * @returns {string} - Das HTML für die bearbeitbare Subtask.
 */
function generateEditSubtaskHTML(subtaskId, currentTitle) {
    return `
    <div class="editSubtaskBar">
        <input 
            type="text" 
            onkeydown="handleSubtaskEditKey(event)"
            onblur="handleSubtaskBlur(event)" 
            class="editSubtaskInput" 
            id="edit-input-${subtaskId}" 
            value="${currentTitle}">
            <div class="subtaskButtons">
        <img src="./../assets/icons/png/D.png"
            class="subtask-btn" 
            onclick="deleteSubtaskFromLocal('${subtaskId}')"> 
            <div id="separatorSubtask" class="separatorSubtask"></div>
        <img src="./../assets/icons/png/Subtasks icons11.png"
            class="subtask-btn"
            onclick="saveEditedSubtask('${subtaskId}')">
    </div>
    </div>
            `;
}

/**
 * Generiert das HTML eines Subtask-Elements.
 * @param {string} subtaskId - Die ID der Subtask.
 * @param {string} subtaskTitle - Der Titel der Subtask.
 * @returns {string} - Das HTML des Subtask-Elements.
 */
function generateSubtaskItemHTML(subtaskId, subtaskTitle) {
    return `
        <div class="subtask-item" id="subtask-${subtaskId}">
            <p 
                id="subtask-p-${subtaskId}" 
                class="subtaskText" 
                onclick="editSubtask('${subtaskId}')">
                ${subtaskTitle}
            </p>
            <div class="hoverBtnContainer">
                <img 
                    class="hoverBtn" 
                    src="./../assets/icons/png/iconoir_cancel.png" 
                    onclick="deleteSubtaskFromLocal('${subtaskId}')"
                    alt="Delete Subtask">
            </div>
        </div>
    `;
}

/**
 * Generiert das HTML einer Task-Karte.
 * @param {string} taskId - Die ID der Aufgabe.
 * @param {Object} task - Die Aufgabendaten.
 * @param {string} listId - Die ID der Liste.
 * @param {string} progressHTML - Das HTML des Fortschrittsbalkens.
 * @param {string} workersHTML - Das HTML der zugewiesenen Kontakte.
 * @returns {string} - Das HTML der Task-Karte.
 */
function generateTaskCardHTML(taskId, task, listId, progressHTML, workersHTML) {
    return /*html*/ `
        <div id="boardCard-${taskId}" 
             draggable="true"
             ondragstart="startDragging('${taskId}', '${listId}')"
             ontouchstart="startTouchDragging(event, '${taskId}')"
             class="boardCard">
            <p class="${task.category?.class || 'defaultCategory'} taskCategory">
                ${task.category?.name || "No Category"}
            </p>
            <p class="taskCardTitle">${task.title}</p>
            <p class="taskCardDescription">${task.description}</p>
            ${progressHTML}
            <div class="BoardCardFooter">
                <div class="worker">${workersHTML}</div>
                <img class="priority" src="./../assets/icons/png/PrioritySymbols${task.priority || 'Low'}.png">
            </div>
        </div>
    `;
}

/**
 * Findet die Ursprungs-Liste einer Aufgabe.
 * @param {string} taskId - Die ID der zu suchenden Aufgabe.
 * @returns {Promise<string|null>} - Die ID der Ursprungs-Liste oder `null`, wenn nicht gefunden.
 */
async function findTaskSourceList(taskId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks.json`;
    const response = await fetch(url);
    if (!response.ok) {
        return null;
    }
    const data = await response.json();
    for (const listId in data) {
        const tasks = data[listId]?.task || {};
        if (tasks[taskId]) {
            return listId;
        }
    }
    return null;
}

/**
 * Generiert eine Nachricht für den Fall, dass keine passenden Ergebnisse gefunden wurden.
 * @param {string} message - Die anzuzeigende Nachricht.
 * @returns {string} - Das generierte HTML für die Nachricht.
 */
function generateNoMatchingMessageHTML(message) {
    return `
        <div class="nothingToDo">
            <p class="nothingToDoText">${message}</p>
        </div>
    `;
}

/**
 * Generiert das HTML eines Kontakts.
 * @param {string} workerName - Der Name des Kontakts.
 * @returns {string} - Das generierte HTML für den Kontakt.
 */
function generateWorkerHTML(workerName) {
    const initials = getInitials(workerName); // Initialen generieren
    const [vorname, nachname] = workerName.split(" "); // Vor- und Nachnamen extrahieren
    const color = getColorHex(vorname?.toLowerCase() || "", nachname?.toLowerCase() || ""); // Farbe basierend auf Vor- und Nachnamen

    return `
        <div class="workerInformation">
            <p class="workerEmblem workerIcon" style="background-color: ${color};">
                ${initials}
            </p>
            <p class="workerName">${workerName}</p>
            <img 
                class="hoverBtn" 
                src="./../assets/icons/png/iconoir_cancel.png" 
                onclick="removeContact('${workerName}')"
                alt="Remove Worker">
        </div>
    `;
}

/**
 * Generiert das HTML eines bearbeitbaren Kontakts.
 * @param {Object} contact - Die Kontaktdaten.
 * @returns {string} - Das generierte HTML für den Kontakt.
 */
function generateEditableWorkerHTML(contact) {
    const initials = getInitials(contact.name); // Initialen generieren
    const [vorname, nachname] = contact.name.split(" "); // Vor- und Nachnamen extrahieren
    const color = getColorHex(vorname?.toLowerCase() || "", nachname?.toLowerCase() || ""); // Farbe basierend auf Vor- und Nachnamen

    return `
        <div class="workerInformation">
            <p class="workerEmblem workerIcon" style="background-color: ${color};">
                ${initials}
            </p>
            <p class="workerName">${contact.name}</p>
            <img 
                class="hoverBtn" 
                src="./../assets/icons/png/iconoir_cancel.png" 
                onclick="removeContactFromEdit('${contact.name}')"
                alt="Remove Worker">
        </div>
    `;
}

/**
 * Generiert das HTML eines bearbeitbaren Kontakts für die Bearbeitung.
 * @param {string} name - Der Name des Kontakts.
 * @returns {string} - Das generierte HTML für den Kontakt.
 */
function generateWorkerHTMLForEdit(name) {
    const initials = getInitials(name); // Initialen generieren
    const [vorname, nachname] = name.split(" "); // Vor- und Nachnamen extrahieren
    const color = getColorHex(vorname?.toLowerCase() || "", nachname?.toLowerCase() || ""); // Farbe basierend auf Vor- und Nachnamen

    return `
        <div class="workerInformation">
            <p class="workerEmblem workerIcon" style="background-color: ${color};">${initials}</p>
            <p class="workerName">${name}</p>
            <img 
                class="hoverBtn" 
                src="./../assets/icons/png/iconoir_cancel.png" 
                onclick="removeContactFromEdit('${name}')"
                alt="Remove Worker">
        </div>
    `;
}