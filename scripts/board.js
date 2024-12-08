let taskIdCounter = 1;
let currentListId = null; 
let tempPriority = null;



function openAddTaskPopup(listId) {
    refreshUIAfterPopupClose();
    const popup = document.getElementById('addTaskPopupOverlay');
    if (!popup) {
        console.error("Popup konnte nicht gefunden werden.");
        return;
    }
    resetForm();
    currentListId = listId; 
    const form = document.getElementById("addTaskFormTask");
    const newForm = form.cloneNode(true); 
    form.parentNode.replaceChild(newForm, form); 
    newForm.addEventListener("submit", (event) => addTaskToSpecificList(listId, event));
    popup.classList.remove('hidden'); 
}



function buildNewTask() {
    const task = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        dueDate: document.getElementById("date").value.trim(),
        priority: tempPriority,
        category: buildCategory(document.getElementById("category").value.trim()),
        workers: getWorkers(), 
        subtasks: getLocalSubtasks(),
    };
    return task;
}



function buildCategory(categoryName) {
    return {
        name: categoryName,
        class: `category${categoryName.replace(/\s/g, "")}`,
    };
}



function getWorkers() {    
    if (!window.localEditedContacts || !Array.isArray(window.localEditedContacts)) {
        return [];
    }
    return window.localEditedContacts
        .filter(contact => contact && typeof contact === "string") 
        .map(contact => {
            try {
                return { name: contact.trim() }; 
            } catch (error) {
                return null; 
            }
        })
        .filter(Boolean); 
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



async function addTaskToSpecificList(listId, event) {
    event.preventDefault();
    if (!validateTaskInputs()) return;
    const newTask = buildNewTask();
    try {
        const result = await addTaskToList(listId, newTask);
        if (result) {
            resetForm();
            showSnackbar("Der Task wurde erfolgreich erstellt!");
            await refreshBoard();
        }
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Tasks:", error);
    }
}



function validateTaskInputs() {
    const title = document.getElementById("title").value.trim();
    const dueDate = document.getElementById("date").value.trim();
    const priority = tempPriority;
    const categoryName = document.getElementById("category").value.trim();
    if (!title || !dueDate || !priority || !categoryName) {
        console.error("Pflichtfelder sind nicht vollständig ausgefüllt.");
        return false;
    }
    return true;
}



function resetForm() {
    resetTaskFormFields();
    resetLocalState();
}



function resetTaskFormFields() {
    const form = document.getElementById("addTaskFormTask");
    if (form) {
        form.reset();
    }
    const subTasksList = document.getElementById("subTasksList");
    if (subTasksList) {
        subTasksList.innerHTML = "";
    }
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (selectedContactsList) {
        selectedContactsList.innerHTML = "";
    }
    const priorityButtons = document.querySelectorAll(".priorityBtn.active");
    priorityButtons.forEach(button => button.classList.remove("active"));
}



function resetLocalState() {
    window.localSubtasks = {};
    window.localEditedContacts = [];
    tempPriority = null;
}



function closeEditTaskPopup() {
    resetForm();
    const overlay = document.getElementById("editTaskPopupOverlay");
    const mainContent = document.getElementById("mainContent");
    if (overlay) overlay.classList.remove("visible");
    if (mainContent) mainContent.classList.remove("blur");
    tempPriority = null;
    refreshUIAfterPopupClose();
}



async function refreshBoard() {
    await getTasks();
    renderBoard();
}



function closeTaskPopup() {
    document.getElementById("viewTaskPopupOverlay").classList.remove("visible");
    document.getElementById("mainContent").classList.remove("blur");
    refreshUIAfterPopupClose();
    location.reload();
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



function getColorHex(vorname, nachname) {
    const completeName = (vorname + nachname).toLowerCase();
    let hash = 0;
    for (let i = 0; i < completeName.length; i++) {
        hash += completeName.charCodeAt(i);
    }
    const r = (hash * 123) % 256;
    const g = (hash * 456) % 256;
    const b = (hash * 789) % 256;
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}



function getInitials(fullName) {
    if (!fullName || typeof fullName !== "string") {
        console.warn("Invalid fullName provided for initials:", fullName);
        return ""; 
    }
    const nameParts = fullName.trim().split(" ");
    return `${nameParts[0]?.charAt(0).toUpperCase() || ""}${nameParts[1]?.charAt(0).toUpperCase() || ""}`;
}



function findTask() {
    const searchTerm = getSearchTerm();
    const allTaskContainers = document.querySelectorAll('.taskContainer');
    allTaskContainers.forEach(container => processTaskContainer(container, searchTerm));
    restoreEmptyListHints(allTaskContainers, searchTerm);
}



function restoreEmptyListHints(allTaskContainers, searchTerm) {
    if (searchTerm !== '') return; // Nur wenn das Suchfeld leer ist
    allTaskContainers.forEach(container => {
        const taskCards = container.querySelectorAll('.boardCard');
        const hasTasks = Array.from(taskCards).some(card => card.style.display !== 'none');
        if (!hasTasks) {
            const nothingToDo = container.querySelector('.nothingToDo');
            if (!nothingToDo) {
                container.innerHTML += /*html*/`
                    <div class="nothingToDo">
                        <p class="nothingToDoText">No tasks to do</p>
                    </div>
                `;
            }
        }
    });
}



function toggleNoMatchingMessage(container, hasMatchingTask, searchTerm) {
    const nothingToDo = container.querySelector('.nothingToDo');
    if (searchTerm === '' && container.querySelectorAll('.boardCard').length === 0) {
        if (!nothingToDo) {
            container.innerHTML += generateNoMatchingMessageHTML('No tasks available in this list');
        }
    } else if (searchTerm !== '' && !hasMatchingTask) {
        if (!nothingToDo) {
            container.innerHTML += generateNoMatchingMessageHTML('No matching tasks found');
        }
    } else if (nothingToDo) {
        nothingToDo.remove();
    }
}



function getSearchTerm() {
    return document.getElementById('findTask').value.trim().toLowerCase();
}



function processTaskContainer(container, searchTerm) {
    const taskCards = container.querySelectorAll('.boardCard');
    let hasMatchingTask = false;
    taskCards.forEach(card => {
        const title = card.querySelector('.taskCardTitle')?.textContent.toLowerCase() || '';
        const description = card.querySelector('.taskCardDescription')?.textContent.toLowerCase() || '';
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = ''; // Zeige passende Karte
            hasMatchingTask = true;
        } else {
            card.style.display = 'none'; // Verstecke nicht passende Karte
        }
    });
    toggleNoMatchingMessage(container, hasMatchingTask, searchTerm);
}



async function toggleSubtaskStatus(listId, taskId, subtaskId, isChecked) {
    try {
        const task = await fetchTask(listId, taskId);
        task.subtasks[subtaskId].done = isChecked;
        const isUpdated = await updateTask(listId, taskId, task);
        if (isUpdated) {
            showSnackbar("Subtask erfolgreich aktualisiert!");
            await updateSingleTaskElement(listId, taskId, task);
            await openTaskPopup(taskId, listId);
        } else {
            showSnackbar("Fehler beim Aktualisieren des Subtasks!");
        }
    } catch (error) {
        console.error("Fehler beim Umschalten des Subtask-Status:", error);
    }
}



async function fetchTask(listId, taskId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    const response = await fetch(url);
    if (response.ok) return await response.json();
    return null;
}



async function updateTask(listId, taskId, task) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
    });
    return response.ok;
}



async function updateSingleTaskElement(listId, taskId, updatedTask) {
    const taskElement = document.getElementById(`boardCard-${taskId}`);
    if (!taskElement) {
        return;
    }
    const progressHTML = generateProgressHTML(updatedTask.subtasks);
    const workersHTML = generateWorkersHTML(updatedTask.workers);
    const newTaskHTML = generateTaskCardHTML(taskId, updatedTask, listId, progressHTML, workersHTML);
    taskElement.outerHTML = newTaskHTML;
}



function refreshUIAfterPopupClose() {
    resetForm(); // Setzt das Formular und die lokalen Zustände zurück
    renderBoard(); // Rendert die Board-Ansicht neu
}
