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
                category: { name: 'Technical Task', class: 'categoryTechnical' },
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
                category: { name: 'Technical Task', class: 'categoryTechnical' },
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
                category: { name: 'Technical Task', class: 'categoryTechnical' },
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
        name: 'Await feedback',
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
                category: { name: 'Technical Task', class: 'categoryTechnical' },
                subtasks: [
                    { todo: 'contacts array erstellen' },
                    { todo: 'die daten im tasks aktualisieren' },
                    { done: 'dateien einbinden' },
                    { done: 'Contacts anzeigen lassen' }
                ]
            },
            {
                id: 6,
                title: 'bootstrap einbinden',
                description: 'sauberes einbinden der ordner',
                workers: [
                    { name: 'Stanislav Levin', class: 'worker-stanislav' },
                    { name: 'Nicolai Österle', class: 'worker-nicolai' }
                ],
                due_Date: '2024-11-10',
                priority: 'Low',
                category: { name: 'Technical Task', class: 'categoryTechnical' },
                subtasks: [
                    { done: 'cloud einstellungen anpassen' },
                    { done: 'neues initialisieren' },
                    { done: 'login und registration mit login fertig bauen' },
                    { done: 'login als index deklarieren' }
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



let currentDraggedElement;



function calculateProgress(subtasks) {
    const totalSubtasks = subtasks.length;
    const doneSubtasks = subtasks.filter(subtask => subtask.done).length;
    return totalSubtasks > 0 ? (doneSubtasks / totalSubtasks) * 100 : 0;
}



function renderBoard() {
    tasks.forEach(list => {
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
                const progressPercent = calculateProgress(task.subtasks);
                const doneCount = task.subtasks.filter(subtask => subtask.done).length; 
                const totalCount = task.subtasks.length; 
                content.innerHTML += /*html*/`
                    <div id="boardCard-${task.id}" draggable="true" ondragstart="startDragging(${task.id})" onclick="openTaskPopup(${task.id})" class="boardCard">
                        <p class="${task.category.class} taskCategory">${task.category.name}</p>
                        <p class="taskCardTitle">${task.title}</p>
                        <p class="taskCardDescription">${task.description}</p>
                        <div class="subtasksContainer">
                            <div class="progress" role="progressbar" aria-label="Basic example" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                                <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                            </div>
                            <p class="taskCardSubtasks">${doneCount}/${totalCount} Subtasks</p>                        </div>
                        <div class="BoardCardFooter">
                            <div class="worker">
                                ${task.workers.map((worker, index) =>
                    `<p class="${worker.class} workerEmblem" style="margin-left: ${index === 1 ? '-10px' : '0'};">${worker.name.charAt(0)}</p>`
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
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId);
    const popupOverlay = document.getElementById("viewTaskPopupOverlay");
    const popupContainer = document.getElementById("viewTaskContainer");
    if (popupOverlay && popupContainer && task) { 
        popupOverlay.classList.add("visible");
        document.getElementById("mainContent").classList.add("blur");
        const workersHTML = task.workers.map(worker => `
            <div class="workerInformation">
                <p class="${worker.class} workerEmblem workerIcon">${worker.name.charAt(0)}</p>
                <p class="workerName">${worker.name}</p> 
            </div>
        `).join('');
        const subtasksHTML = task.subtasks.map((subtask, index) => {
            const subtaskText = subtask.done || subtask.todo;
            const isDone = !!subtask.done;
            return `
                <div id="subtask-${task.id}-${index}" class="subtask-item">
                    <input 
                        class="subtasksCheckbox popupIcons" 
                        type="checkbox" 
                        ${isDone ? 'checked' : ''} 
                        onchange="toggleSubtaskStatus(${task.id}, ${index}, this.checked)"
                    >
                    <p class="subtaskText" style="color: ${isDone ? 'green' : ''}; text-decoration: ${isDone ? 'line-through' : 'none'};">
                        ${subtaskText}
                    </p>
                </div>
            `;
        }).join('');
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
            <h3>Subtasks</h3>
            <div class="subtasks-container">${subtasksHTML}</div>
            <div class="popupActions">
                <img onclick="editTask(${task.id})" class="popupIcons" src="../../assets/icons/png/edit.png">
                <img onclick="deleteTask(${task.id})" class="popupIcons" src="../../assets/icons/png/Delete contact.png">
            </div>
        `;
    } else {
        console.error("Popup overlay or task data not found.");
    }
}



function toggleSubtaskStatus(taskId, subtaskIndex, isChecked) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId);
    if (task && task.subtasks[subtaskIndex]) {
        const subtask = task.subtasks[subtaskIndex];
        const subtaskElement = document.querySelector(`#subtask-${taskId}-${subtaskIndex} .subtaskText`);

        if (isChecked) {
            subtask.done = subtask.todo;
            delete subtask.todo;
            if (subtaskElement) {
                subtaskElement.style.textDecoration = "line-through";
                subtaskElement.style.color = "green";
            }
        } else {
            subtask.todo = subtask.done;
            delete subtask.done;
            if (subtaskElement) {
                subtaskElement.style.textDecoration = "none";
            }
        }
    } else {
        console.error(`Subtask with index ${subtaskIndex} not found in task ${taskId}.`);
    }
    renderBoard();
}





function closeTaskPopup() {
    document.getElementById("viewTaskPopupOverlay").classList.remove("visible");
    document.getElementById("mainContent").classList.remove("blur");
}



function openAddTaskPopup() {
    document.getElementById("addTaskPopupOverlay").classList.add("visible");
    document.getElementById("mainContent").classList.add("blur");
}



function closeAddTaskPopup() {
    document.getElementById("addTaskPopupOverlay").classList.remove("visible");
    document.getElementById("mainContent").classList.remove("blur");
}



function startDragging(taskId) {
    currentDraggedElement = taskId;
}



function allowDrop(event) {
    event.preventDefault();
}



function handleDrop(event, targetListId) {
    event.preventDefault();
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
    }
    renderBoard();
}



function findTask() {
    const searchTerm = document.getElementById('findTask').value.toLowerCase();
    tasks.forEach(list => {
        const content = document.getElementById(`${list.id}List`).querySelector('.taskContainer');
        content.innerHTML = "";
        const filteredTasks = list.task.filter(task =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
        if (filteredTasks.length === 0) {
            content.innerHTML = /*html*/`
                <div class="nothingToDo">
                    <p class="nothingToDoText">No matching Task found</p>
                </div>
            `;
        } else {
            filteredTasks.forEach(task => {
                content.innerHTML += /*html*/`
                    <div draggable="true" ondragstart="startDragging(${task.id})" class="boardCard">
                    <p class="${task.category.class} taskCategory">${task.category.name}</p>
                        <p class="taskCardTitle">${task.title}</p>
                        <p class="taskCardDescription">${task.description}</p>
                        <div class="subtasksContainer">
                            <div class="progress" role="progressbar" aria-label="Basic example" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                                <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                            </div>
                            <p class="taskCardSubtasks">${doneCount}/${totalCount} Subtasks</p>                        </div>
                        <div class="BoardCardFooter">
                            <div class="worker">
                                ${task.workers.map((worker, index) =>
                    `<p class="${worker.class} workerEmblem" style="margin-left: ${index === 1 ? '-10px' : '0'};">${worker.name.charAt(0)}</p>`
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
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId);
    const editTaskPopupOverlay = document.getElementById("editTaskPopupOverlay");
    const editTaskPopupContainer = document.getElementById("editTaskPopupContainer");

    if (editTaskPopupOverlay && editTaskPopupContainer && task) {
        editTaskPopupOverlay.classList.add("visible");
        document.getElementById("mainContent").classList.add("blur");

        const subtasksHTML = task.subtasks.map((subtask, index) => {
            const subtaskText = subtask.done || subtask.todo; 
            const isDone = !!subtask.done; 
            return /*html*/`
                <div id="edit-subtask-${taskId}-${index}" class="editSubtaskItem">
                    <input 
                        type="checkbox" 
                        ${isDone ? 'checked' : ''} 
                        onchange="toggleEditSubtaskStatus(${taskId}, ${index}, this.checked)">
                    <input 
                        type="text" 
                        class="subtaskInput" 
                        value="${subtaskText}" 
                        style="text-decoration: ${isDone ? 'line-through' : 'none'}; color: ${isDone ? 'green' : 'black'};">
                </div>
            `;
        }).join('');

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
                            <button onclick="setPriority('urgent')" id="prioUrgent" type="button" class="priorityBtn ${task.priority === 'Urgent' ? 'active' : ''}">Urgent<img src="../../assets/icons/png/PrioritySymbolsUrgent.png"></button>
                            <button onclick="setPriority('medium')" id="prioMedium" type="button" class="priorityBtn ${task.priority === 'Middle' ? 'active' : ''}">Medium<img src="../../assets/icons/png/PrioritySymbolsMiddle.png"></button>
                            <button onclick="setPriority('low')" id="prioLow" type="button" class="priorityBtn ${task.priority === 'Low' ? 'active' : ''}">Low<img src="../../assets/icons/png/PrioritySymbolsLow.png"></button>
                        </div>
                        <label for="category">Category<span class="requiredStar">*</span></label>
                        <select id="category" required>
                            <option value="Technical Task" ${task.category.name === 'Technical Task' ? 'selected' : ''}>Technical Task</option>
                            <option value="User Story" ${task.category.name === 'User Story' ? 'selected' : ''}>User Story</option>
                        </select>
                        <label for="subtask">Subtasks</label>
                        <div id="subTasksList">${subtasksHTML}</div>
                    </div>
                </div>
                <button type="button" onclick="saveTaskChanges(${taskId})">Save Changes</button>
            </form>
        `;
    } else {
        console.error("Edit task popup overlay or container not found.");
    }
}



function closeEditTaskPopup() {
    document.getElementById("editTaskPopupOverlay").classList.remove("visible");
    document.getElementById("mainContent").classList.remove("blur");
}
