function getLocalSubtasks() {
    return window.localSubtasks || {};
}



function handleSubtaskKey(event) {
    if (event.key === "Enter") {
        event.preventDefault(); 
        addNewSubtask(); 
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



function renderSubtaskProgress(subtasks) {
    const subtaskArray = subtasks ? Object.values(subtasks) : [];
    if (subtaskArray.length === 0) return "";
    const totalCount = subtaskArray.length;
    const doneCount = subtaskArray.filter(st => st.done).length;
    const progressPercent = (doneCount / totalCount) * 100;
    return generateSubtasksProgressHTML(progressPercent, doneCount, totalCount);
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



function generateEditSubtasksHTML(subtasks = {}) {
    if (Object.keys(subtasks).length === 0) {
        return '<p>No subtask in Task.</p>';
    }
    return Object.entries(subtasks).map(([subtaskId, subtask]) => 
        generateEditSingleSubtaskHTML(subtaskId, subtask)
    ).join('');
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



function generateContactsDropdownHTML() {
    const dropdownOptions = contactsArray.map(contact => `
        <option value="${contact.name}">${contact.name}</option>
    `).join("");
    const selectedContactsHTML = window.localEditedContacts.map(worker => generateSingleWorkerHTML(worker)).join("") 
        || '<p>Keine zugewiesenen Arbeiter.</p>';
    return generateCreateContactBarHTML(dropdownOptions, selectedContactsHTML);
}



function renderContactsDropdown(){
    let dropDown = document.getElementById('contactSelection')
    if (dropDown.options.length > 0) return; 
     dropDown.innerHTML="";
     for (let i = 0; i < contactsArray.length; i++) {
       document.getElementById('contactSelection').innerHTML += /*html*/`
               <option value="${contactsArray[i].name}">${contactsArray[i].name}</option>;
       `
     }
 }



 function handleContactSelection() {
    if (!Array.isArray(window.localEditedContacts)) window.localEditedContacts = [];
    const contactSelection = document.getElementById("contactSelection");
    const selectedContactName = contactSelection?.value;
    if (!selectedContactName) return; 
    if (window.localEditedContacts.includes(selectedContactName)) return;
    window.localEditedContacts.push(selectedContactName);
    renderSelectedContacts();
    contactSelection.value = "";
}



function renderSelectedContacts() {
    const selectedContactsList = document.getElementById("selectedContactsList");
    selectedContactsList.innerHTML = window.localEditedContacts
        .map(workerName => {
            const initials = getInitials(workerName);
            const color = getColorHex(workerName, "");
            return `
                <div class="workerInformation">
                    <p class="workerEmblem workerIcon" style="background-color: ${color};">
                        ${initials}
                    </p>
                    <p class="workerName">${workerName}</p>
                    <img 
                        class="hoverBtn" 
                        src="../../assets/icons/png/iconoir_cancel.png" 
                        onclick="removeContact('${workerName}')"
                        alt="Remove Worker">
                </div>
            `;
        })
        .join("");
}



function removeContact(workerName) {
    window.localEditedContacts = window.localEditedContacts.filter(contact => contact !== workerName);
    renderSelectedContacts();
}



function renderContactsDropdownForEdit() {
    const dropdown = document.getElementById("contactSelection");
    if (dropdown.options.length > 0) return; 
    dropdown.innerHTML = ""; 
    for (let contact of contactsArray) {
        dropdown.innerHTML += `
            <option value="${contact.name}">${contact.name}</option>
        `;
    }
}



function removeContactFromEdit(workerName) {
    if (!Array.isArray(window.localEditedContacts)) return; 
    window.localEditedContacts = window.localEditedContacts.filter(contact => contact.name !== workerName);
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (selectedContactsList) {
        selectedContactsList.innerHTML = window.localEditedContacts.length > 0
            ? window.localEditedContacts.map(contact => {
                  const initials = getInitials(contact.name);
                  const color = getColorHex(contact.name, "");
                  return `
                      <div class="workerInformation">
                          <p class="workerEmblem workerIcon" style="background-color: ${color};">
                              ${initials}
                          </p>
                          <p class="workerName">${contact.name}</p>
                          <img 
                              class="hoverBtn" 
                              src="../../assets/icons/png/iconoir_cancel.png" 
                              onclick="removeContactFromEdit('${contact.name}')"
                              alt="Remove Worker">
                      </div>
                  `;
              }).join("")
            : '<p>Keine zugewiesenen Arbeiter.</p>';
    }
}



function handleContactSelectionForEdit() {
    const dropdown = document.getElementById("contactSelection");
    const selectedContactName = dropdown.value;
    if (!selectedContactName) return; 
    if (window.localEditedContacts.some(contact => contact.name === selectedContactName)) return;
    const newContact = { name: selectedContactName };
    window.localEditedContacts.push(newContact);
    const selectedContactsList = document.getElementById("selectedContactsList");
    const initials = getInitials(selectedContactName);
    const color = getColorHex(selectedContactName, "");
    selectedContactsList.insertAdjacentHTML("beforeend", `
        <div class="workerInformation">
            <p class="workerEmblem workerIcon" style="background-color: ${color};">${initials}</p>
            <p class="workerName">${selectedContactName}</p>
            <img 
                class="hoverBtn" 
                src="../../assets/icons/png/iconoir_cancel.png" 
                onclick="removeContactFromEdit('${selectedContactName}')"
                alt="Remove Worker">
        </div>
    `);
    dropdown.value = "";
}
