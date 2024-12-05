let taskIdCounter = 1;
let currentListId = null; 
let tempPriority = null;



function renderBoard() {
    if (!tasks || Object.keys(tasks).length === 0) return;
    Object.values(tasks).forEach(list => {
        const content = document.getElementById(`${list.id}List`)?.querySelector('.taskContainer');
        if (!content) return;
        content.innerHTML = "";
        if (!list.task || Object.keys(list.task).length === 0) {
            content.innerHTML += `
                <div class="nothingToDo">
                    <p class="nothingToDoText">No Tasks To-Do</p>
                </div>
            `;
        } else {
            Object.entries(list.task).forEach(([taskId, task]) => {
                const subtasks = task.subtasks ? Object.values(task.subtasks) : [];
                const totalCount = subtasks.length;
                const doneCount = subtasks.filter(st => st.done).length;
                const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
                const progressHTML = totalCount > 0 ? `
                    <div class="subtasksContainer">
                        <div class="progress" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                        </div>
                        <p class="taskCardSubtasks">${doneCount}/${totalCount} Subtasks</p>
                    </div>
                ` : "";
                const workersHTML = task.workers
                    ? task.workers.map(worker => `
                        <p class="workerEmblem" style="background-color: ${getColorHex(worker.name, "")};">
                            ${getInitials(worker.name)}
                        </p>
                    `).join("")
                    : "";
                content.innerHTML += `
                    <div id="boardCard-${taskId}" 
                         draggable="true"
                         ondragstart="startDragging('${taskId}', '${list.id}')"
                         onclick="openTaskPopup('${taskId}', '${list.id}')"
                         class="boardCard">
                        <p class="${task.category?.class || 'defaultCategory'} taskCategory">${task.category?.name || "No Category"}</p>
                        <p class="taskCardTitle">${task.title}</p>
                        <p class="taskCardDescription">${task.description}</p>
                        ${progressHTML}
                        <div class="BoardCardFooter">
                            <div class="worker">${workersHTML}</div>
                            <img class="priority" src="../../assets/icons/png/PrioritySymbols${task.priority || 'Low'}.png">
                        </div>
                    </div>
                `;
            });
        }
    });
}



async function openTaskPopup(taskId, listId) {
    if (!listId || !taskId) return;
    currentListId = listId; 
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) return;
        const task = await response.json();
        if (!task) return;
        const popupOverlay = document.getElementById("viewTaskPopupOverlay");
        const popupContainer = document.getElementById("viewTaskContainer");
        if (!popupOverlay || !popupContainer) return;
        const subtasksHTML = task.subtasks && Object.keys(task.subtasks).length > 0
            ? Object.entries(task.subtasks).map(([subtaskId, subtask]) => `
                <div id="subtask-${taskId}-${subtaskId}" class="subtask-item">
                    <input 
                        class="subtasksCheckbox popupIcons" 
                        type="checkbox" 
                        ${subtask.done ? 'checked' : ''} 
                        onchange="toggleSubtaskStatus('${listId}', '${taskId}', '${subtaskId}', this.checked)">
                    <p 
                        id="subtask-p-${taskId}-${subtaskId}" 
                        class="subtaskText" 
                        style="text-decoration: ${subtask.done ? 'line-through' : 'none'};">
                        ${subtask.title || 'Unnamed Subtask'}
                    </p>
                    <div class="hoverBtnContainer">
                        <img
                            class="hoverBtn" 
                            src="../../assets/icons/png/editIcon.png" 
                            onclick="editSubtask('${taskId}', '${subtaskId}')"
                            alt="Edit Subtask">
                        <img 
                            class="hoverBtn" 
                            src="../../assets/icons/png/iconoir_cancel.png" 
                            onclick="deleteSubtask('${listId}', '${taskId}', '${subtaskId}')"
                            alt="Delete Subtask">
                    </div>
                </div>
            `).join("")
            : '<p>Keine Subtasks vorhanden.</p>';
        const workersHTML = task.workers && task.workers.length > 0
            ? task.workers.map(worker => `
                <div class="workerInformation">
                    <p class="workerEmblem" style="background-color: ${worker.color || getColorHex(worker.name, "")};">
                        ${getInitials(worker.name)}
                    </p>
                    <p class="workerName">${worker.name}</p>
                </div>
            `).join("")
            : '<p>Keine Arbeiter zugewiesen.</p>';
        popupOverlay.classList.add("visible");
        document.getElementById("mainContent").classList.add("blur");
        popupContainer.innerHTML = `
            <div class="popupHeader">
                <p class="${task.category?.class || 'defaultCategory'} taskCategory">
                    ${task.category?.name || 'No Category'}
                </p>
                <img class="popupIcons" onclick="closeTaskPopup()" src="../../assets/icons/png/iconoir_cancel.png">
            </div>
            <h1>${task.title || 'Kein Titel'}</h1>
            <p class="popupDescription">${task.description || 'Keine Beschreibung'}</p>
            <p class="popupInformation">Due Date: <strong>${task.dueDate || 'Kein Datum'}</strong></p>
            <p class="popupInformation">Priority: <strong>${task.priority || 'Low'}
                <img src="../../assets/icons/png/PrioritySymbols${task.priority || 'Low'}.png">
            </strong></p>
            <div class="workerContainer">
                ${workersHTML}
            </div>
            <div class="subtasks-container">
                <h2>Subtasks:</h2>
                ${subtasksHTML}
            </div>
            <div class="popupActions">
                <img onclick="editTask('${listId}', '${taskId}')" class="popupIcons" src="../../assets/icons/png/edit.png">
                <img onclick="deleteTask('${listId}', '${taskId}')" class="popupIcons" src="../../assets/icons/png/Delete contact.png">
            </div>
        `;
    } catch {
        // No explicit error handling needed
    }
}



async function editTask(listId, taskId) {
    if (!listId || !taskId) return;
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) return;
        const task = await response.json();
        if (!task) return;
        window.localEditedContacts = task.workers || [];
        window.localEditedSubtasks = task.subtasks ? { ...task.subtasks } : {};
        const editTaskPopupOverlay = document.getElementById("editTaskPopupOverlay");
        const editTaskPopupContainer = document.getElementById("editTaskPopupContainer");
        if (!editTaskPopupOverlay || !editTaskPopupContainer) return;
        editTaskPopupOverlay.setAttribute("data-task-id", taskId);
        editTaskPopupOverlay.setAttribute("data-list-id", listId);
        editTaskPopupOverlay.classList.add("visible");
        document.getElementById("mainContent").classList.add("blur");
        const renderSubtasksHTML = () => Object.entries(window.localEditedSubtasks)
            .map(([subtaskId, subtask]) => `
                <div class="subtask-item" id="subtask-${subtaskId}">
                    <p 
                        id="subtask-p-${subtaskId}" 
                        class="subtaskText" 
                        onclick="editSubtaskInLocal('${subtaskId}')">
                        ${subtask.title || "Unnamed Subtask"}
                    </p>
                    <div class="hoverBtnContainer">
                        <img 
                            class="hoverBtn" 
                            src="../../assets/icons/png/editIcon.png" 
                            onclick="editSubtaskInLocal('${subtaskId}')"
                            alt="Edit Subtask">
                        <img 
                            class="hoverBtn" 
                            src="../../assets/icons/png/iconoir_cancel.png" 
                            onclick="deleteSubtaskFromLocal('${subtaskId}')"
                            alt="Delete Subtask">
                    </div>
                </div>
            `).join("");
        const renderContactsDropdownHTML = () => {
            const dropdownOptions = contactsArray
                .map(contact => `<option value="${contact.name}">${contact.name}</option>`)
                .join("");
            const selectedContactsHTML = window.localEditedContacts.map(worker => `
                <div class="workerInformation">
                    <p class="workerEmblem workerIcon" 
                       style="background-color: ${worker.color || getColorHex(worker.name, "")};">
                        ${getInitials(worker.name)}
                    </p>
                    <p class="workerName">${worker.name}</p>
                    <img 
                        class="hoverBtn" 
                        src="../../assets/icons/png/iconoir_cancel.png" 
                        onclick="removeContactFromEdit('${worker.name}')"
                        alt="Remove Worker">
                </div>
            `).join("");
            return `
                <div class="createContactBar">
                    <select id="contactSelection" onchange="handleContactSelectionForEdit()">
                        <option value="" disabled selected hidden>Select Contact</option>
                        ${dropdownOptions}
                    </select>
                    <ul id="selectedContactsList">${selectedContactsHTML || '<p>Keine zugewiesenen Arbeiter.</p>'}</ul>
                </div>
            `;
        };
        editTaskPopupContainer.innerHTML = `
            <div class="popupHeader">
                <h1>Edit Task</h1>
                <img class="icon close" onclick="closeEditTaskPopup()" src="../../assets/icons/png/iconoir_cancel.png">
            </div>
            <form id="editTaskForm" onsubmit="saveTaskChanges(event, '${listId}', '${taskId}')">
                <div class="formParts">
                    <div class="formPart">
                        <label for="title">Title<span class="requiredStar">*</span></label>
                        <input type="text" id="title" value="${task.title || ''}" required>
                        <label for="description">Description</label>
                        <textarea id="description" rows="5">${task.description || ''}</textarea>
                        <label for="contactSelection">Assigned to</label>
                        ${renderContactsDropdownHTML()}
                    </div>
                    <div class="separator"></div>
                    <div class="formPart">
                        <label for="dueDate">Due Date<span class="requiredStar">*</span></label>
                        <input type="date" id="dueDate" value="${task.dueDate || ''}">
                        <label for="priority">Priority</label>
                        <div class="priorityBtnContainer">
                            <button onclick="setPriority('Urgent')" id="prioUrgent" type="button"
                                class="priorityBtn ${task.priority === 'Urgent' ? 'active' : ''}">Urgent
                                <img src="../../assets/icons/png/PrioritySymbolsUrgent.png">
                            </button>
                            <button onclick="setPriority('Middle')" id="prioMiddle" type="button"
                                class="priorityBtn ${task.priority === 'Middle' ? 'active' : ''}">Medium
                                <img src="../../assets/icons/png/PrioritySymbolsMiddle.png">
                            </button>
                            <button onclick="setPriority('Low')" id="prioLow" type="button"
                                class="priorityBtn ${task.priority === 'Low' ? 'active' : ''}">Low
                                <img src="../../assets/icons/png/PrioritySymbolsLow.png">
                            </button>
                        </div>
                        <label for="category">Category<span class="requiredStar">*</span></label>
                        <select id="category" required>
                            <option value="Technical Task" ${task.category?.name === 'Technical Task' ? 'selected' : ''}>Technical Task</option>
                            <option value="User Story" ${task.category?.name === 'User Story' ? 'selected' : ''}>User Story</option>
                        </select>
                        <label for="subtask">Subtasks</label>
                        <div id="subTasksList">
                            ${renderSubtasksHTML()}
                            <div class="createSubtaskBar">
                                <input id="newSubtaskInput" class="addSubTask" placeholder="Add new subtask" type="text">
                                <div class="divider"></div>
                                <img onclick="addSubtaskToLocalList()" class="addSubtaskButton" src="../assets/icons/png/addSubtasks.png">
                            </div>
                        </div>
                    </div>
                </div>
                <button type="submit">Save Changes</button>
            </form>
        `;
    } catch {
        // No explicit error handling required
    }
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
    const subtaskHTML = `
        <div class="subtask-item" id="subtask-${subtaskId}">
            <p class="subtaskText">${subtaskTitle}</p>
            <img 
                class="hoverBtn" 
                src="../../assets/icons/png/iconoir_cancel.png" 
                onclick="removeSubtaskFromList('${subtaskId}')"
                alt="Delete Subtask">
        </div>
    `;
    subTasksList.insertAdjacentHTML("beforeend", subtaskHTML);
    subTaskInput.value = ""; 
}



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



async function editSubtask(taskId, subtaskId) {
    const subtaskElement = document.getElementById(`subtask-${taskId}-${subtaskId}`);
    if (!subtaskElement) return;
    const subtaskTextElement = subtaskElement.querySelector(".subtaskText");
    if (!subtaskTextElement) return;
    const currentTitle = subtaskTextElement.textContent.trim();
    subtaskTextElement.outerHTML = `
        <input 
            type="text" 
            class="editSubtaskInput" 
            id="edit-input-${subtaskId}" 
            value="${currentTitle}">
        <button 
            onclick="saveSubtaskEdit('${taskId}', '${subtaskId}', document.getElementById('edit-input-${subtaskId}').value)">
            Save
        </button>
    `;
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
    const subtaskHTML = `
        <div class="subtask-item" id="subtask-${subtaskId}">
            <p 
                id="subtask-p-${subtaskId}" 
                class="subtaskText" 
                onclick="editSubtask('${subtaskId}')">
                ${subtaskTitle}
            </p>
            <div class="hoverBtnContainer">
                <img 
                    class="hoverBtn" 
                    src="../../assets/icons/png/iconoir_cancel.png" 
                    onclick="deleteSubtaskFromLocal('${subtaskId}')"
                    alt="Delete Subtask">
            </div>
        </div>
    `;
    subTasksList.insertAdjacentHTML("beforeend", subtaskHTML);
    subTaskInput.value = ""; 
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
        renderBoard();
        closeEditTaskPopup();
        openTaskPopup(taskId, listId);
    } catch {
        // Keine weitere Aktion bei Fehler
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
    console.log(`Liste "${listId}" wurde geöffnet.`);
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
        workers: workers.map(worker => ({ name: worker })), // Kontakte als Objekte
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

function deleteWorkerFromTask(){
    let worker = document.getElementsByClassName(`worker-kevin fischer workerEmblem} workerEmblem`).innerHTML;
     console.log(worker);
     
 }