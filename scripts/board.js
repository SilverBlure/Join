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
                due_Date: '31.11.2024',
                priority: 'Middle',
                category: { name: 'Technical Task', class: 'category-technical' },
                subtasks: ['Wasser abstehen lassen', 'Dünger hinzugeben', 'PH Wert anpassen', 'im Ring gießen']
            },
            {
                id: 2,
                title: 'coden',
                description: 'Join coden',
                workers: [
                    { name: 'Stanislav Levin', class: 'worker-stanislav' },
                    { name: 'Kevin Fischer', class: 'worker-kevin' }
                ],
                due_Date: '31.11.2024',
                priority: 'Low',
                category: { name: 'Technical Task', class: 'category-technical' },
                subtasks: ['JS Datei einbinden', 'Summary Styling bearbeiten', 'auf github pushen', 'mit Team besprechen']
            },
            {
                id: 7,
                title: 'schlafen',
                description: 'ausreichend schlafen',
                workers: [
                    { name: 'Stanislav Levin', class: 'worker-stanislav' },
                    { name: 'Ozan Orhan', class: 'worker-ozan' }
                ],
                due_Date: '31.11.2024',
                priority: 'Urgent',
                category: { name: 'Technical Task', class: 'category-technical' },
                subtasks: ['kleiner schritt 25', 'kleiner schritt 26', 'kleiner schritt 27', 'kleiner schritt 28']
            },
            {
                id: 8,
                title: 'backen',
                description: 'Infused Brownies backen',
                workers: [
                    { name: 'Stanislav Levin', class: 'worker-stanislav' },
                    { name: 'Kevin Fischer', class: 'worker-kevin' }
                ],
                due_Date: '31.11.2024',
                priority: 'Middle',
                category: { name: 'User Story', class: 'category-user-story' },
                subtasks: ['kleiner schritt 29', 'kleiner schritt 30', 'kleiner schritt 31', 'kleiner schritt 32']
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
                due_Date: '31.11.2024',
                priority: 'Urgent',
                category: { name: 'Technical Task', class: 'category-technical' },
                subtasks: ['Code Schnipsel sammeln', 'auf github mergen', 'mit dem Team besprechen', 'änderungen anpassen und clean code beachten']
            },
            {
                id: 4,
                title: 'add Task einbinden',
                description: 'add task erfolgreich ins array einbinden',
                workers: [
                    { name: 'Stanislav Levin', class: 'worker-stanislav' },
                    { name: 'Ozan Orhan', class: 'worker-ozan' }
                ],
                due_Date: '31.11.2024',
                priority: 'Middle',
                category: { name: 'User Story', class: 'category-user-story' },
                subtasks: ['datenstruktur besprechen', 'Änderungen übernehmen']
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
                subtasks: ['contacts array erstellen', 'die daten im tasks aktualisieren', 'dateien einbinden', 'Contacts anzeigen lassen']
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
                subtasks: ['cloud einstellungen anpassen', 'neues initialisieren', 'login und registration mit login fertig bauen', 'login als index deklarieren']
            }
        ]
    },
    {
        id: 'done',
        name: 'Done',
        task: [
        ]
    }
];


let currentDraggedElement;


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
                content.innerHTML += /*html*/`
                <div draggable="true" ondragstart="startDragging(${task.id})" class="boardCard">
                    <p class="${task.category.class} taskCategory">${task.category.name}</p>
                    <p style="font-weight: 700;">${task.title}</p>
                    <p style="color: #A8A8A8;">${task.description}</p>
                    <div class="d_flex">
                        <div class="progress" role="progressbar" aria-label="Basic example" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-bar" style="width: 50%"></div>
                        </div>
                        <p style="padding-left: 15px; font-size: 12px;">1/2 Subtasks</p>
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
