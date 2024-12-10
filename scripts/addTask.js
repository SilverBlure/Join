/**
 * Temporäre Priorität, die für die Task-Bearbeitung verwendet wird.
 * @type {string | null}
 */
let tempPriority = null;


/**
 * Initialisiert die Anwendung, lädt Session-ID, Task-Listen und Kontakte.
 * @async
 */
async function main() {
    loadSessionId();
    if (!(await initializeTaskLists())) return;
    await getTasks();
    getContacts();
}


/**
 * Lädt die Session-ID aus dem lokalen Speicher.
 */
function loadSessionId() {
    ID = localStorage.getItem("sessionKey");
}


/**
 * Lädt alle Tasks von der API und transformiert die Daten.
 * @async
 */
async function getTasks() {
    try {
        const url = createTasksUrl();
        const data = await fetchTasksData(url);
        if (!data) return;
        tasks = transformTasksData(data);
    } catch (error) {
        console.error("Fehler beim Abrufen der Tasks:", error);
    }
}


/**
 * Erstellt die URL für die Task-Daten.
 * @returns {string} URL für die Task-Daten.
 */
function createTasksUrl() {
    return `${BASE_URL}data/user/${ID}/user/tasks.json`;
}


/**
 * Ruft die Task-Daten von der API ab.
 * @async
 * @param {string} url - Die URL, von der die Task-Daten abgerufen werden.
 * @returns {Object|null} Die abgerufenen Daten oder null bei Fehler.
 */
async function fetchTasksData(url) {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
}


/**
 * Transformiert die erhaltenen Task-Daten in das gewünschte Format.
 * @param {Object} data - Die rohen Task-Daten.
 * @returns {Object} Die transformierten Task-Daten.
 */
function transformTasksData(data) {
    return Object.entries(data || {}).reduce((acc, [listKey, listValue]) => {
        acc[listKey] = transformTaskList(listKey, listValue);
        return acc;
    }, {});
}


/**
 * Transformiert eine einzelne Task-Liste.
 * @param {string} listKey - Der Schlüssel der Task-Liste.
 * @param {Object} listValue - Die Werte der Task-Liste.
 * @returns {Object} Die transformierte Task-Liste.
 */
function transformTaskList(listKey, listValue) {
    return {
        id: listKey,
        name: listValue.name || listKey,
        task: listValue.task ? transformTaskEntries(listValue.task) : {},
    };
}


/**
 * Transformiert die Task-Einträge einer Liste.
 * @param {Object} taskEntries - Die Task-Einträge.
 * @returns {Object} Die transformierten Tasks.
 */
function transformTaskEntries(taskEntries) {
    return Object.entries(taskEntries).reduce((taskAcc, [taskId, taskValue]) => {
        taskAcc[taskId] = transformTask(taskValue);
        return taskAcc;
    }, {});
}


/**
 * Transformiert eine einzelne Task.
 * @param {Object} taskValue - Die rohen Task-Daten.
 * @returns {Object} Die transformierte Task.
 */
function transformTask(taskValue) {
    return {
        ...taskValue,
        workers: transformWorkers(taskValue.workers || []),
    };
}


/**
 * Transformiert die Worker-Daten einer Task.
 * @param {Array} workers - Die Worker-Daten.
 * @returns {Array} Die transformierten Worker-Daten.
 */
function transformWorkers(workers) {
    return workers.map(worker => ({
        name: worker.name,
        initials: getInitials(worker.name),
        color: getColorHex(worker.name, ""),
    }));
}


/**
 * Fügt eine neue Aufgabe zur "To Do"-Liste hinzu.
 * @async
 * @param {Event} event - Das Form-Submit-Event.
 */
async function addTaskToToDoList(event) {
    event.preventDefault();
    if (!validateTaskInputs()) return;
    const newTask = buildNewTask();
    try {
        const result = await saveTask(newTask);
        if (result) {
            showSnackbar("Der Task wurde erfolgreich erstellt!");
            document.getElementById("prioMiddle").classList.add("active");
        }
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Tasks:", error);
    }
}


/**
 * Validiert die Eingaben im Task-Formular.
 * @returns {boolean} Gibt true zurück, wenn die Eingaben gültig sind, ansonsten false.
 */
function validateTaskInputs() {
    const title = document.getElementById("title").value.trim();
    const dueDate = document.getElementById("date").value.trim();
    const priority = tempPriority;
    const categoryName = document.getElementById("category").value.trim();
    if (!title || !dueDate || !priority || !categoryName) {
        console.error("Pflichtfelder sind nicht vollständig ausgefüllt.");
        return false;
    }
    return true;
}


/**
 * Erstellt ein neues Task-Objekt basierend auf den Formulareingaben.
 * @returns {Object} Das neue Task-Objekt.
 */
function buildNewTask() {
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const dueDate = document.getElementById("date").value.trim();
    const priority = tempPriority;
    const categoryName = document.getElementById("category").value.trim();
    return {
        title,
        description,
        dueDate,
        priority,
        category: buildCategory(categoryName),
        workers: getWorkers(),
        subtasks: getLocalSubtasks(),
    };
}

/**
 * Erstellt die Kategorie-Daten einer Task.
 * @param {string} categoryName - Der Name der Kategorie.
 * @returns {Object} Die Kategorie-Daten.
 */
function buildCategory(categoryName) {
    return {
        name: categoryName,
        class: `category${categoryName.replace(/\s/g, "")}`,
    };
}


/**
 * Ruft die aktuellen Worker-Daten aus dem lokalen Zustand ab.
 * @returns {Array} Die Worker-Daten.
 */
function getWorkers() {
    return window.localContacts
        ? Object.values(window.localContacts).map(contact => ({
              name: contact.name,
              id: contact.id,
              color: contact.color,
          }))
        : [];
}


/**
 * Ruft die aktuellen Subtask-Daten aus dem lokalen Zustand ab.
 * @returns {Object} Die Subtask-Daten.
 */
function getLocalSubtasks() {
    return { ...window.localSubtasks };
}


/**
 * Speichert eine neue Task in der Datenbank.
 * @async
 * @param {Object} task - Das zu speichernde Task-Objekt.
 * @returns {boolean} Gibt true zurück, wenn das Speichern erfolgreich war, ansonsten false.
 */
async function saveTask(task) {
    const result = await addTaskToList(task);
    if (result) {
        resetTaskForm();
        return true;
    }
    return false;
}



/**
 * Setzt das Task-Formular zurück und leert den lokalen Zustand.
 */
function resetTaskForm() {
    document.getElementById("addTaskFormTask").reset();
    clearLocalContacts();
    clearLocalSubtasks();
    tempPriority = null;
    document.querySelectorAll(".priorityBtn.active").forEach(button =>
        button.classList.remove("active")
    );
}


/**
 * Löscht die lokalen Kontakte aus dem Zustand und leert die Kontaktanzeige.
 */
function clearLocalContacts() {
    window.localContacts = {};
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (selectedContactsList) selectedContactsList.innerHTML = "";
}


/**
 * Löscht die lokalen Subtasks aus dem Zustand und leert die Subtask-Anzeige.
 */
function clearLocalSubtasks() {
    window.localSubtasks = {};
    const subTasksList = document.getElementById("subTasksList");
    if (subTasksList) subTasksList.innerHTML = "";
}


/**
 * Fügt eine neue Task in die "To Do"-Liste hinzu.
 * @async
 * @param {Object} task - Das zu speichernde Task-Objekt.
 * @returns {Object|null} Gibt die Antwortdaten zurück oder null bei Fehler.
 */
async function addTaskToList(task) {
    try {
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/todo/task.json`;
        const postResponse = await fetch(taskUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });
        if (!postResponse.ok) {
            return null;
        }
        const responseData = await postResponse.json();
        return responseData;
    } catch (error) {
        return null;
    }
}


/**
 * Initialisiert die Standard-Task-Listen, falls diese noch nicht existieren.
 * @async
 * @returns {boolean} Gibt true zurück, wenn die Initialisierung erfolgreich war, ansonsten false.
 */
async function initializeTaskLists() {
    try {
        const taskUrl = createTaskUrl(); 
        const defaultLists = getDefaultTaskLists(); 
        if (await taskListsExist(taskUrl)) {
            return true; 
        }
        return await saveDefaultTaskLists(taskUrl, defaultLists); 
    } catch (error) {
        return false;
    }
}


/**
 * Überprüft, ob die Task-Listen bereits existieren.
 * @async
 * @param {string} url - Die URL zur Überprüfung der Task-Listen.
 * @returns {boolean} Gibt true zurück, wenn die Listen existieren, ansonsten false.
 */
async function taskListsExist(url) {
    try {
        const response = await fetch(url); 
        if (!response.ok) {
            return false; 
        }
        const data = await response.json();
        const hasData = data && Object.keys(data).length > 0;
        return hasData;
    } catch (error) {
        return false; 
    }
}


/**
 * Erstellt die URL für die Task-Listen.
 * @returns {string} Die URL für die Task-Listen.
 */
function createTaskUrl() {
    return `${BASE_URL}data/user/${ID}/user/tasks.json`;
}


/**
 * Gibt die Standard-Task-Listen zurück.
 * @returns {Object} Die Standard-Task-Listen.
 */
function getDefaultTaskLists() {
    return {
        todo: { name: "To Do", task: {} },
        inProgress: { name: "In Progress", task: {} },
        awaitFeedback: { name: "Await Feedback", task: {} },
        done: { name: "Done", task: {} },
    };
}


/**
 * Speichert die Standard-Task-Listen in der Datenbank.
 * @async
 * @param {string} url - Die URL für die Task-Listen.
 * @param {Object} defaultLists - Die Standard-Task-Listen.
 * @returns {boolean} Gibt true zurück, wenn die Listen erfolgreich gespeichert wurden, ansonsten false.
 */
async function saveDefaultTaskLists(url, defaultLists) {
    const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultLists),
    });
    if (!response.ok) {
        console.error(`Fehler beim Speichern der Standard-Task-Listen: ${response.status}`);
    }
    return response.ok;
}


/**
 * Setzt die Priorität für eine Task.
 * @param {string} priority - Die Priorität, die gesetzt werden soll.
 */
function setPriority(priority) {
    tempPriority = priority;
    document.querySelectorAll(".priorityBtn").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`prio${priority}`)?.classList.add("active");
}


/**
 * Rendert das Kontakt-Dropdown-Menü.
 */
function renderContactsDropdown() {
    const dropDown = document.getElementById('contactSelection');
    if (!dropDown) return;
    dropDown.innerHTML = `<option value="" disabled selected hidden>Wähle einen Kontakt aus</option>`; 
    for (let i = 0; i < contactsArray.length; i++) {
        dropDown.innerHTML += `
            <option value="${contactsArray[i].name}">${contactsArray[i].name}</option>
        `;
    }
}



/**
 * Behandelt die Auswahl eines Kontakts und fügt ihn zur Anzeige hinzu.
 */
function handleContactSelection() {
    const contactSelection = document.getElementById("contactSelection");
    const selectedContactsList = document.getElementById("selectedContactsList");
    const selectedContactName = contactSelection.value;
    const selectedContact = contactsArray.find(contact => contact.name === selectedContactName);
    if (!selectedContact || isContactSelected(selectedContactName)) return;
    const color = getColorHex(selectedContact.name, "");
    const initials = getInitials(selectedContact.name);
    const contactId = `contact_${Date.now()}`;
    const newContact = { id: contactId, ...selectedContact, color };
    window.localContacts = { ...window.localContacts, [contactId]: newContact };
    selectedContactsList.innerHTML += createContactItem(contactId, initials, selectedContact.name, color);
    contactSelection.value = "";
}


/**
 * Überprüft, ob ein Kontakt bereits ausgewählt wurde.
 * @param {string} contactName - Der Name des Kontakts.
 * @returns {boolean} Gibt true zurück, wenn der Kontakt bereits ausgewählt ist, ansonsten false.
 */
function isContactSelected(contactName) {
    return Object.values(window.localContacts || {}).some(contact => contact.name === contactName);
}


/**
 * Entfernt einen Kontakt aus der Anzeige und dem lokalen Zustand.
 * @param {string} contactId - Die ID des zu entfernenden Kontakts.
 */
function removeContact(contactId) {
    document.getElementById(contactId)?.closest(".workerInformation")?.remove();
    delete window.localContacts[contactId];
}


/**
 * Fügt eine neue Subtask hinzu.
 */
function addNewSubtask() {
    const subTaskInput = document.getElementById("subTaskInputAddTask");
    const subTasksList = document.getElementById("subTasksList");
    if (!subTaskInput || !subTasksList) return;
    const subtaskTitle = subTaskInput.value.trim();
    if (!subtaskTitle) return;
    if (!window.localSubtasks) window.localSubtasks = {};
    const subtaskId = `subtask_${Date.now()}`;
    const subtaskItem = {
        title: subtaskTitle,
        done: false,
    };
    window.localSubtasks[subtaskId] = subtaskItem;
    const subtaskHTML = `
        <div class="subtask-item" id="${subtaskId}">
            <input 
                type="checkbox" 
                onchange="toggleLocalSubtaskStatus('${subtaskId}', this.checked)">
            <p class="subtaskText" onclick="editLocalSubtask('${subtaskId}')">
                ${subtaskTitle}
            </p>
            <img 
                class="hoverBtn" 
                src="./../assets/icons/png/iconoir_cancel.png" 
                onclick="removeSubtaskFromList('${subtaskId}')"
                alt="Remove Subtask">
        </div>
    `;
    subTasksList.insertAdjacentHTML("beforeend", subtaskHTML);
    subTaskInput.value = "";
}


/**
 * Behandelt den Enter-Key-Ereignis für das Subtask-Eingabefeld.
 * @param {Event} event - Das Key-Ereignis.
 */
function handleSubtaskKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addNewSubtask();
    }
}


/**
 * Generiert die Initialen eines vollständigen Namens.
 * @param {string} fullName - Der vollständige Name.
 * @returns {string} Die Initialen des Namens.
 */
function getInitials(fullName) {
    const nameParts = fullName.trim().split(" ");
    return `${nameParts[0]?.charAt(0).toUpperCase() || ""}${nameParts[1]?.charAt(0).toUpperCase() || ""}`;
}



/**
 * Setzt das Formular zurück und leert die definierten Listen.
 */
function resetFormAndLists() {
    // Formular zurücksetzen
    const form = document.getElementById("addTaskFormTask"); // Ersetze 'myForm' mit der ID deines Formulars
    if (form) {
        form.reset(); // Setzt alle Formularfelder zurück
    }

    // Listen leeren
    const listsToClear = ["subTasksList", "selectedContactsList"]; // IDs der Listen, die geleert werden sollen
    listsToClear.forEach(listId => {
        const list = document.getElementById(listId);
        if (list) {
            list.innerHTML = ""; // Entfernt alle Listeneinträge
        }
    });

    // Optional: Leere lokale Zustände
    window.localSubtasks = {};
    window.localEditedContacts = [];
    console.log("Formular und Listen erfolgreich zurückgesetzt.");
}
