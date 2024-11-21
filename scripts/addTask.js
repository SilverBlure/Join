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



function addTaskToToDoList(event) {
    if (event) event.preventDefault();

    if (!currentUser) {
        console.error('Kein Benutzer ist angemeldet!');
        return;
    }

    const tasks = currentUser.tasks; 
    const todoList = tasks.find(list => list.id === 'todo'); // Statische Zuordnung zur "To-Do"-Liste
    if (!todoList) {
        console.error('To-Do-Liste nicht gefunden.');
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
        id: Date.now(), // Automatische ID
        title: title,
        description: document.getElementById('description').value.trim(),
        workers: [{ name: 'Default Worker', class: 'worker-default' }], // Beispiel-Worker
        due_Date: dueDate,
        priority: tempPriority || 'Low', // Standard-Priorität, wenn keine ausgewählt
        category: { name: category, class: `category${category.replace(' ', '')}` },
        subtasks: Array.from(document.querySelectorAll('.addSubTaskInput'))
            .map(input => ({ todo: input.value.trim() }))
            .filter(st => st.todo)
    };

    todoList.task.push(newTask); // Direkte Zuordnung zur "To-Do"-Liste
    document.getElementById('addTaskFormTask').reset();
    tempPriority = null; // Reset der temporären Priorität

    console.log('Neue Aufgabe erfolgreich zur "To-Do"-Liste hinzugefügt.');
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
        console.log(`Subtask zu Task ${taskId} hinzugefügt.`);
    } else {
        console.error("Fehler beim Hinzufügen des Subtasks oder Eingabe ist leer.");
    }
}