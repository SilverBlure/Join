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
    event.preventDefault(); // Verhindert die Standard-Aktion des Formulars

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const dueDate = document.getElementById("date").value.trim();
    const priority = tempPriority;
    const categoryName = document.getElementById("category").value.trim(); // Kategorie-Name abrufen
    const workersInput = document.getElementById("contactSelection").value;

    // Validierung der Pflichtfelder
    if (!title || !dueDate || !priority || !categoryName) {
        console.error("Pflichtfelder sind nicht vollständig ausgefüllt.");
        return;
    }

    // Subtasks aus der lokalen Liste
    const subtasks = getLocalSubtasks(); // Holt die gesammelten Subtasks

    // Arbeiter-Array erstellen
    const workers = workersInput
        ? workersInput.split(",").map(worker => ({
              name: worker.trim(),
              class: `worker-${worker.trim().toLowerCase()}`,
          }))
        : [];

    // Kategorie-Objekt erstellen
    const category = {
        name: categoryName,
        class: `category${categoryName.replace(/\s/g, "")}`, // Klasse basierend auf dem Namen
    };

    // Neues Task-Objekt vorbereiten
    const newTask = {
        title,
        description,
        dueDate,
        priority,
        category, // Kategorie als Objekt hinzufügen
        workers,
        subtasks, // Subtasks aus der lokalen Liste hinzufügen
    };

    try {
        // Task in Firebase speichern
        const result = await addTaskToList(newTask);

        if (result) {
            console.log("Task erfolgreich hinzugefügt:", result);
            document.getElementById("addTaskFormTask").reset(); // Formular zurücksetzen
            clearLocalSubtasks(); // Subtask-Liste zurücksetzen
            tempPriority = null; // Priorität zurücksetzen
        } else {
            console.error("Task konnte nicht hinzugefügt werden.");
        }
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Tasks:", error);
    }
}


function getLocalSubtasks() {
    if (!window.localSubtasks || Object.keys(window.localSubtasks).length === 0) {
        console.warn("Keine Subtasks in der lokalen Liste gefunden.");
        return {}; // Gibt ein leeres Objekt zurück, wenn keine Subtasks vorhanden sind
    }
    console.log("Subtasks aus lokaler Liste:", window.localSubtasks);
    return { ...window.localSubtasks }; // Gibt eine Kopie der Subtasks zurück
}



function clearLocalSubtasks() {
    window.localSubtasks = {}; // Löscht die Subtasks
    const subTasksList = document.getElementById("subTasksList");
    if (subTasksList) {
        subTasksList.innerHTML = ""; // Subtasks aus dem DOM entfernen
    }
}




async function addTaskToList(task) {
    try {
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/todo/task.json`;

        // Sicherstellen, dass die Liste existiert
        const response = await fetch(taskUrl);
        if (!response.ok) {
            console.warn("Liste 'todo' existiert nicht. Initialisiere sie erneut.");
            await initializeTaskLists();
        }

        // Task speichern
        const postResponse = await fetch(taskUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task), // Direkt das Task-Objekt senden
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


 function addNewSubtask() {
    const subTaskInput = document.getElementById("subTaskInputAddTask");
    const subTasksList = document.getElementById("subTasksList");

    if (!subTaskInput || !subTasksList) {
        console.error("Subtask-Input oder Subtasks-Liste nicht gefunden.");
        return;
    }

    const subtaskTitle = subTaskInput.value.trim();
    if (!subtaskTitle) {
        console.warn("Subtask-Titel darf nicht leer sein.");
        return;
    }

    if (!window.localSubtasks) {
        window.localSubtasks = {}; // Initialisiere die lokale Liste
    }

    const subtaskId = `subtask_${Date.now()}`; // Eindeutige ID generieren
    const subtaskItem = {
        title: subtaskTitle,
        done: false, // Subtask ist standardmäßig "nicht erledigt"
    };

    // Subtask zur lokalen Liste hinzufügen
    window.localSubtasks[subtaskId] = subtaskItem;

    // Subtask ins DOM hinzufügen
    const subtaskHTML = `
        <div class="subtask-item" id="${subtaskId}">
            <input 
                type="checkbox" 
                onchange="toggleLocalSubtaskStatus('${subtaskId}', this.checked)">
            <p class="subtaskText" onclick="editLocalSubtask('${subtaskId}')">
                ${subtaskTitle}
            </p>
            <img 
                class="hoverBtn" 
                src="../../assets/icons/png/iconoir_cancel.png" 
                onclick="removeSubtaskFromList('${subtaskId}')"
                alt="Remove Subtask">
        </div>
    `;
    subTasksList.insertAdjacentHTML("beforeend", subtaskHTML);

    // Input-Feld leeren
    subTaskInput.value = "";

    console.log(`Subtask "${subtaskTitle}" hinzugefügt.`, window.localSubtasks);
}
