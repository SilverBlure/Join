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


let dropdownOpen = false;

let selectedContacts = []; 

function toggleContactsDropdown() {
    const dropdownList = document.getElementById("contactsDropdownList");
    dropdownOpen = !dropdownOpen;
    if (dropdownOpen) {
        renderContactsDropdown();
        dropdownList.classList.add("open");
    } else {
        dropdownList.classList.remove("open");
    }
}


function renderContactsDropdown() {
    const dropdownList = document.getElementById("contactsDropdownList");
    dropdownList.innerHTML = "";
    if (!contactsArray || contactsArray.length === 0) {
        console.error("No contacts available to render");
        dropdownList.innerHTML = "<li>Keine Kontakte verfügbar</li>";
        return;
    }
    contactsArray.forEach(contact => {
        const li = document.createElement("li");
        li.classList.add("dropdown-item");
        const circle = document.createElement("div");
        const nameSpan = document.createElement("span");
        nameSpan.classList.add("contact-name");
        nameSpan.textContent = contact.name;
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = contact.name;
        checkbox.checked = isContactSelected(contact.name);
        checkbox.addEventListener("change", (event) => {
            handleContactSelection(contact, event.target.checked);
        });
        li.appendChild(circle);
        li.appendChild(nameSpan);
        li.appendChild(checkbox);
        dropdownList.appendChild(li);
    });
}


function handleContactSelection(contact, isChecked) {
    if (!window.localContacts) {
        window.localContacts = {}; 
    }
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (isChecked) {
        if (!isContactSelected(contact.name)) {
            selectedContacts.push(contact);
            window.localContacts[contact.id] = contact; 
            const li = document.createElement("li");
            li.id = `selected_${contact.id}`;
            li.textContent = contact.name; 
            selectedContactsList.appendChild(li);
        }
    } else {
        removeContact(contact);
    }
    updateDropdownLabel();
}


function removeContact(contact) {
    selectedContacts = selectedContacts.filter(selected => selected.id !== contact.id);
    delete window.localContacts[contact.id];
    const selectedContactItem = document.getElementById(`selected_${contact.id}`);
    if (selectedContactItem) {
        selectedContactItem.remove();
    }
    updateDropdownLabel();
}


function isContactSelected(contactName) {
    return selectedContacts.some(contact => contact.name === contactName);
}


function updateDropdownLabel() {
    const dropdownLabel = document.getElementById("dropdownLabel");
    if (selectedContacts.length === 0) {
        dropdownLabel.textContent = "Wähle einen Kontakt aus";
    } else {
        dropdownLabel.textContent = `${selectedContacts.length} Kontakt(e) ausgewählt`;
    }
}


document.addEventListener("click", function (event) {
    const dropdownList = document.getElementById("contactsDropdownList");
    const createContactBar = document.querySelector(".createContactBar");
    if (
        dropdownOpen && 
        !dropdownList.contains(event.target) && 
        !createContactBar.contains(event.target)
    ) {
        dropdownList.classList.remove("open");
        dropdownOpen = false;
    }
});


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

/**
 * Setzt das Formular zurück und leert die definierten Listen, einschließlich der globalen Zustände.
 */
function resetFormAndLists() {
    // Formular zurücksetzen
    const form = document.getElementById("addTaskFormTask"); // Ersetze 'addTaskFormTask' mit der ID deines Formulars
    if (form) {
        form.reset(); // Setzt alle Formularfelder zurück
    }

    // Listen leeren
    const listsToClear = ["subTasksList", "selectedContactsList"]; // IDs der Listen, die geleert werden sollen
    listsToClear.forEach(listId => {
        const list = document.getElementById(listId);
        if (list) {
            while (list.firstChild) {
                list.removeChild(list.firstChild); // Entfernt alle Listeneinträge einzeln
            }
        }
    });

    // Lokale Zustände leeren
    if (window.localSubtasks) {
        window.localSubtasks = {}; // Subtask-Daten zurücksetzen
    }
    if (window.localEditedContacts) {
        window.localEditedContacts = []; // Kontakt-Daten zurücksetzen
    }

    console.log("Formular, Listen und globale Zustände erfolgreich zurückgesetzt.");
}


function refreshLists() {
    const subTasksList = document.getElementById("subTasksList");
    const selectedContactsList = document.getElementById("selectedContactsList");

    if (subTasksList) {
        subTasksList.innerHTML = ""; // Sicherstellen, dass die Liste leer ist
    }
    if (selectedContactsList) {
        selectedContactsList.innerHTML = ""; // Sicherstellen, dass die Liste leer ist
    }
}

