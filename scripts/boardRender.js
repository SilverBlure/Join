function renderBoard() {
    if (!tasks || Object.keys(tasks).length === 0) return;
    Object.values(tasks).forEach(list => renderTaskList(list));
}



function renderTaskList(list) {
    const content = document.getElementById(`${list.id}List`)?.querySelector('.taskContainer');
    if (!content) return;
    content.innerHTML = "";
    if (!list.task || Object.keys(list.task).length === 0) {
        renderEmptyMessage(content);
    } else {
        Object.entries(list.task).forEach(([taskId, task]) => renderTask(content, taskId, task, list.id));
    }
}



function renderTask(container, taskId, task, listId) {
    const progressHTML = renderSubtaskProgress(task.subtasks || {}); 
    const workersHTML = renderTaskWorkers(task.workers);
    const taskHTML = generateBoardCardHTML(taskId, task, listId, progressHTML, workersHTML);
    container.innerHTML += taskHTML;
}



function renderSubtaskProgress(subtasks) {
    const subtaskArray = subtasks ? Object.values(subtasks) : [];
    if (subtaskArray.length === 0) return "";
    const totalCount = subtaskArray.length;
    const doneCount = subtaskArray.filter(st => st.done).length;
    const progressPercent = (doneCount / totalCount) * 100;
    return generateSubtasksProgressHTML(progressPercent, doneCount, totalCount);
}



function renderTaskWorkers(workers) {
    if (!workers || workers.length === 0) return "";
    return workers
        .filter(worker => worker && worker.name) // Entferne ungültige Worker-Einträge
        .map(worker => `
            <p class="workerEmblem" style="background-color: ${getColorHex(worker.name, "")};">
                ${getInitials(worker.name)}
            </p>
        `).join("");
}




async function openTaskPopup(taskId, listId) {
    if (!listId || !taskId) {
        return;
    }
    const task = await fetchTaskData(taskId, listId);
    if (!task) return;
    const popupOverlay = document.getElementById("viewTaskPopupOverlay");
    const popupContainer = document.getElementById("viewTaskContainer");
    if (!popupOverlay || !popupContainer) return;
    const subtasksHTML = generateSubtasksHTML(task, taskId, listId);
    const workersHTML = generateWorkersHTML(task);
    showTaskPopup(popupOverlay, popupContainer, task, subtasksHTML, workersHTML, listId, taskId);
}



async function fetchTaskData(taskId, listId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return null;
        }
        const task = await response.json();
        if (task.subtasks) {
            task.subtasks = JSON.parse(JSON.stringify(task.subtasks));
        }
        return task;
    } catch (error) {
        return null;
    }
}



function generateSubtasksHTML(task, taskId, listId) {
    const subtasks = task.subtasks;
    if (!subtasks) {
        return '<p>No subtasks in task.</p>';
    }
    return Object.entries(subtasks).map(([subtaskId, subtask]) => {
        if (!subtask || typeof subtask !== "object" || !("title" in subtask) || !("done" in subtask)) {
            return `<p>${subtaskId}</p>`;
        }
        return generatePopupSingleSubtaskHTML(subtask, subtaskId, taskId, listId); // Verwende hier direkt die Funktion
    }).join('');
}



function showTaskPopup(popupOverlay, popupContainer, task, subtasksHTML, workersHTML, listId, taskId) {
    popupOverlay.classList.add("visible");
    document.getElementById("mainContent").classList.add("blur");
    const headerHTML = generatePopupHeaderHTML(task);
    const detailsHTML = generatePopupDetailsHTML(task);
    const workerContainerHTML = generateWorkerContainerHTML(workersHTML);
    const subtasksContainerHTML = generateSubtasksContainerHTML(subtasksHTML);
    const actionsHTML = generatePopupActionsHTML(listId, taskId);
    popupContainer.innerHTML = `
        ${headerHTML}
        ${detailsHTML}
        ${workerContainerHTML}
        ${subtasksContainerHTML}
        ${actionsHTML}
    `;
}



async function editTask(listId, taskId) {
    if (!listId || !taskId) return;
    try {
        const task = await fetchTaskForEditing(listId, taskId);
        if (!task) {
            return;
        }
        initializeLocalTaskState(task);
        renderEditTaskPopup(listId, taskId, task);
    } catch (error) {
        console.error("Fehler beim Bearbeiten des Tasks:", error);
    }
}



function renderEditTaskPopup(listId, taskId, task) {
    const editTaskPopupOverlay = document.getElementById("editTaskPopupOverlay");
    const editTaskPopupContainer = document.getElementById("editTaskPopupContainer");
    if (!editTaskPopupOverlay || !editTaskPopupContainer) return;
    editTaskPopupOverlay.setAttribute("data-task-id", taskId);
    editTaskPopupOverlay.setAttribute("data-list-id", listId);
    editTaskPopupOverlay.classList.add("visible");
    document.getElementById("mainContent").classList.add("blur");
    const subtasksHTML = generateEditSubtasksHTML(window.localEditedSubtasks);
    const contactsDropdownHTML = generateContactsDropdownHTML();
    editTaskPopupContainer.innerHTML = generateEditTaskForm(task, subtasksHTML, contactsDropdownHTML, listId, taskId);
}



function generatePriorityButtonsHTML(selectedPriority) {
    const priorities = [
        { name: "Urgent", src: "./../assets/icons/png/PrioritySymbolsUrgent.png" },
        { name: "Middle", src: "./../assets/icons/png/PrioritySymbolsMiddle.png" },
        { name: "Low", src: "./../assets/icons/png/PrioritySymbolsLow.png" },
    ];
    return priorities.map(priority => generatePriorityButtonHTML(priority, selectedPriority)).join("");
}



function generateEditSubtasksHTML(subtasks = {}) {
    if (Object.keys(subtasks).length === 0) {
        return '<p>No subtask in Task.</p>';
    }
    return Object.entries(subtasks).map(([subtaskId, subtask]) => 
        generateEditSingleSubtaskHTML(subtaskId, subtask)
    ).join('');
}



async function fetchTaskForEditing(listId, taskId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        return null;
    }
}



function initializeLocalTaskState(task) {
    window.localEditedContacts = task.workers || [];
    if (task.subtasks && typeof task.subtasks === "object") {
        window.localEditedSubtasks = { ...task.subtasks };
    } else {
        window.localEditedSubtasks = {}; 
    }
    console.log("Initialized local state:", {
        workers: window.localEditedContacts,
        subtasks: window.localEditedSubtasks,
    });
}



function generateContactsDropdownHTML() {
    const dropdownOptions = contactsArray.map(contact => `
        <option value="${contact.name}">${contact.name}</option>
    `).join("");
    const selectedContactsHTML = window.localEditedContacts.map(worker => generateSingleWorkerHTML(worker)).join("") 
        || '<p>Keine zugewiesenen Arbeiter.</p>';
    return generateCreateContactBarHTML(dropdownOptions, selectedContactsHTML);
}



function addNewSubtask() {
    const subTaskInput = document.getElementById("newSubtaskInput");
    const subTasksList = document.getElementById("subTasksList");
    if (!subTaskInput || !subTasksList) return;
    const subtaskTitle = subTaskInput.value.trim();
    if (!subtaskTitle) return;
    const subtaskId = `subtask_${Date.now()}`;
    const subtaskItem = { title: subtaskTitle, done: false };
    window.localSubtasks = window.localSubtasks || {};
    window.localSubtasks[subtaskId] = subtaskItem;
    const subtaskHTML = generateNewSubtaskHTML(subtaskId, subtaskTitle);
    subTasksList.insertAdjacentHTML("beforeend", subtaskHTML);
    subTaskInput.value = ""; 
}



async function editSubtask(taskId, subtaskId) {
    const subtaskElement = document.getElementById(`subtask-${taskId}-${subtaskId}`);
    if (!subtaskElement) return;
    const subtaskTextElement = subtaskElement.querySelector(".subtaskText");
    if (!subtaskTextElement) return;
    const currentTitle = subtaskTextElement.textContent.trim();
    const editSubtaskHTML = generateEditSubtaskHTML(taskId, subtaskId, currentTitle);
    subtaskTextElement.outerHTML = editSubtaskHTML;
}



function saveLocalSubtaskEdit(subtaskId, newTitle) {
    if (!newTitle.trim() || !window.localEditedSubtasks || !window.localEditedSubtasks[subtaskId]) return;
    window.localEditedSubtasks[subtaskId].title = newTitle.trim();
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (subtaskElement) {
        subtaskElement.querySelector(".editSubtaskInput").outerHTML = `
            <p 
                id="subtask-p-${subtaskId}" 
                class="subtaskText" 
                onclick="editSubtaskInLocal('${subtaskId}')">
                ${newTitle.trim()}
            </p>
        `;
    }
}



function editSubtaskInLocal(subtaskId) {
    if (!window.localEditedSubtasks || !window.localEditedSubtasks[subtaskId]) return;
    const subtask = window.localEditedSubtasks[subtaskId];
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (!subtaskElement) return;
    const subtaskTextElement = subtaskElement.querySelector(".subtaskText");
    if (!subtaskTextElement) return;
    const currentTitle = subtask.title || "Unnamed Subtask";
    subtaskTextElement.outerHTML = `
        <input 
            type="text" 
            class="editSubtaskInput" 
            value="${currentTitle}" 
            onblur="saveLocalSubtaskEdit('${subtaskId}', this.value)">
    `;
}



function addSubtaskToLocalList() {
    const subTaskInput = document.getElementById("newSubtaskInput");
    const subTasksList = document.getElementById("subTasksList");
    if (!subTaskInput || !subTasksList) return;
    const subtaskTitle = subTaskInput.value.trim();
    if (!subtaskTitle) return;
    const subtaskId = `subtask_${Date.now()}`;
    const subtaskItem = { title: subtaskTitle, done: false };
    if (!window.localEditedSubtasks) window.localEditedSubtasks = {};
    window.localEditedSubtasks[subtaskId] = subtaskItem;
    const subtaskHTML = generateSubtaskItemHTML(subtaskId, subtaskTitle);
    subTasksList.insertAdjacentHTML("beforeend", subtaskHTML);
    subTaskInput.value = ""; 
}
