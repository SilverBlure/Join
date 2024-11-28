let tasks = [];
let taskIdCounter = 1;
let currentListId = null; 
let tempPriority = null;

function renderBoard() {
    if (!tasks || tasks.length === 0) {
        console.error('Keine Aufgaben gefunden!');
        return;
    }

    tasks.forEach(list => {
        const content = document.getElementById(`${list.id}List`)?.querySelector('.taskContainer');
        if (!content) {
            console.error(`Container für Liste "${list.id}" nicht gefunden.`);
            return;
        }
        content.innerHTML = "";

        if (list.task.length === 0) {
            content.innerHTML += /*html*/ `
                <div class="nothingToDo">
                    <p class="nothingToDoText">No Tasks To-Do</p>
                </div>
            `;
        } else {
            list.task.forEach(task => {
                const totalCount = task.subtasks?.length || 0; // Gesamtanzahl der Subtasks
                const doneCount = task.subtasks?.filter(st => st.done).length || 0; // Abgeschlossene Subtasks
                const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0; // Fortschritt in %
                const progressHTML = totalCount > 0 ? /*html*/ `
                    <div class="subtasksContainer">
                        <div class="progress" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                        </div>
                        <p class="taskCardSubtasks">${doneCount}/${totalCount} Subtasks</p>
                    </div>
                ` : '';
                const workersHTML = Array.isArray(task.workers)
                    ? task.workers.map(worker => {
                        const workerClass = worker?.class || 'defaultWorker';
                        const workerInitial = worker?.name?.charAt(0) || '?';
                        return `<p class="${workerClass} workerEmblem">${workerInitial}</p>`;
                    }).join('')
                    : '';

                content.innerHTML += /*html*/ `
                    <div id="boardCard-${task.id}" 
                         draggable="true"
                         ondragstart="startDragging('${task.id}', '${list.id}')"
                         onclick="openTaskPopup('${task.id}', '${list.id}')"
                         class="boardCard">
                        <p class="${task.category?.class || 'defaultCategory'} taskCategory">${task.category?.name || 'No Category'}</p>
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
    if (!listId) {
        console.error(`Task ${taskId} kann nicht geöffnet werden, da keine Liste angegeben wurde.`);
        return;
    }
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Fehler beim Abrufen des Tasks ${taskId} aus Liste ${listId}: ${response.status}`);
            return;
        }
        const task = await response.json();
        if (!task) {
            console.error(`Task ${taskId} nicht gefunden in Liste ${listId}.`);
            return;
        }
        const popupOverlay = document.getElementById("viewTaskPopupOverlay");
        const popupContainer = document.getElementById("viewTaskContainer");
        if (popupOverlay && popupContainer) {
            popupOverlay.classList.add("visible");
            document.getElementById("mainContent").classList.add("blur");
            const workersHTML = task.workers?.map(worker => /*html*/ `
                <div class="workerInformation">
                    <p class="${worker.class || 'defaultWorker'} workerEmblem workerIcon">
                        ${worker.name?.charAt(0) || '?'}
                    </p>
                    <p class="workerName">${worker.name || 'Unknown'}</p> 
                </div>
            `).join('') || '';
            const subtasksHTML = task.subtasks?.length > 0
                ? /*html*/ `
                    <h3>Subtasks</h3>
                    ${task.subtasks.map((subtask, index) => {
                        const subtaskText = subtask.done || subtask.todo || 'Unnamed Subtask'; 
                        const isDone = !!subtask.done; 
                        return /*html*/ `
                            <div id="subtask-${taskId}-${index}" class="subtask-item">
                                <input 
                                    class="subtasksCheckbox popupIcons" 
                                    type="checkbox" 
                                    ${isDone ? 'checked' : ''} 
                                    onchange="toggleSubtaskStatus('${listId}', '${taskId}', ${index}, this.checked)">
                                <p class="subtaskText" style="text-decoration: ${isDone ? 'line-through' : 'none'};">
                                    ${subtaskText}
                                </p>
                            </div>
                        `;
                    }).join('')}
                `
                : '<p>Keine Subtasks vorhanden.</p>';

            // Fülle das Popup mit den abgerufenen Task-Daten
            popupContainer.innerHTML = /*html*/ `
                <div class="popupHeader">
                    <p class="${task.category?.class || 'defaultCategory'} taskCategory">
                        ${task.category?.name || 'No Category'}
                    </p>
                    <img class="popupIcons" onclick="closeTaskPopup()" src="../../assets/icons/png/iconoir_cancel.png">   
                </div> 
                <h1>${task.title}</h1>
                <p class="popupDescription">${task.description || 'No description'}</p>
                <p class="popupInformation">Due Date:<strong>${task.dueDate || 'No date'}</strong></p>
                <p class="popupInformation">Priority:<strong>${task.priority || 'Low'}
                    <img src="../../assets/icons/png/PrioritySymbols${task.priority || 'Low'}.png">
                </strong></p>
                <p>Assigned to:</p>
                <div class="workerContainer">${workersHTML}</div>
                <div class="subtasks-container">${subtasksHTML}</div>
                <div class="popupActions">
                    <img onclick="editTask('${listId}', '${taskId}')" class="popupIcons" src="../../assets/icons/png/edit.png">
                    <img onclick="deleteTask('${listId}', '${taskId}')" class="popupIcons" src="../../assets/icons/png/Delete contact.png">
                </div>
            `;
        } else {
            console.error("Popup-Overlay oder -Container konnte nicht gefunden werden.");
        }
    } catch (error) {
        console.error("Fehler beim Öffnen des Task-Popups:", error);
    }
}



function deleteSubtask(taskId, subtaskIndex) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); 
    if (task && task.subtasks[subtaskIndex]) {
        task.subtasks.splice(subtaskIndex, 1); 
        openTaskPopup(taskId); 
        renderBoard(); 
    } else {
        console.error(`Subtask mit Index ${subtaskIndex} nicht in Task ${taskId} gefunden.`);
    }
}



function deleteTask(taskId) {
    tasks.forEach(list => {
        const index = list.task.findIndex(task => task.id === taskId); 
        if (index !== -1) {
            list.task.splice(index, 1); 
            renderBoard(); 
            closeTaskPopup(); 
        }
    });
}



function editSubtask(taskId, subtaskIndex) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); 
    if (!task || !task.subtasks[subtaskIndex]) {
        console.error(`Task oder Subtask nicht gefunden (Task ID: ${taskId}, Subtask Index: ${subtaskIndex})`);
        return;
    }
    const subtask = task.subtasks[subtaskIndex];
    const subtaskText = subtask.done || subtask.todo; 
    const subtaskElement = document.getElementById(`subtask-${taskId}-${subtaskIndex}`); 
    if (!subtaskElement) {
        console.error(`Subtask-Element nicht gefunden (Task ID: ${taskId}, Subtask Index: ${subtaskIndex})`);
        return;
    }
    subtaskElement.innerHTML = /*html*/`
        <input
            type="text" 
            class="editSubtaskInput" 
            value="${subtaskText}" 
            onblur="saveSubtaskEdit(${taskId}, ${subtaskIndex}, this.value)">
        <button
            class="saveSubtaskBtn" 
            onclick="saveSubtaskEdit(${taskId}, ${subtaskIndex}, document.querySelector('#subtask-${taskId}-${subtaskIndex} .editSubtaskInput').value)">
            Save
        </button>
    `;
    const inputField = subtaskElement.querySelector('.editSubtaskInput');
    if (inputField) inputField.focus();
}



function saveSubtaskEdit(taskId, subtaskIndex, newText) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); 
    if (!task || !task.subtasks[subtaskIndex]) {
        console.error(`Task oder Subtask nicht gefunden (Task ID: ${taskId}, Subtask Index: ${subtaskIndex})`);
        return;
    }
    const subtask = task.subtasks[subtaskIndex];
    if (subtask.done !== undefined) {
        subtask.done = newText; 
    } else {
        subtask.todo = newText; 
    }
    console.log(`Subtask aktualisiert (Task ID: ${taskId}, Subtask Index: ${subtaskIndex}):`, subtask);
    renderBoard();
    openTaskPopup(taskId); 
}

function findTask() {
    const searchTerm = document.getElementById('findTask').value.trim().toLowerCase();

    // Alle gerenderten Task-Container durchsuchen
    const allTaskContainers = document.querySelectorAll('.taskContainer');

    allTaskContainers.forEach(container => {
        const taskCards = container.querySelectorAll('.boardCard');
        let hasMatchingTask = false;

        // Suche in jeder Task-Karte innerhalb des Containers
        taskCards.forEach(card => {
            const title = card.querySelector('.taskCardTitle')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.taskCardDescription')?.textContent.toLowerCase() || '';

            // Sichtbarkeit basierend auf Suchkriterium einstellen
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = ''; // Zeige das passende Element
                hasMatchingTask = true;
            } else {
                card.style.display = 'none'; // Verstecke das nicht passende Element
            }
        });

        // Fallback, wenn keine Übereinstimmungen in einem Container gefunden werden
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
            // Entferne die "No matching tasks found"-Meldung, wenn wieder passende Tasks gefunden werden
            const nothingToDo = container.querySelector('.nothingToDo');
            if (nothingToDo) {
                nothingToDo.remove();
            }
        }

        // Stelle den ursprünglichen Zustand her, wenn kein Suchbegriff eingegeben ist
        if (searchTerm === '') {
            taskCards.forEach(card => {
                card.style.display = ''; // Zeige alle Elemente
            });
            container.querySelector('.nothingToDo')?.remove(); // Entferne die "No tasks found"-Meldung
        }
    });
}




function editTask(taskId) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); 
    const editTaskPopupOverlay = document.getElementById("editTaskPopupOverlay");
    const editTaskPopupContainer = document.getElementById("editTaskPopupContainer");
    if (!editTaskPopupOverlay || !editTaskPopupContainer || !task) {
        console.error(`Popup-Container oder Task mit ID ${taskId} nicht gefunden.`);
        return;
    }
    editTaskPopupOverlay.setAttribute("data-task-id", taskId);
    editTaskPopupOverlay.classList.add("visible");
    document.getElementById("mainContent").classList.add("blur");
    const addSubtaskHTML = /*html*/`
        <div class="createSubtaskBar">
            <input id="newSubtaskInput" class="addSubTask" placeholder="Add new subtask" type="text">
            <div class="divider"></div>
            <img onclick="addNewSubtask(${taskId})" class="addSubtaskButton" src="../assets/icons/png/addSubtasks.png">
        </div>
    `;
    editTaskPopupContainer.innerHTML = /*html*/`
        <div class="popupHeader">
            <h1>Edit Task</h1>
            <img class="icon close" onclick="closeEditTaskPopup()" src="../../assets/icons/png/iconoir_cancel.png">
        </div>
        <form id="editTaskForm">
            <div class="formParts">
                <div class="formPart">
                    <label for="title">Title<span class="requiredStar">*</span></label>
                    <input type="text" id="title" value="${task.title}" required>
                    <label for="description">Description</label>
                    <textarea id="description" rows="5">${task.description}</textarea>
                    <label for="contactSelection">Assigned to</label>
                    <div id="contactSelection">${task.workers.map(worker => worker.name).join(', ')}</div>
                </div>
                <div class="separator"></div>
                <div class="formPart">
                    <label for="dueDate">Due Date<span class="requiredStar">*</span></label>
                    <input type="date" id="dueDate" value="${task.due_Date}">
                    <label for="priority">Prio</label>
                    <div class="priorityBtnContainer" id="prio">
                        <button onclick="setPriority('Urgent')" id="prioUrgent" type="button" class="priorityBtn ${task.priority === 'Urgent' ? 'active' : ''}">Urgent<img src="../../assets/icons/png/PrioritySymbolsUrgent.png"></button>
                        <button onclick="setPriority('Middle')" id="prioMedium" type="button" class="priorityBtn ${task.priority === 'Middle' ? 'active' : ''}">Medium<img src="../../assets/icons/png/PrioritySymbolsMiddle.png"></button>
                        <button onclick="setPriority('Low')" id="prioLow" type="button" class="priorityBtn ${task.priority === 'Low' ? 'active' : ''}">Low<img src="../../assets/icons/png/PrioritySymbolsLow.png"></button>
                    </div>
                    <label for="category">Category<span class="requiredStar">*</span></label>
                    <select id="category" required>
                        <option value="Technical Task" ${task.category.name === 'Technical Task' ? 'selected' : ''}>Technical Task</option>
                        <option value="User Story" ${task.category.name === 'User Story' ? 'selected' : ''}>User Story</option>
                    </select>
                    <label for="subtask">Subtasks</label>
                    <div id="subTasksList">${addSubtaskHTML}</div>
                </div>
            </div>
            <button type="button" onclick="saveTaskChanges(${taskId})">Save Changes</button>
        </form>
    `;
}



function saveTaskChanges(taskId) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); 
    if (!task) {
        console.error(`Task mit ID ${taskId} nicht gefunden.`);
        return;
    }
    const titleInput = document.getElementById("title").value.trim();
    const descriptionInput = document.getElementById("description").value.trim();
    const dueDateInput = document.getElementById("dueDate").value;
    const categoryInput = document.getElementById("category").value;
    if (titleInput) task.title = titleInput;
    task.description = descriptionInput;
    if (dueDateInput) task.due_Date = dueDateInput;
    if (categoryInput) {
        task.category.name = categoryInput;
        task.category.class = categoryInput === "Technical Task"
            ? "categoryTechnicalTask"
            : "categoryUserStory";
    }
    console.log('Aktueller Zustand der Aufgaben:', tasks);
    renderBoard(); 
    closeEditTaskPopup(); 
}



function addNewSubtask(taskId) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); 
    const newSubtaskInput = document.getElementById('newSubtaskInput');
    if (task && newSubtaskInput && newSubtaskInput.value.trim() !== '') {
        task.subtasks.push({ todo: newSubtaskInput.value.trim() });
        newSubtaskInput.value = ''; 
        renderBoard(); 
        openTaskPopup(taskId); 
    } else {
        console.error("Fehler beim Hinzufügen des Subtasks oder Eingabe ist leer.");
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
    try {
        const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}.json`;
        let response = await fetch(url);
        if (!response.ok) {
            console.warn(`Liste '${listId}' existiert nicht. Initialisiere sie erneut.`);
            await initializeTaskLists(); 
        }
        const newTask = {
            title: title,
            description: description,
            dueDate: dueDate,
            priority: priority,
            workers: workers ? workers.split(',').map(w => w.trim()) : [],
            category: { name: category, class: `category${category.replace(' ', '')}` },
            subtasks: Array.isArray(subtasks) ? subtasks : [subtasks],
        };
        const postUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task.json`;
        let postResponse = await fetch(postUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTask),
        });
        if (postResponse.ok) {
            let responseData = await postResponse.json();
            console.log(`Task erfolgreich zu Liste '${listId}' hinzugefügt:`, responseData);
            return responseData;
        } else {
            let errorText = await postResponse.text();
            console.error(`Fehler beim Hinzufügen des Tasks zu Liste '${listId}':`, postResponse.status, errorText);
            return null;
        }
    } catch (error) {
        console.error(`Ein Fehler ist beim Hinzufügen des Tasks zu Liste '${listId}' aufgetreten:`, error);
        return null;
    }
}



async function addTaskToSpecificList(listId, event) {
    event.preventDefault(); 
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const dueDate = document.getElementById("date").value;
    const priority = tempPriority;
    const workers = document.getElementById("contactSelection").value;
    const category = document.getElementById("category").value;
    const subtasksInput = document.getElementById("popupSubtask").value;
    const subtasks = subtasksInput ? subtasksInput.split(",").map(todo => ({ todo: todo.trim() })) : [];
    if (!priority) {
        console.warn("Keine Priorität ausgewählt.");
        return;
    }
    if (!listId) {
        console.error("Keine Liste angegeben, in die der Task hinzugefügt werden soll.");
        return;
    }
    try {
        const result = await addTaskToList(listId, title, description, dueDate, priority, workers, category, subtasks);
        if (result) {
            console.log(`Task erfolgreich in Liste '${listId}' hinzugefügt:`, result);
            await getTasks(); 
            document.getElementById("addTaskFormTask").reset(); 
            tempPriority = null; 
            closeAddTaskPopup();
            renderBoard();
        } else {
            console.error(`Task konnte nicht in Liste '${listId}' hinzugefügt werden.`);
        }
    } catch (error) {
        console.error(`Fehler beim Hinzufügen des Tasks in Liste '${listId}':`, error);
    }
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