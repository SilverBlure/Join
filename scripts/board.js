let taskIdCounter = 1;
let currentListId = null; 
let tempPriority = null;



function addSubtaskToList() {
    const subTaskInput = document.getElementById("newSubtaskInput");
    const subTasksList = document.getElementById("subTasksList");
    if (!subTaskInput || !subTasksList) {
        console.error("Subtask-Input oder -Liste nicht gefunden.");
        return;
    }
    const subtaskTitle = subTaskInput.value.trim();
    if (!subtaskTitle) {
        console.error("Subtask-Titel darf nicht leer sein.");
        return;
    }
    const subtaskId = `subtask_${Date.now()}`; 
    const subtaskItem = {
        id: subtaskId,
        title: subtaskTitle,
        done: false,
    };
    const subtaskElement = document.createElement("li");
    subtaskElement.id = subtaskId;
    subtaskElement.innerHTML = `
        <input type="checkbox" onchange="toggleLocalSubtaskStatus('${subtaskId}', this.checked)">
        <span>${subtaskTitle}</span>
        <button onclick="removeSubtaskFromList('${subtaskId}')">Löschen</button>
    `;
    subTasksList.appendChild(subtaskElement);
    subTaskInput.value = "";
    if (!window.localSubtasks) {
        window.localSubtasks = {};
    }
    window.localSubtasks[subtaskId] = subtaskItem;
    console.log(`Subtask "${subtaskTitle}" hinzugefügt.`);
}



function removeSubtaskFromList(subtaskId) {
    if (!subtaskId) {
        console.error("Keine Subtask-ID übergeben.");
        return;
    }

    // Subtask-Element im DOM suchen
    const subtaskElement = document.getElementById(subtaskId);

    if (subtaskElement) {
        // Subtask-Element entfernen, wenn es existiert
        subtaskElement.remove();
        console.log(`Subtask-Element mit ID "${subtaskId}" aus der Liste entfernt.`);
    } else {
        console.warn(`Subtask-Element mit ID "${subtaskId}" nicht im DOM gefunden. Dies könnte bereits entfernt worden sein.`);
    }

    // Subtask aus der lokalen Liste entfernen, falls vorhanden
    if (window.localSubtasks && window.localSubtasks[subtaskId]) {
        delete window.localSubtasks[subtaskId];
        console.log(`Subtask mit ID "${subtaskId}" aus localSubtasks entfernt.`);
    } else {
        console.warn(`Subtask mit ID "${subtaskId}" nicht in localSubtasks gefunden.`);
    }

    // Liste im UI synchronisieren, nur wenn notwendig
    syncLocalSubtasksInDOM(subtaskId);
}





function syncLocalSubtasksInDOM(subtaskId) {
    const subTasksList = document.getElementById("subTasksList");
    if (!subTasksList) {
        console.error("subTasksList-Element nicht gefunden.");
        return;
    }

    if (!window.localSubtasks || Object.keys(window.localSubtasks).length === 0) {
        // Keine Subtasks mehr vorhanden, UI anpassen
        subTasksList.innerHTML = `<p class="noSubtasksMessage">Keine Subtasks vorhanden.</p>`;
        console.log("Alle Subtasks wurden entfernt.");
        return;
    }

    // Prüfe, ob das gelöschte Subtask-Element entfernt wurde
    const subtaskElement = document.getElementById(subtaskId);
    if (subtaskElement) {
        subtaskElement.remove(); // Nur das spezifische Element entfernen
        console.log(`Subtask-Element mit ID "${subtaskId}" wurde aus dem DOM entfernt.`);
    } else {
        console.warn(`Subtask-Element mit ID "${subtaskId}" war bereits nicht im DOM.`);
    }
}






function getLocalSubtasks() {
    if (!window.localSubtasks) {
        console.warn("Keine Subtasks in der lokalen Liste gefunden.");
        return {};
    }
    return { ...window.localSubtasks }; 
}



function renderContactsDropdown(){
    let dropDown = document.getElementById('contactSelection')
    if (dropDown.options.length > 0) return; 
     dropDown.innerHTML="";
     for (let i = 0; i < contactsArray.length; i++) {
       document.getElementById('contactSelection').innerHTML += /*html*/`
               <option value="${contactsArray[i].name}">${contactsArray[i].name}</option>;
       `
     }
 }



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
                 ? task.workers.map(worker => `
                     <p class="workerEmblem" style="background-color: ${worker.color};">
                         ${worker.initials}
                     </p>
                 `).join("")
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
        console.error(`Ungültige Liste oder Task-ID:`, { listId, taskId });
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
        const popupOverlay = document.getElementById("viewTaskPopupOverlay");
        const popupContainer = document.getElementById("viewTaskContainer");
        if (!popupOverlay || !popupContainer) {
            console.error("Popup-Overlay oder -Container konnte nicht gefunden werden.");
            return;
        }
        popupOverlay.classList.add("visible");
        document.getElementById("mainContent").classList.add("blur");
        const workersHTML = task.workers
        ? task.workers.map(workerName => {
              const initials = getInitials(workerName); // Initialen berechnen
              const color = getColorHex(workerName, ""); // Farbe generieren
              return `
                <div class="workerInformation">
                    <p class="workerEmblem workerIcon" style="background-color: ${color};">
                        ${initials}
                    </p>
                    <p class="workerName">${workerName}</p>
                </div>
              `;
          }).join("")
            : '<p>Keine zugewiesenen Arbeiter.</p>';
        const subtasksHTML = task.subtasks
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
                        style="text-decoration: ${subtask.done ? 'line-through' : 'none'};"
                        onclick="editSubtask('${listId}', '${taskId}', '${subtaskId}')">
                        ${subtask.title || 'Unnamed Subtask'}
                    </p>
                    <div class="hoverBtnContainer">
                        <img
                            class="hoverBtn" 
                            src="../../assets/icons/png/editIcon.png" 
                            onclick="editSubtask('${listId}', '${taskId}', '${subtaskId}')"
                            alt="Edit Subtask">
                        <img 
                            class="hoverBtn" 
                            src="../../assets/icons/png/iconoir_cancel.png" 
                            onclick="deleteSubtask('${listId}', '${taskId}', '${subtaskId}')"
                            alt="Delete Subtask">
                    </div>
                </div>
            `).join('')
            : '<p>Keine Subtasks vorhanden.</p>';
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
            <p>Assigned to:</p>
            <div class="workerContainer">${workersHTML}</div>
            <div class="subtasks-container">${subtasksHTML}</div>
            <div class="popupActions">
                <img onclick="editTask('${listId}', '${taskId}')" class="popupIcons" src="../../assets/icons/png/edit.png">
                <img onclick="deleteTask('${listId}', '${taskId}')" class="popupIcons" src="../../assets/icons/png/Delete contact.png">
            </div>
        `;
    } catch (error) {
        console.error("Fehler beim Öffnen des Task-Popups:", error);
    }
}

async function editSubtaskList(listId, taskId, subtaskId) {
    try {
        // Lösche den Subtask und warte, bis der Vorgang abgeschlossen ist
        await deleteSubtask(listId, taskId, subtaskId);

        // Rufe editTask nur auf, wenn der Subtask erfolgreich gelöscht wurde
        await editTask(listId, taskId);

        console.log(`Subtask ${subtaskId} erfolgreich gelöscht und Popup aktualisiert.`);
    } catch (error) {
        console.error("Fehler beim Bearbeiten der Subtask-Liste:", error);
    }
}


async function deleteSubtask(listId, taskId, subtaskId) {
    if (!listId || !taskId || !subtaskId) {
        console.error("Ungültige Parameter für deleteSubtask:", { listId, taskId, subtaskId });
        return;
    }

    try {
        // Task-Daten laden
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
        const response = await fetch(taskUrl);
        if (!response.ok) {
            console.error(`Fehler beim Laden des Tasks: ${response.status}`);
            return;
        }

        const task = await response.json();
        if (!task || !task.subtasks || !task.subtasks[subtaskId]) {
            console.warn(`Subtask ${subtaskId} nicht gefunden.`);
            return;
        }

        // Subtask löschen
        delete task.subtasks[subtaskId];

        // Task mit aktualisierten Subtasks speichern
        const updateResponse = await fetch(taskUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });

        if (!updateResponse.ok) {
            console.error(`Fehler beim Speichern des Tasks: ${updateResponse.status}`);
            return;
        }

        console.log(`Subtask ${subtaskId} erfolgreich gelöscht.`);

        // UI aktualisieren
        const currentPopup = document.querySelector(".popupOverlay.visible");

        if (currentPopup?.id === "viewTaskPopupOverlay") {
            // Aktualisiere das View-Popup
            await openTaskPopup(taskId, listId);
        } else if (currentPopup?.id === "editTaskPopupOverlay") {
            // Aktualisiere das Edit-Popup
            await editTask(listId, taskId);
        } else {
            // Aktualisiere das Board
            await renderBoard();
        }
    } catch (error) {
        console.error("Fehler beim Löschen des Subtasks:", error);
    }
}






async function deleteTask(listId, taskId) {
    if (!listId || !taskId) {
        console.error("Ungültige Parameter für das Löschen:", { listId, taskId });
        return;
    }
    try {
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
        const response = await fetch(taskUrl, {
            method: "DELETE",
        });
        if (!response.ok) {
            console.error(`Fehler beim Löschen des Tasks ${taskId} aus Liste ${listId}: ${response.status}`);
            return;
        }
        console.log(`Task ${taskId} erfolgreich aus Liste ${listId} gelöscht.`);
        await getTasks(); 
        renderBoard(); 
        closeTaskPopup(); 
    } catch (error) {
        console.error("Fehler beim Löschen des Tasks:", error);
    }
}



async function editSubtask(listId, taskId, subtaskId) {
    if (!listId || !taskId || !subtaskId) {
        console.error("Ungültige Parameter übergeben:", { listId, taskId, subtaskId });
        return;
    }
    const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    try {
        const response = await fetch(taskUrl);
        if (!response.ok) {
            console.error(`Fehler beim Abrufen des Tasks ${taskId} aus Liste ${listId}: ${response.status}`);
            return;
        }
        const task = await response.json();
        if (!task || !task.subtasks || !task.subtasks[subtaskId]) {
            console.error(`Subtask mit ID '${subtaskId}' nicht gefunden.`);
            return;
        }
        const subtask = task.subtasks[subtaskId];
        const subtaskElement = document.getElementById(`subtask-p-${taskId}-${subtaskId}`);
        if (!subtaskElement) {
            console.error("Subtask-Element konnte nicht gefunden werden.");
            return;
        }
        const inputHTML = `
            <input
                type="text"
                class="editSubtaskInput"
                value="${subtask.title || ''}"
                placeholder="Edit subtask title"
                onblur="saveSubtaskEdit('${listId}', '${taskId}', '${subtaskId}', this.value)"
            >
            <button
                class="saveSubtaskBtn"
                onclick="saveSubtaskEdit('${listId}', '${taskId}', '${subtaskId}', this.previousSibling.value)"
            >
                Save
            </button>
        `;
        subtaskElement.outerHTML = inputHTML;
    } catch (error) {
        console.error("Fehler beim Bearbeiten des Subtasks:", error);
    }
}



async function saveSubtaskEdit(listId, taskId, subtaskId, newTitle) {
    if (!listId || !taskId || !subtaskId || !newTitle.trim()) {
        console.error("Ungültige Parameter oder leerer Titel:", { listId, taskId, subtaskId, newTitle });
        return;
    }
    const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    try {
        const response = await fetch(taskUrl);
        if (!response.ok) {
            console.error(`Fehler beim Abrufen des Tasks ${taskId} aus Liste ${listId}: ${response.status}`);
            return;
        }
        const task = await response.json();
        if (!task || !task.subtasks || !task.subtasks[subtaskId]) {
            console.error(`Subtask mit ID '${subtaskId}' nicht gefunden.`);
            return;
        }
        task.subtasks[subtaskId].title = newTitle.trim();
        task.subtasks[subtaskId].done = false; 
        const updateResponse = await fetch(taskUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });
        if (!updateResponse.ok) {
            console.error(`Fehler beim Speichern des bearbeiteten Subtasks: ${updateResponse.statusText}`);
            return;
        }
        console.log(`Subtask ${subtaskId} erfolgreich bearbeitet und auf done: false gesetzt.`);
        await renderBoard();
        await openTaskPopup(taskId, listId); 
    } catch (error) {
        console.error("Fehler beim Bearbeiten des Subtasks:", error);
    }
}



function findTask() {
    const searchTerm = document.getElementById('findTask').value.trim().toLowerCase();
    const allTaskContainers = document.querySelectorAll('.taskContainer');
    allTaskContainers.forEach(container => {
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
        if (!hasMatchingTask) {
            const nothingToDo = container.querySelector('.nothingToDo');
            if (!nothingToDo) {
                container.innerHTML += /*html*/`
                    <div class="nothingToDo">
                        <p class="nothingToDoText">No matching tasks found</p>
                    </div>
                `;
            }
        } else {
            const nothingToDo = container.querySelector('.nothingToDo');
            if (nothingToDo) {
                nothingToDo.remove();
            }
        }
        if (searchTerm === '') {
            taskCards.forEach(card => {
                card.style.display = ''; 
            });
            container.querySelector('.nothingToDo')?.remove(); 
        }
    });
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

        const editTaskPopupOverlay = document.getElementById("editTaskPopupOverlay");
        const editTaskPopupContainer = document.getElementById("editTaskPopupContainer");
        if (!editTaskPopupOverlay || !editTaskPopupContainer) {
            console.error("Popup-Overlay oder -Container konnte nicht gefunden werden.");
            return;
        }

        // Kontakte lokal speichern
        window.localEditedContacts = [...(task.workers || [])];
        console.log("Lokal gespeicherte Kontakte:", window.localEditedContacts);

        window.localEditedSubtasks = task.subtasks ? { ...task.subtasks } : {};
        editTaskPopupOverlay.setAttribute("data-task-id", taskId);
        editTaskPopupOverlay.setAttribute("data-list-id", listId);
        editTaskPopupOverlay.classList.add("visible");
        document.getElementById("mainContent").classList.add("blur");

        // Render Kontakte mit Select-Dropdown
        const renderContactsDropdownInEdit = () => {
            const contactDropdownHTML = `
                <select id="contactSelection" 
                        onchange="handleContactSelectionForEdit()" 
                        onclick="renderContactsDropdownForEdit()">
                </select>
            `;
            const selectedContactsHTML = window.localEditedContacts.map(workerName => {
                const initials = getInitials(workerName);
                const color = getColorHex(workerName, "");
                return `
                    <div class="workerInformation">
                        <p class="workerEmblem workerIcon" style="background-color: ${color};">
                            ${initials}
                        </p>
                        <p class="workerName">${workerName}</p>
                        <img 
                            class="hoverBtn" 
                            src="../../assets/icons/png/iconoir_cancel.png" 
                            onclick="removeContactFromEdit('${workerName}')"
                            alt="Remove Worker">
                    </div>
                `;
            }).join("");
            

            return `
                <div class="createContactBar">
                    ${contactDropdownHTML}
                    <ul id="selectedContactsList">${selectedContactsHTML || '<p>Keine zugewiesenen Arbeiter.</p>'}</ul>
                </div>
            `;
        };

        // Render Subtasks
        const subtasksHTML = task.subtasks
            ? Object.entries(task.subtasks).map(([subtaskId, subtask]) => `
                <div class="subtask-item" id="subtask-${taskId}-${subtaskId}">
                    <input 
                        class="subtasksCheckbox" 
                        type="checkbox" 
                        ${subtask.done ? 'checked' : ''} 
                        onchange="toggleSubtaskStatus('${listId}', '${taskId}', '${subtaskId}', this.checked)">
                    <p 
                        id="subtask-p-${taskId}-${subtaskId}" 
                        class="subtaskText"
                        onclick="editExistingSubtask('${taskId}', '${subtaskId}')">
                        ${subtask.title || "Unnamed Subtask"}
                    </p>
                        <img 
                            class="hoverBtn" 
                            src="../../assets/icons/png/iconoir_cancel.png" 
                            onclick="editSubtaskList('${listId}', '${taskId}', '${subtaskId}')"
                            alt="Delete Subtask">
                </div>
            `).join("")
            : '<p>Keine Subtasks vorhanden.</p>';

        const addSubtaskHTML = `
            <div class="createSubtaskBar">
                <input id="newSubtaskInput" class="addSubTask" placeholder="Add new subtask" type="text">
                <div class="divider"></div>
                <img 
                    onclick="addNewSubtask('${listId}', '${taskId}')" 
                    class="addSubtaskButton" 
                    src="../assets/icons/png/addSubtasks.png">
            </div>
        `;

        // Popup HTML mit dynamischen Inhalten
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
                        ${renderContactsDropdownInEdit()}
                    </div>
                    <div class="separator"></div>
                    <div class="formPart">
                        <label for="dueDate">Due Date<span class="requiredStar">*</span></label>
                        <input type="date" id="dueDate" value="${task.dueDate || ''}">
                        <label for="priority">Prio</label>
                        <div class="priorityBtnContainer">
                            <button onclick="setPriority('Urgent')" id="prioUrgent" type="button"
                                class="priorityBtn">Urgent
                                <img src="../../assets/icons/png/PrioritySymbolsUrgent.png">
                            </button>
                            <button onclick="setPriority('Middle')" id="prioMiddle" type="button"
                                class="priorityBtn">Medium
                                <img src="../../assets/icons/png/PrioritySymbolsMiddle.png">
                            </button>
                            <button onclick="setPriority('Low')" id="prioLow" type="button" class="priorityBtn">Low
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
                            ${subtasksHTML}
                            ${addSubtaskHTML}
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



function handleContactSelection() {
    if (!window.localEditedContacts) {
        window.localEditedContacts = []; // Initialisieren, falls nicht vorhanden
    }

    const contactSelection = document.getElementById("contactSelection");
    const selectedContactsList = document.getElementById("selectedContactsList");
    const selectedContactName = contactSelection.value;

    if (!selectedContactName) return;

    // Überprüfen, ob der Kontakt bereits existiert
    if (window.localEditedContacts.includes(selectedContactName)) {
        console.warn("Kontakt ist bereits ausgewählt.");
        return;
    }

    // Kontakt hinzufügen
    window.localEditedContacts.push(selectedContactName);

    // Rendern der Kontakte
    renderSelectedContacts();
}


function renderSelectedContacts() {
    const selectedContactsList = document.getElementById("selectedContactsList");
    selectedContactsList.innerHTML = window.localEditedContacts
        .map(workerName => {
            const initials = getInitials(workerName);
            const color = getColorHex(workerName, "");
            return `
                <div class="workerInformation">
                    <p class="workerEmblem workerIcon" style="background-color: ${color};">
                        ${initials}
                    </p>
                    <p class="workerName">${workerName}</p>
                    <img 
                        class="hoverBtn" 
                        src="../../assets/icons/png/iconoir_cancel.png" 
                        onclick="removeContact('${workerName}')"
                        alt="Remove Worker">
                </div>
            `;
        })
        .join("");
}

function removeContact(workerName) {
    window.localEditedContacts = window.localEditedContacts.filter(contact => contact !== workerName);
    renderSelectedContacts();
}





function renderContactsDropdownForEdit() {
    const dropdown = document.getElementById("contactSelection");
    if (dropdown.options.length > 0) return; 
    dropdown.innerHTML = ""; // Sicherstellen, dass keine Duplikate auftreten
    for (let contact of contactsArray) {
        dropdown.innerHTML += `
            <option value="${contact.name}">${contact.name}</option>
        `;
    }
}




function renderContactsDropdown(){
    let dropDown = document.getElementById('contactSelection')
    if (dropDown.options.length > 0) return; 
     dropDown.innerHTML="";
     for (let i = 0; i < contactsArray.length; i++) {
       document.getElementById('contactSelection').innerHTML += /*html*/`
               <option value="${contactsArray[i].name}">${contactsArray[i].name}</option>;
       `
     }
 }




function handleContactSelectionForEdit() {
    const dropdown = document.getElementById("contactSelection");
    const selectedContactName = dropdown.value;
    if (!selectedContactName) return; 

    if (window.localEditedContacts.includes(selectedContactName)) {
        console.warn("Kontakt ist bereits ausgewählt.");
        return;
    }

    window.localEditedContacts.push(selectedContactName);
    console.log("Aktualisierte Kontakte:", window.localEditedContacts);

    // Liste neu rendern
    const selectedContactsList = document.getElementById("selectedContactsList");
    const initials = getInitials(selectedContactName);
    const color = getColorHex(selectedContactName, "");
    selectedContactsList.insertAdjacentHTML("beforeend", `
        <div class="workerInformation">
            <p class="workerEmblem workerIcon" style="background-color: ${color};">
                ${initials}
            </p>
            <p class="workerName">${selectedContactName}</p>
            <img 
                class="hoverBtn" 
                src="../../assets/icons/png/iconoir_cancel.png" 
                onclick="removeContact('${selectedContactName}')"
                alt="Remove Worker">
        </div>
    `);
}


function removeContactFromEdit(workerName) {
    if (!window.localEditedContacts) {
        console.warn("Es gibt keine lokalen bearbeiteten Kontakte.");
        return;
    }

    // Entferne den Kontakt aus der Liste
    window.localEditedContacts = window.localEditedContacts.filter(contact => contact !== workerName);
    console.log(`Kontakt "${workerName}" aus der Bearbeitungsliste entfernt.`, window.localEditedContacts);

    // Liste der ausgewählten Kontakte aktualisieren
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (!selectedContactsList) {
        console.error("Das HTML-Element für die ausgewählten Kontakte wurde nicht gefunden.");
        return;
    }

    const updatedContactsHTML = window.localEditedContacts.map(workerName => {
        const initials = getInitials(workerName);
        const color = getColorHex(workerName, "");
        return `
            <div class="workerInformation">
                <p class="workerEmblem workerIcon" style="background-color: ${color};">
                    ${initials}
                </p>
                <p class="workerName">${workerName}</p>
                <img 
                    class="hoverBtn" 
                    src="../../assets/icons/png/iconoir_cancel.png" 
                    onclick="removeContactFromEdit('${workerName}')"
                    alt="Remove Worker">
                </div>
            `;
    }).join("");

    // Aktualisiere die UI
    selectedContactsList.innerHTML = updatedContactsHTML || '<p>Keine zugewiesenen Arbeiter.</p>';
}







async function saveTaskChanges(listId, taskId) {
    if (!listId || !taskId) {
        console.error("Ungültige Liste oder Task-ID:", { listId, taskId });
        return;
    }

    syncSubtasksFromDOM(taskId);

    // Konvertiere das Kontakte-Array in ein Firebase-kompatibles Objekt
    const workers = window.localEditedContacts.reduce((acc, contact, index) => {
        acc[`worker_${index}`] = { name: contact }; // Arbeiter mit ID speichern
        return acc;
    }, {});

    // Baue das aktualisierte Task-Objekt
    const updatedTask = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        dueDate: document.getElementById("dueDate").value,
        priority: tempPriority,
        category: {
            name: document.getElementById("category").value,
            class: `category${document.getElementById("category").value.replace(" ", "")}`,
        },
        workers, // Jetzt ein Objekt und kein Array
        subtasks: window.localEditedSubtasks || {}, // Subtasks aus der globalen Liste übernehmen
    };

    console.log("Speichere aktualisierten Task:", updatedTask); // Debugging

    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;

    try {
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
            return;
        }

        console.log(`Task "${taskId}" erfolgreich aktualisiert.`);
        closeEditTaskPopup();
        renderBoard();
    } catch (error) {
        console.error("Fehler beim Speichern der Änderungen:", error);
    }
}




function syncSubtasksFromDOM(taskId) {
    const subTasksList = document.getElementById("subTasksList");
    if (!subTasksList) {
        console.error("Subtasks-Liste nicht gefunden.");
        return;
    }
    const updatedSubtasks = {};
    subTasksList.querySelectorAll(".subtask-item").forEach(subtaskElement => {
        const subtaskId = subtaskElement.id.replace(`subtask-${taskId}-`, "").trim(); // Extrahiere Subtask-ID
        const subtaskTextElement = subtaskElement.querySelector(".subtaskText");
        const checkbox = subtaskElement.querySelector(".subtasksCheckbox");
        if (!subtaskTextElement) {
            console.warn(`Subtask-Text für ${subtaskId} fehlt.`);
            return;
        }
        updatedSubtasks[subtaskId] = {
            title: subtaskTextElement.textContent.trim(),
            done: checkbox ? checkbox.checked : false,
        };
    });
    window.localEditedSubtasks = updatedSubtasks; 
    console.log("Subtasks aus DOM synchronisiert:", updatedSubtasks);
}



function handleSubtaskKey(event) {
    if (event.key === "Enter") {
        event.preventDefault(); 
        addNewSubtask(); 
    }
}



function addNewSubtask(listId, taskId) {
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
    if (!window.localSubtasks) {
        window.localSubtasks = {};
    }
    const subtaskId = `subtask_${Date.now()}`;
    const subtaskItem = {
        title: subtaskTitle,
        done: false,
    };
    window.localSubtasks[subtaskId] = subtaskItem;
    const subtaskHTML = `
        <div class="subtask-item" id="subtask-${taskId}-${subtaskId}">
            <input 
                class="subtasksCheckbox popupIcons" 
                type="checkbox" 
                onchange="toggleLocalSubtaskStatus('${subtaskId}', this.checked)">
            <p 
                id="subtask-p-${taskId}-${subtaskId}" 
                class="subtaskText"
                onclick="editLocalSubtask('${subtaskId}')">
                ${subtaskTitle}
            </p>
            <img 
                class="hoverBtn" 
                src="../../assets/icons/png/iconoir_cancel.png" 
                onclick="removeSubtaskFromList('${subtaskId}')"
                alt="Delete Subtask">
        </div>
    `;
    subTasksList.insertAdjacentHTML("beforeend", subtaskHTML);
    subTaskInput.value = ""; 
    console.log(`Subtask "${subtaskTitle}" hinzugefügt.`);
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
        if (typeof subtasks !== "object" || Array.isArray(subtasks)) {
            console.error("Subtasks müssen ein Objekt sein:", subtasks);
            return null;
        }

        const newTask = {
            title,
            description,
            dueDate,
            priority,
            workers: workers.map(worker => ({ name: worker })), // Kontakt als Array von Objekten formatieren
            category: { name: category, class: `category${category.replace(" ", "")}` },
            subtasks,
        };

        console.log("Task-Daten, die gespeichert werden:", newTask);

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
        console.error(`Ein Fehler ist beim Hinzufügen des Tasks zu Liste '${listId}' aufgetreten:`, error);
        return null;
    }
}





async function addTaskToSpecificList(listId, event) {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const dueDate = document.getElementById("date").value.trim();
    const priority = tempPriority;
    const category = document.getElementById("category").value.trim();

    if (!priority || !listId || !title || !dueDate || !category) {
        console.warn("Fehlende Pflichtfelder oder keine Liste angegeben.");
        return;
    }

    const subtasks = window.localSubtasks || {}; // Lokale Subtasks abrufen
    const workersArray = window.localEditedContacts || []; // Lokale Kontakte abrufen

    console.log("Subtasks, die gespeichert werden sollen:", subtasks);
    console.log("Arbeiter, die gespeichert werden sollen:", workersArray);

    try {
        const result = await addTaskToList(listId, title, description, dueDate, priority, workersArray, category, subtasks);
        if (result) {
            console.log(`Task erfolgreich in Liste "${listId}" hinzugefügt.`);
            window.localSubtasks = {}; // Subtasks zurücksetzen
            window.localEditedContacts = []; // Kontakte zurücksetzen
            document.getElementById("addTaskFormTask").reset(); // Formular zurücksetzen
            tempPriority = null; // Priorität zurücksetzen
            closeAddTaskPopup(); // Popup schließen
            renderBoard(); // Board neu rendern
        } else {
            console.error(`Task konnte nicht in Liste "${listId}" gespeichert werden.`);
        }
    } catch (error) {
        console.error(`Fehler beim Speichern des Tasks in Liste "${listId}":`, error);
    }
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