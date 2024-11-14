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
                due_Date: '01.01.2025',
                priority: 'Middle',
                category: { name: 'Technical Task', class: 'category-technical' },
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
                due_Date: '24.10.2025',
                priority: 'Low',
                category: { name: 'Technical Task', class: 'category-technical' },
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
                due_Date: '16.09.2044',
                priority: 'Urgent',
                category: { name: 'Technical Task', class: 'category-technical' },
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
                due_Date: '14.06.2036',
                priority: 'Middle',
                category: { name: 'User Story', class: 'category-user-story' },
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
                due_Date: '31.11.2024',
                priority: 'Middle',
                category: { name: 'Technical Task', class: 'category-technical' },
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
                due_Date: '31.11.2024',
                priority: 'Low',
                category: { name: 'Technical Task', class: 'category-technical' },
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
                    <p class="margin_0">No Tasks To-do</p>
                </div>
            `;
        } else {
            list.task.forEach(task => {
                const progressPercent = calculateProgress(task.subtasks);

                content.innerHTML += /*html*/`
                    <div id="boardCard-${task.id}" draggable="true" ondragstart="startDragging(${task.id})" 
                         onclick="openTaskPopup(${task.id})" class="boardCard">
                        <p class="${task.category.class} taskCategory">${task.category.name}</p>
                        <p style="font-weight: 700;">${task.title}</p>
                        <p style="color: #A8A8A8;">${task.description}</p>
                        <div class="d_flex">
                            <div class="progress" role="progressbar" aria-label="Basic example" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                                <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                            </div>
                            <p style="padding-left: 15px; font-size: 12px;">${task.subtasks.length} Subtasks</p>
                        </div>
                        <div class="d_spaceBetween">
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

        // Generiere die Liste der Workers mit deren spezifischen Klassen und Initialen
        const workersHTML = task.workers.map(worker => `
            <li class="${worker.class}">
                ${worker.name} 
                <p class="${worker.class} workerEmblem">${worker.name.charAt(0)}</p> <!-- Initialen des Workers -->
            </li>
        `).join('');

        // Generiere die Subtasks ohne Aufzählungszeichen und nur mit Checkboxen
        const subtasksHTML = task.subtasks.map(subtask => {
            const subtaskText = subtask.done || subtask.todo; 
            return `
                <div class="subtask-item">
                    <input type="checkbox">
                    <p>${subtaskText}</p>
                </div>
            `;
        }).join('');

        // Setze die HTML-Struktur mit dynamischen Klassen und Worker-Emblemen
        popupContainer.innerHTML = `
            <p class="${task.category.class}">${task.category.name}</p> <!-- Dynamische Kategorie-Klasse -->
            <h2>${task.title}</h2>
            <p><strong>Description:</strong> ${task.description}</p>
            <p><strong>Due Date:</strong> ${task.due_Date}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <h3>Assigned to:</h3>
            <ul>${workersHTML}</ul>
            <h3>Subtasks</h3>
            <div class="subtasks-container">${subtasksHTML}</div>
            <button onclick="closeTaskPopup()">Close</button>
        `;
    } else {
        console.error("Popup overlay or task data not found.");
    }
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
                    <p class="margin_0">No matching Task found</p>
                </div>
            `;
        } else {
            filteredTasks.forEach(task => {
                content.innerHTML += /*html*/`
                    <div draggable="true" ondragstart="startDragging(${task.id})" class="boardCard">
                        <p class="${task.category.class} taskCategory">${task.category.name}</p>
                        <p style="font-weight: 700;">${task.title}</p>
                        <p style="color: #A8A8A8;">${task.description}</p>
                        <div class="d_flex">
                            <div class="progress" role="progressbar" aria-label="Basic example" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
                                <div class="progress-bar" style="width: 50%"></div>
                            </div>
                            <p style="padding-left: 15px; font-size: 12px;">${task.subtasks.length} Subtasks</p>
                        </div>
                        <div class="d_spaceBetween">
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

