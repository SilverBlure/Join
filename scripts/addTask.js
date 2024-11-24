// Beispielbenutzerstruktur
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

// Aktueller Benutzer
let currentUser = users.find(user => user.id === '1');

// Standardmäßig auf "To-Do"-Liste setzen
let currentListId = 'todo';

/**
 * Task zu einer Liste hinzufügen
 */
function addTaskToList(event) {
    if (event) event.preventDefault();

    // Überprüfen, ob ein Benutzer angemeldet ist
    if (!currentUser) {
        console.error('Kein Benutzer ist angemeldet!');
        return;
    }

    // Aufgabenliste finden
    const targetList = currentUser.tasks.find(list => list.id === currentListId);
    if (!targetList) {
        console.error(`Liste mit ID "${currentListId}" nicht gefunden.`);
        return;
    }

    // Formulardaten erfassen
    const title = document.getElementById('title').value.trim();
    const dueDate = document.getElementById('date').value;
    const category = document.getElementById('category').value;

    // Validierung
    if (!title || !dueDate || !category) {
        alert('Alle Pflichtfelder müssen ausgefüllt werden!');
        return;
    }

    // Neues Task-Objekt erstellen
    const newTask = {
        id: Date.now(), // Automatisch generierte ID
        title: title,
        description: document.getElementById('description').value.trim(),
        workers: [{ name: 'Default Worker', class: 'worker-default' }],
        due_Date: dueDate,
        priority: tempPriority || 'Low', // Standard-Priorität verwenden
        category: { name: category, class: `category${category.replace(' ', '')}` },
        subtasks: Array.from(document.querySelectorAll('.addSubTaskInput'))
            .map(input => ({ todo: input.value.trim() }))
            .filter(st => st.todo) // Nur gültige Subtasks hinzufügen
    };

    // Task zur Ziel-Liste hinzufügen
    targetList.task.push(newTask);

    // Formular zurücksetzen
    document.getElementById('addTaskFormTask').reset();
    tempPriority = null; // Temporäre Priorität zurücksetzen

    console.log(`Task erfolgreich zu Liste "${currentListId}" hinzugefügt:`, newTask);
}

/**
 * Priorität setzen
 */
let tempPriority = null;

function setPriority(priority) {
    tempPriority = priority;
    document.querySelectorAll('.priorityBtn').forEach(btn => btn.classList.remove('active'));
    const activeButton = document.getElementById(`prio${priority}`);
    if (activeButton) {
        activeButton.classList.add('active');
    } else {
        console.warn(`Button für Priorität "${priority}" nicht gefunden.`);
    }
}

/**
 * Subtask hinzufügen
 */
function addNewSubtask(taskId) {
    if (!currentUser) {
        console.error('Kein Benutzer ist angemeldet!');
        return;
    }

    // Task finden
    const task = currentUser.tasks.flatMap(list => list.task).find(t => t.id === taskId);
    const newSubtaskInput = document.getElementById('newSubtaskInput');

    // Subtask hinzufügen
    if (task && newSubtaskInput && newSubtaskInput.value.trim() !== '') {
        task.subtasks.push({ todo: newSubtaskInput.value.trim() });
        newSubtaskInput.value = '';
        console.log(`Subtask zu Task ${taskId} hinzugefügt.`);
    } else {
        console.error("Fehler beim Hinzufügen des Subtasks oder Eingabe ist leer.");
    }
}
