const BASE_URL = 'https://join-b023c-default-rtdb.europe-west1.firebasedatabase.app/';


let users = [
    {
        id: '1',
        name: 'Stanislav',
        email: 'stanislav1994@live.de',
        password: '111',
        tasks: [
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
        ]
    }
];






let currentUser = users.find(user => user.id === '1'); 




function renderBoard() {
    const currentUserId = '1'; 
    const currentUser = users.find(user => user.id === currentUserId);
    if (!currentUser) {
        console.error('Kein angemeldeter Benutzer gefunden!');
        return;
    }
    currentUser.tasks.forEach(list => {
        const content = document.getElementById(`${list.id}List`).querySelector('.taskContainer');
        content.innerHTML = "";
        if (list.task.length === 0) {
            content.innerHTML += /*html*/`
                <div class="nothingToDo">
                    <p class="nothingToDoText">No Tasks To-do</p>
                </div>
            `;
        } else {
            list.task.forEach(task => {
                const totalCount = task.subtasks && task.subtasks.length > 0 ? task.subtasks.length : 0;
                const doneCount = totalCount > 0 ? task.subtasks.filter(subtask => subtask.done).length : 0;
                const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
                const progressHTML = totalCount > 0
                    ? /*html*/`
                        <div class="subtasksContainer">
                            <div class="progress" role="progressbar" aria-label="Task Progress" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                                <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                            </div>
                            <p class="taskCardSubtasks">${doneCount}/${totalCount} Subtasks</p>
                        </div>
                    `
                    : '';
                content.innerHTML += /*html*/`
                    <div id="boardCard-${task.id}" 
                    draggable="true" 
                    ondragenter="highlightList('${list.id}List')" 
                    ondragleave="unhighlightList('${list.id}List')"
                    ondragstart="startDragging(${task.id})" 
                    onclick="openTaskPopup(${task.id})" class="boardCard">
                        <p class="${task.category.class} taskCategory">${task.category.name}</p>
                        <p class="taskCardTitle">${task.title}</p>
                        <p class="taskCardDescription">${task.description}</p>
                        ${progressHTML} 
                        <div class="BoardCardFooter">
                            <div class="worker">
                                ${task.workers.map((worker, index) =>
                    `<p class="${worker.class} workerEmblem" style="margin-left: ${index === 1 ? '-10px' : '0'};">${worker.name.charAt(0)}</p>`).join('')}
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
    const currentUserId = '1'; 
    const currentUser = users.find(user => user.id === currentUserId);
    if (!currentUser) {
        console.error('Kein angemeldeter Benutzer gefunden!');
        return;
    }
    const task = currentUser.tasks.flatMap(list => list.task).find(t => t.id === taskId);
    const popupOverlay = document.getElementById("viewTaskPopupOverlay");
    const popupContainer = document.getElementById("viewTaskContainer");
    if (popupOverlay && popupContainer && task) {
        popupOverlay.classList.add("visible");
        document.getElementById("mainContent").classList.add("blur");
        const workersHTML = task.workers.map(worker => /*html*/`
            <div class="workerInformation">
                <p class="${worker.class} workerEmblem workerIcon">${worker.name.charAt(0)}</p>
                <p class="workerName">${worker.name}</p> 
            </div>
        `).join('');
        const subtasksHTML = task.subtasks.length > 0
            ? /*html*/`
                <h3>Subtasks</h3>
                ${task.subtasks.map((subtask, index) => {
                const subtaskText = subtask.done || subtask.todo;
                const isDone = !!subtask.done;
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
    const currentUserId = '1'; 
    const currentUser = users.find(user => user.id === currentUserId);
    if (!currentUser) {
        console.error('Kein angemeldeter Benutzer gefunden!');
        return;
    }
    const task = currentUser.tasks.flatMap(list => list.task).find(t => t.id === taskId);
    if (task && task.subtasks[subtaskIndex]) {
        task.subtasks.splice(subtaskIndex, 1);
        openTaskPopup(taskId);
        renderBoard();
    } else {
        console.error(`Subtask mit Index ${subtaskIndex} nicht in Task ${taskId} gefunden.`);
    }
}



async function deleteTask(taskId) {
    const tasks = currentUser.tasks;
    let taskFound = false;

    tasks.forEach(list => {
        const taskIndex = list.task.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            list.task.splice(taskIndex, 1); // Lokal entfernen
            taskFound = true;
        }
    });

    if (taskFound) {
        // **Firebase Löschung**
        await fetch(`${BASE_URL}/users/${currentUser.id}/tasks/${currentListId}/task/${taskId}.json`, {
            method: 'DELETE'
        });
        renderBoard();
        closeTaskPopup();
        console.log(`Task mit ID ${taskId} erfolgreich gelöscht.`);
    } else {
        console.error(`Task mit ID ${taskId} nicht gefunden.`);
    }
}







function editSubtask(taskId, subtaskIndex) {
    const currentUserId = '1'; 
    const currentUser = users.find(user => user.id === currentUserId);
    if (!currentUser) {
        console.error('Kein angemeldeter Benutzer gefunden!');
        return;
    }
    let task;
    currentUser.tasks.forEach(list => {
        const foundTask = list.task.find(t => t.id === taskId);
        if (foundTask) {
            task = foundTask;
        }
    });
    if (!task || !task.subtasks[subtaskIndex]) {
        console.error(`Task oder Subtask nicht gefunden (Task ID: ${taskId}, Subtask Index: ${subtaskIndex})`);
        return;
    }
    const subtask = task.subtasks[subtaskIndex];
    const subtaskText = subtask.done || subtask.todo;
    const subtaskElement = document.getElementById(`subtask-${taskId}-${subtaskIndex}`);
    if (!subtaskElement) {
        console.error(`Subtask-Element nicht gefunden (Task ID: ${taskId}, Subtask Index: ${subtaskIndex})`);
        return;
    }
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
    const inputField = subtaskElement.querySelector('.editSubtaskInput');
    if (inputField) inputField.focus();
}






function saveSubtaskEdit(taskId, subtaskIndex, newValue) {
    const currentUserId = '1'; 
    const currentUser = users.find(user => user.id === currentUserId);
    if (!currentUser) {
        console.error('Kein angemeldeter Benutzer gefunden!');
        return;
    }
    let task;
    currentUser.tasks.forEach(list => {
        const foundTask = list.task.find(t => t.id === taskId);
        if (foundTask) {
            task = foundTask;
        }
    });
    if (!task || !task.subtasks[subtaskIndex]) {
        console.error(`Task oder Subtask nicht gefunden (Task ID: ${taskId}, Subtask Index: ${subtaskIndex})`);
        return;
    }
    const subtask = task.subtasks[subtaskIndex];
    if (subtask.done) {
        subtask.done = newValue;
    } else if (subtask.todo) {
        subtask.todo = newValue;
    } else {
        console.error('Subtask hat kein gültiges Feld (done/todo).');
        return;
    }
    openTaskPopup(taskId);
    renderBoard();
    console.log(`Subtask mit Index ${subtaskIndex} in Task ID ${taskId} erfolgreich aktualisiert.`);
}







function toggleSubtaskStatus(taskId, subtaskIndex, isChecked) {
    const currentUserId = '1'; 
    const currentUser = users.find(user => user.id === currentUserId);
    if (!currentUser) {
        console.error('Kein angemeldeter Benutzer gefunden!');
        return;
    }
    let task;
    currentUser.tasks.forEach(list => {
        const foundTask = list.task.find(t => t.id === taskId);
        if (foundTask) {
            task = foundTask;
        }
    });
    if (!task || !task.subtasks[subtaskIndex]) {
        console.error(`Task oder Subtask nicht gefunden (Task ID: ${taskId}, Subtask Index: ${subtaskIndex})`);
        return;
    }
    const subtask = task.subtasks[subtaskIndex];
    if (isChecked) {
        subtask.done = subtask.todo;
        delete subtask.todo;
    } else {
        subtask.todo = subtask.done;
        delete subtask.done;
    }
    const subtaskElement = document.querySelector(`#subtask-${taskId}-${subtaskIndex} .subtaskText`);
    if (subtaskElement) {
        subtaskElement.style.textDecoration = isChecked ? "line-through" : "none";
    }
    openTaskPopup(taskId);
    renderBoard();
    console.log(`Subtask Status mit Index ${subtaskIndex} in Task ID ${taskId} erfolgreich umgeschaltet.`);
}




function closeTaskPopup() {
    document.getElementById("viewTaskPopupOverlay").classList.remove("visible");
    document.getElementById("mainContent").classList.remove("blur");
}



function closeAddTaskPopup() {
    document.getElementById("addTaskPopupOverlay").classList.remove("visible");
    document.getElementById("mainContent").classList.remove("blur");
}





let currentDraggedElement; 

function startDragging(taskId) {
    currentDraggedElement = taskId;
    const card = document.getElementById(`boardCard-${taskId}`);
    if (card) {
        card.classList.add('dragging');
        console.log(`Start dragging task ID: ${taskId}`);
    } else {
        console.error(`Card mit ID boardCard-${taskId} nicht gefunden.`);
    }
}


function stopDragging() {
    const card = document.getElementById(`boardCard-${currentDraggedElement}`);
    if (card) {
        card.classList.remove('dragging');
        console.log(`Stop dragging task ID: ${currentDraggedElement}`);
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
        console.log(`Liste mit ID ${listId} hervorgehoben.`);
    } else {
        console.error(`Liste mit ID ${listId} nicht gefunden.`);
    }
}


function unhighlightList(listId) {
    const list = document.getElementById(listId);
    if (list) {
        list.classList.remove('highlight');
        console.log(`Highlight von Liste mit ID ${listId} entfernt.`);
    } else {
        console.error(`Liste mit ID ${listId} nicht gefunden.`);
    }
}



function handleDrop(event, targetListId) {
    event.preventDefault();
    event.stopPropagation();
    if (!currentUser) {
        console.error('Kein Benutzer ist angemeldet!');
        return;
    }
    const tasks = currentUser.tasks; 
    let sourceList, task;
    tasks.forEach(list => {
        const taskIndex = list.task.findIndex(t => t.id === currentDraggedElement);
        if (taskIndex !== -1) {
            sourceList = list;
            [task] = sourceList.task.splice(taskIndex, 1); 
        }
    });
    const targetList = tasks.find(list => list.id === targetListId); 
    if (targetList && task) {
        targetList.task.push(task); 
        renderBoard();
        console.log(`Task ${task.id} erfolgreich in Liste "${targetListId}" verschoben.`);
    } else {
        console.error(`Ziel-Liste mit ID "${targetListId}" oder Task nicht gefunden.`);
    }
    stopDragging();
    unhighlightList(`${targetListId}List`);
}




function findTask() {
    const searchTerm = document.getElementById('findTask').value.trim().toLowerCase();
    if (!currentUser || !currentUser.tasks) {
        console.error('Kein gültiger Benutzer oder keine Aufgaben vorhanden.');
        return;
    }
    currentUser.tasks.forEach(list => {
        const content = document.getElementById(`${list.id}List`).querySelector('.taskContainer');
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
    console.log(`Suche abgeschlossen. Suchbegriff: "${searchTerm}"`);
}






function editTask(taskId) {
    if (!currentUser) {
        console.error('Kein Benutzer ist angemeldet!');
        return;
    }
    const tasks = currentUser.tasks; 
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




async function saveTaskChanges(taskId) {
    const task = currentUser.tasks.flatMap(list => list.task).find(t => t.id === taskId);
    if (!task) {
        console.error(`Task mit ID ${taskId} nicht gefunden.`);
        return;
    }

    const updatedTask = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        due_Date: document.getElementById("dueDate").value,
        category: {
            name: document.getElementById("category").value,
            class: document.getElementById("category").value === "Technical Task" 
                ? "categoryTechnicalTask" 
                : "categoryUserStory"
        },
        priority: tempPriority || task.priority
    };

    Object.assign(task, updatedTask); // Update Task lokal

    // **Firebase Aktualisierung**
    await fetch(`${BASE_URL}/users/${currentUser.id}/tasks/${currentListId}/task/${taskId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
    });

    closeEditTaskPopup();
    renderBoard();
    openTaskPopup(taskId);
    console.log(`Task mit ID ${taskId} erfolgreich aktualisiert.`);
}






function addNewSubtask(taskId) {
    if (!currentUser) {
        console.error('Kein Benutzer ist angemeldet!');
        return;
    }
    const tasks = currentUser.tasks; 
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId);
    const newSubtaskInput = document.getElementById('newSubtaskInput');
    if (task && newSubtaskInput && newSubtaskInput.value.trim() !== '') {
        task.subtasks.push({ todo: newSubtaskInput.value.trim() });
        newSubtaskInput.value = '';
        renderBoard();
        openTaskPopup(taskId); 
        console.log(`Subtask zu Task ${taskId} hinzugefügt.`);
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
    console.log("Edit task popup closed.");
}



let taskIdCounter = 1;




let currentListId = 'todo'; 
function openAddTaskPopup(listId) {
    if (!currentUser) {
        console.error('Kein Benutzer ist angemeldet!');
        return;
    }
    const tasks = currentUser.tasks; 
    const targetList = tasks.find(list => list.id === listId);
    if (!targetList) {
        console.error(`Liste mit ID "${listId}" nicht gefunden.`);
        return;
    }
    currentListId = listId; 
    const popup = document.getElementById('addTaskPopupOverlay');
    if (popup) {
        popup.classList.remove('hidden');
    } else {
        console.error('Popup-Element nicht gefunden.');
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
    console.log("Add Task Popup closed.");
}



async function addTaskToList(event) {
    if (event) event.preventDefault();

    if (!currentUser) {
        console.error('Kein Benutzer ist angemeldet!');
        return;
    }

    const tasks = currentUser.tasks;
    const targetList = tasks.find(list => list.id === currentListId);

    if (!targetList) {
        console.error(`Liste mit ID "${currentListId}" nicht gefunden.`);
        return;
    }

    const title = document.getElementById('title').value.trim();
    const dueDate = document.getElementById('date').value;
    const category = document.getElementById('category').value;

    // Validierung
    if (!title || !dueDate || !category) {
        alert('Alle Pflichtfelder müssen ausgefüllt werden!');
        return;
    }

    if (typeof category !== 'string') {
        alert("Ungültige Kategorie.");
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

    targetList.task.push(newTask);
    document.getElementById('addTaskFormTask').reset();

    // Firebase-Speichern
    await fetch(`${BASE_URL}/users/${currentUser.id}/tasks/${currentListId}/task.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
    });

    console.log(`Task erfolgreich zu Liste "${currentListId}" hinzugefügt.`);
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

// Alle deine Funktionsdefinitionen

async function loadData() {
    try {
        const response = await fetch(`${BASE_URL}/users.json`);
        const data = await response.json();

        if (data) {
            const userId = '1'; // Aktueller Benutzer
            currentUser = data[userId];

            if (!currentUser || !currentUser.tasks) {
                console.error("Benutzer oder Aufgaben nicht gefunden.");
                return;
            }

            renderBoard();
        } else {
            console.error("Keine Daten von der Datenbank erhalten.");
        }
    } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
    }
}

// DOMContentLoaded wird hier registriert
document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
});

