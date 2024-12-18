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
    // Initialisieren, falls `window.localSubtasks` nicht existiert
    if (!window.localSubtasks) {
        window.localSubtasks = {};
        console.warn("window.localSubtasks wurde initialisiert.");
    }

    // Subtask abrufen oder neuen erstellen, falls nicht vorhanden
    let subtask = window.localSubtasks[subtaskId];
    if (!subtask) {
        subtask = { title: "", done: false };
        window.localSubtasks[subtaskId] = subtask;
    }

    // Eingabefeld abrufen
    const inputElement = document.getElementById(`edit-input-${subtaskId}`);
    if (!inputElement) {
        console.error(`Eingabefeld für Subtask mit ID ${subtaskId} nicht gefunden.`);
        return;
    }

    // Neuen Titel abrufen
    const newTitle = inputElement.value.trim();

    // Überprüfen, ob das Eingabefeld leer ist
    if (!newTitle) {
        console.warn("Das Eingabefeld ist leer. Es wird trotzdem gespeichert.");
    }

    // Aktualisierung des Subtask-Titels, auch wenn keine Änderung vorgenommen wurde
    const oldTitle = subtask.title;
    subtask.title = newTitle || oldTitle; // Behalte den alten Titel, falls das Eingabefeld leer ist



    // DOM aktualisieren
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
    } else {
        console.error(`Subtask-Element mit ID ${subtaskId} nicht im DOM gefunden.`);
    }
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
        li.classList.add("dropdown-item"); // Standardklasse für alle Kontakte

        // Prüfen, ob der Kontakt ausgewählt ist, und entsprechende Klasse hinzufügen
        if (isContactSelected(contact.name)) {
            li.classList.add("selected-contact-item"); // Markiere das gesamte <li>
        }

        // Vor- und Nachnamen extrahieren
        const [vorname, nachname] = contact.name.split(" ");
        const backgroundColor = getColorHex(vorname?.toLowerCase() || "", nachname?.toLowerCase() || "");

        // Arbeiter-Symbol erstellen
        const workerEmblem = document.createElement("p");
        workerEmblem.classList.add("workerEmblemList");
        workerEmblem.style.backgroundColor = backgroundColor; // Farbe setzen
        workerEmblem.textContent = getInitials(contact.name); // Initialen hinzufügen

        // Name anzeigen
        const nameSpan = document.createElement("span");
        nameSpan.classList.add("contact-nameList");
        nameSpan.textContent = contact.name;

        // Status-Icon (anstatt einer Checkbox)
        const img = document.createElement("img");
        img.classList.add("status-icon");
        img.src = isContactSelected(contact.name)
            ? "./../assets/icons/png/checkButtonContacts.png" // Pfad zum "checked"-Bild
            : "./../assets/icons/png/checkButtonEmpty.png"; // Pfad zum "unchecked"-Bild
        img.alt = isContactSelected(contact.name) ? "Selected" : "Not Selected";
        img.style.cursor = "pointer";

        // Event-Listener für Statuswechsel (auf das gesamte <li>)
        li.addEventListener("click", () => {
            const isSelected = isContactSelected(contact.name);
            handleContactSelection(contact, !isSelected);

            // Toggle "selected-contact-item" Klasse auf dem <li>
            if (!isSelected) {
                li.classList.add("selected-contact-item");
            } else {
                li.classList.remove("selected-contact-item");
            }

            // Bild umschalten
            img.src = !isSelected
                ? "./../assets/icons/png/checkButtonContacts.png"
                : "./../assets/icons/png/checkButtonEmpty.png";
            img.alt = !isSelected ? "Selected" : "Not Selected";
        });

        // Elemente in das <li> einfügen
        li.appendChild(workerEmblem);
        li.appendChild(nameSpan);
        li.appendChild(img);

        // <li> in die Dropdown-Liste einfügen
        dropdownList.appendChild(li);
    });
}

function isContactSelected(contactName) {
    return Object.values(window.localContacts || {}).some(contact => contact.name === contactName);
}



  function initializeLocalContacts(task) {
    if (!task || !Array.isArray(task.workers)) {
        console.warn("Keine gültigen Worker-Daten gefunden.");
        window.localContacts = {};
        return;
    }

    // Lokale Kontakte initialisieren
    window.localContacts = task.workers.reduce((acc, worker) => {
        acc[worker.id] = { id: worker.id, name: worker.name };
        return acc;
    }, {});

    // Aktualisiere die HTML-Liste der ausgewählten Kontakte
    renderSelectedContacts();
}






function synchronizeContactCheckboxes() {
    if (!contactsArray || !Array.isArray(contactsArray)) {
        console.error("Fehlende oder ungültige Daten für Kontakte.");
        return;
    }
    if (!Array.isArray(window.localEditedContacts)) {
        console.error("`window.localEditedContacts` ist kein Array. Initialisiere als leeres Array.");
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
            // Füge Kontakt hinzu, falls nicht vorhanden
            if (!Object.values(window.localContacts).some(contact => contact.name === contactName)) {
                window.localContacts[`contact_${Date.now()}`] = {
                    name: contactName,
                    id: existingContact?.id || `contact_${Date.now()}`, // ID aus vorhandenen Daten oder generieren
                };
            }
        } else {
            // Entferne Kontakt
            const contactKey = Object.keys(window.localContacts).find(
                key => window.localContacts[key].name === contactName
            );
            if (contactKey) {
                delete window.localContacts[contactKey];
            }
        }
    });
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





function handleContactSelection(contact, isChecked) {
    if (!window.localContacts) {
        window.localContacts = {}; // Initialisierung
    }
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (isChecked) {
        if (!isContactSelected(contact.name)) {
            selectedContacts.push(contact);
            window.localContacts[contact.id] = contact; // Synchronisierung
            const [vorname, nachname] = contact.name.split(" ");
            const div = document.createElement("div");
            div.id = `selected_${contact.id}`;
            div.classList.add("selected-contact"); // Optional: CSS-Klasse für Styling
            const workerEmblem = document.createElement("p");
            workerEmblem.classList.add("workerEmblem");
            workerEmblem.style.backgroundColor = getColorHex(
                vorname?.toLowerCase() || "", 
                nachname?.toLowerCase() || ""
            ); // Farbe setzen basierend auf Vor- und Nachnamen
            workerEmblem.textContent = getInitials(contact.name); // Initialen hinzufügen
            div.appendChild(workerEmblem);
            selectedContactsList.appendChild(div);
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






