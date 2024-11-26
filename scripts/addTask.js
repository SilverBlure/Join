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
        const url = BASE_URL + "data/user/" + ID + "/user/tasks.json";
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
        tasks = Object.keys(data).map(key => ({
            id: key,
            name: data[key].name,
            task: data[key].task || [],
        }));
        console.log("Aufgaben erfolgreich geladen:", tasks);
    } catch (error) {
        console.error("Fehler beim Abrufen der Aufgaben:", error);
    }
}



async function addTaskToToDoList(event) {
    event.preventDefault(); 
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const dueDate = document.getElementById("date").value;
    const priority = tempPriority;
    const workers = document.getElementById("contactSelection").value;
    const category = document.getElementById("category").value;
    const subtasksInput = document.getElementById("subtasksInput").value;
    const subtasks = subtasksInput ? subtasksInput.split(",").map(todo => ({ todo: todo.trim() })) : [];
    if (!priority) {
        console.warn("Keine Priorität ausgewählt.");
        return;
    }
    try {
        const result = await addTaskToList(title, description, dueDate, priority, workers, category, subtasks);
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



async function initializeTaskLists() {
    try {
        let response = await fetch(BASE_URL + "data/user/" + ID + "/user/tasks.json");
        if (response.ok) {
            let data = await response.json();
            if (data) {
                console.log("Bestehende Listenstruktur gefunden:", data);
                return true; 
            }
        }
        const defaultLists = {
            toDo: { name: "To Do", task: [] },
            inProgress: { name: "In Progress", task: [] },
            awaitFeedback: { name: "Await Feedback", task: [] },
            done: { name: "Done", task: [] },
        };
        let initResponse = await fetch(BASE_URL + "data/user/" + ID + "/user/tasks.json", {
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



async function addTaskToList(title, description, dueDate, priority, workers, category, subtasks) {
    try {
        const newTask = {
            title: title,
            description: description,
            dueDate: dueDate,
            priority: priority,
            workers: [workers], 
            category: { name: category, class: `category${category.replace(' ', '')}` },
            subtasks: Array.isArray(subtasks) ? subtasks : [subtasks],
        };
        let response = await fetch(BASE_URL + "data/user/" + ID + "/user/tasks/toDo/task.json", {
            method: "POST", 
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTask),
        });
        if (response.ok) {
            let responseData = await response.json();
            console.log("Task erfolgreich hinzugefügt:", responseData);
            return responseData;
        } else {
            let errorText = await response.text();
            console.error("Fehler beim Hinzufügen des Tasks:", response.status, errorText);
            return null;
        }
    } catch (error) {
        console.error("Ein Fehler ist beim Hinzufügen des Tasks aufgetreten:", error);
        return null;
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



function addNewSubtask(taskId) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId);
    const newSubtaskInput = document.getElementById('newSubtaskInput');
    if (task && newSubtaskInput && newSubtaskInput.value.trim() !== '') {
        task.subtasks.push({ todo: newSubtaskInput.value.trim() });
        newSubtaskInput.value = '';
        console.log(`Subtask zu Task ${taskId} hinzugefügt.`);
    } else {
        console.error('Fehler beim Hinzufügen der Subtask oder Eingabe ist leer.');
    }
}
