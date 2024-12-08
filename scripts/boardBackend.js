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
                    subtasks: taskValue.subtasks || {}, // Standardisiere Subtasks
                };
                return taskAcc;
            }, {}),
        };
        return acc;
    }, {});
}


/**
 * Generalized function to send a POST request.
 * @param {string} url - The endpoint to send the request to.
 * @param {Object} data - The data to be sent in the request body.
 * @returns {Promise<Object|null>} - The response JSON or null if the request fails.
 */
async function postData(url, data) {
    try {
        console.log("Sending data to URL:", url);
        console.log("Payload:", data); // Debugging log
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            console.error("Failed POST request:", response.statusText);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Error during POST request:", error);
        return null;
    }
}

/**
 * Function to add a task to a specific list.
 * @param {string} listId - The ID of the list to add the task to.
 * @param {Object} taskDetails - The task details to add.
 * @returns {Promise<Object|null>} - The response JSON or null if the operation fails.
 */
async function addTaskToList(listId, taskDetails) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task.json`;
    showSnackbar("Adding task");
    renderBoard();
    closeAddTaskPopup();
    return await postData(url, taskDetails);
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
        resetForm(); 
        showSnackbar('Der Task wurde erfolgreich aktualisiert!');
        closeEditTaskPopup(); 
        openTaskPopup(taskId, listId);
    } catch (error) {
        showSnackbar('Fehler beim aktualisieren der Daten!');
        console.error(error);
    }
}



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