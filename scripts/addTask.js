let tempPriority = null;

async function main() {
    loadSessionId();
    const isInitialized = await initializeTaskLists();
    if (!isInitialized) {
        console.error("Fehler beim Initialisieren der Listenstruktur. Anwendung kann nicht fortgesetzt werden.");
        return;
    }
    await getTasks();
    getContacts();
}

function loadSessionId() {
    ID = localStorage.getItem("sessionKey");
}

async function getTasks() {
    try {
        const url = `${BASE_URL}data/user/${ID}/user/tasks.json`;
        console.log("Lade Aufgaben von:", url);
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Fehler beim Abrufen der Aufgaben: ${response.status} - ${response.statusText}`);
            return;
        }
        const data = await response.json();
        if (!data) {
            console.warn("Keine Aufgaben gefunden.");
            tasks = {};
            return;
        }

        tasks = Object.entries(data).reduce((acc, [listKey, listValue]) => {
            acc[listKey] = {
                id: listKey,
                name: listValue.name || listKey,
                task: listValue.task
                    ? Object.entries(listValue.task).reduce((taskAcc, [taskId, taskValue]) => {
                          taskAcc[taskId] = {
                              ...taskValue,
                              workers: (taskValue.workers || []).map(worker => ({
                                  name: worker.name,
                                  initials: getInitials(worker.name),
                                  color: getColorHex(worker.name, ""),
                              })),
                          };
                          return taskAcc;
                      }, {})
                    : {},
            };
            return acc;
        }, {});

        console.log("Aufgaben erfolgreich geladen:", tasks);
    } catch (error) {
        console.error("Fehler beim Abrufen der Aufgaben:", error);
    }
}

async function addTaskToToDoList(event) {
    event.preventDefault();
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const dueDate = document.getElementById("date").value.trim();
    const priority = tempPriority;
    const categoryName = document.getElementById("category").value.trim();

    if (!title || !dueDate || !priority || !categoryName) {
        console.error("Pflichtfelder sind nicht vollständig ausgefüllt.");
        return;
    }

    const subtasks = getLocalSubtasks();

    // Arbeiter aus `localContacts` extrahieren und korrekt formatieren
    const workers = window.localContacts
        ? Object.values(window.localContacts).map(contact => ({
              name: contact.name,
          }))
        : [];

    const category = {
        name: categoryName,
        class: `category${categoryName.replace(/\s/g, "")}`,
    };

    const newTask = {
        title,
        description,
        dueDate,
        priority,
        category,
        workers, // Enthält jetzt Objekte mit Name, Initialen und Farbe
        subtasks,
    };

    try {
        const result = await addTaskToList(newTask);
        if (result) {
            console.log("Task erfolgreich hinzugefügt:", result);
            resetForm();
            document.getElementById("addTaskFormTask").reset();
            clearLocalSubtasks();
            tempPriority = null;
        } else {
            console.error("Task konnte nicht hinzugefügt werden.");
        }
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Tasks:", error);
    }
}

function clearLocalContacts() {
    window.localContacts = {}; // Lokale Kontakte löschen
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (selectedContactsList) {
        selectedContactsList.innerHTML = ""; // UI-Liste der Kontakte leeren
    }
    console.log("Alle Kontakte erfolgreich zurückgesetzt.");
}

function resetForm() {
    const form = document.getElementById("addTaskFormTask");
    if (form) {
        form.reset();
    }
    const subTasksList = document.getElementById("subTasksList");
    if (subTasksList) {
        subTasksList.innerHTML = "";
    }
    const contactSelection = document.getElementById("contactSelection");
    if (contactSelection) {
        contactSelection.selectedIndex = 0;
    }
    const priorityButtons = document.querySelectorAll(".priorityBtn.active");
    priorityButtons.forEach(button => button.classList.remove("active"));

    clearLocalContacts(); // Kontakte zurücksetzen
    console.log("Formular zurückgesetzt, Contacts-Dropdown zurückgesetzt und Priority-Buttons deaktiviert.");
}

function getLocalSubtasks() {
    if (!window.localSubtasks || Object.keys(window.localSubtasks).length === 0) {
        console.warn("Keine Subtasks in der lokalen Liste gefunden.");
        return {};
    }
    console.log("Subtasks aus lokaler Liste:", window.localSubtasks);
    return { ...window.localSubtasks };
}

function clearLocalSubtasks() {
    window.localSubtasks = {};
    const subTasksList = document.getElementById("subTasksList");
    if (subTasksList) {
        subTasksList.innerHTML = "";
    }
}

async function addTaskToList(task) {
    try {
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/todo/task.json`;
        const response = await fetch(taskUrl);
        if (!response.ok) {
            console.warn("Liste 'todo' existiert nicht. Initialisiere sie erneut.");
            await initializeTaskLists();
        }
        const postResponse = await fetch(taskUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });
        if (!postResponse.ok) {
            const errorText = await postResponse.text();
            console.error(`Fehler beim Speichern des Tasks: ${postResponse.status}`, errorText);
            return null;
        }
        const responseData = await postResponse.json();
        console.log("Task erfolgreich gespeichert:", responseData);
        return responseData;
    } catch (error) {
        console.error("Fehler beim Speichern des Tasks:", error);
        return null;
    }
}



async function initializeTaskLists() {
    try {
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks.json`;
        let response = await fetch(taskUrl);
        if (response.ok) {
            let data = await response.json();
            if (data) {
                console.log("Bestehende Listenstruktur gefunden:", data);
                return true; 
            }
        }
        const defaultLists = {
            todo: { name: "To Do", task: {} }, 
            inProgress: { name: "In Progress", task: {} },
            awaitFeedback: { name: "Await Feedback", task: {} },
            done: { name: "Done", task: {} },
        };
        let initResponse = await fetch(taskUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(defaultLists),
        });
        if (initResponse.ok) {
            console.log("Listenstruktur erfolgreich initialisiert.");
            return true;
        } else {
            let errorText = await initResponse.text();
            console.error("Fehler beim Initialisieren der Listen:", initResponse.status, errorText);
            return false;
        }
    } catch (error) {
        console.error("Ein Fehler ist beim Initialisieren aufgetreten:", error);
        return false;
    }
}



function setPriority(priority) {
    tempPriority = priority;
    document.querySelectorAll('.priorityBtn').forEach(btn => btn.classList.remove('active'));
    const activeButton = document.getElementById(`prio${priority}`);
    if (activeButton) {
        activeButton.classList.add('active');
    } else {
        console.warn(`Button für Priorität "${priority}" nicht gefunden.`);
    }
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



const getInitials = (fullName) => {
    const nameParts = fullName.trim().split(" "); 
    const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || ""; 
    const lastInitial = nameParts[1]?.charAt(0).toUpperCase() || ""; 
    return `${firstInitial}${lastInitial}`; 
};


 function handleContactSelection() {
    const contactSelection = document.getElementById("contactSelection");
    const selectedContactsList = document.getElementById("selectedContactsList");
    const selectedContactName = contactSelection.value;
    if (!selectedContactName) return; 
    const existingContact = Object.values(window.localContacts || {}).find(
        contact => contact.name === selectedContactName
    );
    if (existingContact) {
        console.warn("Kontakt ist bereits ausgewählt.");
        return;
    }
    const color = getColorHex(selectedContactName, "");
    const initials = getInitials(selectedContactName);
    const contactId = `contact_${Date.now()}`;
    const newContact = { id: contactId, name: selectedContactName, color };
    if (!window.localContacts) {
        window.localContacts = {};
    }
    window.localContacts[contactId] = newContact;
    const contactHTML = `
 <div class="workerInformation">
            <p id="${contactId}" class="workerEmblem workerIcon" style="background-color: ${color};">
                ${initials}
            </p>
            <p class="workerName">${selectedContactName}</p>
            <img 
                src="../../assets/icons/png/iconoir_cancel.png" 
                onclick="removeContact('${contactId}')"
                alt="Remove Contact">
        </div>
    `;
    selectedContactsList.insertAdjacentHTML("beforeend", contactHTML);
    console.log("Kontakt hinzugefügt:", newContact);
    contactSelection.value = "";
}



function removeContact(contactId) {
    const contactElement = document.getElementById(contactId)?.closest(".workerInformation");
    if (contactElement) {
        contactElement.remove(); // Entfernt das gesamte Kontakt-Element aus dem DOM
        console.log(`Kontakt mit ID "${contactId}" aus der UI entfernt.`);
    } else {
        console.warn(`Kontakt mit ID "${contactId}" nicht im UI gefunden.`);
    }
    if (window.localContacts && window.localContacts[contactId]) {
        delete window.localContacts[contactId];
        console.log(`Kontakt mit ID "${contactId}" aus der lokalen Liste entfernt.`);
    } else {
        console.warn(`Kontakt mit ID "${contactId}" nicht in der lokalen Liste gefunden.`);
    }
}





 function addNewSubtask() {
    const subTaskInput = document.getElementById("subTaskInputAddTask");
    const subTasksList = document.getElementById("subTasksList");
    if (!subTaskInput || !subTasksList) {
        console.error("Subtask-Input oder Subtasks-Liste nicht gefunden.");
        return;
    }
    const subtaskTitle = subTaskInput.value.trim();
    if (!subtaskTitle) {
        console.warn("Subtask-Titel darf nicht leer sein.");
        return;
    }
    if (!window.localSubtasks) {
        window.localSubtasks = {}; 
    }
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
                src="../../assets/icons/png/iconoir_cancel.png" 
                onclick="removeSubtaskFromList('${subtaskId}')"
                alt="Remove Subtask">
        </div>
    `;
    subTasksList.insertAdjacentHTML("beforeend", subtaskHTML);
    subTaskInput.value = "";
    console.log(`Subtask "${subtaskTitle}" hinzugefügt.`, window.localSubtasks);
}



function handleSubtaskKey(event) {
    if (event.key === "Enter") {
        event.preventDefault(); 
        addNewSubtask(); 
    }
}
