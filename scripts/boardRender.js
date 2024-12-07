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



function renderTaskWorkers(workers) {
    if (!workers || workers.length === 0) return "";
    return workers
        .filter(worker => worker && worker.name) 
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
    const workersHTML = generateWorkersHTML(task.workers || []); 
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



function showTaskPopup(popupOverlay, popupContainer, task, subtasksHTML, workersHTML, listId, taskId) {
    popupOverlay.classList.add("visible");
    document.getElementById("mainContent").classList.add("blur");
    const headerHTML = generatePopupHeaderHTML(task);
    const detailsHTML = generatePopupDetailsHTML(task);
    const workerContainerHTML = generateWorkerContainerHTML(workersHTML); // Use generated workers HTML
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





