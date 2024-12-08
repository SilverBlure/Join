/**
 * Gibt die lokalen Subtasks zurück, oder ein leeres Objekt, falls keine vorhanden sind.
 * @returns {Object} - Die lokalen Subtasks.
 */
function getLocalSubtasks() {
    return window.localSubtasks || {};
}



/**
 * Fügt einen neuen Subtask hinzu, wenn die Eingabetaste gedrückt wird.
 * @param {Event} event - Das Event des Tastendrucks.
 */
function handleSubtaskKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addNewSubtask();
    }
}



/**
 * Entfernt einen Subtask aus den lokalen Daten und dem DOM.
 * @param {string} subtaskId - Die ID des zu entfernenden Subtasks.
 */
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



/**
 * Rendert den Fortschritt der Subtasks als HTML.
 * @param {Object} subtasks - Die Subtasks des Tasks.
 * @returns {string} - HTML für den Subtask-Fortschritt.
 */
function renderSubtaskProgress(subtasks) {
    const subtaskArray = subtasks ? Object.values(subtasks) : [];
    if (subtaskArray.length === 0) return "";
    const totalCount = subtaskArray.length;
    const doneCount = subtaskArray.filter(st => st.done).length;
    const progressPercent = (doneCount / totalCount) * 100;
    return generateSubtasksProgressHTML(progressPercent, doneCount, totalCount);
}



/**
 * Generiert HTML für die Subtasks eines Tasks.
 * @param {Object} task - Der Task, der Subtasks enthält.
 * @param {string} taskId - Die ID des Tasks.
 * @param {string} listId - Die ID der Liste, zu der der Task gehört.
 * @returns {string} - HTML für die Subtasks.
 */
function generateSubtasksHTML(task, taskId, listId) {
    const subtasks = task.subtasks;
    if (!subtasks) {
        return '<p>No subtasks in task.</p>';
    }
    return Object.entries(subtasks).map(([subtaskId, subtask]) => {
        if (!subtask || typeof subtask !== "object" || !("title" in subtask) || !("done" in subtask)) {
            return `<p>${subtaskId}</p>`;
        }
        return generatePopupSingleSubtaskHTML(subtask, subtaskId, taskId, listId);
    }).join('');
}



/**
 * Generiert HTML für das Bearbeiten von Subtasks.
 * @param {Object} subtasks - Die Subtasks des Tasks.
 * @returns {string} - HTML für das Bearbeiten der Subtasks.
 */
function generateEditSubtasksHTML(subtasks = {}) {
    if (Object.keys(subtasks).length === 0) {
        return '<p>No subtask in Task.</p>';
    }
    return Object.entries(subtasks).map(([subtaskId, subtask]) => 
        generateEditSingleSubtaskHTML(subtaskId, subtask)
    ).join('');
}



/**
 * Initialisiert den lokalen Zustand eines Tasks mit seinen Arbeitern und Subtasks.
 * @param {Object} task - Der Task, dessen Zustand initialisiert werden soll.
 */
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



/**
 * Fügt einen neuen Subtask hinzu und aktualisiert das DOM.
 */
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



/**
 * Ermöglicht das Bearbeiten eines Subtasks im Formular.
 * @param {string} taskId - Die ID des Tasks, zu dem der Subtask gehört.
 * @param {string} subtaskId - Die ID des Subtasks, der bearbeitet werden soll.
 */
async function editSubtask(taskId, subtaskId) {
    const subtaskElement = document.getElementById(`subtask-${taskId}-${subtaskId}`);
    if (!subtaskElement) return;
    const subtaskTextElement = subtaskElement.querySelector(".subtaskText");
    if (!subtaskTextElement) return;
    const currentTitle = subtaskTextElement.textContent.trim();
    const editSubtaskHTML = generateEditSubtaskHTML(taskId, subtaskId, currentTitle);
    subtaskTextElement.outerHTML = editSubtaskHTML;
}



/**
 * Speichert die Änderungen eines Subtasks lokal.
 * @param {string} subtaskId - Die ID des Subtasks.
 * @param {string} newTitle - Der neue Titel des Subtasks.
 */
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



/**
 * Fügt einen neuen Subtask zur lokalen Liste hinzu und aktualisiert das DOM.
 */
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



/**
 * Generiert das HTML für das Dropdown-Menü der Kontakte.
 * @returns {string} - Das generierte HTML für das Dropdown-Menü.
 */
function generateContactsDropdownHTML() {
    const dropdownOptions = contactsArray.map(contact => `
        <option value="${contact.name}">${contact.name}</option>
    `).join("");
    const selectedContactsHTML = window.localEditedContacts
        .map(worker => generateSingleWorkerHTML(worker))
        .join("") || '<p>Keine zugewiesenen Arbeiter.</p>';
    return generateCreateContactBarHTML(dropdownOptions, selectedContactsHTML);
}



/**
 * Rendert das Dropdown-Menü für Kontakte.
 */
function renderContactsDropdown() {
    let dropDown = document.getElementById('contactSelection');
    if (dropDown.options.length > 0) return;
    dropDown.innerHTML = "";
    for (let i = 0; i < contactsArray.length; i++) {
        dropDown.innerHTML += `
            <option value="${contactsArray[i].name}">${contactsArray[i].name}</option>
        `;
    }
}



/**
 * Handhabt die Auswahl eines Kontakts aus dem Dropdown-Menü.
 */
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



/**
 * Rendert die ausgewählten Kontakte im DOM.
 */
function renderSelectedContacts() {
    const selectedContactsList = document.getElementById("selectedContactsList");
    selectedContactsList.innerHTML = window.localEditedContacts
        .map(workerName => generateWorkerHTML(workerName))
        .join("");
}



/**
 * Entfernt einen Kontakt aus der lokalen Bearbeitung und aktualisiert das DOM.
 * @param {string} workerName - Der Name des Kontakts, der entfernt werden soll.
 */
function removeContact(workerName) {
    window.localEditedContacts = window.localEditedContacts.filter(contact => contact !== workerName);
    renderSelectedContacts();
}



/**
 * Rendert das Dropdown-Menü für Kontakte im Bearbeitungsmodus.
 */
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



/**
 * Entfernt einen Kontakt aus dem Bearbeitungsformular und aktualisiert das DOM.
 * @param {string} workerName - Der Name des Kontakts, der entfernt werden soll.
 */
function removeContactFromEdit(workerName) {
    if (!Array.isArray(window.localEditedContacts)) return;
    window.localEditedContacts = window.localEditedContacts.filter(contact => contact.name !== workerName);
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (selectedContactsList) {
        selectedContactsList.innerHTML = window.localEditedContacts.length > 0
            ? window.localEditedContacts
                  .map(contact => generateEditableWorkerHTML(contact))
                  .join("")
            : '<p>Keine zugewiesenen Arbeiter.</p>';
    }
}



/**
 * Handhabt die Auswahl eines Kontakts im Bearbeitungsmodus.
 */
function handleContactSelectionForEdit() {
    const dropdown = document.getElementById("contactSelection");
    const selectedContactName = dropdown.value;
    if (!selectedContactName) return;
    if (window.localEditedContacts.some(contact => contact.name === selectedContactName)) return;
    const newContact = { name: selectedContactName };
    window.localEditedContacts.push(newContact);
    const selectedContactsList = document.getElementById("selectedContactsList");
    selectedContactsList.insertAdjacentHTML("beforeend", generateWorkerHTMLForEdit(selectedContactName));
    dropdown.value = "";
}

