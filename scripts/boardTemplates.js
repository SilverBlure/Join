
function renderEmptyMessage(container) {
    container.innerHTML += `
        <div class="nothingToDo">
            <p class="nothingToDoText">No Tasks To-Do</p>
        </div>
    `;
}



function generateBoardCardHTML(taskId, task, listId, progressHTML, workersHTML) {
    return `
        <div id="boardCard-${taskId}" 
             draggable="true"
             ondragstart="startDragging('${taskId}', '${listId}')"
             ontouchstart="startTouchDragging(event, '${taskId}')"

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
 * Generiert die Fortschrittsanzeige basierend auf den Subtasks.
 * @param {Object} subtasks - Die Subtasks des Tasks.
 * @returns {string} - HTML für die Fortschrittsanzeige.
 */
function generateProgressHTML(subtasks = {}) {
    const subtasksArray = Object.values(subtasks);
    const totalCount = subtasksArray.length;
    const doneCount = subtasksArray.filter(st => st.done).length;
    const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

    return generateProgressBarHTML(progressPercent, doneCount, totalCount);
}

/**
 * Generiert die Fortschrittsanzeige basierend auf den direkten Werten.
 * @param {number} progressPercent - Der Fortschrittsprozentsatz.
 * @param {number} doneCount - Die Anzahl der abgeschlossenen Subtasks.
 * @param {number} totalCount - Die Gesamtanzahl der Subtasks.
 * @returns {string} - HTML für die Fortschrittsanzeige.
 */
function generateSubtasksProgressHTML(progressPercent, doneCount, totalCount) {
    return generateProgressBarHTML(progressPercent, doneCount, totalCount);
}

/**
 * Generiert das HTML für die Fortschrittsanzeige.
 * @param {number} progressPercent - Der Fortschrittsprozentsatz.
 * @param {number} doneCount - Die Anzahl der abgeschlossenen Subtasks.
 * @param {number} totalCount - Die Gesamtanzahl der Subtasks.
 * @returns {string} - HTML für die Fortschrittsanzeige.
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
 * Generiert HTML für die Arbeiter einer Aufgabe.
 * @param {Array<Object>} workers - Die Arbeiter der Aufgabe.
 * @param {boolean} showNames - Wenn true, werden die Namen angezeigt.
 * @returns {string} - Das generierte HTML.
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




function generatePopupSingleSubtaskHTML(subtask, subtaskId, taskId, listId) {
    return `
        <div id="subtask-${taskId}-${subtaskId}" class="subtask-item">
            <img 
                class="subtask-toggle-icon" 
                src="${subtask.done ? './../assets/icons/png/checkButtonChecked.png' : './../assets/icons/png/checkButtonEmpty.png'}" 
                alt="Toggle Subtask" 
                onclick="toggleSubtaskStatus('${listId}', '${taskId}', '${subtaskId}', ${!subtask.done})">
            <p class="subtaskText" style="text-decoration: ${subtask.done ? 'line-through' : 'none'};">
                ${subtask.title || 'Unnamed Subtask'}
            </p>
        </div>
    `;
}





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



function generatePopupDetailsHTML(task) {
    return `
        <h1>${task.title || 'Kein Titel'}</h1>
        <p class="popupDescription">${task.description || 'Keine Beschreibung'}</p>
        <p class="popupInformation">Due Date: <strong>${task.dueDate || 'Kein Datum'}</strong></p>
        <p class="popupInformation">Priority: <strong>${task.priority || 'Low'}
            <img src="./../assets/icons/png/PrioritySymbols${task.priority || 'Low'}.png">
        </strong></p>
    `;
}



function generateWorkerContainerHTML(initials, color, name, showName) {
    return `
        <div class="workerContainer">
            <div class="workerInformation">
                <p class="workerEmblem" style="background-color: ${color};">${initials}</p>
                            ${showName ? `<p class="workerName">${name}</p>` : ""} 
            </div>
        </div>
    `;
}




function generateSubtasksContainerHTML(subtasksHTML) {
    return `
        <div class="subtasks-container">
            <h2>Subtasks:</h2>
            ${subtasksHTML}
        </div>
    `;
}



function generatePopupActionsHTML(listId, taskId) {
    return `
        <div class="popupActions">
            <img onclick="editTask('${listId}', '${taskId}')" class="popupIcons" src="./../assets/icons/png/edit.png">
            <img onclick="deleteTask('${listId}', '${taskId}')" class="popupIcons" src="./../assets/icons/png/Delete contact.png">
        </div>
    `;
}



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
 * Generiert HTML für einen einzelnen Worker.
 * @param {Object} worker - Das Worker-Objekt mit `name` und optional `color`.
 * @returns {string} - Das generierte HTML.
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



function generateEditTaskForm(task, subtasksHTML, listId, taskId) {
    return /*html*/`
        <div class="popupHeader">
            <h1>Edit Task</h1>
        </div>
        <form id="editTaskForm" onsubmit="saveTaskChanges(event, '${listId}', '${taskId}')">
        <button type="reset" style="all: unset;">
        <img class="icon close" onclick="closeEditTaskPopup()" src="./../assets/icons/png/iconoir_cancel.png">
        </button>
        <div class="formParts">
                <div class="formPart">
                    <label for="title">Title<span class="requiredStar">*</span></label>
                    <input type="text" id="title" value="${task.title || ''}" required>
                    <label for="description">Description</label>
                    <textarea id="description" rows="5">${task.description || ''}</textarea>
                    <label for="contactSelection">Assign Contacts</label>
                            <div class="createContactBar" onclick="toggleContactsDropdown()">
                                <span id="dropdownLabel">Wähle einen Kontakt aus</span>
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
                    <select id="category" required>
                        <option value="Technical Task" ${task.category?.name === 'Technical Task' ? 'selected' : ''}>Technical Task</option>
                        <option value="User Story" ${task.category?.name === 'User Story' ? 'selected' : ''}>User Story</option>
                    </select>
                    <label for="subtask">Subtasks</label>
                    <div id="subTasksList">
                        ${subtasksHTML}
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
                    </div>
                </div>
            </div>
            <button class="saveChangesButton" type="submit"><img src="./../assets/icons/png/check.png">OK</button>
        </form>
    `;
}




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


async function findTaskSourceList(taskId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks.json`;
    const response = await fetch(url);
    if (!response.ok) {
        console.error("Fehler beim Abrufen der Task-Daten.");
        return null;
    }

    const data = await response.json();
    console.log("Firebase Task-Daten:", data); // Debugging: Zeige die gesamte Datenstruktur

    for (const listId in data) {
        const tasks = data[listId]?.task || {};
        console.log(`Überprüfe Liste: ${listId}, Tasks:`, tasks); // Debugging: Zeige die Tasks in jeder Liste

        if (tasks[taskId]) {
            console.log("Ursprungsliste gefunden:", listId);
            return listId;
        }
    }

    console.warn("Ursprungsliste nicht gefunden für Task:", taskId);
    return null;
}



function generateNoMatchingMessageHTML(message) {
    return `
        <div class="nothingToDo">
            <p class="nothingToDoText">${message}</p>
        </div>
    `;
}


/**
 * Generiert HTML für einen einzelnen Worker.
 * @param {string} workerName - Der vollständige Name des Workers (Vorname Nachname).
 * @returns {string} - Das generierte HTML.
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
 * Generiert HTML für einen editierbaren Worker.
 * @param {Object} contact - Der Kontakt-Objekt mit Name und anderen Details.
 * @returns {string} - Das generierte HTML.
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
 * Generiert HTML für einen editierbaren Worker.
 * @param {string} name - Der vollständige Name des Workers (Vorname Nachname).
 * @returns {string} - Das generierte HTML.
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
