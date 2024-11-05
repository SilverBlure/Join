let tasks = [
    {
        id: 'todo',
        name: 'To Do',
        task: [
            {
                id: 1, title: 'Gießen', description: '300ml Wasser gießen',
                worker: 'Stanislav Levin, Ozan Orhan', due_Date: '31.11.2024',
                priority: '<img src="../assets/icons/png/prioritySymbolsMiddle.png">',
                category: 'Technical Task', 
                subtasks: ['kleiner schritt 1', 'kleiner schritt 2', 'kleiner schritt 3', 'kleiner schritt 4']
            },
            {
                id: 2, title: 'coden', description: 'Join coden',
                worker: 'Stanislav Levin, Kevin Fischer', due_Date: '31.11.2024',
                priority: '<img src="../assets/icons/png/prioritySymbolsLow.png">',
                category: 'Technical Task', 
                subtasks: ['kleiner schritt 5', 'kleiner schritt 6', 'kleiner schritt 7', 'kleiner schritt 8']
            }
        ]
    },
    {
        id: 'inProgress',
        name: 'In Progress',
        task: [
            {
                id: 3, title: 'kochen', description: 'braten machen',
                worker: 'Stanislav Levin, Nicolai Österle', due_Date: '31.11.2024',
                priority: '../assets/icons/png/prioritySymbolsUrgent.png',
                category: 'Technical Task', 
                subtasks: ['kleiner schritt 9', 'kleiner schritt 10', 'kleiner schritt 11', 'kleiner schritt 12']
            },
            {
                id: 4, title: 'essen', description: 'genug nährstoffe aufnehmen',
                worker: 'Stanislav Levin, Ozan Orhan', due_Date: '31.11.2024',
                priority: '../assets/icons/png/prioritySymbolsMiddle.png',
                category: 'Technical Task', 
                subtasks: ['kleiner schritt 13', 'kleiner schritt 14', 'kleiner schritt 15', 'kleiner schritt 16']
            }]
    },
    {
        id: 'awaitFeedback',
        name: 'Await feedback',
        task: [
            {
                id: 5, title: 'trainieren', description: 'physis und psyche auslasten',
                worker: 'Stanislav Levin, Kevin Fischer', due_Date: '31.11.2024',
                priority: '../assets/icons/png/prioritySymbolsMiddle.png',
                category: 'Technical Task', 
                subtasks: ['kleiner schritt 17', 'kleiner schritt 18', 'kleiner schritt 19', 'kleiner schritt 20']
            },
            {
                id: 6, title: 'einkaufen', description: 'kein Müll als nahrung',
                worker: 'Stanislav Levin, Nicolai Österle', due_Date: '31.11.2024',
                priority: '../assets/icons/png/prioritySymbolsLow.png',
                category: 'Technical Task', 
                subtasks: ['kleiner schritt 21', 'kleiner schritt 22', 'kleiner schritt 23', 'kleiner schritt 24']
            }]
    },
    {
        id: 'done',
        name: 'Done',
        task: [
            {
                id: 7, title: 'schlafen', description: 'ausreichend schlafen',
                worker: 'Stanislav Levin, Ozan Orhan', due_Date: '31.11.2024',
                priority: '../assets/icons/png/prioritySymbolsUrgent.png',
                category: 'Technical Task', 
                subtasks: ['kleiner schritt 25', 'kleiner schritt 26', 'kleiner schritt 27', 'kleiner schritt 28']
            },
            {
                id: 8, title: 'backen', description: 'Infused Brownies backen',
                worker: 'Stanislav Levin, Kevin Fischer', due_Date: '31.11.2024',
                priority: '../assets/icons/png/prioritySymbolsMiddle.png',
                category: 'Technical Task', 
                subtasks: ['kleiner schritt 29', 'kleiner schritt 30', 'kleiner schritt 31', 'kleiner schritt 32']
            }]
    }
];


function renderSummary() {
    tasks.forEach(list => {
        const content = document.getElementById(`${list.id}List`);
        if (!content) return;
        list.task.forEach(task => {
            content.innerHTML += /*html*/`
                <div class="boardCard">
                    <p style="background-color: blue;" class="taskCategory">${task.category}</p>
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
                            <p style="background-color: green;" class="workerEmblem">${task.worker.charAt(0)}</p>
                        </div>
                        <img class="priority" src="${task.priority}"> <!-- Hier wird der Pfad verwendet -->
                    </div>
                </div>
            `;
        });
    });
}
