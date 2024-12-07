let tasks = {};



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



function loadSessionId() {
    ID = localStorage.getItem('sessionKey');
    if (!ID) console.error("Session ID not found. The user might not be logged in.");
}



async function initializeTaskLists() {
    try {
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
    } catch (error) {
        return false;
    }
}



async function getTasks() {
    try {
        const url = `${BASE_URL}data/user/${ID}/user/tasks.json`;
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching tasks: ${response.status} - ${response.statusText}`);
            return;
        }
        const data = await response.json();
        console.log("Rohdaten von Firebase:", data);
        tasks = Object.entries(data || {}).reduce((acc, [listKey, listValue]) => {
            acc[listKey] = {
                id: listKey,
                name: listValue.name || listKey,
                task: Object.entries(listValue.task || {}).reduce((taskAcc, [taskId, taskValue]) => {
                    taskAcc[taskId] = {
                        ...taskValue,
                        subtasks: taskValue.subtasks || {}, // Standardisiere Subtasks
                    };
                    return taskAcc;
                }, {}),
            };
            return acc;
        }, {});
        console.log("Verarbeitete Tasks:", tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}



async function addTaskToList(listId, taskDetails) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task.json`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskDetails),
        });
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        return null;
    }
}


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
        showSnackbar('Der Task wurde erfolgreich aktualisiert!');
        renderBoard();
        closeEditTaskPopup();
        openTaskPopup(taskId, listId);
    } catch {
        showSnackbar('Fehler beim aktuallisieren der Daten!');
    }
}


async function deleteTask(listId, taskId) {
    if (!listId || !taskId) {
        console.error("Fehlende Parameter für deleteTask:", { listId, taskId });
        return;
    }
    try {
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
        console.log("DELETE-URL:", taskUrl);

        const response = await fetch(taskUrl, {
            method: "DELETE",
        });

        if (!response.ok) {
            console.error("Fehler beim Löschen der Aufgabe:", response.status, response.statusText);
            return;
        }

        console.log("Task erfolgreich gelöscht:", taskId);
        showSnackbar('Der Task wurde erfolgreich gelöscht!');

        console.log("Aufgaben werden nach Löschung neu geladen...");
        await getTasks();
        console.log("Aufgaben erfolgreich neu geladen.");

        renderBoard();
        console.log("Board erfolgreich neu gerendert.");

        closeTaskPopup();
        console.log("Popup erfolgreich geschlossen.");
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}




