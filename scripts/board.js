let users = [
    {
        id: '1',
        name: 'Stanislav',
        email: 'stanislav1994@live.de',
        password: '111',
        tasks: [
            {
                id: 'todo',
                name: 'To Do',
                task: [
                    {
                        id: 1,
                        title: 'Gießen',
                        description: '300ml Wasser gießen',
                        workers: [
                            { name: 'Stanislav Levin', class: 'worker-stanislav' },
                            { name: 'Ozan Orhan', class: 'worker-ozan' }
                        ],
                        due_Date: '2025-01-01',
                        priority: 'Middle',
                        category: { name: 'Technical Task', class: 'categoryTechnicalTask' },
                        subtasks: [
                            { todo: 'Wasser abstehen lassen' },
                            { todo: 'Dünger hinzugeben' },
                            { todo: 'PH Wert anpassen' },
                            { todo: 'im Ring gießen' }
                        ]
                    },
                    {
                        id: 2,
                        title: 'coden',
                        description: 'Join coden',
                        workers: [
                            { name: 'Stanislav Levin', class: 'worker-stanislav' },
                            { name: 'Kevin Fischer', class: 'worker-kevin' }
                        ],
                        due_Date: '2025-10-24',
                        priority: 'Low',
                        category: { name: 'Technical Task', class: 'categoryTechnicalTask' },
                        subtasks: [
                            { done: 'JS Datei einbinden' },
                            { todo: 'Summary Styling bearbeiten' },
                            { todo: 'auf github pushen' },
                            { todo: 'mit Team besprechen' }
                        ]
                    }
                ]
            },
            {
                id: 'inProgress',
                name: 'In Progress',
                task: [
                    {
                        id: 3,
                        title: 'HTML templates einbinden',
                        description: 'alle HTML datein zusammenfassen',
                        workers: [
                            { name: 'Stanislav Levin', class: 'worker-stanislav' },
                            { name: 'Nicolai Österle', class: 'worker-nicolai' }
                        ],
                        due_Date: '2044-08-15',
                        priority: 'Urgent',
                        category: { name: 'Technical Task', class: 'categoryTechnicalTask' },
                        subtasks: [
                            { todo: 'Code Schnipsel sammeln' },
                            { todo: 'auf github mergen' },
                            { todo: 'mit dem Team besprechen' },
                            { todo: 'änderungen anpassen und clean code beachten' }
                        ]
                    },
                    {
                        id: 4,
                        title: 'add Task einbinden',
                        description: 'add task erfolgreich ins array einbinden',
                        workers: [
                            { name: 'Stanislav Levin', class: 'worker-stanislav' },
                            { name: 'Ozan Orhan', class: 'worker-ozan' }
                        ],
                        due_Date: '2036-06-28',
                        priority: 'Middle',
                        category: { name: 'User Story', class: 'categoryUserStory' },
                        subtasks: [
                            { todo: 'datenstruktur besprechen' },
                            { todo: 'Änderungen übernehmen' }
                        ]
                    }
                ]
            },
            {
                id: 'awaitFeedback',
                name: 'Await Feedback',
                task: [
                    {
                        id: 5,
                        title: 'contacts einbinden',
                        description: 'codeblöcke miteinander verbinden',
                        workers: [
                            { name: 'Stanislav Levin', class: 'worker-stanislav' },
                            { name: 'Kevin Fischer', class: 'worker-kevin' }
                        ],
                        due_Date: '2024-11-30',
                        priority: 'Middle',
                        category: { name: 'Technical Task', class: 'categoryTechnicalTask' },
                        subtasks: [
                            { todo: 'contacts array erstellen' },
                            { todo: 'die daten im tasks aktualisieren' },
                            { done: 'dateien einbinden' },
                            { done: 'Contacts anzeigen lassen' }
                        ]
                    }
                ]
            },
            {
                id: 'done',
                name: 'Done',
                task: []
            }
        ]
    }
];







function renderBoard() {
    tasks.forEach(list => {
        const content = document.getElementById(`${list.id}List`).querySelector('.taskContainer');
        content.innerHTML = "";
        if (list.task.length === 0) {
            content.innerHTML += /*html*/`
                <div class="nothingToDo">
                    <p class="nothingToDoText">No Tasks To-do</p>
                </div>
            `;
        } else {
            list.task.forEach(task => {
                const totalCount = task.subtasks && task.subtasks.length > 0 ? task.subtasks.length : 0;
                const doneCount = totalCount > 0 ? task.subtasks.filter(subtask => subtask.done).length : 0;
                const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
                const progressHTML = totalCount > 0
                    ? /*html*/`
                        <div class="subtasksContainer">
                            <div class="progress" role="progressbar" aria-label="Task Progress" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                                <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                            </div>
                            <p class="taskCardSubtasks">${doneCount}/${totalCount} Subtasks</p>
                        </div>
                    `
                    : '';
                content.innerHTML += /*html*/`
                    <div id="boardCard-${task.id}" 
                    draggable="true" 
                    ondragenter="highlightList('${list.id}List')" 
                    ondragleave="unhighlightList('${list.id}List')"
                    ondragstart="startDragging(${task.id})" 
                    onclick="openTaskPopup(${task.id})" class="boardCard">
                        <p class="${task.category.class} taskCategory">${task.category.name}</p>
                        <p class="taskCardTitle">${task.title}</p>
                        <p class="taskCardDescription">${task.description}</p>
                        ${progressHTML} 
                        <div class="BoardCardFooter">
                            <div class="worker">
                                ${task.workers.map((worker, index) =>
                    `<p class="${worker.class} workerEmblem" style="margin-left: ${index === 1 ? '-10px' : '0'};">${worker.name.charAt(0)}</p>`).join('')}
                            </div>
                            <img class="priority" src="../../assets/icons/png/PrioritySymbols${task.priority}.png"> 
                        </div>
                    </div>
                `;
            });
        }
    });
}





function openTaskPopup(taskId) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId);
    const popupOverlay = document.getElementById("viewTaskPopupOverlay");
    const popupContainer = document.getElementById("viewTaskContainer");
    if (popupOverlay && popupContainer && task) {
        popupOverlay.classList.add("visible");
        document.getElementById("mainContent").classList.add("blur");
        const workersHTML = task.workers.map(worker => /*html*/`
            <div class="workerInformation">
                <p class="${worker.class} workerEmblem workerIcon">${worker.name.charAt(0)}</p>
                <p class="workerName">${worker.name}</p> 
            </div>
        `).join('');
        const subtasksHTML = task.subtasks.length > 0
            ? /*html*/`
                <h3>Subtasks</h3>
                ${task.subtasks.map((subtask, index) => {
                const subtaskText = subtask.done || subtask.todo;
                const isDone = !!subtask.done;
                return /*html*/`
                        <div id="subtask-${task.id}-${index}" class="subtask-item">
                            <input 
                                class="subtasksCheckbox popupIcons" 
                                type="checkbox" 
                                ${isDone ? 'checked' : ''} 
                                onchange="toggleSubtaskStatus(${task.id}, ${index}, this.checked)">
                            <p class="subtaskText" style="text-decoration: ${isDone ? 'line-through' : 'none'};">
                                ${subtaskText}
                            </p>
                            <div class="hoverBtnContainer">
                            <img
                                    class="hoverBtn" 
                                    src="../../assets/icons/png/editIcon.png" 
                                    onclick="editSubtask(${task.id}, ${index})" 
                                    alt="Delete Subtask">    
                            <img 
                                    class="hoverBtn" 
                                    src="../../assets/icons/png/iconoir_cancel.png" 
                                    onclick="deleteSubtask(${task.id}, ${index})" 
                                    alt="Delete Subtask">
                            </div>
                        </div>
                    `;
            }).join('')}
            `
            : '';
        popupContainer.innerHTML = /*html*/`
            <div class="popupHeader">
                <p class="${task.category.class} taskCategory">${task.category.name}</p>
                <img class="popupIcons" onclick="closeTaskPopup()" src="../../assets/icons/png/iconoir_cancel.png">   
            </div> 
            <h1>${task.title}</h1>
            <p class="popupDescription">${task.description}</p>
            <p class="popupInformation">Due Date:<strong>${task.due_Date}</strong></p>
            <p class="popupInformation">Priority:<strong>${task.priority}<img src="../../assets/icons/png/PrioritySymbols${task.priority}.png"></strong></p>
            <p>Assigned to:</p>
            <div class="workerContainer">${workersHTML}</div>
            <div class="subtasks-container">${subtasksHTML}</div>
            <div class="popupActions">
                <img onclick="editTask(${task.id})" class="popupIcons" src="../../assets/icons/png/edit.png">
                <img onclick="deleteTask(${task.id})" class="popupIcons" src="../../assets/icons/png/Delete contact.png">
            </div>
        `;
    } else {
        console.error("Popup overlay or task data not found.");
    }
}



function deleteSubtask(taskId, subtaskIndex) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId);
    if (task && task.subtasks[subtaskIndex]) {
        task.subtasks.splice(subtaskIndex, 1);
        openTaskPopup(taskId);
        renderBoard();
    } else {
        console.error(`Subtask with index ${subtaskIndex} not found in task ${taskId}.`);
    }
}


function deleteTask(taskId) {
    tasks.forEach(list => {
        const taskIndex = list.task.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            list.task.splice(taskIndex, 1);
            renderBoard();
            closeTaskPopup();
            console.log(`Task mit ID ${taskId} wurde gelöscht.`);
            return; 
        }
    });
    console.error(`Task mit ID ${taskId} wurde nicht gefunden.`);
}






function editSubtask(taskId, subtaskIndex) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId);
    if (!task || !task.subtasks[subtaskIndex]) {
        console.error(`Task or Subtask not found (Task ID: ${taskId}, Subtask Index: ${subtaskIndex})`);
        return;
    }
    const subtask = task.subtasks[subtaskIndex];
    const subtaskText = subtask.done || subtask.todo;
    const subtaskElement = document.getElementById(`subtask-${taskId}-${subtaskIndex}`);
    if (!subtaskElement) {
        console.error(`Subtask element not found (Task ID: ${taskId}, Subtask Index: ${subtaskIndex})`);
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





function saveSubtaskEdit(taskId, subtaskIndex, newValue) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId);
    if (!task || !task.subtasks[subtaskIndex]) {
        console.error(`Task or Subtask not found (Task ID: ${taskId}, Subtask Index: ${subtaskIndex})`);
        return;
    }
    const subtask = task.subtasks[subtaskIndex];
    if (subtask.done) {
        subtask.done = newValue;
    } else if (subtask.todo) {
        subtask.todo = newValue;
    }
    openTaskPopup(taskId); 
    renderBoard(); 
}






function toggleSubtaskStatus(taskId, subtaskIndex, isChecked) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId);
    if (task && task.subtasks[subtaskIndex]) {
        const subtask = task.subtasks[subtaskIndex];

        if (isChecked) {
            subtask.done = subtask.todo;
            delete subtask.todo;
        } else {
            subtask.todo = subtask.done;
            delete subtask.done;
        }
        const subtaskElement = document.querySelector(`#subtask-${taskId}-${subtaskIndex} .subtaskText`);
        if (subtaskElement) {
            subtaskElement.style.textDecoration = isChecked ? "line-through" : "none";
        }
        openTaskPopup(taskId);
    } else {
        console.error(`Subtask with index ${subtaskIndex} not found in task ${taskId}.`);
    }

    renderBoard();
}







function closeTaskPopup() {
    document.getElementById("viewTaskPopupOverlay").classList.remove("visible");
    document.getElementById("mainContent").classList.remove("blur");
}





function closeAddTaskPopup() {
    document.getElementById("addTaskPopupOverlay").classList.remove("visible");
    document.getElementById("mainContent").classList.remove("blur");
}
























let currentDraggedElement; // Speichert die ID der aktuell gezogenen Card

function startDragging(taskId) {
    currentDraggedElement = taskId;

    // Card drehen
    const card = document.getElementById(`boardCard-${taskId}`);
    if (card) {
        card.classList.add('dragging'); // CSS-Klasse hinzufügen
    }
}

function stopDragging() {
    // Drehung entfernen
    const card = document.getElementById(`boardCard-${currentDraggedElement}`);
    if (card) {
        card.classList.remove('dragging'); // CSS-Klasse entfernen
    }

    currentDraggedElement = null;
}

function allowDrop(event) { 
    event.preventDefault(); // Erlaubt das Ablegen
    event.stopPropagation(); // Verhindert, dass andere Elemente das Event blockieren
}


function highlightList(listId) {
    const list = document.getElementById(listId);
  
        list.classList.add('highlight'); // Füge die Highlight-Klasse hinzu
    
}

function unhighlightList(listId) {
    const list = document.getElementById(listId);
   
        list.classList.remove('highlight'); // Entferne die Highlight-Klasse
    
}


function handleDrop(event, targetListId) {
    event.preventDefault();
    event.stopPropagation();
    let sourceList, task;
    tasks.forEach(list => {
        const taskIndex = list.task.findIndex(t => t.id === currentDraggedElement);
        if (taskIndex !== -1) {
            sourceList = list;
            [task] = sourceList.task.splice(taskIndex, 1);
        }
    });

    const targetList = tasks.find(list => list.id === targetListId);
    if (targetList && task) {
        targetList.task.push(task);
        renderBoard();
    }

    // Entferne Drehung nach dem Drop
    stopDragging();

    // Entferne Hervorhebung der Liste
    unhighlightList(`${targetListId}List`);
}






















function findTask() {
    const searchTerm = document.getElementById('findTask').value.toLowerCase();
    tasks.forEach(list => {
        const content = document.getElementById(`${list.id}List`).querySelector('.taskContainer');
        content.innerHTML = "";
        const filteredTasks = list.task.filter(task =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
        if (filteredTasks.length === 0) {
            content.innerHTML = /*html*/`
                <div class="nothingToDo">
                    <p class="nothingToDoText">No matching Task found</p>
                </div>
            `;
        } else {
            filteredTasks.forEach(task => {
                content.innerHTML += /*html*/`
                    <div draggable="true" ondragstart="startDragging(${task.id})" class="boardCard">
                    <p class="${task.category.class} taskCategory">${task.category.name}</p>
                        <p class="taskCardTitle">${task.title}</p>
                        <p class="taskCardDescription">${task.description}</p>
                        <div class="subtasksContainer">
                            <div class="progress" role="progressbar" aria-label="Basic example" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                                <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                            </div>
                            <p class="taskCardSubtasks">${doneCount}/${totalCount} Subtasks</p>                        </div>
                        <div class="BoardCardFooter">
                            <div class="worker">
                                ${task.workers.map((worker, index) =>
                    `<p class="${worker.class} workerEmblem" style="margin-left: ${index === 1 ? '-10px' : '0'};">${worker.name.charAt(0)}</p>`
                ).join('')}
                            </div>
                            <img class="priority" src="../../assets/icons/png/PrioritySymbols${task.priority}.png"> 
                        </div>
                    </div>
                `;
            });
        }
    });
}




function editTask(taskId) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId);
    const editTaskPopupOverlay = document.getElementById("editTaskPopupOverlay");
    const editTaskPopupContainer = document.getElementById("editTaskPopupContainer");
    if (editTaskPopupOverlay && editTaskPopupContainer && task) {
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
    } else {
        console.error("Edit task popup overlay or container not found.");
    };
    openTaskPopup(taskId);
}




let tempPriority = null; 

function setPriority(priority) {
    tempPriority = priority; 
    document.querySelectorAll('.priorityBtn').forEach(btn => btn.classList.remove('active')); 
    const activeButton = document.getElementById(`prio${priority}`); 
    if (activeButton) {
        activeButton.classList.add('active'); 
    }
}






function saveTaskChanges(taskId) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId);
    if (!task) {
        console.error(`Task with ID ${taskId} not found.`);
        return;
    }
    const titleInput = document.getElementById("title").value.trim();
    const descriptionInput = document.getElementById("description").value.trim();
    const dueDateInput = document.getElementById("dueDate").value;
    const categoryInput = document.getElementById("category").value;
    if (tempPriority) {
        task.priority = tempPriority;
        tempPriority = null;
    }
    if (titleInput) task.title = titleInput;
    task.description = descriptionInput; 
    if (dueDateInput) task.due_Date = dueDateInput;
    if (categoryInput) {
        task.category.name = categoryInput;
        task.category.class = categoryInput === "Technical Task" 
            ? "categoryTechnicalTask" 
            : "categoryUserStory"; 
    }
    closeEditTaskPopup();
    renderBoard();
    openTaskPopup(taskId);

    console.log(`Task with ID ${taskId} updated successfully.`);
}





function addNewSubtask(taskId) {
    const task = tasks.flatMap(list => list.task).find(t => t.id === taskId);
    const newSubtaskInput = document.getElementById('newSubtaskInput');

    if (task && newSubtaskInput && newSubtaskInput.value.trim() !== '') {
        task.subtasks.push({ todo: newSubtaskInput.value.trim() });
        newSubtaskInput.value = '';
        renderBoard();
    } else {
        console.error("Failed to add new subtask or input is empty.");
    }
}




function closeEditTaskPopup() {
    document.getElementById("editTaskPopupOverlay").classList.remove("visible");
    document.getElementById("mainContent").classList.remove("blur");
}


let taskIdCounter = 1;





































let currentListId = 'todo'; 

function openAddTaskPopup(listId) {
    currentListId = listId;
    const popup = document.getElementById('addTaskPopupOverlay');
    if (popup) {
        popup.classList.remove('hidden');
    }
}


function closeAddTaskPopup() {
    const popup = document.getElementById('addTaskPopupOverlay');
    if (popup) {
        popup.classList.add('hidden'); 
    }
}

function addTaskToList(event) {
    if (event) event.preventDefault(); 

    const title = document.getElementById('title').value.trim();
    const dueDate = document.getElementById('date').value;
    const category = document.getElementById('category').value;


    if (!title) {
        alert('Title is required!');
        return;
    }
    if (!dueDate) {
        alert('Due date is required!');
        return;
    }
    if (!category) {
        alert('Category is required!');
        return;
    }

    const description = document.getElementById('description').value.trim();
    const subtaskInputs = document.querySelectorAll('.addSubTaskInput');
    const subtasks = Array.from(subtaskInputs).map(input => ({ todo: input.value.trim() })).filter(st => st.todo);
    const newTask = {
        id: Date.now(),
        title: title,
        description: description,
        workers: [{ name: 'Default Worker', class: 'worker-default' }],
        due_Date: dueDate,
        priority: document.querySelector('.priorityBtn.active')?.id.replace('prio', '') || 'Low',
        category: { name: category, class: `category${category.replace(' ', '')}` },
        subtasks: subtasks
    };

    const targetList = tasks.find(list => list.id === currentListId);
    if (targetList) {
        targetList.task.push(newTask);
        renderBoard();
        closeAddTaskPopup();
        document.getElementById('addTaskFormTask').reset();
        console.log(`Task successfully added to "${currentListId}"`);
    } else {
        console.error(`List with ID "${currentListId}" not found.`);
    };
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

