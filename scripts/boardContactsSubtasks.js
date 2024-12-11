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
 * Fügt einen neuen Subtask hinzu und aktualisiert die Subtask-Liste im DOM.
 */
function addNewSubtask() {
    const subTaskInput = document.getElementById("newSubtaskInput") || document.getElementById("subTaskInputAddTask");
    const subTasksList = document.getElementById("subTasksList");
    const subtaskTitle = subTaskInput.value.trim();
    const subtaskId = `subtask_${Date.now()}`;
    const subtaskItem = { title: subtaskTitle, done: false };
    window.localSubtasks = window.localSubtasks || {};
    window.localSubtasks[subtaskId] = subtaskItem;
    const subtaskHTML = generateNewSubtaskHTML(subtaskId, subtaskTitle);
    subTasksList.insertAdjacentHTML("beforeend", subtaskHTML);
    subTaskInput.value = "";
    toggleSubtaskButtons();
}

/**
 * Entfernt einen Subtask aus der Liste und aus dem lokalen Zustand.
 * @param {string} subtaskId - Die ID des zu entfernenden Subtasks.
 */
function removeSubtaskFromList(subtaskId) {
    if (!subtaskId) {
        console.error("Fehler: Keine gültige Subtask-ID angegeben.");
        return;
    }

    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (subtaskElement) {
        subtaskElement.remove(); // Entferne das Element aus dem DOM
    } else {
        console.warn("Subtask-Element nicht gefunden:", subtaskId);
    }

    if (window.localSubtasks && window.localSubtasks[subtaskId]) {
        delete window.localSubtasks[subtaskId]; // Entferne den Subtask aus dem lokalen Zustand
    }
}




async function editSubtask(subtaskId) {
    // Suche nach dem Subtask-Element
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (!subtaskElement) return;

    // Suche nach dem Subtask-Text
    const subtaskTextElement = subtaskElement.querySelector(".subtaskText");
    if (!subtaskTextElement) {
        console.error("Subtask-Text-Element nicht gefunden.");
        return;
    }

    // Hole den aktuellen Titel aus dem Text-Element
    const currentTitle = subtaskTextElement.textContent.trim();
    if (!currentTitle) {
        console.error("Subtask-Text ist leer.");
        return;
    }

    // Generiere das Bearbeitungsfeld
    const editSubtaskHTML = generateEditSubtaskHTML(subtaskId, currentTitle);

    // Setze den HTML-Inhalt des Subtasks auf das Bearbeitungsfeld
    subtaskElement.innerHTML = editSubtaskHTML;
}



/**
 * Speichert die Änderungen eines Subtasks.
 * @param {string} subtaskId - Die ID des Subtasks.
 */
function saveSubtaskEdit(subtaskId) {
    // Abrufen des Eingabefelds basierend auf der Subtask-ID
    const inputElement = document.getElementById(`edit-input-${subtaskId}`);
    if (!inputElement) {
        console.error(`Eingabefeld für Subtask ${subtaskId} nicht gefunden.`);
        return;
    }

    // Abrufen des neuen Titels
    const newTitle = inputElement.value;
    console.log("saveSubtaskEdit aufgerufen mit:", { subtaskId, newTitle });

    // Überprüfen, ob der neue Titel definiert ist
    if (!newTitle || newTitle.trim() === "") {
        console.error("Fehler: newTitle ist undefined oder leer.");
        return;
    }

    // Sicherstellen, dass der neue Titel gültig ist
    const trimmedTitle = newTitle.trim();

    // Aktualisierung des lokalen Zustands
    if (window.localSubtasks && window.localSubtasks[subtaskId]) {
        window.localSubtasks[subtaskId].title = trimmedTitle;
        console.log("Subtask aktualisiert:", subtaskId, "mit neuem Titel:", trimmedTitle);
    } else {
        console.error("Subtask mit der ID nicht im lokalen Zustand gefunden:", subtaskId);
        return;
    }

    // Aktualisierung im DOM
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (subtaskElement) {
        subtaskElement.innerHTML = `
            <p class="subtaskText">${trimmedTitle}</p>
            <div class="subtaskButtons">
                <img src="./../assets/icons/png/editIcon.png" class="subtask-btn" onclick="editSubtask('${subtaskId}')">
                <div class="separatorSubtask"></div>
                <img src="./../assets/icons/png/D.png" class="subtask-btn" onclick="deleteSubtaskFromLocal('${subtaskId}')">
            </div>
        `;
    } else {
        console.error("Subtask-Element nicht gefunden im DOM:", subtaskId);
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

function toggleSubtaskButtons() {
    const input = document.getElementById("subTaskInputAddTask");
    const saveBtn = document.getElementById("saveSubtaskBtn");
    const clearBtn = document.getElementById("clearSubtaskBtn");
    const separator = document.getElementById("separatorSubtask")
    const subtaskImg = document.getElementById("subtaskImg");
    if (input.value.trim() !== "") {
        saveBtn.classList.remove("hidden");
        clearBtn.classList.remove("hidden");
        subtaskImg.classList.add("hidden");
        separator.classList.remove("hidden")
    } else {
        saveBtn.classList.add("hidden");
        clearBtn.classList.add("hidden");
        subtaskImg.classList.remove("hidden");
        separator.classList.add("hidden");

    }
}

function clearSubtaskInput() {
    const input = document.getElementById("subTaskInputAddTask");
    input.value = "";
}