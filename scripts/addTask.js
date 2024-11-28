const BASE_URL = 'https://join-a403d-default-rtdb.europe-west1.firebasedatabase.app/';
let tempPriority = null;



async function main() {
    loadSessionId(); 
    const isInitialized = await initializeTaskLists();
    if (!isInitialized) {
        console.error("Fehler beim Initialisieren der Listenstruktur. Anwendung kann nicht fortgesetzt werden.");
        return;
    }
    await getTasks();
}



function loadSessionId() {
    ID = localStorage.getItem('sessionKey');
}



async function getTasks() {
    try {
        const url = BASE_URL + `data/user/${ID}/user/tasks.json`;
        console.log("Lade Aufgaben von:", url);

        let response = await fetch(url);
        if (!response.ok) {
            console.error(`Fehler beim Abrufen der Aufgaben: ${response.status} - ${response.statusText}`);
            return;
        }

        let data = await response.json();
        if (!data) {
            console.warn("Keine Aufgaben gefunden.");
            return;
        }

        // Aufgaben in ein einheitliches Format bringen
        tasks = Object.keys(data).map(listKey => {
            const list = data[listKey]; // Zugriff auf die Liste
            const tasksInList = list.task ? Object.keys(list.task).map(taskKey => {
                const task = list.task[taskKey];

                return {
                    id: taskKey,
                    title: task.title || "No Title",
                    description: task.description || "No Description",
                    dueDate: task.dueDate || "No Date",
                    priority: task.priority || "Low",
                    category: task.category || { name: "Uncategorized", class: "defaultCategory" },
                    workers: task.workers || [], // Arbeiter als Array
                    subtasks: task.subtasks || {}, // Subtasks als Objekt
                };
            }) : [];

            return {
                id: listKey,
                name: list.name || listKey, // Standardname setzen, falls `name` fehlt
                task: tasksInList,
            };
        });

        console.log("Aufgaben erfolgreich geladen:", tasks);
    } catch (error) {
        console.error("Fehler beim Abrufen der Aufgaben:", error);
    }
}


async function addTaskToToDoList(event) {
    event.preventDefault();

    // Eingabewerte abrufen
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const dueDate = document.getElementById("date").value;
    const priority = tempPriority;
    const workersInput = document.getElementById("contactSelection").value;
    const category = document.getElementById("category").value;
    const subtasksInput = document.getElementById("subtasksInput").value;

    // Subtasks als Objekte mit eindeutigen IDs definieren
    const subtasks = subtasksInput
    ? subtasksInput.split(",").reduce((obj, todo, index) => {
        obj[`subtask_${index}`] = { title: todo.trim(), done: false };
        return obj;
    }, {})
    : {};

    // Workers als Objekte mit name und class definieren
    const workers = workersInput
        ? workersInput.split(",").map((worker, index) => ({
            name: worker.trim(),
            class: `worker-${index}`,
        }))
        : [];

    if (!priority) {
        console.warn("Keine Priorität ausgewählt.");
        return;
    }

    try {
        // Aufgabe zur ToDo-Liste hinzufügen
        const result = await addTaskToList(
            title,
            description,
            dueDate,
            priority,
            workers,
            category,
            subtasks
        );
        if (result) {
            console.log("Task erfolgreich hinzugefügt:", result);
            await getTasks();
            document.getElementById("addTaskFormTask").reset();
            tempPriority = null;
        } else {
            console.error("Task konnte nicht hinzugefügt werden.");
        }
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Tasks:", error);
    }
}

async function addTaskToList(title, description, dueDate, priority, workers, category, subtasks) {
    try {
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/todo/task.json`;

        // Sicherstellen, dass die Liste 'todo' existiert
        let response = await fetch(taskUrl);
        if (!response.ok) {
            console.warn("Liste 'todo' existiert nicht. Initialisiere sie erneut.");
            await initializeTaskLists();
        }

        // Task-Daten definieren
        const newTask = {
            title: title,
            description: description,
            dueDate: dueDate,
            priority: priority,
            workers: workers, // Bereits formatierte Objekte
            category: { name: category, class: `category${category.replace(' ', '')}` },
            subtasks: subtasks, // Subtasks als Objekt
        };

        // Task in die Datenbank speichern
        let postResponse = await fetch(taskUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTask),
        });

        if (postResponse.ok) {
            let responseData = await postResponse.json();
            console.log("Task erfolgreich hinzugefügt:", responseData);
            return responseData;
        } else {
            let errorText = await postResponse.text();
            console.error("Fehler beim Hinzufügen des Tasks:", postResponse.status, errorText);
            return null;
        }
    } catch (error) {
        console.error("Ein Fehler ist beim Hinzufügen des Tasks aufgetreten:", error);
        return null;
    }
}

async function initializeTaskLists() {
    try {
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks.json`;

        // Prüfen, ob die Listenstruktur bereits existiert
        let response = await fetch(taskUrl);
        if (response.ok) {
            let data = await response.json();
            if (data) {
                console.log("Bestehende Listenstruktur gefunden:", data);
                return true;
            }
        }

        // Standard-Listen definieren
        const defaultLists = {
            todo: { name: "To Do", task: {} },
            inProgress: { name: "In Progress", task: {} },
            awaitFeedback: { name: "Await Feedback", task: {} },
            done: { name: "Done", task: {} },
        };

        // Standard-Listen hochladen
        let initResponse = await fetch(taskUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(defaultLists),
        });

        if (initResponse.ok) {
            console.log("Listenstruktur erfolgreich initialisiert.");
            return true;
        } else {
            let errorText = await initResponse.text();
            console.error("Fehler beim Initialisieren der Listen:", initResponse.status, errorText);
            return false;
        }
    } catch (error) {
        console.error("Ein Fehler ist beim Initialisieren aufgetreten:", error);
        return false;
    }
}




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



