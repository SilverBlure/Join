let tempPriority = null;



async function main() {
    loadSessionId();
    if (!(await initializeTaskLists())) return;
    await getTasks();
    getContacts();
}



function loadSessionId() {
    ID = localStorage.getItem("sessionKey");
}



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



function createTasksUrl() {
    return `${BASE_URL}data/user/${ID}/user/tasks.json`;
}



async function fetchTasksData(url) {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
}



function transformTasksData(data) {
    return Object.entries(data || {}).reduce((acc, [listKey, listValue]) => {
        acc[listKey] = transformTaskList(listKey, listValue);
        return acc;
    }, {});
}



function transformTaskList(listKey, listValue) {
    return {
        id: listKey,
        name: listValue.name || listKey,
        task: listValue.task ? transformTaskEntries(listValue.task) : {},
    };
}



function transformTaskEntries(taskEntries) {
    return Object.entries(taskEntries).reduce((taskAcc, [taskId, taskValue]) => {
        taskAcc[taskId] = transformTask(taskValue);
        return taskAcc;
    }, {});
}



function transformTask(taskValue) {
    return {
        ...taskValue,
        workers: transformWorkers(taskValue.workers || []),
    };
}



function transformWorkers(workers) {
    return workers.map(worker => ({
        name: worker.name,
        initials: getInitials(worker.name),
        color: getColorHex(worker.name, ""),
    }));
}



async function addTaskToToDoList(event) {
    event.preventDefault();
    if (!validateTaskInputs()) return;
    const newTask = buildNewTask();
    try {
        const result = await saveTask(newTask);
        if (result) {
            showSnackbar("Der Task wurde erfolgreich erstellt!");
        }
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Tasks:", error);
    }
}



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



function buildCategory(categoryName) {
    return {
        name: categoryName,
        class: `category${categoryName.replace(/\s/g, "")}`,
    };
}



function getWorkers() {
    return window.localContacts
        ? Object.values(window.localContacts).map(contact => ({
              name: contact.name,
              id: contact.id,
              color: contact.color,
          }))
        : [];
}



async function saveTask(task) {
    const result = await addTaskToList(task);
    if (result) {
        resetTaskForm();
        return true;
    }
    return false;
}



function resetTaskForm() {
    document.getElementById("addTaskFormTask").reset();
    clearLocalContacts();
    clearLocalSubtasks();
    tempPriority = null;
    document.querySelectorAll(".priorityBtn.active").forEach(button =>
        button.classList.remove("active")
    );
}



function clearLocalContacts() {
    window.localContacts = {};
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (selectedContactsList) selectedContactsList.innerHTML = "";
}



function getLocalSubtasks() {
    return { ...window.localSubtasks };
}



function clearLocalSubtasks() {
    window.localSubtasks = {};
    const subTasksList = document.getElementById("subTasksList");
    if (subTasksList) subTasksList.innerHTML = "";
}



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



async function initializeTaskLists() {
    try {
        const taskUrl = createTaskUrl();
        const defaultLists = getDefaultTaskLists();
        return await saveDefaultTaskLists(taskUrl, defaultLists);
    } catch (error) {
        console.error("Fehler beim Initialisieren der Task-Listen:", error);
        return false;
    }
}



function createTaskUrl() {
    return `${BASE_URL}data/user/${ID}/user/tasks.json`;
}



function getDefaultTaskLists() {
    return {
        todo: { name: "To Do", task: {} },
        inProgress: { name: "In Progress", task: {} },
        awaitFeedback: { name: "Await Feedback", task: {} },
        done: { name: "Done", task: {} },
    };
}



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



function setPriority(priority) {
    tempPriority = priority;
    document.querySelectorAll(".priorityBtn").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`prio${priority}`)?.classList.add("active");
}



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



function isContactSelected(contactName) {
    return Object.values(window.localContacts || {}).some(contact => contact.name === contactName);
}



function removeContact(contactId) {
    document.getElementById(contactId)?.closest(".workerInformation")?.remove();
    delete window.localContacts[contactId];
}



function addNewSubtask() {
    const subTaskInput = document.getElementById("subTaskInputAddTask");
    const subTasksList = document.getElementById("subTasksList");
    if (!subTaskInput || !subTaskInput.value.trim()) return;
    const title = subTaskInput.value.trim(); 
    const subtaskId = `subtask_${Date.now()}`; 
    const subtaskItem = { title, done: false };
    window.localSubtasks = { ...window.localSubtasks, [subtaskId]: subtaskItem };
    const subtaskHTML = generateSubtaskHTML(subtaskId, title); 
    subTasksList.innerHTML += subtaskHTML;
    subTaskInput.value = ""; 
}




function handleSubtaskKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addNewSubtask();
    }
}



function getInitials(fullName) {
    const nameParts = fullName.trim().split(" ");
    return `${nameParts[0]?.charAt(0).toUpperCase() || ""}${nameParts[1]?.charAt(0).toUpperCase() || ""}`;
}
