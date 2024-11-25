let tasks = [
    {
        id: 'todo',
        name: 'To Do',
        task: [
            {
                id: 1,
                title: 'Gießen',
                description: '300ml Wasser gießen',
                workers: [
                    { name: 'Stanislav Levin', class: 'worker-stanislav' },
                    { name: 'Ozan Orhan', class: 'worker-ozan' }
                ],
                due_Date: '2025-01-01',
                priority: 'Middle',
                category: { name: 'Technical Task', class: 'categoryTechnicalTask' },
                subtasks: [
                    { todo: 'Wasser abstehen lassen' },
                    { todo: 'Dünger hinzugeben' },
                    { todo: 'PH Wert anpassen' },
                    { todo: 'im Ring gießen' }
                ]
            },
            {
                id: 2,
                title: 'coden',
                description: 'Join coden',
                workers: [
                    { name: 'Stanislav Levin', class: 'worker-stanislav' },
                    { name: 'Kevin Fischer', class: 'worker-kevin' }
                ],
                due_Date: '2025-10-24',
                priority: 'Low',
                category: { name: 'Technical Task', class: 'categoryTechnicalTask' },
                subtasks: [
                    { done: 'JS Datei einbinden' },
                    { todo: 'Summary Styling bearbeiten' },
                    { todo: 'auf github pushen' },
                    { todo: 'mit Team besprechen' }
                ]
            }
        ]
    },
    {
        id: 'inProgress',
        name: 'In Progress',
        task: [
            {
                id: 3,
                title: 'HTML templates einbinden',
                description: 'alle HTML datein zusammenfassen',
                workers: [
                    { name: 'Stanislav Levin', class: 'worker-stanislav' },
                    { name: 'Nicolai Österle', class: 'worker-nicolai' }
                ],
                due_Date: '2044-08-15',
                priority: 'Urgent',
                category: { name: 'Technical Task', class: 'categoryTechnicalTask' },
                subtasks: [
                    { todo: 'Code Schnipsel sammeln' },
                    { todo: 'auf github mergen' },
                    { todo: 'mit dem Team besprechen' },
                    { todo: 'änderungen anpassen und clean code beachten' }
                ]
            },
            {
                id: 4,
                title: 'add Task einbinden',
                description: 'add task erfolgreich ins array einbinden',
                workers: [
                    { name: 'Stanislav Levin', class: 'worker-stanislav' },
                    { name: 'Ozan Orhan', class: 'worker-ozan' }
                ],
                due_Date: '2036-06-28',
                priority: 'Middle',
                category: { name: 'User Story', class: 'categoryUserStory' },
                subtasks: [
                    { todo: 'datenstruktur besprechen' },
                    { todo: 'Änderungen übernehmen' }
                ]
            }
        ]
    },
    {
        id: 'awaitFeedback',
        name: 'Await Feedback',
        task: [
            {
                id: 5,
                title: 'contacts einbinden',
                description: 'codeblöcke miteinander verbinden',
                workers: [
                    { name: 'Stanislav Levin', class: 'worker-stanislav' },
                    { name: 'Kevin Fischer', class: 'worker-kevin' }
                ],
                due_Date: '2024-11-30',
                priority: 'Middle',
                category: { name: 'Technical Task', class: 'categoryTechnicalTask' },
                subtasks: [
                    { todo: 'contacts array erstellen' },
                    { todo: 'die daten im tasks aktualisieren' },
                    { done: 'dateien einbinden' },
                    { done: 'Contacts anzeigen lassen' }
                ]
            }
        ]
    },
    {
        id: 'done',
        name: 'Done',
        task: []
    }
];




function renderBoard() {
    // Überprüfen, ob das tasks-Array existiert
    if (!tasks || tasks.length === 0) {
        console.error('Keine Aufgaben gefunden!');
        return;
    }
    tasks.forEach(list => {
        // Sucht den Container für die jeweilige Liste anhand der ID
        const content = document.getElementById(`${list.id}List`)?.querySelector('.taskContainer');
        if (!content) {
            console.error(`Container für Liste "${list.id}" nicht gefunden.`);
            return;
        }
        // Löscht den Inhalt des Containers
        content.innerHTML = "";
        // Falls keine Aufgaben in der Liste sind
        if (list.task.length === 0) {
            content.innerHTML += /*html*/`
                <div class="nothingToDo">
                    <p class="nothingToDoText">No Tasks To-Do</p>
                </div>
            `;
        } else {
            // Fügt jede Aufgabe in die entsprechende Liste ein
            list.task.forEach(task => {
                const totalCount = task.subtasks.length; // Gesamtanzahl der Subtasks
                const doneCount = task.subtasks.filter(st => st.done).length; // Abgeschlossene Subtasks
                const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0; // Fortschritt in %
                // Fortschrittsanzeige für Subtasks
                const progressHTML = totalCount > 0 ? /*html*/`
                    <div class="subtasksContainer">
                        <div class="progress" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                        </div>
                        <p class="taskCardSubtasks">${doneCount}/${totalCount} Subtasks</p>
                    </div>
                ` : '';
                // Fügt die Aufgabe in den Container ein
                content.innerHTML += /*html*/`
                    <div id="boardCard-${task.id}" 
                         draggable="true"
                         ondragstart="startDragging(${task.id})"
                         onclick="openTaskPopup(${task.id})"
                         class="boardCard">
                        <p class="${task.category.class} taskCategory">${task.category.name}</p>
                        <p class="taskCardTitle">${task.title}</p>
                        <p class="taskCardDescription">${task.description}</p>
                        ${progressHTML}
                        <div class="BoardCardFooter">
                            <div class="worker">
                                ${task.workers.map(worker =>
                    `<p class="${worker.class} workerEmblem">${worker.name.charAt(0)}</p>`
                ).join('')}
                            </div>
                            <img class="priority" src="../../assets/icons/png/PrioritySymbols${task.priority}.png">
                        </div>
                    </div>
                `;
            });
        }
    });
}



function openTaskPopup(taskId) {
    // Alle Aufgaben aus allen Listen suchen
    const allTasks = tasks.flatMap(list => list.task);
    const task = allTasks.find(t => t.id === taskId); // Finde die Aufgabe mit der ID
    const popupOverlay = document.getElementById("viewTaskPopupOverlay");
    const popupContainer = document.getElementById("viewTaskContainer");
    if (popupOverlay && popupContainer && task) {
        // Zeige das Popup an und füge Blur-Effekt hinzu
        popupOverlay.classList.add("visible");
        document.getElementById("mainContent").classList.add("blur");
        // Arbeiter-HTML generieren
        const workersHTML = task.workers.map(worker => /*html*/`
            <div class="workerInformation">
                <p class="${worker.class} workerEmblem workerIcon">${worker.name.charAt(0)}</p>
                <p class="workerName">${worker.name}</p> 
            </div>
        `).join('');
        // Subtasks-HTML generieren
        const subtasksHTML = task.subtasks.length > 0
            ? /*html*/`
                <h3>Subtasks</h3>
                ${task.subtasks.map((subtask, index) => {
                const subtaskText = subtask.done || subtask.todo; // Finde den Subtask-Text
                const isDone = !!subtask.done; // Status des Subtasks
                return /*html*/`
                        <div id="subtask-${task.id}-${index}" class="subtask-item">
                            <input 
                                class="subtasksCheckbox popupIcons" 
                                type="checkbox" 
                                ${isDone ? 'checked' : ''} 
                                onchange="toggleSubtaskStatus(${task.id}, ${index}, this.checked)">
                            <p class="subtaskText" style="text-decoration: ${isDone ? 'line-through' : 'none'};">
                                ${subtaskText}
                            </p>
                            <div class="hoverBtnContainer">
                                <img
                                    class="hoverBtn" 
                                    src="../../assets/icons/png/editIcon.png" 
                                    onclick="editSubtask(${task.id}, ${index})" 
                                    alt="Edit Subtask">    
                                <img 
                                    class="hoverBtn" 
                                    src="../../assets/icons/png/iconoir_cancel.png" 
                                    onclick="deleteSubtask(${task.id}, ${index})" 
                                    alt="Delete Subtask">
                            </div>
                        </div>
                    `;
            }).join('')}
            `
            : '';
        // HTML für das Popup generieren
        popupContainer.innerHTML = /*html*/`
            <div class="popupHeader">
                <p class="${task.category.class} taskCategory">${task.category.name}</p>
                <img class="popupIcons" onclick="closeTaskPopup()" src="../../assets/icons/png/iconoir_cancel.png">   
            </div> 
            <h1>${task.title}</h1>
            <p class="popupDescription">${task.description}</p>
            <p class="popupInformation">Due Date:<strong>${task.due_Date}</strong></p>
            <p class="popupInformation">Priority:<strong>${task.priority}<img src="../../assets/icons/png/PrioritySymbols${task.priority}.png"></strong></p>
            <p>Assigned to:</p>
            <div class="workerContainer">${workersHTML}</div>
            <div class="subtasks-container">${subtasksHTML}</div>
            <div class="popupActions">
                <img onclick="editTask(${task.id})" class="popupIcons" src="../../assets/icons/png/edit.png">
                <img onclick="deleteTask(${task.id})" class="popupIcons" src="../../assets/icons/png/Delete contact.png">
            </div>
        `;
    } else {
        console.error("Popup overlay oder Task-Daten nicht gefunden.");
    }
}



function deleteSubtask(taskId, subtaskIndex) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); // Finde die Aufgabe

    if (task && task.subtasks[subtaskIndex]) {
        task.subtasks.splice(subtaskIndex, 1); // Entferne den Subtask
        openTaskPopup(taskId); // Aktualisiere das Popup
        renderBoard(); // Aktualisiere das Board
    } else {
        console.error(`Subtask mit Index ${subtaskIndex} nicht in Task ${taskId} gefunden.`);
    }
}



function deleteTask(taskId) {
    tasks.forEach(list => {
        const index = list.task.findIndex(task => task.id === taskId); // Finde den Index der Aufgabe
        if (index !== -1) {
            list.task.splice(index, 1); // Entferne die Aufgabe
            renderBoard(); // Aktualisiere das Board
            closeTaskPopup(); // Schließe das Popup
        }
    });
}



function editSubtask(taskId, subtaskIndex) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); // Finde die Aufgabe
    if (!task || !task.subtasks[subtaskIndex]) {
        console.error(`Task oder Subtask nicht gefunden (Task ID: ${taskId}, Subtask Index: ${subtaskIndex})`);
        return;
    }
    const subtask = task.subtasks[subtaskIndex];
    const subtaskText = subtask.done || subtask.todo; // Subtask-Text holen
    const subtaskElement = document.getElementById(`subtask-${taskId}-${subtaskIndex}`); // HTML-Element finden
    if (!subtaskElement) {
        console.error(`Subtask-Element nicht gefunden (Task ID: ${taskId}, Subtask Index: ${subtaskIndex})`);
        return;
    }
    // Bearbeitungsfeld einfügen
    subtaskElement.innerHTML = /*html*/`
        <input
            type="text" 
            class="editSubtaskInput" 
            value="${subtaskText}" 
            onblur="saveSubtaskEdit(${taskId}, ${subtaskIndex}, this.value)">
        <button
            class="saveSubtaskBtn" 
            onclick="saveSubtaskEdit(${taskId}, ${subtaskIndex}, document.querySelector('#subtask-${taskId}-${subtaskIndex} .editSubtaskInput').value)">
            Save
        </button>
    `;
    // Eingabefeld fokussieren
    const inputField = subtaskElement.querySelector('.editSubtaskInput');
    if (inputField) inputField.focus();
}



function saveSubtaskEdit(taskId, subtaskIndex, newText) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); // Finde die Aufgabe
    if (!task || !task.subtasks[subtaskIndex]) {
        console.error(`Task oder Subtask nicht gefunden (Task ID: ${taskId}, Subtask Index: ${subtaskIndex})`);
        return;
    }
    // Aktualisiere den Subtask
    const subtask = task.subtasks[subtaskIndex];
    if (subtask.done !== undefined) {
        subtask.done = newText; // Aktualisiere den Text im 'done'-Feld
    } else {
        subtask.todo = newText; // Aktualisiere den Text im 'todo'-Feld
    }
    console.log(`Subtask aktualisiert (Task ID: ${taskId}, Subtask Index: ${subtaskIndex}):`, subtask);
    // Aktualisiere die Anzeige
    renderBoard();
    openTaskPopup(taskId); // Öffne das Popup erneut, um die Änderungen zu zeigen
}



function toggleSubtaskStatus(taskId, subtaskIndex, isChecked) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); // Finde die Aufgabe
    if (!task || !task.subtasks[subtaskIndex]) {
        console.error(`Task oder Subtask nicht gefunden (Task ID: ${taskId}, Subtask Index: ${subtaskIndex})`);
        return;
    }
    const subtask = task.subtasks[subtaskIndex];
    // Status des Subtasks ändern
    if (isChecked) {
        subtask.done = subtask.todo; // Markiere als erledigt
        delete subtask.todo; // Entferne das `todo`-Feld
    } else {
        subtask.todo = subtask.done; // Setze zurück auf `todo`
        delete subtask.done; // Entferne das `done`-Feld
    }
    // Aktualisiere die Darstellung des Subtasks
    const subtaskElement = document.querySelector(`#subtask-${taskId}-${subtaskIndex} .subtaskText`);
    if (subtaskElement) {
        subtaskElement.style.textDecoration = isChecked ? "line-through" : "none";
    }
    openTaskPopup(taskId); // Aktualisiere das Popup
    renderBoard(); // Aktualisiere das Board
}


function findTask() {
    const searchTerm = document.getElementById('findTask').value.trim().toLowerCase();
    tasks.forEach(list => {
        const content = document.getElementById(`${list.id}List`)?.querySelector('.taskContainer');
        if (!content) {
            console.error(`Liste mit ID ${list.id} nicht gefunden.`);
            return;
        }
        content.innerHTML = "";
        const filteredTasks = list.task.filter(task =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
        if (filteredTasks.length === 0) {
            content.innerHTML = /*html*/`
                <div class="nothingToDo">
                    <p class="nothingToDoText">No matching tasks found</p>
                </div>
            `;
        } else {
            filteredTasks.forEach(task => {
                const totalCount = task.subtasks ? task.subtasks.length : 0;
                const doneCount = task.subtasks ? task.subtasks.filter(st => st.done).length : 0;
                const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
                content.innerHTML += /*html*/`
                    <div draggable="true" 
                         ondragstart="startDragging(${task.id})" 
                         onclick="openTaskPopup(${task.id})" 
                         class="boardCard">
                        <p class="${task.category.class} taskCategory">${task.category.name}</p>
                        <p class="taskCardTitle">${task.title}</p>
                        <p class="taskCardDescription">${task.description}</p>
                        <div class="subtasksContainer">
                            <div class="progress" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                                <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                            </div>
                            <p class="taskCardSubtasks">${doneCount}/${totalCount} Subtasks</p>
                        </div>
                        <div class="BoardCardFooter">
                            <div class="worker">
                                ${task.workers.map((worker, index) =>
                    `<p class="${worker.class} workerEmblem" style="margin-left: ${index === 1 ? '-10px' : '0'};">
                                        ${worker.name.charAt(0)}
                                     </p>`
                ).join('')}
                            </div>
                            <img class="priority" src="../../assets/icons/png/PrioritySymbols${task.priority}.png"> 
                        </div>
                    </div>
                `;
            });
        }
    });
}



function editTask(taskId) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); // Finde die Aufgabe
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




let tempPriority = null;


function setPriority(priority) {
    tempPriority = priority;
    document.querySelectorAll('.priorityBtn').forEach(btn => btn.classList.remove('active'));
    const activeButton = document.getElementById(`prio${priority}`);
    if (activeButton) {
        activeButton.classList.add('active');
    } else {
        console.warn(`Button for priority "${priority}" not found.`);
    }
}


function saveTaskChanges(taskId) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); // Task aus globalem `tasks` finden
    if (!task) {
        console.error(`Task mit ID ${taskId} nicht gefunden.`);
        return;
    }
    // Eingaben aus den Feldern abrufen
    const titleInput = document.getElementById("title").value.trim();
    const descriptionInput = document.getElementById("description").value.trim();
    const dueDateInput = document.getElementById("dueDate").value;
    const categoryInput = document.getElementById("category").value;
    // Task-Felder aktualisieren
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
    renderBoard(); // Board neu rendern
    closeEditTaskPopup(); // Bearbeitungs-Popup schließen
}



function addNewSubtask(taskId) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); // Task finden
    const newSubtaskInput = document.getElementById('newSubtaskInput');
    // Subtask hinzufügen, wenn Eingabe vorhanden ist
    if (task && newSubtaskInput && newSubtaskInput.value.trim() !== '') {
        task.subtasks.push({ todo: newSubtaskInput.value.trim() });
        newSubtaskInput.value = ''; // Eingabefeld zurücksetzen
        renderBoard(); // Board neu rendern
        openTaskPopup(taskId); // Popup erneut öffnen
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



let taskIdCounter = 1;



function openAddTaskPopup(listId) {
    const targetList = tasks.find(list => list.id === listId); // Liste finden
    if (!targetList) {
        console.error(`Liste mit ID "${listId}" nicht gefunden.`);
        return;
    }
    currentListId = listId; // Aktuelle Liste setzen
    const popup = document.getElementById('addTaskPopupOverlay');
    if (popup) {
        popup.classList.remove('hidden'); // Popup anzeigen
    }
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


function addTaskToList(event) {
    if (event) event.preventDefault();
    const targetList = tasks.find(list => list.id === currentListId); // Ziel-Liste finden
    if (!targetList) {
        console.error(`Liste mit ID "${currentListId}" nicht gefunden.`);
        return;
    }
    const title = document.getElementById('title').value.trim();
    const dueDate = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    if (!title || !dueDate || !category) {
        alert('Alle Pflichtfelder müssen ausgefüllt werden!');
        return;
    }
    const newTask = {
        id: Date.now(),
        title: title,
        description: document.getElementById('description').value.trim(),
        workers: [{ name: 'Default Worker', class: 'worker-default' }],
        due_Date: dueDate,
        priority: document.querySelector('.priorityBtn.active')?.id.replace('prio', '') || 'Low',
        category: { name: category, class: `category${category.replace(' ', '')}` },
        subtasks: Array.from(document.querySelectorAll('.addSubTaskInput'))
            .map(input => ({ todo: input.value.trim() }))
            .filter(st => st.todo)
    };
    targetList.task.push(newTask); // Task zur Ziel-Liste hinzufügen
    document.getElementById('addTaskFormTask').reset(); // Formular zurücksetzen
    tempPriority = null; // Priorität zurücksetzen
    renderBoard(); // Board neu rendern
}




let currentDraggedElement;



function startDragging(taskId) {
    currentDraggedElement = taskId;
    const card = document.getElementById(`boardCard-${taskId}`);
    if (card) {
        card.classList.add('dragging');
    } else {
        console.error(`Card mit ID boardCard-${taskId} nicht gefunden.`);
    }
}



function stopDragging() {
    const card = document.getElementById(`boardCard-${currentDraggedElement}`);
    if (card) {
        card.classList.remove('dragging');
    }
    currentDraggedElement = null;
}



function allowDrop(event) {
    event.preventDefault();
    event.stopPropagation();
}



function highlightList(listId) {
    const list = document.getElementById(listId);
    if (list) {
        list.classList.add('highlight');
    } else {
        console.error(`Liste mit ID ${listId} nicht gefunden.`);
    }
}



function unhighlightList(listId) {
    const list = document.getElementById(listId);
    if (list) {
        list.classList.remove('highlight');
    } else {
        console.error(`Liste mit ID ${listId} nicht gefunden.`);
    }
}


function handleDrop(event, targetListId) {
    event.preventDefault();
    event.stopPropagation();
    let sourceList, task;
    // Die Liste und den Task finden, aus der der Task entfernt wird
    tasks.forEach(list => {
        const taskIndex = list.task.findIndex(t => t.id === currentDraggedElement);
        if (taskIndex !== -1) {
            sourceList = list;
            [task] = sourceList.task.splice(taskIndex, 1); // Task aus der Quell-Liste entfernen
        }
    });
    // Ziel-Liste finden und Task hinzufügen
    const targetList = tasks.find(list => list.id === targetListId);
    if (targetList && task) {
        targetList.task.push(task); // Task in die Ziel-Liste verschieben
        renderBoard(); // Board neu rendern
    } else {
        console.error(`Ziel-Liste mit ID "${targetListId}" oder Task nicht gefunden.`);
    }
    stopDragging(); // Dragging beenden
    unhighlightList(`${targetListId}List`); // Hervorhebung entfernen
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

