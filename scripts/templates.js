function renderCurrentLetter(currentLetter) {
    return `<div>
    <div class="separator">${currentLetter}</div>
        <div class="contact-group" id="group-${currentLetter}"></div>
    </div>`;

}


function contactTemps(i, initialien) {
    return /*html*/ `<div class="contact">
                <div class="shortInfo" onclick="renderContactDetails(${i})">
                    <div class="tag">
                        <p id="userTag${i}" class="contactUserTag">${initialien}</p>
                    </div>
                    <div>
                        <p>${contactsArray[i].name}</p>
                        <a class="mailTo" href="mailto:${contactsArray[i].email}"><p>${contactsArray[i].email}</p></a>
                    </div>
                </div>
            </div>`;
}


function contactDetailsTemps(i, initialien) {
    return /*html*/`<div class="InfoBoxHead">
<div><p id="userTagBig${i}" class="userTagBig">${initialien}</p></div>
    <div>
        <div><H2>${contactsArray[i].name}</H2></div>
        <img class="pointer" onclick="editContact(${i})" src="../assets/icons/png/edit.png" alt=""><img class="pointer" onclick="deleteContact(${i})" src="../assets/icons/png/Delete contact.png" alt="">
    </div>
    </div>
    <h4>Contact Information</h4>
    <div>
        <div class="email"><b>Email</b><br><a class="mailTo" href="mailto:"${contactsArray[i].email}">${contactsArray[i].email}</a></div>
        <div class="phone"><b>Phone</b><br>${contactsArray[i].phone}</div>
    </div> `;
}

function addContactTemp(){
    return /*html*/ `
    <div>
        <img class="userImg" src="../assets/icons/png/userpic_leer.png" alt="">
    </div>
    <div class="createContact">
    <div class="closeBtn">
        <img class="close" onclick="closeAddContact()" src="../assets/icons/png/iconoir_cancel.png" alt="">
    </div>
    <div>
    <form class="contacInput" id="contactForm">
        <div class="inputBorder">
            <span class="innerInputfield">
                <input class="noBorder" name="name" type="text" id="name" placeholder="Firstname Lastname" required>
                <img src="../../assets/icons/png/person.png">
            </span>
        </div>
    
        <div class="inputBorder">
            <span class="innerInputfield">
                <input id="email" name="email" type="email" class="noBorder" placeholder="Email" required>
                <img src="../../assets/icons/svg/mail.svg">
            </span>
        </div>
    
        <div class="inputBorder">
            <span class="innerInputfield">
                <input id="phone" name="phone" type="number" class="noBorder" placeholder="phone" required>
                <img src="../assets/icons/png/call.png">
            </span>
        </div>
    </form>
    </div>
    <div class="createContactBtn">
        <button type="submit" class="addbutton, notOnMobile" onclick="closeAddContact()">cancel</button><button class="addbutton" onclick="checkInput()">create contact <img src="../assets/icons/png/check.png"></button>
    </div>
</div>
`;
}

function editContactTemp(i){
    return /*html*/ `
    <div>
        <img src="../assets/icons/png/userpic_leer.png" alt="">
    </div>
    <div class="createContact">
    <div class="closeBtn">
        <img class="close" onclick="closeAddContact()" src="../assets/icons/png/iconoir_cancel.png" alt="">
    </div>
    <div>
    <form class="contacInput" id="contactForm">
        <div class="inputBorder">
            <innerInputfield class="innerInputfield">
                <input class="noBorder" id="name" placeholder="Name" required>
                <img src="../../assets/icons/png/person.png">
            </innerInputfield>
        </div>
    
        <div class="inputBorder">
            <innerInputfield class="innerInputfield">
                <input id="email" type="email" class="noBorder" placeholder="Email" required>
                <img src="../../assets/icons/svg/mail.svg">
            </innerInputfield>
        </div>
    
        <div class="inputBorder">
            <innerInputfield class="innerInputfield">
                <input id="phone" type="number" class="noBorder" placeholder="phone" required>
                <img src="../assets/icons/png/call.png">
            </innerInputfield>
        </div>
    </form>
    </div>
    <div class="createContactBtn">
        <button onclick="closeAddContact()">cancel</button><button onclick="getFromEdit(${i})">edit contact <img src="../assets/icons/png/check.png"></button>
    </div>
</div>
`;
}

function deleteContactTemp(i){
    return /*html*/ `<div class="deleteDialog"><div>Do you really want to delete the contact?</div>
    <div class="deleteBtn"><button onclick="closeAddContact()">cancel</button><button onclick="deleteContactDatabase(${i})">delete Contact</button></div></div>
    `
}

















// addTask Templates
function generateSubtaskHTML(subtaskId, title) {
    return /*html*/`
        <div class="subtask-item" id="${subtaskId}">
            <input type="checkbox" onchange="toggleLocalSubtaskStatus('${subtaskId}', this.checked)">
            <p class="subtaskText" onclick="editLocalSubtask('${subtaskId}')">${title}</p>
            <img src="../../assets/icons/png/iconoir_cancel.png" onclick="removeSubtaskFromList('${subtaskId}')" alt="Remove Subtask">
        </div>
    `;
}



function createContactItem(contactId, initials, name, color) {
    return /*html*/ `
        <div class="workerInformation">
            <p id="${contactId}" class="workerEmblem workerIcon" style="background-color: ${color};">
                ${initials}
            </p>
            <p class="workerName">${name}</p>
            <img src="./../assets/icons/png/iconoir_cancel.png" onclick="removeContact('${contactId}')" alt="Remove Contact">
        </div>
    `;
}













// Board Templates

function renderEmptyMessage(container) {
    container.innerHTML += `
        <div class="nothingToDo">
            <p class="nothingToDoText">No Tasks To-Do</p>
        </div>
    `;
}


function generateBoardCardHTML(taskId, task, listId, progressHTML, workersHTML) {
    return `
        <div id="boardCard-${taskId}" 
             draggable="true"
             ondragstart="startDragging('${taskId}', '${listId}')"
             onclick="openTaskPopup('${taskId}', '${listId}')"
             class="boardCard">
            <p class="${task.category?.class || 'defaultCategory'} taskCategory">${task.category?.name || "No Category"}</p>
            <p class="taskCardTitle">${task.title}</p>
            <p class="taskCardDescription">${task.description}</p>
            ${progressHTML}
            <div class="BoardCardFooter">
                <div class="worker">${workersHTML}</div>
                <img class="priority" src="./../assets/icons/png/PrioritySymbols${task.priority || 'Low'}.png">
            </div>
        </div>
    `;
}


function generateSubtasksProgressHTML(progressPercent, doneCount, totalCount) {
    return `
        <div class="subtasksContainer">
            <div class="progress" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                <div class="progress-bar" style="width: ${progressPercent}%;"></div>
            </div>
            <p class="taskCardSubtasks">${doneCount}/${totalCount} Subtasks</p>
        </div>
    `;
}


function generateWorkersHTML(task) {
    if (!task.workers || task.workers.length === 0) {
        return '<p>No selected Contacts.</p>';
    }
    return task.workers.map(worker => `
        <div class="workerInformation">
            <p class="workerEmblem" style="background-color: ${worker.color || getColorHex(worker.name, "")};">
                ${getInitials(worker.name)}
            </p>
            <p class="workerName">${worker.name}</p>
        </div>
    `).join("");
}


// Für die Anzeige in der Task-Popup
function generatePopupSingleSubtaskHTML(subtask, subtaskId, taskId, listId) {
    return `
        <div id="subtask-${taskId}-${subtaskId}" class="subtask-item">
            <input 
                class="subtasksCheckbox popupIcons" 
                type="checkbox" 
                ${subtask.done ? 'checked' : ''} 
                onchange="toggleSubtaskStatus('${listId}', '${taskId}', '${subtaskId}', this.checked)">
            <p class="subtaskText" style="text-decoration: ${subtask.done ? 'line-through' : 'none'};">
                ${subtask.title || 'Unnamed Subtask'}
            </p>
        </div>
    `;
}

// Für die Edit-Seite
function generateEditSingleSubtaskHTML(subtaskId, subtask) {
    return `
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
    `;
}




function generatePopupHeaderHTML(task) {
    return `
        <div class="popupHeader">
            <p class="${task.category?.class || 'defaultCategory'} taskCategory">
                ${task.category?.name || 'No Category'}
            </p>
            <img class="popupIcons" onclick="closeTaskPopup()" src="../../assets/icons/png/iconoir_cancel.png">
        </div>
    `;
}


function generatePopupDetailsHTML(task) {
    return `
        <h1>${task.title || 'Kein Titel'}</h1>
        <p class="popupDescription">${task.description || 'Keine Beschreibung'}</p>
        <p class="popupInformation">Due Date: <strong>${task.dueDate || 'Kein Datum'}</strong></p>
        <p class="popupInformation">Priority: <strong>${task.priority || 'Low'}
            <img src="./../assets/icons/png/PrioritySymbols${task.priority || 'Low'}.png">
        </strong></p>
    `;
}


function generateWorkerContainerHTML(workersHTML) {
    return `
        <div class="workerContainer">
            ${workersHTML}
        </div>
    `;
}


function generateSubtasksContainerHTML(subtasksHTML) {
    return `
        <div class="subtasks-container">
            <h2>Subtasks:</h2>
            ${subtasksHTML}
        </div>
    `;
}


function generatePopupActionsHTML(listId, taskId) {
    return `
        <div class="popupActions">
            <img onclick="editTask('${listId}', '${taskId}')" class="popupIcons" src="./../assets/icons/png/edit.png">
            <img onclick="deleteTask('${listId}', '${taskId}')" class="popupIcons" src="./../assets/icons/png/Delete contact.png">
        </div>
    `;
}


function generatePriorityButtonHTML(priority, selectedPriority) {
    return `
        <button 
            type="button" 
            class="priorityBtn ${priority.name === selectedPriority ? 'active' : ''}" 
            id="prio${priority.name}"
            onclick="setPriority('${priority.name}')">
            <img src="${priority.src}" alt="${priority.name} Priority Icon">
            ${priority.name}
        </button>
    `;
}





function generateCreateContactBarHTML(dropdownOptions, selectedContactsHTML) {
    return `
        <div class="createContactBar">
            <select id="contactSelection" onchange="handleContactSelectionForEdit()">
                <option value="" disabled selected hidden>Select Contact</option>
                ${dropdownOptions}
            </select>
            <ul id="selectedContactsList">${selectedContactsHTML}</ul>
        </div>
    `;
}


function generateSingleWorkerHTML(worker) {
    return `
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
    `;
}

function generateEditTaskForm(task, subtasksHTML, contactsDropdownHTML, listId, taskId) {
    return `
        <div class="popupHeader">
            <h1>Edit Task</h1>
            <img class="icon close" onclick="closeEditTaskPopup()" src="./../assets/icons/png/iconoir_cancel.png">
        </div>
        <form id="editTaskForm" onsubmit="saveTaskChanges(event, '${listId}', '${taskId}')">
            <div class="formParts">
                <div class="formPart">
                    <label for="title">Title<span class="requiredStar">*</span></label>
                    <input type="text" id="title" value="${task.title || ''}" required>
                    <label for="description">Description</label>
                    <textarea id="description" rows="5">${task.description || ''}</textarea>
                    <label for="contactSelection">Assigned to</label>
                    ${contactsDropdownHTML}
                </div>
                <div class="separator"></div>
                <div class="formPart">
                    <label for="dueDate">Due Date<span class="requiredStar">*</span></label>
                    <input type="date" id="dueDate" value="${task.dueDate || ''}">
                    <label for="priority">Priority</label>
                    <div class="priorityBtnContainer">
                        ${generatePriorityButtonsHTML(task.priority)}
                    </div>
                    <label for="category">Category<span class="requiredStar">*</span></label>
                    <select id="category" required>
                        <option value="Technical Task" ${task.category?.name === 'Technical Task' ? 'selected' : ''}>Technical Task</option>
                        <option value="User Story" ${task.category?.name === 'User Story' ? 'selected' : ''}>User Story</option>
                    </select>
                    <label for="subtask">Subtasks</label>
                    <div id="subTasksList">
                        ${subtasksHTML}
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
}


function generateNewSubtaskHTML(subtaskId, subtaskTitle) {
    return `
        <div class="subtask-item" id="subtask-${subtaskId}">
            <p class="subtaskText">${subtaskTitle}</p>
            <img 
                class="hoverBtn" 
                src="../../assets/icons/png/iconoir_cancel.png" 
                onclick="removeSubtaskFromList('${subtaskId}')"
                alt="Delete Subtask">
        </div>
    `;
}


function generateEditSubtaskHTML(taskId, subtaskId, currentTitle) {
    return `
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


function generateSubtaskItemHTML(subtaskId, subtaskTitle) {
    return `
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
}
