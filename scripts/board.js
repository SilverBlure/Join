let taskIdCounter = 1;
let currentListId = null; 
let tempPriority = null;



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



function closeEditTaskPopup() {
    const overlay = document.getElementById("editTaskPopupOverlay");
    const mainContent = document.getElementById("mainContent");
    if (overlay) overlay.classList.remove("visible");
    if (mainContent) mainContent.classList.remove("blur");
    tempPriority = null;
}



async function refreshBoard() {
    await getTasks();
    renderBoard();
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
    const searchTerm = document.getElementById('findTask').value.trim().toLowerCase();
    const allTaskContainers = document.querySelectorAll('.taskContainer');
    allTaskContainers.forEach(container => {
        const taskCards = container.querySelectorAll('.boardCard');
        let hasMatchingTask = false;
        taskCards.forEach(card => {
            const title = card.querySelector('.taskCardTitle')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.taskCardDescription')?.textContent.toLowerCase() || '';
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = ''; 
                hasMatchingTask = true;
            } else {
                card.style.display = 'none';
            }
        });
        if (!hasMatchingTask) {
            const nothingToDo = container.querySelector('.nothingToDo');
            if (!nothingToDo) {
                container.innerHTML += /*html*/`
                    <div class="nothingToDo">
                        <p class="nothingToDoText">No matching tasks found</p>
                    </div>
                `;
            }
        } else {
            const nothingToDo = container.querySelector('.nothingToDo');
            if (nothingToDo) {
                nothingToDo.remove();
            }
        }
        if (searchTerm === '') {
            taskCards.forEach(card => {
                card.style.display = ''; 
            });
            container.querySelector('.nothingToDo')?.remove(); 
        }
    });
}

async function toggleSubtaskStatus(listId, taskId, subtaskId, isChecked) {
    if (!listId || !taskId || !subtaskId) {
        console.error("Ungültige Parameter:", { listId, taskId, subtaskId });
        return;
    }

    try {
        const task = await fetchTask(listId, taskId);
        if (!task || !task.subtasks || !task.subtasks[subtaskId]) {
            console.error(`Subtask nicht gefunden: ${subtaskId}`);
            return;
        }

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
    console.error(`Fehler beim Abrufen des Tasks: ${response.status}`);
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
        console.error("Task-Element nicht gefunden:", taskId);
        return;
    }

    const progressHTML = generateProgressHTML(updatedTask.subtasks);
    const workersHTML = generateWorkersHTML(updatedTask.workers);
    const newTaskHTML = generateTaskCardHTML(taskId, updatedTask, listId, progressHTML, workersHTML);

    taskElement.outerHTML = newTaskHTML;
}
