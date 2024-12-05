let taskIdCounter = 1;
let currentListId = null; 
let tempPriority = null;



function renderBoard() {
    if (!tasks || Object.keys(tasks).length === 0) {
        console.error("Keine Aufgaben gefunden!");
        return;
    }
    Object.values(tasks).forEach(list => {
        const content = document.getElementById(`${list.id}List`)?.querySelector('.taskContainer');
        if (!content) {
            console.error(`Container für Liste "${list.id}" nicht gefunden.`);
            return;
        }
        content.innerHTML = "";
        if (!list.task || Object.keys(list.task).length === 0) {
            content.innerHTML += /*html*/ `
                <div class="nothingToDo">
                    <p class="nothingToDoText">No Tasks To-Do</p>
                </div>
            `;
        } else {
            Object.entries(list.task).forEach(([taskId, task]) => {
                const subtasks = task.subtasks ? Object.values(task.subtasks) : [];
                const totalCount = subtasks.length;
                const doneCount = subtasks.filter(st => st.done).length;
                const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
                const progressHTML = totalCount > 0 ? /*html*/ `
                    <div class="subtasksContainer">
                        <div class="progress" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                        </div>
                        <p class="taskCardSubtasks">${doneCount}/${totalCount} Subtasks</p>
                    </div>
                ` : "";
                const workersHTML = task.workers
                    ? task.workers.map(worker => {
                          const initials = getInitials(worker.name); // Initialen basierend auf dem Namen generieren
                          const color = getColorHex(worker.name, ""); // Hex-Farbe basierend auf dem Namen generieren
                          return `
                              <p class="workerEmblem" style="background-color: ${color};">
                                  ${initials}
                              </p>
                          `;
                      }).join("")
                    : "";
                content.innerHTML += /*html*/ `
                    <div id="boardCard-${taskId}" 
                         draggable="true"
                         ondragstart="startDragging('${taskId}', '${list.id}')"
                         onclick="openTaskPopup('${taskId}', '${list.id}')"
                         class="boardCard">
                        <p class="${task.category?.class || 'defaultCategory'} taskCategory">${task.category?.name || "No Category"}</p>
                        <p class="taskCardTitle">${task.title}</p>
                        <p class="taskCardDescription">${task.description}</p>
                        ${progressHTML}
                        <div class="BoardCardFooter">
                            <div class="worker">${workersHTML}</div>
                            <img class="priority" src="../../assets/icons/png/PrioritySymbols${task.priority || 'Low'}.png">
                        </div>
                    </div>
                `;
            });
        }
    });
}



async function openTaskPopup(taskId, listId) {
    if (!listId || !taskId) {
        console.error("Ungültige Liste oder Task-ID:", { listId, taskId });
        return;
    }
    currentListId = listId;
    console.log("Aktualisiere currentListId:", currentListId);
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Fehler beim Abrufen des Tasks ${taskId} aus Liste ${listId}: ${response.status}`);
            return;
        }
        const task = await response.json();
        if (!task) {
            console.error(`Task ${taskId} nicht gefunden in Liste ${listId}.`);
            return;
        }
        const popupOverlay = document.getElementById("viewTaskPopupOverlay");
        const popupContainer = document.getElementById("viewTaskContainer");
        if (!popupOverlay || !popupContainer) {
            console.error("Popup-Overlay oder -Container konnte nicht gefunden werden.");
            return;
        }
        const subtasksHTML = task.subtasks && Object.keys(task.subtasks).length > 0
            ? Object.entries(task.subtasks).map(([subtaskId, subtask]) => `
                <div id="subtask-${taskId}-${subtaskId}" class="subtask-item">
                    <input 
                        class="subtasksCheckbox popupIcons" 
                        type="checkbox" 
                        ${subtask.done ? 'checked' : ''} 
                        onchange="toggleSubtaskStatus('${listId}', '${taskId}', '${subtaskId}', this.checked)">
                    <p 
                        id="subtask-p-${taskId}-${subtaskId}" 
                        class="subtaskText" 
                        style="text-decoration: ${subtask.done ? 'line-through' : 'none'};">
                        ${subtask.title || 'Unnamed Subtask'}
                    </p>
                    <div class="hoverBtnContainer">
                        <img
                            class="hoverBtn" 
                            src="../../assets/icons/png/editIcon.png" 
                            onclick="editSubtask('${taskId}', '${subtaskId}')"
                            alt="Edit Subtask">
                        <img 
                            class="hoverBtn" 
                            src="../../assets/icons/png/iconoir_cancel.png" 
                            onclick="deleteSubtask('${listId}', '${taskId}', '${subtaskId}')"
                            alt="Delete Subtask">
                    </div>
                </div>
            `).join("")
            : '<p>Keine Subtasks vorhanden.</p>';
        const workersHTML = task.workers && task.workers.length > 0
            ? task.workers.map(worker => {
                const initials = getInitials(worker.name); // Initialen basierend auf dem Namen generieren
                const color = worker.color || getColorHex(worker.name, ""); // Farbe basierend auf dem Namen generieren
                return `
                    <div class="workerInformation">
                        <p class="workerEmblem" style="background-color: ${color};">${initials}</p>
                        <p class="workerName">${worker.name}</p>
                    </div>
                `;
            }).join("")
            : '<p>Keine Arbeiter zugewiesen.</p>';
        popupOverlay.classList.add("visible");
        document.getElementById("mainContent").classList.add("blur");
        popupContainer.innerHTML = `
            <div class="popupHeader">
                <p class="${task.category?.class || 'defaultCategory'} taskCategory">
                    ${task.category?.name || 'No Category'}
                </p>
                <img class="popupIcons" onclick="closeTaskPopup()" src="../../assets/icons/png/iconoir_cancel.png">
            </div>
            <h1>${task.title || 'Kein Titel'}</h1>
            <p class="popupDescription">${task.description || 'Keine Beschreibung'}</p>
            <p class="popupInformation">Due Date: <strong>${task.dueDate || 'Kein Datum'}</strong></p>
            <p class="popupInformation">Priority: <strong>${task.priority || 'Low'}
                <img src="../../assets/icons/png/PrioritySymbols${task.priority || 'Low'}.png">
            </strong></p>
            <div class="workerContainer">
                ${workersHTML}
            </div>
            <div class="subtasks-container">
                <h2>Subtasks:</h2>
                ${subtasksHTML}
            </div>
            <div class="popupActions">
                <img onclick="editTask('${listId}', '${taskId}')" class="popupIcons" src="../../assets/icons/png/edit.png">
                <img onclick="deleteTask('${listId}', '${taskId}')" class="popupIcons" src="../../assets/icons/png/Delete contact.png">
            </div>
        `;
    } catch (error) {
        console.error("Fehler beim Öffnen des Task-Popups:", error);
    }
}





async function editTask(listId, taskId) {
    if (!listId || !taskId) {
        console.error("Ungültige Liste oder Task-ID:", { listId, taskId });
        return;
    }
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Fehler beim Abrufen des Tasks ${taskId} aus Liste ${listId}: ${response.status}`);
            return;
        }
        const task = await response.json();
        if (!task) {
            console.error(`Task ${taskId} nicht gefunden in Liste ${listId}.`);
            return;
        }
        window.localEditedContacts = task.workers || [];
        window.localEditedSubtasks = task.subtasks ? { ...task.subtasks } : {};
        const editTaskPopupOverlay = document.getElementById("editTaskPopupOverlay");
        const editTaskPopupContainer = document.getElementById("editTaskPopupContainer");
        if (!editTaskPopupOverlay || !editTaskPopupContainer) {
            console.error("Popup-Overlay oder -Container konnte nicht gefunden werden.");
            return;
        }
        editTaskPopupOverlay.setAttribute("data-task-id", taskId);
        editTaskPopupOverlay.setAttribute("data-list-id", listId);
        editTaskPopupOverlay.classList.add("visible");
        document.getElementById("mainContent").classList.add("blur");
        const renderSubtasksHTML = () => {
            return Object.entries(window.localEditedSubtasks)
                .map(([subtaskId, subtask]) => `
                    <div class="subtask-item" id="subtask-${subtaskId}">
                        <p 
                            id="subtask-p-${subtaskId}" 
                            class="subtaskText" 
                            onclick="editSubtask('${taskId}', '${subtaskId}')">
                            ${subtask.title || "Unnamed Subtask"}
                        </p>
                    <div class="hoverBtnContainer">
                        <img
                            class="hoverBtn" 
                            src="../../assets/icons/png/editIcon.png" 
                            onclick="editSubtaskInLocal('${subtaskId}')"
                            alt="Edit Subtask">
                        <img 
                            class="hoverBtn" 
                            src="../../assets/icons/png/iconoir_cancel.png" 
                            onclick="deleteSubtaskFromLocal('${subtaskId}')"
                            alt="Delete Subtask">
                    </div>
                        </div>
                `).join("");
        };
        const renderContactsDropdownHTML = () => {
            const dropdownOptions = contactsArray
                .map(contact => `<option value="${contact.name}">${contact.name}</option>`)
                .join("");
            const selectedContactsHTML = window.localEditedContacts.map(worker => {
                const initials = getInitials(worker.name);
                const color = worker.color || getColorHex(worker.name, "");
                return `
                    <div class="workerInformation">
                        <p class="workerEmblem workerIcon" style="background-color: ${color};">${initials}</p>
                        <p class="workerName">${worker.name}</p>
                        <img 
                            class="hoverBtn" 
                            src="../../assets/icons/png/iconoir_cancel.png" 
                            onclick="removeContactFromEdit('${worker.name}')"
                            alt="Remove Worker">
                    </div>
                `;
            }).join("");
            return `
                <div class="createContactBar">
                    <select id="contactSelection" onchange="handleContactSelectionForEdit()">
                        <option value="" disabled selected hidden>Select Contact</option>
                        ${dropdownOptions}
                    </select>
                    <ul id="selectedContactsList">${selectedContactsHTML || '<p>Keine zugewiesenen Arbeiter.</p>'}</ul>
                </div>
            `;
        };
        editTaskPopupContainer.innerHTML = `
            <div class="popupHeader">
                <h1>Edit Task</h1>
                <img class="icon close" onclick="closeEditTaskPopup()" src="../../assets/icons/png/iconoir_cancel.png">
            </div>
            <form id="editTaskForm" onsubmit="saveTaskChanges(event, '${listId}', '${taskId}')">
                <div class="formParts">
                    <div class="formPart">
                        <label for="title">Title<span class="requiredStar">*</span></label>
                        <input type="text" id="title" value="${task.title || ''}" required>
                        
                        <label for="description">Description</label>
                        <textarea id="description" rows="5">${task.description || ''}</textarea>
                        
                        <label for="contactSelection">Assigned to</label>
                        ${renderContactsDropdownHTML()}
                    </div>
                    <div class="separator"></div>
                    <div class="formPart">
                        <label for="dueDate">Due Date<span class="requiredStar">*</span></label>
                        <input type="date" id="dueDate" value="${task.dueDate || ''}">
                        <label for="priority">Priority</label>
                        <div class="priorityBtnContainer">
                            <button onclick="setPriority('Urgent')" id="prioUrgent" type="button"
                                class="priorityBtn ${task.priority === 'Urgent' ? 'active' : ''}">Urgent
                                <img src="../../assets/icons/png/PrioritySymbolsUrgent.png">
                            </button>
                            <button onclick="setPriority('Middle')" id="prioMiddle" type="button"
                                class="priorityBtn ${task.priority === 'Middle' ? 'active' : ''}">Medium
                                <img src="../../assets/icons/png/PrioritySymbolsMiddle.png">
                            </button>
                            <button onclick="setPriority('Low')" id="prioLow" type="button"
                                class="priorityBtn ${task.priority === 'Low' ? 'active' : ''}">Low
                                <img src="../../assets/icons/png/PrioritySymbolsLow.png">
                            </button>
                        </div>
                        <label for="category">Category<span class="requiredStar">*</span></label>
                        <select id="category" required>
                            <option value="Technical Task" ${task.category?.name === 'Technical Task' ? 'selected' : ''}>Technical Task</option>
                            <option value="User Story" ${task.category?.name === 'User Story' ? 'selected' : ''}>User Story</option>
                        </select>
                        <label for="subtask">Subtasks</label>
                        <div id="subTasksList">
                            ${renderSubtasksHTML()}
                            <div class="createSubtaskBar">
                                <input id="newSubtaskInput" class="addSubTask" placeholder="Add new subtask" type="text">
                                <div class="divider"></div>
                                <img onclick="addSubtaskToLocalList()" class="addSubtaskButton" src="../assets/icons/png/addSubtasks.png">
                            </div>
                        </div>
                    </div>
                </div>
                <button type="submit">Save Changes</button>
            </form>
        `;
    } catch (error) {
        console.error("Fehler beim Öffnen des Edit-Popups:", error);
    }
}





function addNewSubtask() {
    const subTaskInput = document.getElementById("newSubtaskInput");
    const subTasksList = document.getElementById("subTasksList");
    if (!subTaskInput || !subTasksList) {
        console.error("Subtask-Input oder Subtasks-Liste nicht gefunden.");
        return;
    }
    const subtaskTitle = subTaskInput.value.trim();
    if (!subtaskTitle) {
        console.warn("Subtask-Titel ist leer.");
        return;
    }
    const subtaskId = `subtask_${Date.now()}`;
    const subtaskItem = { title: subtaskTitle, done: false };
    if (!window.localSubtasks) {
        window.localSubtasks = {};
    }
    window.localSubtasks[subtaskId] = subtaskItem;
    const subtaskHTML = `
        <div class="subtask-item" id="subtask-${subtaskId}">
            <p class="subtaskText">${subtaskTitle}</p>
                        <img 
                            class="hoverBtn" 
                            src="../../assets/icons/png/iconoir_cancel.png" 
                            onclick="removeSubtaskFromList('${subtaskId}')"
                            alt="Delete Subtask"></img>        </div>
    `;
    subTasksList.insertAdjacentHTML("beforeend", subtaskHTML);
    subTaskInput.value = ""; // Eingabe zurücksetzen
    console.log(`Subtask "${subtaskTitle}" hinzugefügt.`);
}




function handleSubtaskKey(event) {
    if (event.key === "Enter") {
        event.preventDefault(); 
        addNewSubtask(); 
    }
}



async function deleteSubtask(listId, taskId, subtaskId) {
    // Zugriff auf lokale Daten prüfen
    if (window.localEditedSubtasks && window.localEditedSubtasks[subtaskId]) {
        console.log(`Lokaler Subtask ${subtaskId} gefunden. Wird entfernt...`);
        delete window.localEditedSubtasks[subtaskId];

        // Subtask aus DOM entfernen
        const subtaskElement = document.getElementById(`subtask-${taskId}-${subtaskId}`);
        if (subtaskElement) {
            subtaskElement.remove();
        }
        console.log(`Subtask ${subtaskId} aus lokalen Daten und DOM entfernt.`);
        return;
    }

    try {
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;

        // Task-Daten abrufen
        const response = await fetch(taskUrl);
        if (!response.ok) {
            console.error(`Fehler beim Abrufen der Task-Daten: ${response.status}`);
            return;
        }

        const task = await response.json();
        if (!task || !task.subtasks || !task.subtasks[subtaskId]) {
            console.warn(`Subtask ${subtaskId} nicht in Backend-Daten gefunden.`);
            return;
        }

        // Subtask entfernen
        delete task.subtasks[subtaskId];

        // Aktualisierte Daten speichern
        const updateResponse = await fetch(taskUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });

        if (!updateResponse.ok) {
            console.error(`Fehler beim Aktualisieren des Tasks: ${updateResponse.status}`);
            return;
        }

        // Subtask aus DOM entfernen
        const subtaskElement = document.getElementById(`subtask-${taskId}-${subtaskId}`);
        if (subtaskElement) {
            subtaskElement.remove();
        }
        console.log(`Subtask ${subtaskId} erfolgreich entfernt.`);
        await getTasks(); // Tasks erneut abrufen
        renderBoard();    
    } catch (error) {
        console.error("Fehler beim Löschen des Subtasks:", error);
    }
}



async function editSubtask(taskId, subtaskId) {
    console.log(`editSubtask aufgerufen mit: taskId=${taskId}, subtaskId=${subtaskId}`);
    
    const subtaskElement = document.getElementById(`subtask-${taskId}-${subtaskId}`);
    if (!subtaskElement) {
        console.error(`Subtask-Element mit ID "subtask-${taskId}-${subtaskId}" nicht gefunden.`);
        return;
    }

    const subtaskTextElement = subtaskElement.querySelector(".subtaskText");
    if (!subtaskTextElement) {
        console.error("Subtask-Text-Element nicht gefunden.");
        return;
    }

    // Aktuellen Titel auslesen
    const currentTitle = subtaskTextElement.textContent.trim();

    // Ersetzen des Subtask-Textes durch ein Eingabefeld und Button
    subtaskTextElement.outerHTML = `
        <input 
            type="text" 
            class="editSubtaskInput" 
            id="edit-input-${subtaskId}" 
            value="${currentTitle}">
        <button 
            onclick="saveSubtaskEdit('${taskId}', '${subtaskId}', document.getElementById('edit-input-${subtaskId}').value)">
            Save
        </button>
    `;
}



async function saveSubtaskEdit(taskId, subtaskId, newTitle) {
    console.log(`saveSubtaskEdit aufgerufen mit: taskId=${taskId}, subtaskId=${subtaskId}, newTitle=${newTitle}`);

    if (!newTitle || !newTitle.trim()) {
        console.warn("Subtask-Titel ist leer. Änderungen werden verworfen.");
        return;
    }

    if (!currentListId) {
        console.error("currentListId ist null. Die Liste konnte nicht identifiziert werden.");
        return;
    }

    const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${currentListId}/task/${taskId}.json`;
    console.log("Abgerufene URL:", taskUrl);

    try {
        // Task aus Firebase abrufen
        const response = await fetch(taskUrl);
        if (!response.ok) {
            console.error(`Fehler beim Abrufen des Tasks: ${response.status}`);
            return;
        }

        const task = await response.json();
        if (!task) {
            console.error(`Keine Daten für Task "${taskId}" gefunden.`);
            return;
        }

        if (!task.subtasks || !task.subtasks[subtaskId]) {
            console.error(`Subtask mit ID "${subtaskId}" nicht in Firebase gefunden.`);
            console.log("Vorhandene Subtasks:", task.subtasks);
            return;
        }

        // Subtask-Titel aktualisieren und auf "done: false" setzen
        task.subtasks[subtaskId].title = newTitle.trim();
        task.subtasks[subtaskId].done = false;

        // Aktualisierte Daten in Firebase speichern
        const updateResponse = await fetch(taskUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });

        if (!updateResponse.ok) {
            console.error(`Fehler beim Speichern des aktualisierten Tasks: ${updateResponse.status}`);
            return;
        }

        console.log(`Subtask ${subtaskId} erfolgreich in Firebase aktualisiert.`);

        // Ansicht aktualisieren
        await openTaskPopup(taskId, currentListId);
    } catch (error) {
        console.error("Fehler beim Speichern des Subtasks:", error);
    }
}










function saveLocalSubtaskEdit(subtaskId, newTitle) {
    console.log(`saveLocalSubtaskEdit aufgerufen für Subtask-ID: ${subtaskId}, Neuer Titel: "${newTitle}"`);

    if (!newTitle.trim()) {
        console.warn("Subtask-Titel ist leer. Änderungen werden verworfen.");
        return;
    }

    if (!window.localEditedSubtasks || !window.localEditedSubtasks[subtaskId]) {
        console.error(`Subtask mit ID "${subtaskId}" nicht in lokalen Daten gefunden.`);
        return;
    }

    // Subtask-Titel aktualisieren
    window.localEditedSubtasks[subtaskId].title = newTitle.trim();
    console.log(`Subtask "${subtaskId}" erfolgreich aktualisiert.`);

    // DOM aktualisieren
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (subtaskElement) {
        const newTextHTML = `
            <p 
                id="subtask-p-${subtaskId}" 
                class="subtaskText" 
                onclick="editSubtask('${subtaskId}')">
                ${newTitle.trim()}
            </p>
        `;
        const textContainer = subtaskElement.querySelector(".editSubtaskInput");
        if (textContainer) {
            textContainer.outerHTML = newTextHTML;
        }
    }
}



function editSubtaskInLocal(subtaskId) {
    console.log(`editSubtask aufgerufen für Subtask-ID: ${subtaskId}`);

    // Subtask im lokalen Speicher finden
    if (!window.localEditedSubtasks || !window.localEditedSubtasks[subtaskId]) {
        console.error(`Subtask mit ID "${subtaskId}" nicht in lokalen Daten gefunden.`);
        return;
    }

    const subtask = window.localEditedSubtasks[subtaskId];
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (!subtaskElement) {
        console.error(`Subtask-Element mit ID "subtask-${subtaskId}" nicht gefunden.`);
        return;
    }

    // Subtask-Titel bearbeiten
    const subtaskTextElement = subtaskElement.querySelector(".subtaskText");
    if (!subtaskTextElement) {
        console.error("Subtask-Text-Element nicht gefunden.");
        return;
    }

    const currentTitle = subtask.title || "Unnamed Subtask";
    subtaskTextElement.outerHTML = `
        <input 
            type="text" 
            class="editSubtaskInput" 
            value="${currentTitle}" 
            onblur="saveLocalSubtaskEdit('${subtaskId}', this.value)">
    `;
}



function addSubtaskToLocalList() {
    const subTaskInput = document.getElementById("newSubtaskInput");
    const subTasksList = document.getElementById("subTasksList");

    if (!subTaskInput || !subTasksList) {
        console.error("Subtask-Input oder Subtasks-Liste nicht gefunden.");
        return;
    }

    const subtaskTitle = subTaskInput.value.trim();
    if (!subtaskTitle) {
        console.warn("Subtask-Titel ist leer.");
        return;
    }

    // Erstelle eine eindeutige Subtask-ID
    const subtaskId = `subtask_${Date.now()}`;
    const subtaskItem = { title: subtaskTitle, done: false };

    // Füge den neuen Subtask zur lokalen Liste hinzu
    if (!window.localEditedSubtasks) {
        window.localEditedSubtasks = {};
    }
    window.localEditedSubtasks[subtaskId] = subtaskItem;

    // Füge den neuen Subtask zur DOM hinzu
    const subtaskHTML = `
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
                    src="../../assets/icons/png/iconoir_cancel.png" 
                    onclick="deleteSubtaskFromLocal('${subtaskId}')"
                    alt="Delete Subtask">
            </div>
        </div>
    `;
    subTasksList.insertAdjacentHTML("beforeend", subtaskHTML);

    subTaskInput.value = ""; // Setze das Eingabefeld zurück
    console.log(`Subtask "${subtaskTitle}" hinzugefügt. Aktuelle lokale Subtasks:`, window.localEditedSubtasks);
}


function deleteSubtaskFromLocal(subtaskId) {
    if (!subtaskId) {
        console.error("Keine gültige Subtask-ID angegeben.");
        return;
    }

    // Entferne den Subtask aus der lokalen Liste
    if (window.localEditedSubtasks && window.localEditedSubtasks[subtaskId]) {
        delete window.localEditedSubtasks[subtaskId];
        console.log(`Subtask mit ID "${subtaskId}" wurde aus der lokalen Liste entfernt.`);
    } else {
        console.warn(`Subtask mit ID "${subtaskId}" ist nicht in der lokalen Liste vorhanden.`);
    }

    // Entferne den Subtask aus der DOM
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (subtaskElement) {
        subtaskElement.remove();
        console.log(`Subtask-Element mit ID "subtask-${subtaskId}" wurde aus der DOM entfernt.`);
    } else {
        console.warn(`Subtask-Element mit ID "subtask-${subtaskId}" wurde in der DOM nicht gefunden.`);
    }
}

async function saveTaskChanges(event, listId, taskId) {
    event.preventDefault(); // Standardformularverhalten verhindern

    // Eingabewerte validieren
    if (!listId || !taskId) {
        alert("Ungültige Liste oder Task-ID. Änderungen können nicht gespeichert werden.");
        console.error("Ungültige Liste oder Task-ID:", { listId, taskId });
        return;
    }

    // Subtasks aus der DOM synchronisieren
    if (!window.localEditedSubtasks) {
        window.localEditedSubtasks = {};
    }

    // Alle Subtasks auf done: false setzen
    Object.keys(window.localEditedSubtasks).forEach(subtaskId => {
        window.localEditedSubtasks[subtaskId].done = false;
    });

    // Kontakte auslesen
    const workers = (window.localEditedContacts || []).map(contact => ({
        name: contact.name,
    }));

    // Aktualisierte Task-Daten erstellen
    const updatedTask = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim() || "No description provided",
        dueDate: document.getElementById("dueDate").value || null,
        priority: tempPriority || "Low",
        category: {
            name: document.getElementById("category").value.trim() || "Uncategorized",
            class: `category${(document.getElementById("category").value || "Uncategorized").replace(/\s/g, "")}`,
        },
        workers,
        subtasks: { ...window.localEditedSubtasks }, // Lokale Subtask-Liste nutzen
    };

    console.log("Aktualisierte Task-Daten mit allen Subtasks auf done: false:", updatedTask);

    // Firebase-URL
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    console.log("URL für Firebase PUT:", url);

    try {
        // PUT-Anfrage an Firebase
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedTask),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Fehler beim Speichern der Änderungen: ${response.status}`, errorText);
            alert(`Fehler beim Speichern der Änderungen: ${errorText}`);
            return;
        }

        const responseData = await response.json();
        console.log(`Task "${taskId}" erfolgreich aktualisiert. Antwort:`, responseData);

        // Daten und UI aktualisieren
        await getTasks(); // Tasks neu laden
        renderBoard(); // Board neu rendern
        closeEditTaskPopup(); // Popup schließen
        openTaskPopup(taskId, listId); // Aktualisierte Task anzeigen
    } catch (error) {
        console.error("Unerwarteter Fehler:", error);
        alert("Unerwarteter Fehler: " + error.message);
    }
}




























function closeEditTaskPopup() {
    const overlay = document.getElementById("editTaskPopupOverlay");
    const mainContent = document.getElementById("mainContent");
    if (overlay) overlay.classList.remove("visible");
    if (mainContent) mainContent.classList.remove("blur");
    tempPriority = null;
}



function openAddTaskPopup(listId) {
    const popup = document.getElementById('addTaskPopupOverlay');
    if (!popup) {
        console.error("Popup konnte nicht gefunden werden.");
        return;
    }
    currentListId = listId; 
    console.log(`Liste "${listId}" wurde geöffnet.`);
    const form = document.getElementById("addTaskFormTask");
    const newForm = form.cloneNode(true); 
    form.parentNode.replaceChild(newForm, form); 
    newForm.addEventListener("submit", (event) => addTaskToSpecificList(listId, event));
    popup.classList.remove('hidden'); 
}



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



async function addTaskToList(listId, title, description, dueDate, priority, workers, category, subtasks) {
    try {
        const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task.json`;

        // Validierung der Subtasks: Muss ein Objekt sein
        if (!subtasks || typeof subtasks !== "object") {
            console.error("Subtasks müssen ein gültiges Objekt sein:", subtasks);
            return null;
        }

        // Struktur der Aufgabe definieren
        const newTask = {
            title,
            description,
            dueDate,
            priority,
            workers: workers.map(worker => ({ name: worker })), // Kontakte als Objekte
            category: { name: category, class: `category${category.replace(" ", "")}` },
            subtasks, // Subtasks hinzufügen
        };

        console.log("Task-Daten, die gespeichert werden:", newTask);

        // API-Call zur Speicherung in Firebase
        const postResponse = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTask),
        });

        if (!postResponse.ok) {
            const errorText = await postResponse.text();
            console.error(`Fehler beim Hinzufügen des Tasks: ${postResponse.status}`, errorText);
            return null;
        }

        const responseData = await postResponse.json();
        console.log(`Task erfolgreich zu Liste '${listId}' hinzugefügt:`, responseData);
        return responseData;
    } catch (error) {
        console.error(`Fehler beim Hinzufügen des Tasks zu Liste '${listId}':`, error);
        return null;
    }
}



async function addTaskToSpecificList(listId, event) {
    event.preventDefault();

    // Formularfelder auslesen
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const dueDate = document.getElementById("date").value.trim();
    const priority = tempPriority;
    const category = document.getElementById("category").value.trim();

    // Pflichtfelder überprüfen
    if (!priority || !listId || !title || !dueDate || !category) {
        console.warn("Fehlende Pflichtfelder oder keine Liste angegeben.");
        return;
    }

    // Lokale Subtasks abrufen
    const subtasks = { ...window.localSubtasks };
    const workersArray = window.localEditedContacts || [];

    console.log("Subtasks, die gespeichert werden sollen:", subtasks);
    console.log("Arbeiter, die gespeichert werden sollen:", workersArray);

    try {
        // Aufgabe speichern
        const result = await addTaskToList(listId, title, description, dueDate, priority, workersArray, category, subtasks);
        if (result) {
            console.log(`Task erfolgreich in Liste "${listId}" hinzugefügt.`);
            window.localSubtasks = {}; // Lokale Subtasks zurücksetzen
            window.localEditedContacts = []; // Lokale Kontakte zurücksetzen
            document.getElementById("addTaskFormTask").reset(); // Formular zurücksetzen
            tempPriority = null; // Priorität zurücksetzen
            resetForm();
            closeAddTaskPopup(); // Popup schließen
            await getTasks();
            renderBoard(); // Board neu rendern
        } else {
            console.error(`Task konnte nicht in Liste "${listId}" gespeichert werden.`);
        }
    } catch (error) {
        console.error(`Fehler beim Speichern des Tasks in Liste "${listId}":`, error);
    }
}



function resetForm() {
    const form = document.getElementById("addTaskFormTask");
    if (form) {
        form.reset(); 
    }
    window.localSubtasks = {}; 
    const subTasksList = document.getElementById("subTasksList");
    if (subTasksList) {
        subTasksList.innerHTML = ""; 
    }
    window.localEditedContacts = [];
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (selectedContactsList) {
        selectedContactsList.innerHTML = ""; 
    }
    const priorityButtons = document.querySelectorAll(".priorityBtn.active");
    priorityButtons.forEach(button => button.classList.remove("active"));
    tempPriority = null; 
}



function closeTaskPopup() {
    document.getElementById("viewTaskPopupOverlay").classList.remove("visible");
    document.getElementById("mainContent").classList.remove("blur");
}



function addTaskToTodo() {
    openAddTaskPopup('todo');
}



function addTaskToInProgress() {
    openAddTaskPopup('inProgress');
}



function addTaskToAwaitFeedback() {
    openAddTaskPopup('awaitFeedback');
}

function deleteWorkerFromTask(){
    let worker = document.getElementsByClassName(`worker-kevin fischer workerEmblem} workerEmblem`).innerHTML;
     console.log(worker);
     
 }