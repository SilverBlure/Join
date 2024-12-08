/**
 * Initialisiert die Anwendung, lädt die Session-ID, Task-Listen, Aufgaben und Kontakte, und rendert das Board.
 */
async function main() {
    loadSessionId();
    const isInitialized = await initializeTaskLists();
    if (!isInitialized) {
        return;
    }
    await getTasks();
    getContacts();
    renderBoard();
}

/**
 * Lädt die Session-ID aus dem lokalen Speicher.
 */
function loadSessionId() {
    ID = localStorage.getItem('sessionKey');
    if (!ID) console.error("Session-ID nicht gefunden. Der Benutzer ist möglicherweise nicht eingeloggt.");
}

/**
 * Initialisiert die Task-Listen, falls diese noch nicht existieren.
 * @returns {boolean} - Gibt true zurück, wenn die Listen erfolgreich initialisiert wurden.
 */
async function initializeTaskLists() {
    const url = `${BASE_URL}data/user/${ID}/user/tasks.json`;
    const response = await fetch(url);
    if (response.ok) {
        const data = await response.json();
        if (data) return true;
    }
    const defaultLists = {
        todo: { name: "To Do", task: {} },
        inProgress: { name: "In Progress", task: {} },
        awaitFeedback: { name: "Await Feedback", task: {} },
        done: { name: "Done", task: {} },
    };
    const initResponse = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultLists),
    });
    return initResponse.ok;
}

/**
 * Holt die Aufgaben aus der Datenbank und speichert sie in der globalen Variable `tasks`.
 */
async function getTasks() {
    const url = `${BASE_URL}data/user/${ID}/user/tasks.json`;
    const response = await fetch(url);
    if (!response.ok) {
        return;
    }
    const data = await response.json();
    tasks = Object.entries(data || {}).reduce((acc, [listKey, listValue]) => {
        acc[listKey] = {
            id: listKey,
            name: listValue.name || listKey,
            task: Object.entries(listValue.task || {}).reduce((taskAcc, [taskId, taskValue]) => {
                taskAcc[taskId] = {
                    ...taskValue,
                    subtasks: taskValue.subtasks || {}, // Standardisiert die Subtasks.
                };
                return taskAcc;
            }, {}),
        };
        return acc;
    }, {});
}

/**
 * Allgemeine Funktion zum Senden einer POST-Anfrage.
 * @param {string} url - Die Ziel-URL für die Anfrage.
 * @param {Object} data - Die zu sendenden Daten im Request-Body.
 * @returns {Promise<Object|null>} - Die Antwortdaten als JSON oder null bei einem Fehler.
 */
async function postData(url, data) {
    try {
        console.log("Sende Daten an URL:", url);
        console.log("Payload:", data); // Debugging-Log.
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            console.error("POST-Anfrage fehlgeschlagen:", response.statusText);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Fehler während der POST-Anfrage:", error);
        return null;
    }
}

/**
 * Fügt eine Aufgabe einer bestimmten Liste hinzu.
 * @param {string} listId - Die ID der Liste, zu der die Aufgabe hinzugefügt werden soll.
 * @param {Object} taskDetails - Die Details der hinzuzufügenden Aufgabe.
 * @returns {Promise<Object|null>} - Die Antwortdaten als JSON oder null bei einem Fehler.
 */
async function addTaskToList(listId, taskDetails) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task.json`;
    showSnackbar("Task wird hinzugefügt");
    renderBoard();
    closeAddTaskPopup();
    return await postData(url, taskDetails);
}

/**
 * Speichert die Änderungen einer bestehenden Aufgabe.
 * @param {Event} event - Das Formular-Event.
 * @param {string} listId - Die ID der Liste, zu der die Aufgabe gehört.
 * @param {string} taskId - Die ID der zu ändernden Aufgabe.
 */
async function saveTaskChanges(event, listId, taskId) {
    event.preventDefault();
    if (!listId || !taskId) return;
    if (!window.localEditedSubtasks) window.localEditedSubtasks = {};
    Object.values(window.localEditedSubtasks).forEach(subtask => {
        subtask.done = false;
    });
    const workers = (window.localEditedContacts || []).map(contact => ({
        name: contact.name,
    }));
    const updatedTask = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim() || "No description provided",
        dueDate: document.getElementById("dueDate").value || null,
        priority: tempPriority || "Low",
        category: {
            name: document.getElementById("category").value.trim() || "Uncategorized",
            class: `category${(document.getElementById("category").value || "Uncategorized").replace(/\s/g, "")}`,
        },
        workers,
        subtasks: { ...window.localEditedSubtasks },
    };
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedTask),
        });
        if (!response.ok) return;
        await getTasks();
        resetForm();
        showSnackbar('Der Task wurde erfolgreich aktualisiert!');
        closeEditTaskPopup();
        openTaskPopup(taskId, listId);
    } catch (error) {
        showSnackbar('Fehler beim Aktualisieren der Daten!');
        console.error(error);
    }
}

/**
 * Löscht eine Aufgabe aus einer bestimmten Liste.
 * @param {string} listId - Die ID der Liste, aus der die Aufgabe entfernt werden soll.
 * @param {string} taskId - Die ID der zu löschenden Aufgabe.
 */
async function deleteTask(listId, taskId) {
    const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    const response = await fetch(taskUrl, {
        method: "DELETE",
    });
    if (!response.ok) {
        return;
    }
    showSnackbar('Der Task wurde erfolgreich gelöscht!');
    await getTasks();
    renderBoard();
    closeTaskPopup();
}
