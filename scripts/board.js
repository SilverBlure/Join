let taskIdCounter = 1;
let currentListId = null; 
let tempPriority = null;



function handleSubtaskKey(event) {
    if (event.key === "Enter") {
        event.preventDefault(); 
        addNewSubtask(); 
    }
}



async function deleteSubtask(listId, taskId, subtaskId) {
    if (window.localEditedSubtasks?.[subtaskId]) {
        delete window.localEditedSubtasks[subtaskId];
        document.getElementById(`subtask-${taskId}-${subtaskId}`)?.remove();
        return;
    }
    try {
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
        const response = await fetch(taskUrl);
        if (!response.ok) return;
        const task = await response.json();
        if (!task?.subtasks?.[subtaskId]) return;
        delete task.subtasks[subtaskId];
        const updateResponse = await fetch(taskUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });
        if (!updateResponse.ok) return;
        document.getElementById(`subtask-${taskId}-${subtaskId}`)?.remove();
        await getTasks();
        renderBoard();
    } catch {
        // Kein Error Logging im optimierten Code
    }
}



async function saveSubtaskEdit(taskId, subtaskId, newTitle) {
    if (!newTitle?.trim() || !currentListId) return;
    const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${currentListId}/task/${taskId}.json`;
    try {
        const response = await fetch(taskUrl);
        if (!response.ok) return;
        const task = await response.json();
        if (!task?.subtasks?.[subtaskId]) return;
        task.subtasks[subtaskId].title = newTitle.trim();
        task.subtasks[subtaskId].done = false;
        const updateResponse = await fetch(taskUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });
        if (!updateResponse.ok) return;
        await openTaskPopup(taskId, currentListId);
    } catch {
        // Fehlerbehandlung optional
    }
}



function deleteSubtaskFromLocal(subtaskId) {
    if (!subtaskId) return;
    if (window.localEditedSubtasks && window.localEditedSubtasks[subtaskId]) {
        delete window.localEditedSubtasks[subtaskId];
    }
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (subtaskElement) {
        subtaskElement.remove();
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




function closeEditTaskPopup() {
    const overlay = document.getElementById("editTaskPopupOverlay");
    const mainContent = document.getElementById("mainContent");
    if (overlay) overlay.classList.remove("visible");
    if (mainContent) mainContent.classList.remove("blur");
    tempPriority = null;
}



function openAddTaskPopup(listId) {
    const popup = document.getElementById('addTaskPopupOverlay');
    if (!popup) {
        console.error("Popup konnte nicht gefunden werden.");
        return;
    }
    currentListId = listId; 
    const form = document.getElementById("addTaskFormTask");
    const newForm = form.cloneNode(true); 
    form.parentNode.replaceChild(newForm, form); 
    newForm.addEventListener("submit", (event) => addTaskToSpecificList(listId, event));
    popup.classList.remove('hidden'); 
}



function closeAddTaskPopup() {
    const popup = document.getElementById('addTaskPopupOverlay');
    const mainContent = document.getElementById('mainContent');
    if (popup) {
        popup.classList.add('hidden');
    }
    if (mainContent) {
        mainContent.classList.remove('blur');
    }
}


async function addTaskToList(listId, title, description, dueDate, priority, workers, category, subtasks) {
    if (!subtasks || typeof subtasks !== "object") return null;
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task.json`;
    const newTask = {
        title,
        description,
        dueDate,
        priority,
        workers: workers.map(worker => ({ name: worker })), 
        category: { name: category, class: `category${category.replace(" ", "")}` },
        subtasks,
    };
    try {
        const postResponse = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask),
        });
        if (!postResponse.ok) return null;
        return await postResponse.json();
    } catch {
        return null;
    }
}


async function addTaskToSpecificList(listId, event) {
    event.preventDefault();
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const dueDate = document.getElementById("date").value.trim();
    const priority = tempPriority;
    const category = document.getElementById("category").value.trim();
    if (!priority || !listId || !title || !dueDate || !category) return;
    const subtasks = { ...window.localSubtasks };
    const workersArray = window.localEditedContacts || [];
    const result = await addTaskToList(listId, title, description, dueDate, priority, workersArray, category, subtasks);
    if (result) {
        window.localSubtasks = {}; 
        window.localEditedContacts = []; 
        document.getElementById("addTaskFormTask").reset(); 
        tempPriority = null; 
        showSnackbar('Der Task wurde erfolgreich erstellt!');
        resetForm();
        closeAddTaskPopup(); 
        await getTasks();
        renderBoard(); 
    }
}



function resetForm() {
    const form = document.getElementById("addTaskFormTask");
    if (form) {
        form.reset(); 
    }
    window.localSubtasks = {}; 
    const subTasksList = document.getElementById("subTasksList");
    if (subTasksList) {
        subTasksList.innerHTML = ""; 
    }
    window.localEditedContacts = [];
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (selectedContactsList) {
        selectedContactsList.innerHTML = ""; 
    }
    const priorityButtons = document.querySelectorAll(".priorityBtn.active");
    priorityButtons.forEach(button => button.classList.remove("active"));
    tempPriority = null; 
}



function closeTaskPopup() {
    document.getElementById("viewTaskPopupOverlay").classList.remove("visible");
    document.getElementById("mainContent").classList.remove("blur");
}



function addTaskToTodo() {
    openAddTaskPopup('todo');
}



function addTaskToInProgress() {
    openAddTaskPopup('inProgress');
}



function addTaskToAwaitFeedback() {
    openAddTaskPopup('awaitFeedback');
}

