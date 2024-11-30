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

    const subtaskId = `subtask_${Date.now()}`; // Generiere eine eindeutige ID
    const subtaskItem = {
        id: subtaskId,
        title: subtaskTitle,
        done: false,
    };

    // Subtask im DOM hinzufügen
    const subtaskElement = document.createElement("li");
    subtaskElement.id = subtaskId;
    subtaskElement.innerHTML = `
        <input type="checkbox" onchange="toggleLocalSubtaskStatus('${subtaskId}', this.checked)">
        <span>${subtaskTitle}</span>
        <button onclick="removeSubtaskFromList('${subtaskId}')">Löschen</button>
    `;
    subTasksList.appendChild(subtaskElement);

    // Input-Feld zurücksetzen
    subTaskInput.value = "";

    // Temporär speichern
    if (!window.localSubtasks) {
        window.localSubtasks = {};
    }
    window.localSubtasks[subtaskId] = subtaskItem;

    console.log(`Subtask "${subtaskTitle}" hinzugefügt.`);
}



function removeSubtaskFromList(subtaskId) {
    const subtaskElement = document.getElementById(subtaskId);
    if (!subtaskElement) {
        console.error(`Subtask-Element mit ID "${subtaskId}" nicht gefunden.`);
        return;
    }

    subtaskElement.remove(); // Entferne aus dem DOM

    if (window.localSubtasks) {
        delete window.localSubtasks[subtaskId]; // Entferne aus der temporären Liste
    }

    console.log(`Subtask mit ID "${subtaskId}" entfernt.`);
}


function getLocalSubtasks() {
    if (!window.localSubtasks) {
        console.warn("Keine Subtasks in der lokalen Liste gefunden.");
        return {};
    }

    return { ...window.localSubtasks }; // Rückgabe der Subtasks als Objekt
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
                const workersHTML = Array.isArray(task.workers)
                    ? task.workers.map(worker => {
                          const workerClass = worker?.class || "defaultWorker";
                          const workerInitial = worker?.name?.charAt(0) || "?";
                          return `<p class="${workerClass} workerEmblem">${workerInitial}</p>`;
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

        // Arbeiter-HTML generieren
        const workersHTML = task.workers
            ? task.workers.map(worker => `
                <div class="workerInformation">
                    <p class="${worker.class || 'defaultWorker'} workerEmblem workerIcon">
                        ${worker.name?.charAt(0) || '?'}
                    </p>
                    <p class="workerName">${worker.name || 'Unknown'}</p>
                </div>
            `).join('')
            : '<p>Keine zugewiesenen Arbeiter.</p>';

        // Subtasks-HTML generieren
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

        // Setze den Popup-Inhalt
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




async function deleteSubtask(listId, taskId, subtaskId) {
    if (!listId || !taskId || !subtaskId) {
        console.error("Ungültige Parameter übergeben:", { listId, taskId, subtaskId });
        return;
    }

    try {
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;

        // Abrufen des Tasks
        const response = await fetch(taskUrl);
        if (!response.ok) {
            console.error(`Fehler beim Abrufen des Tasks ${taskId} aus Liste ${listId}: ${response.status}`);
            return;
        }

        const task = await response.json();
        if (!task || !task.subtasks || !task.subtasks[subtaskId]) {
            console.error(`Subtask mit ID "${subtaskId}" nicht gefunden.`);
            return;
        }

        // Entferne den Subtask
        delete task.subtasks[subtaskId];

        // Aktualisiere den Task in Firebase
        const updateResponse = await fetch(taskUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });

        if (!updateResponse.ok) {
            console.error(`Fehler beim Löschen des Subtasks: ${updateResponse.statusText}`);
            return;
        }

        console.log(`Subtask "${subtaskId}" erfolgreich gelöscht.`);
        await renderBoard();
        await openTaskPopup(taskId, listId); // Aktualisiere das Popup
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


function editExistingSubtask(taskId, subtaskId) {
    const subtaskTextElement = document.querySelector(`#subtask-${taskId}-${subtaskId} .subtaskText`);
    if (!subtaskTextElement) {
        console.error("Subtask-Text nicht gefunden.");
        return;
    }

    // Subtask-Text in ein Input-Feld umwandeln
    const currentTitle = subtaskTextElement.textContent.trim();
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.className = "editSubtaskInput";
    inputField.value = currentTitle;
    inputField.onblur = () => updateSubtaskTitle(taskId, subtaskId, inputField.value); // Speichern bei Verlassen des Feldes
    inputField.onkeydown = (event) => {
        if (event.key === "Enter") {
            updateSubtaskTitle(taskId, subtaskId, inputField.value); // Speichern bei Enter-Taste
        } else if (event.key === "Escape") {
            cancelSubtaskEdit(taskId, subtaskId, currentTitle); // Abbrechen bei Escape-Taste
        }
    };

    // Ersetze <p> durch <input>
    subtaskTextElement.replaceWith(inputField);
    inputField.focus();
}



function cancelSubtaskEdit(taskId, subtaskId, originalTitle) {
    const subtaskItem = document.getElementById(`subtask-${taskId}-${subtaskId}`);
    if (subtaskItem) {
        const inputField = subtaskItem.querySelector(".editSubtaskInput");
        const originalTextElement = document.createElement("p");
        originalTextElement.className = "subtaskText";
        originalTextElement.id = `subtask-p-${taskId}-${subtaskId}`;
        originalTextElement.textContent = originalTitle;
        originalTextElement.onclick = () => editExistingSubtask(taskId, subtaskId);

        inputField.replaceWith(originalTextElement);
    }
}



function updateSubtaskTitle(taskId, subtaskId, newTitle) {
    if (!newTitle.trim()) {
        console.warn("Subtask-Titel darf nicht leer sein.");
        return;
    }

    // Aktualisiere den Titel in localEditedSubtasks
    if (window.localEditedSubtasks && window.localEditedSubtasks[subtaskId]) {
        window.localEditedSubtasks[subtaskId].title = newTitle.trim();
    } else {
        console.warn(`Subtask ${subtaskId} ist nicht in localEditedSubtasks vorhanden.`);
        return;
    }

    // Aktualisiere das DOM
    const subtaskItem = document.getElementById(`subtask-${taskId}-${subtaskId}`);
    if (subtaskItem) {
        const inputField = subtaskItem.querySelector(".editSubtaskInput");
        const updatedTextElement = document.createElement("p");
        updatedTextElement.className = "subtaskText";
        updatedTextElement.id = `subtask-p-${taskId}-${subtaskId}`;
        updatedTextElement.textContent = newTitle;
        updatedTextElement.onclick = () => editExistingSubtask(taskId, subtaskId);

        inputField.replaceWith(updatedTextElement);
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

        const editTaskPopupOverlay = document.getElementById("editTaskPopupOverlay");
        const editTaskPopupContainer = document.getElementById("editTaskPopupContainer");

        if (!editTaskPopupOverlay || !editTaskPopupContainer) {
            console.error("Popup-Overlay oder -Container konnte nicht gefunden werden.");
            return;
        }

        // Synchronisiere Subtasks mit localEditedSubtasks
        window.localEditedSubtasks = task.subtasks ? { ...task.subtasks } : {};

        console.log("Subtasks wurden in localEditedSubtasks synchronisiert:", window.localEditedSubtasks);

        // Setze Task-Informationen in das Popup
        editTaskPopupOverlay.setAttribute("data-task-id", taskId);
        editTaskPopupOverlay.setAttribute("data-list-id", listId);
        editTaskPopupOverlay.classList.add("visible");
        document.getElementById("mainContent").classList.add("blur");

        // Generiere Subtasks-HTML mit IDs für <p>
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
                            src="../../assets/icons/png/editIcon.png" 
                            onclick="editExistingSubtask('${taskId}', '${subtaskId}')"
                            alt="Edit Subtask">
                        <img 
                            class="hoverBtn" 
                            src="../../assets/icons/png/iconoir_cancel.png" 
                            onclick="deleteSubtask('${listId}', '${taskId}', '${subtaskId}')"
                            alt="Delete Subtask">
                    
                </div>
            `).join("")
            : '<p>Keine Subtasks vorhanden.</p>';

        // Subtask-Input für neue Subtasks
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

        // Setze den Inhalt des Edit-Popups
        editTaskPopupContainer.innerHTML = `
            <div class="popupHeader">
                <h1>Edit Task</h1>
                <img class="icon close" onclick="closeEditTaskPopup()" src="../../assets/icons/png/iconoir_cancel.png">
            </div>
            <form id="editTaskForm">
                <div class="formParts">
                    <div class="formPart">
                        <label for="title">Title<span class="requiredStar">*</span></label>
                        <input type="text" id="title" value="${task.title || ''}" required>
                        <label for="description">Description</label>
                        <textarea id="description" rows="5">${task.description || ''}</textarea>
                        <label for="contactSelection">Assigned to</label>
                        <div id="contactSelection">${task.workers.map(worker => worker.name).join(", ")}</div>
                    </div>
                    <div class="separator"></div>
                    <div class="formPart">
                        <label for="dueDate">Due Date<span class="requiredStar">*</span></label>
                        <input type="date" id="dueDate" value="${task.dueDate || ''}">
                        <label for="priority">Prio</label>
                        <div class="priorityBtnContainer">
                            <button onclick="setPriority('Urgent')" id="prioUrgent" type="button" class="priorityBtn ${task.priority === 'Urgent' ? 'active' : ''}">Urgent</button>
                            <button onclick="setPriority('Middle')" id="prioMiddle" type="button" class="priorityBtn ${task.priority === 'Middle' ? 'active' : ''}">Middle</button>
                            <button onclick="setPriority('Low')" id="prioLow" type="button" class="priorityBtn ${task.priority === 'Low' ? 'active' : ''}">Low</button>
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
                <button type="button" onclick="saveTaskChanges('${listId}', '${taskId}')">Save Changes</button>
            </form>
        `;
    } catch (error) {
        console.error("Fehler beim Öffnen des Edit-Popups:", error);
    }
}






async function saveTaskChanges(listId, taskId) {
    if (!listId || !taskId) {
        console.error("Ungültige Liste oder Task-ID:", { listId, taskId });
        return;
    }

    // Synchronisiere die Subtasks aus dem DOM
    syncSubtasksFromDOM(taskId);

    const updatedTask = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        dueDate: document.getElementById("dueDate").value,
        priority: tempPriority,
        category: {
            name: document.getElementById("category").value,
            class: `category${document.getElementById("category").value.replace(" ", "")}`,
        },
        workers: document.getElementById("contactSelection").textContent
            .split(",")
            .map(name => ({ name: name.trim(), class: `worker-${name.trim().toLowerCase()}` })),
        subtasks: window.localEditedSubtasks, // Aktualisierte Subtasks
    };

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
        closeEditTaskPopup(); // Popup schließen
        renderBoard(); // Board aktualisieren
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

    window.localEditedSubtasks = updatedSubtasks; // Lokale Subtasks aktualisieren
    console.log("Subtasks aus DOM synchronisiert:", updatedSubtasks);
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

    // Speichere den Subtask lokal
    window.localSubtasks[subtaskId] = subtaskItem;

    // Aktualisiere das DOM
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

    subTaskInput.value = ""; // Input-Feld zurücksetzen
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

        // Prüfen, ob Subtasks ein gültiges Objekt sind
        if (typeof subtasks !== "object" || Array.isArray(subtasks)) {
            console.error("Subtasks müssen ein Objekt sein:", subtasks);
            return null;
        }

        const newTask = {
            title,
            description,
            dueDate,
            priority,
            workers: workers
                ? workers.split(",").map(w => ({ name: w.trim(), class: `worker-${w.trim().toLowerCase()}` }))
                : [],
            category: { name: category, class: `category${category.replace(" ", "")}` },
            subtasks, // Subtasks einfügen
        };

        console.log("Task-Daten, die gespeichert werden:", newTask);

        const postResponse = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTask), // Task-Daten an Firebase senden
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

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const dueDate = document.getElementById("date").value;
    const priority = tempPriority;
    const workers = document.getElementById("contactSelection").value;
    const category = document.getElementById("category").value;

    if (!priority || !listId) {
        console.warn("Fehlende Pflichtfelder oder keine Liste angegeben.");
        return;
    }

    const subtasks = window.localSubtasks || {}; // Subtasks aus der lokalen Liste
    console.log("Subtasks, die gespeichert werden sollen:", subtasks);

    try {
        const result = await addTaskToList(listId, title, description, dueDate, priority, workers, category, subtasks);

        if (result) {
            console.log(`Task erfolgreich in Liste "${listId}" hinzugefügt.`);
            window.localSubtasks = {}; // Lokale Subtasks leeren
            document.getElementById("addTaskFormTask").reset();
            tempPriority = null;
            closeAddTaskPopup();
            renderBoard();
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