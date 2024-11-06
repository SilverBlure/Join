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
                priority: '../assets/icons/png/prioritySymbolsMiddle.png',
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
                priority: '../assets/icons/png/prioritySymbolsLow.png',
                category: { name: 'Technical Task', class: 'category-technical' },
                subtasks: ['JS Datei einbinden', 'Summary Styling bearbeiten', 'auf github pushen', 'mit Team besprechen']
            }
        ]
    },
    {
        id: 'inProgress',
        name: 'In Progress',
        task: [
            {
                id: 3,
                title: 'kochen',
                description: 'braten machen',
                workers: [
                    { name: 'Stanislav Levin', class: 'worker-stanislav' },
                    { name: 'Nicolai Österle', class: 'worker-nicolai' }
                ],
                due_Date: '31.11.2024',
                priority: '../assets/icons/png/prioritySymbolsUrgent.png',
                category: { name: 'Technical Task', class: 'category-technical' },
                subtasks: ['kleiner schritt 9', 'kleiner schritt 10', 'kleiner schritt 11', 'kleiner schritt 12']
            },
            {
                id: 4,
                title: 'essen',
                description: 'genug nährstoffe aufnehmen',
                workers: [
                    { name: 'Stanislav Levin', class: 'worker-stanislav' },
                    { name: 'Ozan Orhan', class: 'worker-ozan' }
                ],
                due_Date: '31.11.2024',
                priority: '../assets/icons/png/prioritySymbolsMiddle.png',
                category: { name: 'User Story', class: 'category-user-story' },
                subtasks: ['kleiner schritt 13', 'kleiner schritt 14', 'kleiner schritt 15', 'kleiner schritt 16']
            }
        ]
    },
    {
        id: 'awaitFeedback',
        name: 'Await feedback',
        task: [
            {
                id: 5,
                title: 'trainieren',
                description: 'physis und psyche auslasten',
                workers: [
                    { name: 'Stanislav Levin', class: 'worker-stanislav' },
                    { name: 'Kevin Fischer', class: 'worker-kevin' }
                ],
                due_Date: '31.11.2024',
                priority: '../assets/icons/png/prioritySymbolsMiddle.png',
                category: { name: 'Technical Task', class: 'category-technical' },
                subtasks: ['kleiner schritt 17', 'kleiner schritt 18', 'kleiner schritt 19', 'kleiner schritt 20']
            },
            {
                id: 6,
                title: 'einkaufen',
                description: 'kein Müll als Nahrung',
                workers: [
                    { name: 'Stanislav Levin', class: 'worker-stanislav' },
                    { name: 'Nicolai Österle', class: 'worker-nicolai' }
                ],
                due_Date: '31.11.2024',
                priority: '../assets/icons/png/prioritySymbolsLow.png',
                category: { name: 'Technical Task', class: 'category-technical' },
                subtasks: ['kleiner schritt 21', 'kleiner schritt 22', 'kleiner schritt 23', 'kleiner schritt 24']
            }
        ]
    },
    {
        id: 'done',
        name: 'Done',
        task: [
            {
                id: 7,
                title: 'schlafen',
                description: 'ausreichend schlafen',
                workers: [
                    { name: 'Stanislav Levin', class: 'worker-stanislav' },
                    { name: 'Ozan Orhan', class: 'worker-ozan' }
                ],
                due_Date: '31.11.2024',
                priority: '../assets/icons/png/prioritySymbolsUrgent.png',
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
                priority: '../assets/icons/png/prioritySymbolsMiddle.png',
                category: { name: 'User Story', class: 'category-user-story' },
                subtasks: ['kleiner schritt 29', 'kleiner schritt 30', 'kleiner schritt 31', 'kleiner schritt 32']
            }
        ]
    }
];


let currentDraggedElement;

function renderSummary() {
    tasks.forEach(list => {
        const content = document.getElementById(`${list.id}List`).querySelector('.taskContainer');
        content.innerHTML = ""; // Nur den Task-Container leeren, nicht die Überschrift

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
                        <img class="priority" src="${task.priority}"> 
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
    
    // Finde die Quelle und das Ziel-Array basierend auf `currentDraggedElement` und `targetListId`
    let sourceList, task;
    tasks.forEach(list => {
        const taskIndex = list.task.findIndex(t => t.id === currentDraggedElement);
        if (taskIndex !== -1) {
            sourceList = list;
            [task] = sourceList.task.splice(taskIndex, 1); // Entferne die Aufgabe aus der Quellliste
        }
    });

    // Finde das Ziel-Array und füge die Aufgabe hinzu
    const targetList = tasks.find(list => list.id === targetListId);
    if (targetList && task) {
        targetList.task.push(task); // Füge die Aufgabe in die Zielliste ein
    }

    // Aktualisiere das Board, um die Änderungen darzustellen
    renderSummary();
}
