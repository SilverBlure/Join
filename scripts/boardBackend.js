const BASE_URL = 'https://join-a403d-default-rtdb.europe-west1.firebasedatabase.app/';

async function main() {
    loadSessionId();
    const isInitialized = await initializeTaskLists();
    if (!isInitialized) {
        console.error("Fehler beim Initialisieren der Listenstruktur. Anwendung kann nicht fortgesetzt werden.");
        return;
    }

    await getTasks(); // Aufgaben laden
    renderBoard(); // Aufgaben im Board anzeigen
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





async function initializeTaskLists() {
    try {
        // Prüfen, ob die Listenstruktur bereits existiert
        let response = await fetch(BASE_URL + "data/user/" + ID + "/user/tasks.json");
        if (response.ok) {
            let data = await response.json();
            if (data) {
                console.log("Bestehende Listenstruktur gefunden:", data);
                return true; // Listenstruktur vorhanden, keine Initialisierung notwendig
            }
        }

        // Standard-Listen definieren, wenn keine Struktur vorhanden ist
        const defaultLists = {
            todo: { name: "To Do", task: [] },
            inProgress: { name: "In Progress", task: [] },
            awaitFeedback: { name: "Await Feedback", task: [] },
            done: { name: "Done", task: [] },
        };

        // Standard-Listenstruktur hochladen
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

