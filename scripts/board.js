let taskIdCounter = 1;
let currentListId = null; 
let tempPriority = null;


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
                // Subtasks als Objekt iterieren
                const subtasks = task.subtasks ? Object.values(task.subtasks) : [];
                const totalCount = subtasks.length;
                const doneCount = subtasks.filter(st => st.done).length;
                const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

                // Fortschritt-HTML
                const progressHTML = totalCount > 0 ? /*html*/ `
                    <div class="subtasksContainer">
                        <div class="progress" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                        </div>
                        <p class="taskCardSubtasks">${doneCount}/${totalCount} Subtasks</p>
                    </div>
                ` : "";

                // Arbeiter-HTML
                const workersHTML = Array.isArray(task.workers)
                    ? task.workers.map(worker => {
                          const workerClass = worker?.class || "defaultWorker";
                          const [vorname, nachname] = worker?.name?.split(" ") ||"?"
                          const workerInitial = vorname[0] + nachname[0];
                          return `<p class="${workerClass} workerEmblem">${workerInitial}</p>`;
                      }).join("")
                    : "";

                // Task-HTML generieren
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
    if (!listId) {
        console.error(`Task ${taskId} kann nicht geöffnet werden, da keine Liste angegeben wurde.`);
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

        // Arbeiter anzeigen
        const workersHTML = task.workers
            ? Object.entries(task.workers).map(([workerId, worker]) => /*html*/ `
                <div class="workerInformation">
                    <p class="${worker.class || 'defaultWorker'} workerEmblem workerIcon">
                        ${worker.name?.charAt(0) || '?'}
                    </p>
                    <p class="workerName">${worker.name || 'Unknown'}</p> 
                </div>
            `).join('')
            : '<p>Keine zugewiesenen Arbeiter.</p>';

        // Subtasks anzeigen mit Edit- und Delete-Icons
        const subtasksHTML = task.subtasks
            ? Object.entries(task.subtasks).map(([subtaskId, subtask]) => {
                const subtaskText = subtask.title || 'Unnamed Subtask'; // Nutze 'title' als Text
                const isDone = subtask.done || false; // Standardwert für 'done'
                return /*html*/ `
                    <div id="subtask-${taskId}-${subtaskId}" class="subtask-item">
                        <input 
                            class="subtasksCheckbox popupIcons" 
                            type="checkbox" 
                            ${isDone ? 'checked' : ''} 
                            onchange="toggleSubtaskStatus('${listId}', '${taskId}', '${subtaskId}', this.checked)">
                        <p class="subtaskText" style="text-decoration: ${isDone ? 'line-through' : 'none'};">
                            ${subtaskText}
                        </p>
                        <div class="hoverBtnContainer">
                            <img
                                    class="hoverBtn" 
                                    src="../../assets/icons/png/editIcon.png" 
                                    onclick="editSubtask('${listId}', '${taskId}', '${subtaskId}')"
                                    alt="Delete Subtask">    
                            <img 
                                    class="hoverBtn" 
                                    src="../../assets/icons/png/iconoir_cancel.png" 
                                    onclick="deleteSubtask('${listId}', '${taskId}', '${subtaskId}')"
                                    alt="Delete Subtask">
                            </div>
                    </div>
                `;
            }).join('')
            : '<p>Keine Subtasks vorhanden.</p>';

        // Popup mit den Daten füllen
        popupContainer.innerHTML = /*html*/ `
            <div class="popupHeader">
                <p class="${task.category?.class || 'defaultCategory'} taskCategory">
                    ${task.category?.name || 'No Category'}
                </p>
                <img class="popupIcons" onclick="closeTaskPopup()" src="../../assets/icons/png/iconoir_cancel.png">   
            </div> 
            <h1>${task.title || 'Kein Titel'}</h1>
            <p class="popupDescription">${task.description || 'Keine Beschreibung'}</p>
            <p class="popupInformation">Due Date:<strong>${task.dueDate || 'Kein Datum'}</strong></p>
            <p class="popupInformation">Priority:<strong>${task.priority || 'Low'}
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
        // Abrufen der Task-Daten
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
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

        // Löschen des Subtasks
        delete task.subtasks[subtaskId];

        // Speichern der Änderungen
        const updateResponse = await fetch(taskUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });

        if (!updateResponse.ok) {
            console.error(`Fehler beim Löschen des Subtasks: ${updateResponse.statusText}`);
            return;
        }

        console.log(`Subtask ${subtaskId} erfolgreich gelöscht.`);
        await renderBoard(); // Aktualisiere das Board
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
        // Firebase-URL für den spezifischen Task
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;

        // DELETE-Anfrage an Firebase senden
        const response = await fetch(taskUrl, {
            method: "DELETE",
        });

        if (!response.ok) {
            console.error(`Fehler beim Löschen des Tasks ${taskId} aus Liste ${listId}: ${response.status}`);
            return;
        }

        console.log(`Task ${taskId} erfolgreich aus Liste ${listId} gelöscht.`);

        // Board neu rendern, um die Änderung darzustellen
        await getTasks(); // Aktualisiere die globale `tasks`-Variable
        renderBoard(); // Board neu rendern
        closeTaskPopup(); // Schließe das Popup
    } catch (error) {
        console.error("Fehler beim Löschen des Tasks:", error);
    }
}



function editSubtask(listId, taskId, subtaskId) {
    if (!listId || !taskId || !subtaskId) {
        console.error("Ungültige Parameter übergeben:", { listId, taskId, subtaskId });
        return;
    }

    // Element des Subtasks finden
    const subtaskElement = document.getElementById(`subtask-${taskId}-${subtaskId}`);
    if (!subtaskElement) {
        console.error(`Subtask-Element nicht gefunden (Task ID: ${taskId}, Subtask ID: ${subtaskId})`);
        return;
    }

    // Der aktuelle Titel des Subtasks wird als Wert des Input-Felds gesetzt
    const currentTitle = subtaskElement.querySelector(".subtaskText")?.innerText || "Unnamed Subtask";

    // Eingabefeld und Speichern-Button hinzufügen
    subtaskElement.innerHTML = /*html*/ `
        <input 
            type="text" 
            class="editSubtaskInput" 
            value="${currentTitle}" 
            onblur="saveSubtaskEdit('${listId}', '${taskId}', '${subtaskId}', this.value)">
        <button 
            class="saveSubtaskBtn" 
            onclick="saveSubtaskEdit('${listId}', '${taskId}', '${subtaskId}', document.querySelector('#subtask-${taskId}-${subtaskId} .editSubtaskInput').value)">
            Save
        </button>
    `;

    // Fokus auf das Eingabefeld setzen
    const inputField = subtaskElement.querySelector('.editSubtaskInput');
    if (inputField) inputField.focus();
}



async function saveSubtaskEdit(listId, taskId, subtaskId, newTitle) {
    if (!listId || !taskId || !subtaskId || !newTitle.trim()) {
        console.error("Ungültige Parameter oder leerer Titel:", { listId, taskId, subtaskId, newTitle });
        return;
    }

    try {
        // Abrufen der Task-Daten
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
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

        // Aktualisieren des Subtask-Titels und Setzen von done: false
        task.subtasks[subtaskId].title = newTitle;
        task.subtasks[subtaskId].done = false; // Status immer auf "done: false" setzen

        // Speichern der Änderungen
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
        await renderBoard(); // Aktualisiere das Board
        await openTaskPopup(taskId, listId); // Aktualisiere das Popup
    } catch (error) {
        console.error("Fehler beim Bearbeiten des Subtasks:", error);
    }
}



function findTask() {
    const searchTerm = document.getElementById('findTask').value.trim().toLowerCase();

    // Alle gerenderten Task-Container durchsuchen
    const allTaskContainers = document.querySelectorAll('.taskContainer');

    allTaskContainers.forEach(container => {
        const taskCards = container.querySelectorAll('.boardCard');
        let hasMatchingTask = false;

        // Suche in jeder Task-Karte innerhalb des Containers
        taskCards.forEach(card => {
            const title = card.querySelector('.taskCardTitle')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.taskCardDescription')?.textContent.toLowerCase() || '';

            // Sichtbarkeit basierend auf Suchkriterium einstellen
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = ''; // Zeige das passende Element
                hasMatchingTask = true;
            } else {
                card.style.display = 'none'; // Verstecke das nicht passende Element
            }
        });

        // Fallback, wenn keine Übereinstimmungen in einem Container gefunden werden
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
            // Entferne die "No matching tasks found"-Meldung, wenn wieder passende Tasks gefunden werden
            const nothingToDo = container.querySelector('.nothingToDo');
            if (nothingToDo) {
                nothingToDo.remove();
            }
        }

        // Stelle den ursprünglichen Zustand her, wenn kein Suchbegriff eingegeben ist
        if (searchTerm === '') {
            taskCards.forEach(card => {
                card.style.display = ''; // Zeige alle Elemente
            });
            container.querySelector('.nothingToDo')?.remove(); // Entferne die "No tasks found"-Meldung
        }
    });
}




function editTask(taskId) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); 
    const editTaskPopupOverlay = document.getElementById("editTaskPopupOverlay");
    const editTaskPopupContainer = document.getElementById("editTaskPopupContainer");
    if (!editTaskPopupOverlay || !editTaskPopupContainer || !task) {
        console.error(`Popup-Container oder Task mit ID ${taskId} nicht gefunden.`);
        return;
    }
    editTaskPopupOverlay.setAttribute("data-task-id", taskId);
    editTaskPopupOverlay.classList.add("visible");
    document.getElementById("mainContent").classList.add("blur");
    const addSubtaskHTML = /*html*/`
        <div class="createSubtaskBar">
            <input id="newSubtaskInput" class="addSubTask" placeholder="Add new subtask" type="text">
            <div class="divider"></div>
            <img onclick="addNewSubtask(${taskId})" class="addSubtaskButton" src="../assets/icons/png/addSubtasks.png">
        </div>
    `;
    editTaskPopupContainer.innerHTML = /*html*/`
        <div class="popupHeader">
            <h1>Edit Task</h1>
            <img class="icon close" onclick="closeEditTaskPopup()" src="../../assets/icons/png/iconoir_cancel.png">
        </div>
        <form id="editTaskForm">
            <div class="formParts">
                <div class="formPart">
                    <label for="title">Title<span class="requiredStar">*</span></label>
                    <input type="text" id="title" value="${task.title}" required>
                    <label for="description">Description</label>
                    <textarea id="description" rows="5">${task.description}</textarea>
                    <label for="contactSelection">Assigned to</label>
                    <div id="contactSelection">${task.workers.map(worker => worker.name).join(', ')}</div>
                </div>
                <div class="separator"></div>
                <div class="formPart">
                    <label for="dueDate">Due Date<span class="requiredStar">*</span></label>
                    <input type="date" id="dueDate" value="${task.due_Date}">
                    <label for="priority">Prio</label>
                    <div class="priorityBtnContainer" id="prio">
                        <button onclick="setPriority('Urgent')" id="prioUrgent" type="button" class="priorityBtn ${task.priority === 'Urgent' ? 'active' : ''}">Urgent<img src="../../assets/icons/png/PrioritySymbolsUrgent.png"></button>
                        <button onclick="setPriority('Middle')" id="prioMedium" type="button" class="priorityBtn ${task.priority === 'Middle' ? 'active' : ''}">Medium<img src="../../assets/icons/png/PrioritySymbolsMiddle.png"></button>
                        <button onclick="setPriority('Low')" id="prioLow" type="button" class="priorityBtn ${task.priority === 'Low' ? 'active' : ''}">Low<img src="../../assets/icons/png/PrioritySymbolsLow.png"></button>
                    </div>
                    <label for="category">Category<span class="requiredStar">*</span></label>
                    <select id="category" required>
                        <option value="Technical Task" ${task.category.name === 'Technical Task' ? 'selected' : ''}>Technical Task</option>
                        <option value="User Story" ${task.category.name === 'User Story' ? 'selected' : ''}>User Story</option>
                    </select>
                    <label for="subtask">Subtasks</label>
                    <div id="subTasksList">${addSubtaskHTML}</div>
                </div>
            </div>
            <button type="button" onclick="saveTaskChanges(${taskId})">Save Changes</button>
        </form>
    `;
}



function saveTaskChanges(taskId) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); 
    if (!task) {
        console.error(`Task mit ID ${taskId} nicht gefunden.`);
        return;
    }
    const titleInput = document.getElementById("title").value.trim();
    const descriptionInput = document.getElementById("description").value.trim();
    const dueDateInput = document.getElementById("dueDate").value;
    const categoryInput = document.getElementById("category").value;
    if (titleInput) task.title = titleInput;
    task.description = descriptionInput;
    if (dueDateInput) task.due_Date = dueDateInput;
    if (categoryInput) {
        task.category.name = categoryInput;
        task.category.class = categoryInput === "Technical Task"
            ? "categoryTechnicalTask"
            : "categoryUserStory";
    }
    console.log('Aktueller Zustand der Aufgaben:', tasks);
    renderBoard(); 
    closeEditTaskPopup(); 
}



function addNewSubtask(taskId) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); 
    const newSubtaskInput = document.getElementById('newSubtaskInput');
    if (task && newSubtaskInput && newSubtaskInput.value.trim() !== '') {
        task.subtasks.push({ todo: newSubtaskInput.value.trim() });
        newSubtaskInput.value = ''; 
        renderBoard(); 
        openTaskPopup(taskId); 
    } else {
        console.error("Fehler beim Hinzufügen des Subtasks oder Eingabe ist leer.");
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

async function addTaskToList(listId, title, description, dueDate, priority, workers, category, subtasksInput) {
    try {
        const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task.json`;

        // Sicherstellen, dass die Liste existiert
        let response = await fetch(url);
        if (!response.ok) {
            console.warn(`Liste '${listId}' existiert nicht. Initialisiere sie erneut.`);
            await initializeTaskLists();
        }

        // **Sicherstellen, dass subtasksInput ein String ist**
        subtasksInput = subtasksInput || ""; // Wenn undefined oder null, setze leeren String
        if (typeof subtasksInput !== "string") {
            console.error("subtasksInput ist kein gültiger String:", subtasksInput);
            return null;
        }

        // Subtasks korrekt als Objekt mit eindeutigen Schlüsseln formatieren
        const subtasks = subtasksInput
            ? subtasksInput.split(",").reduce((obj, todo, index) => {
                  obj[`subtask_${index}`] = {
                      title: todo.trim(),
                      done: false,
                  };
                  return obj;
              }, {})
            : {};

        // Task-Daten definieren
        const newTask = {
            title,
            description,
            dueDate,
            priority,
            workers: workers ? workers.split(",").map(w => ({ name: w.trim(), class: `worker-${w.trim().toLowerCase()}` })) : [],
            category: { name: category, class: `category${category.replace(" ", "")}` },
            subtasks, // Subtasks als Objekt
        };

        // Task in Firebase speichern
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

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const dueDate = document.getElementById("date").value;
    const priority = tempPriority;
    const workers = document.getElementById("contactSelection").value;
    const category = document.getElementById("category").value;
    const subtasksInputElement = document.getElementById("popupSubtask");
    const subtasksInput = subtasksInputElement?.value || ""; 

    if (!priority) {
        console.warn("Keine Priorität ausgewählt.");
        return;
    }
    if (!listId) {
        console.error("Keine Liste angegeben, in die der Task hinzugefügt werden soll.");
        return;
    }

    try {
        const result = await addTaskToList(listId, title, description, dueDate, priority, workers, category, subtasksInput);
        if (result) {
            console.log(`Task erfolgreich in Liste '${listId}' hinzugefügt:`, result);
            await getTasks();
            document.getElementById("addTaskFormTask").reset();
            tempPriority = null;
            closeAddTaskPopup();
            renderBoard();
        } else {
            console.error(`Task konnte nicht in Liste '${listId}' hinzugefügt werden.`);
        }
    } catch (error) {
        console.error(`Fehler beim Hinzufügen des Tasks in Liste '${listId}':`, error);
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