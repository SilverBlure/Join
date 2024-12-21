/**
 * Behandelt Tasteneingaben beim Bearbeiten eines Subtasks.
 * @param {KeyboardEvent} event - Das Tastendruck-Ereignis.
 */
function handleSubtaskEditKey(event) {
    const subtaskId = event.target.id.replace("edit-input-", ""); // Extrahiere Subtask-ID aus der Eingabe-ID

    if (event.key === "Enter") {
        // Speichere die Änderungen, wenn Enter gedrückt wird
        event.preventDefault();
        saveEditedSubtask(subtaskId);
    } else if (event.key === "Escape") {
        // Breche die Bearbeitung ab, wenn Escape gedrückt wird
        event.preventDefault();
        cancelSubtaskEdit(subtaskId);
    }
}



/**
 * Behandelt das `onblur`-Event eines Subtask-Eingabefelds.
 * @param {Event} event - Das Blur-Event.
 */
function handleSubtaskBlur(event) {
    const subtaskId = event.target.id.replace("edit-input-", ""); // Extrahiere die Subtask-ID
    saveEditedSubtask(subtaskId); // Speichere den Subtask
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
 * Sammelt Subtasks aus der DOM-Subtask-Liste und erstellt ein Objekt.
 * @returns {Object} - Ein Objekt mit Subtasks im Format { subtaskId: { title, done } }.
 */
function collectSubtasksFromDOM() {
    const subTasksList = document.getElementById("subTasksList");
    if (!subTasksList) {
        console.warn("Subtask-Liste nicht gefunden.");
        return {};
    }

    const subtasks = {};
    const subtaskItems = subTasksList.querySelectorAll(".subtask-item");

    subtaskItems.forEach(item => {
        const subtaskId = item.id.replace("subtask-", "");
        const titleInput = item.querySelector(".subtaskText, .editSubtaskInput");
        const doneCheckbox = item.querySelector(".subtask-checkbox");

        if (titleInput) {
            subtasks[subtaskId] = {
                title: titleInput.value || titleInput.textContent.trim(),
                done: doneCheckbox ? doneCheckbox.checked : false,
            };
        }
    });

    return subtasks;
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
 * Ermöglicht die Bearbeitung eines Subtasks direkt im DOM.
 * @param {string} subtaskId - Die ID des Subtasks.
 */
function editSubtaskInLocal(subtaskId) {
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (!subtaskElement) return;

    const subtaskTextElement = subtaskElement.querySelector(".subtaskText");
    if (!subtaskTextElement) return;

    const currentTitle = subtaskTextElement.textContent.trim();
    const editHTML = `
        <input 
            type="text" 
            class="editSubtaskInput" 
            id="edit-input-${subtaskId}" 
            value="${currentTitle}"
            oninput="toggleSubtaskButtons()"
            onkeydown="handleSubtaskKey(event)">
            <div class="subtaskButtons">
            <img src="./../assets/icons/png/Subtasks icons11.png" id="saveSubtaskBtn" class="subtask-btn hidden" onclick="saveEditedSubtask('${subtaskId}')">
            <div id="separatorSubtask" class="separatorSubtask hidden"></div>
            <img src="./../assets/icons/png/iconoir_cancel.png" id="clearSubtaskBtn" class="subtask-btn hidden" onclick="clearSubtaskInput()">
                    </div>
    `;
    subtaskElement.innerHTML = editHTML;
}


function saveEditedSubtask(subtaskId) {
    if (!window.localSubtasks) {
        window.localSubtasks = {};
    }
    let subtask = window.localSubtasks[subtaskId];
    if (!subtask) {
        subtask = { title: "", done: false };
        window.localSubtasks[subtaskId] = subtask;
    }
    const inputElement = document.getElementById(`edit-input-${subtaskId}`);
    if (!inputElement) {
        return;
    }
    const newTitle = inputElement.value.trim();
    if (!newTitle) {
    }
    const oldTitle = subtask.title;
    subtask.title = newTitle || oldTitle; 
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (subtaskElement) {
        subtaskElement.innerHTML = `
            <p 
                id="subtask-p-${subtaskId}" 
                class="subtaskText" 
                onclick="editSubtask('${subtaskId}')">
                ${subtask.title}
            </p>
            <div class="subtaskButtons">
                <img 
                    src="./../assets/icons/png/editIcon.png" 
                    class="subtask-btn" 
                    onclick="editSubtask('${subtaskId}')">
                <div class="separatorSubtask"></div>
                <img 
                    src="./../assets/icons/png/D.png" 
                    class="subtask-btn" 
                    onclick="deleteSubtaskFromLocal('${subtaskId}')">
            </div>
        `;
    };
}


function initializeLocalTaskState(task) {
    window.localEditedContacts = Array.isArray(task.workers)
        ? task.workers.map(worker => ({
            name: worker.name,
            id: worker.id || `worker_${Date.now()}`, // Keine Farbe mehr
        }))
        : [];

    window.localEditedSubtasks = task.subtasks && typeof task.subtasks === "object" 
        ? { ...task.subtasks } 
        : {};

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
        return;
    }
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (subtaskElement) {
        subtaskElement.remove(); // Entferne das Element aus dem DOM
    } else {
    }
    if (window.localSubtasks && window.localSubtasks[subtaskId]) {
        delete window.localSubtasks[subtaskId]; // Entferne den Subtask aus dem lokalen Zustand
    }
}


async function editSubtask(subtaskId) {
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (!subtaskElement) return;
    const subtaskTextElement = subtaskElement.querySelector(".subtaskText");
    if (!subtaskTextElement) {
        console.error("Subtask-Text-Element nicht gefunden.");
        return;
    }
    const currentTitle = subtaskTextElement.textContent.trim();
    if (!currentTitle) {
        console.error("Subtask-Text ist leer.");
        return;
    }
    const editSubtaskHTML = generateEditSubtaskHTML(subtaskId, currentTitle);
    subtaskElement.innerHTML = editSubtaskHTML;
}


/**
 * Speichert die Änderungen eines Subtasks.
 * @param {string} subtaskId - Die ID des Subtasks.
 */
function saveSubtaskEdit(subtaskId) {
    const inputElement = document.getElementById(`edit-input-${subtaskId}`);
    if (!inputElement) {
        return;
    }
    const newTitle = inputElement.value;
       if (!newTitle || newTitle.trim() === "") {
        return;
    }
    const trimmedTitle = newTitle.trim();
    if (window.localSubtasks && window.localSubtasks[subtaskId]) {
        window.localSubtasks[subtaskId].title = trimmedTitle;
      
    } else {
        return;
    }
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
    };
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





let dropdownOpen = false;

let selectedContacts = [];


function closeContactsDropdown() {
    const dropdownList = document.getElementById("contactsDropdownList");
      dropdownList.classList.remove("open");
}


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
        dropdownList.innerHTML = "<li>Keine Kontakte verfügbar</li>";
        return;
    }
    contactsArray.forEach((contact) => {
        const li = document.createElement("li");
        li.classList.add("dropdown-item"); 
        if (isContactSelected(contact.name)) {
            li.classList.add("selected-contact-item"); 
        }
        const [vorname, nachname] = contact.name.split(" ");
        const backgroundColor = getColorHex(vorname?.toLowerCase() || "", nachname?.toLowerCase() || "");
        const workerEmblem = document.createElement("p");
        workerEmblem.classList.add("workerEmblemList");
        workerEmblem.style.backgroundColor = backgroundColor; 
        workerEmblem.textContent = getInitials(contact.name); 
        const nameSpan = document.createElement("span");
        nameSpan.classList.add("contact-nameList");
        nameSpan.textContent = contact.name;
        const img = document.createElement("img");
        img.classList.add("status-icon");
        img.src = isContactSelected(contact.name)
            ? "./../assets/icons/png/checkButtonContacts.png" 
            : "./../assets/icons/png/checkButtonEmpty.png"; 
        img.alt = isContactSelected(contact.name) ? "Selected" : "Not Selected";
        img.style.cursor = "pointer";
        li.addEventListener("click", () => {
            const isSelected = isContactSelected(contact.name);
            handleContactSelection(contact, !isSelected);
            if (!isSelected) {
                li.classList.add("selected-contact-item");
            } else {
                li.classList.remove("selected-contact-item");
            }
            img.src = !isSelected
                ? "./../assets/icons/png/checkButtonContacts.png"
                : "./../assets/icons/png/checkButtonEmpty.png";
            img.alt = !isSelected ? "Selected" : "Not Selected";
        });
        li.appendChild(workerEmblem);
        li.appendChild(nameSpan);
        li.appendChild(img);
        dropdownList.appendChild(li);
    });
}


function isContactSelected(contactName) {
    return Object.values(window.localContacts || {}).some(contact => contact.name === contactName);
}


function initializeLocalContacts(task) {
    if (!task || !Array.isArray(task.workers)) {
        window.localContacts = {};
        return;
    }
    window.localContacts = task.workers.reduce((acc, worker) => {
        acc[worker.id] = { id: worker.id, name: worker.name };
        return acc;
    }, {});
    selectedContacts = Object.values(window.localContacts);
    renderSelectedContacts();
    updateDropdownLabel();
}


function synchronizeContactCheckboxes() {
    if (!contactsArray || !Array.isArray(contactsArray)) {
        return;
    }
    if (!Array.isArray(window.localEditedContacts)) {
        window.localEditedContacts = [];
    }
    contactsArray.forEach(contact => {
        const checkbox = document.querySelector(`#contactsDropdownList input[value="${contact.name}"]`);
        if (checkbox) {
            checkbox.checked = !!window.localEditedContacts.find(
                editedContact => editedContact.name === contact.name
            );
        }
    });
  
}


function updateLocalContactsFromCheckboxes() {
    const checkboxes = document.querySelectorAll('#contactsDropdownList input[type="checkbox"]');
    if (!window.localContacts) {
        window.localContacts = {};
    }
    checkboxes.forEach(checkbox => {
        const contactName = checkbox.value;
        const isChecked = checkbox.checked;
        const existingContact = contactsArray.find(contact => contact.name === contactName);
        if (isChecked) {
            if (!Object.values(window.localContacts).some(contact => contact.name === contactName)) {
                window.localContacts[`contact_${Date.now()}`] = {
                    name: contactName,
                    id: existingContact?.id || `contact_${Date.now()}`, // ID aus vorhandenen Daten oder generieren
                };
            }
        } else {
            const contactKey = Object.keys(window.localContacts).find(
                key => window.localContacts[key].name === contactName
            );
            if (contactKey) {
                delete window.localContacts[contactKey];
            }
        }
    });
}

document.addEventListener("mousedown", function (event) {
    const dropdownList = document.getElementById("contactsDropdownList");
    const createContactBar = document.querySelector(".createContactBar");
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (!dropdownList || !createContactBar || !selectedContactsList) {
        return;
    }
    const clickedInsideDropdown = dropdownList.contains(event.target);
    const clickedInsideCreateBar = createContactBar.contains(event.target);
    const clickedInsideSelectedContacts = selectedContactsList.contains(event.target);
    if (!clickedInsideDropdown && !clickedInsideCreateBar && !clickedInsideSelectedContacts) {
        dropdownList.classList.remove("open");
        dropdownOpen = false;
    }
});


function handleContactSelection(contact, isChecked) {
    if (!window.localContacts) {
        window.localContacts = {}; 
    }
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (!selectedContactsList) return;

    if (isChecked) {
        if (!isContactSelected(contact.name)) {
            selectedContacts.push(contact);
            window.localContacts[contact.id] = contact; 
        }
    } else {
        removeContact(contact);
    }
    renderSelectedContacts();
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


function updateDropdownLabel() {
    const dropdownLabel = document.getElementById("dropdownLabel");
    if (!dropdownLabel) {
        return;
    }
    if (selectedContacts.length === 0) {
        dropdownLabel.textContent = "Wähle einen Kontakt aus";
    } else {
        dropdownLabel.textContent = `${selectedContacts.length} Kontakt(e) ausgewählt`;
    }
}
