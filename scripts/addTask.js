/**
 * Temporäre Priorität, die für die Task-Bearbeitung verwendet wird.
 * Standardwert ist 'Middle'.
 * @type {string}
 */
let tempPriority = "Middle";

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
  return workers.map((worker) => {
    const [vorname, nachname] = worker.name.split(" "); // Vor- und Nachname extrahieren
    const color = getColorRGB(vorname?.toLowerCase() || "", nachname?.toLowerCase() || ""); // Farbe basierend auf Vor- und Nachname generieren

    return {
      name: worker.name,
      initials: getInitials(worker.name),
      color: color, // Generierte Farbe setzen
    };
  });
}


/**
 * Fügt eine neue Aufgabe zur "To Do"-Liste hinzu.
 * @async
 * @param {Event} event - Das Form-Submit-Event.
 */
async function addTaskToToDoList(event) {
  addNewSubtask();
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
  const categoryInput = document.getElementById("category"); 
  const selectedCategory = document.getElementById("selectedCategory"); 
  const categoryName = categoryInput.value.trim();
  let isValid = true;
  if (!title || !dueDate || !priority || !categoryName) {
    console.error("Pflichtfelder sind nicht vollständig ausgefüllt.");
    if (!title) console.error("Titel ist ein Pflichtfeld.");
    if (!dueDate) console.error("Fälligkeitsdatum ist ein Pflichtfeld.");
    if (!priority) console.error("Priorität ist ein Pflichtfeld.");
    if (!categoryName) console.error("Kategorie ist ein Pflichtfeld.");
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  const categoryDropdown = document.getElementById("categoryDropdown");
  const selectedCategory = document.getElementById("selectedCategory");
  const categoryList = document.getElementById("categoryList");
  const categoryInput = document.getElementById("category");

  selectedCategory.addEventListener("click", () => {
    categoryList.classList.toggle("hidden");
  });

  categoryList.addEventListener("click", (event) => {
    const selectedItem = event.target;
    if (selectedItem.classList.contains("category-item")) {
      const value = selectedItem.getAttribute("data-value");
      selectedCategory.textContent = value;
      categoryInput.value = value;
      categoryList.classList.add("hidden");
    }
  });

  document.addEventListener("click", (event) => {
    if (!categoryDropdown.contains(event.target)) {
      categoryList.classList.add("hidden");
    }
  });

  document.addEventListener("click", (event) => {
    if (!categoryDropdown.contains(event.target)) {
      categoryList.classList.add("hidden");
    }
  });
});

/**
 * Erstellt ein neues Task-Objekt basierend auf den Formulareingaben.
 * @returns {Object} Das neue Task-Objekt.
 */
function buildNewTask() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const dueDate = document.getElementById("date").value.trim();
  const categoryName = document.getElementById("category").value.trim();
    const priority = tempPriority || "Middle";
    return {
        title,
        description,
        dueDate,
        priority,
        category: buildCategory(categoryName),
        workers: getWorkers(),
        subtasks: collectSubtasksFromDOM(),
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
    ? Object.values(window.localContacts).map((contact) => ({
        name: contact.name,
        id: contact.id,
        color: contact.color,
      }))
    : [];
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
  tempPriority = "Middle";
  document
    .querySelectorAll(".priorityBtn.active")
    .forEach((button) => button.classList.remove("active"));
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
    console.error(
      `Fehler beim Speichern der Standard-Task-Listen: ${response.status}`
    );
  }
  return response.ok;
}

/**
 * Setzt die Priorität für eine Task.
 * @param {string} priority - Die Priorität, die gesetzt werden soll.
 */
function setPriority(priority) {
  tempPriority = priority;
  document
    .querySelectorAll(".priorityBtn")
    .forEach((btn) => btn.classList.remove("active"));
  document.getElementById(`prio${priority}`)?.classList.add("active");
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
    const li = createContactDropdownItem(contact); // Nutzt die ausgelagerte Funktion
    dropdownList.appendChild(li);
  });
}



function createContactDropdownItem(contact) {
  const li = document.createElement("li");
  li.classList.add("dropdown-item");
  if (isContactSelected(contact.name)) {
    li.classList.add("selected-contact-item");
  }
  const [vorname, nachname] = contact.name.split(" ");
  const backgroundColor = getColorRGB(vorname?.toLowerCase() || "", nachname?.toLowerCase() || "");
  const workerEmblem = document.createElement("p");
  workerEmblem.classList.add("workerEmblemList");
  workerEmblem.style.backgroundColor = backgroundColor;
  workerEmblem.textContent = getInitials(contact.name);
  const nameSpan = document.createElement("span");
  nameSpan.classList.add("contact-nameList");
  nameSpan.textContent = contact.name;
  const img = createContactStatusIcon(contact);
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
  return li;
}




function createContactStatusIcon(contact) {
  const img = document.createElement("img");
  img.classList.add("status-icon");
  img.src = isContactSelected(contact.name)
    ? "./../assets/icons/png/checkButtonContacts.png"
    : "./../assets/icons/png/checkButtonEmpty.png";
  img.alt = isContactSelected(contact.name) ? "Selected" : "Not Selected";
  img.style.cursor = "pointer";
  return img;
}




function isContactSelected(contactName) {
  return selectedContacts.some((contact) => contact.name === contactName);
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
      
      // Vor- und Nachnamen extrahieren
      const [vorname, nachname] = contact.name.split(" ");
      const backgroundColor = getColorRGB(vorname?.toLowerCase() || "", nachname?.toLowerCase() || ""); // Generiere Farbe basierend auf Vor- und Nachnamen

      // Div-Container für den Kontakt erstellen
      const div = document.createElement("div");
      div.id = `selected_${contact.id}`;
      div.classList.add("selected-contact");

      // Arbeiter-Symbol erstellen
      const workerEmblem = document.createElement("p");
      workerEmblem.classList.add("workerEmblem");
      workerEmblem.style.backgroundColor = backgroundColor; // Setze die Farbe
      workerEmblem.textContent = getInitials(contact.name); // Initialen hinzufügen

      // Div-Container mit dem Symbol in die Liste einfügen
      div.appendChild(workerEmblem);
      selectedContactsList.appendChild(div);
    }
  } else {
    removeContact(contact); // Entferne den Kontakt
  }

  updateDropdownLabel(); // Aktualisiere die Dropdown-Beschriftung
}




/**
 * Generiert eine RGB-Farbe basierend auf den Buchstaben des Namens.
 * @param {string} vorname - Der Vorname.
 * @param {string} nachname - Der Nachname.
 * @returns {string} - Die generierte RGB-Farbe im Format "rgb(r, g, b)".
 */
function getColorRGB(vorname, nachname) {
  const completeName = (vorname + nachname).toLowerCase();
  let hash = 0;
  for (let i = 0; i < completeName.length; i++) {
      hash += completeName.charCodeAt(i);
  }
  const r = (hash * 123) % 256;
  const g = (hash * 456) % 256;
  const b = (hash * 789) % 256;
  return `rgb(${r}, ${g}, ${b})`;
}



/**
* Generiert die Initialen eines Namens.
* @param {string} fullName - Der vollständige Name der Person (Vorname Nachname).
* @returns {string} - Die generierten Initialen (z.B. "AB").
*/
function getInitials(fullName) {
  if (!fullName || typeof fullName !== "string") {
      console.warn("Ungültiger Name für Initialen:", fullName);
      return ""; 
  }
  const [vorname, nachname] = fullName.trim().split(" ");
  const initialen = `${vorname?.charAt(0)?.toUpperCase() || ""}${nachname?.charAt(0)?.toUpperCase() || ""}`;
  return initialen;
}




function removeContact(contact) {
  selectedContacts = selectedContacts.filter(
    (selected) => selected.id !== contact.id
  );
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
 * Fügt eine neue Subtask hinzu.
 */
function addNewSubtask() {
  const subTaskInput = document.getElementById("subTaskInputAddTask");
  const subTasksList = document.getElementById("subTasksList");
  const subtaskTitle = subTaskInput.value.trim();
  if (!subtaskTitle) {
      return;
  }
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
 * Behandelt den Enter-Key-Ereignis für das Subtask-Eingabefeld.
 * @param {Event} event - Das Key-Ereignis.
 */
function handleSubtaskKey(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addNewSubtask();
  }
}


function toggleSubtaskButtons() {
  const input = document.getElementById("subTaskInputAddTask");
  const saveBtn = document.getElementById("saveSubtaskBtn");
  const clearBtn = document.getElementById("clearSubtaskBtn");
  const separator = document.getElementById("separatorSubtask");
  const subtaskImg = document.getElementById("subtaskImg");
  if (input.value.trim() !== "") {
    saveBtn.classList.remove("hidden");
    clearBtn.classList.remove("hidden");
    subtaskImg.classList.add("hidden");
    separator.classList.remove("hidden");
  } else {
    saveBtn.classList.add("hidden");
    clearBtn.classList.add("hidden");
    subtaskImg.classList.remove("hidden");
    separator.classList.add("hidden");
  }
}


/**
 * Generiert die Initialen eines vollständigen Namens.
 * @param {string} fullName - Der vollständige Name.
 * @returns {string} Die Initialen des Namens.
 */
function getInitials(fullName) {
  const nameParts = fullName.trim().split(" ");
  return `${nameParts[0]?.charAt(0).toUpperCase() || ""}${
    nameParts[1]?.charAt(0).toUpperCase() || ""
  }`;
}


/**
 * Setzt das Formular zurück und leert die definierten Listen.
 */
function resetFormAndLists() {
  const form = document.getElementById("addTaskFormTask"); 
  if (form) {
    form.reset(); 
    document.getElementById(setPriority());
    document.getElementById("prioMiddle").classList.add("active");
  }
  const listsToClear = ["subTasksList", "selectedContactsList"]; 
  listsToClear.forEach((listId) => {
    const list = document.getElementById(listId);
    if (list) {
      list.innerHTML = ""; 
    }
  });
  window.localSubtasks = {};
  window.localEditedContacts = [];
  selectedContacts = [];
  updateDropdownLabel();
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

function collectSubtasksFromDOM() {
  const subTasksList = document.getElementById("subTasksList");
  if (!subTasksList) {
      return {};
  }
  const subtasks = {};
  const subtaskItems = subTasksList.querySelectorAll(".subtask-item");
  subtaskItems.forEach((item) => {
      const subtaskId = item.id.replace("subtask-", "");
      const title = item.querySelector(".subtaskText")?.textContent.trim() || "";
      const done = item.querySelector(".subtask-checkbox")?.checked || false;
      if (title) {
          subtasks[subtaskId] = { title, done };
      }
  });
  return subtasks;
}



function handleSubtaskEditKey(event) {
  const subtaskId = event.target.id.replace("edit-input-", "");
  if (event.key === "Enter") {
      event.preventDefault();
      saveEditedSubtask(subtaskId);
  } else if (event.key === "Escape") {
      event.preventDefault();
      cancelSubtaskEdit(subtaskId);
  }
}




function saveEditedSubtask(subtaskId) {
  const subtaskInput = document.getElementById(`edit-input-${subtaskId}`);
  if (!subtaskInput) {
      return;
  }
  const newTitle = subtaskInput.value.trim();
  if (!newTitle) {
      return;
  }
  if (window.localSubtasks && window.localSubtasks[subtaskId]) {
      window.localSubtasks[subtaskId].title = newTitle;
  }
  const newSubtaskHTML = generateNewSubtaskHTML(subtaskId, newTitle);
  const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
  if (subtaskElement) {
      subtaskElement.outerHTML = newSubtaskHTML;
  }
}



function clearSubtaskInput() {
  const input = document.getElementById("subTaskInputAddTask");
  if (input) {
      input.value = "";
  }
}


async function editSubtask(subtaskId) {
  const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
  if (!subtaskElement) return;
  const subtaskTextElement = subtaskElement.querySelector(".subtaskText");
  if (!subtaskTextElement) return;
  const currentTitle = subtaskTextElement.textContent.trim();
  if (!currentTitle) return;
  const editSubtaskHTML = generateEditSubtaskHTML(subtaskId, currentTitle);
  subtaskElement.innerHTML = editSubtaskHTML;
}



function handleSubtaskBlur(event) {
  const subtaskId = event.target.id.replace("edit-input-", "");
  setTimeout(() => {
      const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
      if (!subtaskElement) {
          console.warn(`Subtask mit ID ${subtaskId} existiert nicht mehr im DOM.`);
          return;
      }
      saveEditedSubtask(subtaskId);
  }, 0);
}

