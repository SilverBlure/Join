let tempPriority = null;



async function main() {
    loadSessionId(); 
    const isInitialized = await initializeTaskLists();
    if (!isInitialized) {
        console.error("Fehler beim Initialisieren der Listenstruktur. Anwendung kann nicht fortgesetzt werden.");
        return;
    }
    await getTasks();
    getContacts();

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

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const dueDate = document.getElementById("date").value;
    const priority = tempPriority;
    const workersInput = document.getElementById("contactSelection").value;
    const category = document.getElementById("category").value;
    const subtasksInputElement = document.getElementById("subTaskInputAddTask");
    const subtasksInput = subtasksInputElement ? subtasksInputElement.value : "";

    // Validierung: Keine leeren Felder für notwendige Eingaben
    if (!title || !dueDate || !priority || !category) {
        console.error("Pflichtfelder sind nicht vollständig ausgefüllt.");
        return;
    }

    // Subtasks-Objekt erstellen
    const subtasks = subtasksInput
        ? subtasksInput.split(",").reduce((obj, todo, index) => {
              obj[`subtask_${index}`] = {
                  title: todo.trim(), // Titel des Subtasks
                  done: false, // Standardwert für `done`
              };
              return obj;
          }, {})
        : {};

    // Arbeiter-Array erstellen
    const workers = workersInput
        ? workersInput.split(",").map(worker => ({
              name: worker.trim(),
              class: `worker-${worker.trim().toLowerCase()}`,
          }))
        : [];

    try {
        // Task zur Firebase hinzufügen
        const result = await addTaskToList(
            title,
            description,
            dueDate,
            priority,
            workers,
            category,
            subtasks // Subtasks als korrektes Objekt übergeben
        );

        if (result) {
            console.log("Task erfolgreich hinzugefügt:", result);
            await getTasks(); // Tasks neu laden
            document.getElementById("addTaskFormTask").reset(); // Formular zurücksetzen
            tempPriority = null; // Priorität zurücksetzen
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

        // Sicherstellen, dass die Liste existiert
        const response = await fetch(taskUrl);
        if (!response.ok) {
            console.warn("Liste 'todo' existiert nicht. Initialisiere sie erneut.");
            await initializeTaskLists();
        }

        // Task-Daten definieren
        const newTask = {
            title,
            description,
            dueDate,
            priority,
            workers,
            category: { name: category, class: `category${category.replace(/\s/g, "")}` },
            subtasks, // Subtasks direkt als korrektes Objekt verwenden
        };

        // Task speichern
        const postResponse = await fetch(taskUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask),
        });

        if (!postResponse.ok) {
            const errorText = await postResponse.text();
            console.error(`Fehler beim Speichern des Tasks: ${postResponse.status}`, errorText);
            return null;
        }

        const responseData = await postResponse.json();
        console.log("Task erfolgreich gespeichert:", responseData);
        return responseData;
    } catch (error) {
        console.error("Fehler beim Speichern des Tasks:", error);
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
                return true; // Listenstruktur vorhanden, keine Initialisierung notwendig
            }
        }

        // Standard-Listen definieren
        const defaultLists = {
            todo: { name: "To Do", task: {} }, // task als Objekt
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




function renderContactsDropdown(){
    let dropDown = document.getElementById('contactSelection')
    if (dropDown.options.length > 0) return; 
     dropDown.innerHTML="";
     for (let i = 0; i < contactsArray.length; i++) {
       document.getElementById('contactSelection').innerHTML += /*html*/`
               <option value="${contactsArray[i].name}">${contactsArray[i].name}</option>;

       `
     }
 
 }
