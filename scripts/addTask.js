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
        const url = `${BASE_URL}data/user/${ID}/user/tasks.json`;
        const response = await fetch(url);
        if (!response.ok) return; 
        const data = await response.json();
        tasks = Object.entries(data || {}).reduce((acc, [listKey, listValue]) => {
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
    } catch {
        // Silent failure
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
    const workers = window.localContacts
        ? Object.values(window.localContacts).map(contact => ({
              name: contact.name,
          }))
        : [];
    const category = {
        name: categoryName,
        class: `category${categoryName.replace(/\s/g, "")}`, //Technical Task, dann wird in der mitte das leerzeichen entfernt und somit stimmt die class bezeichnung im CSS wieder
    };
    const newTask = {
        title,
        description,
        dueDate,
        priority,
        category,
        workers, 
        subtasks,
    };
    try {
        const result = await addTaskToList(newTask);
        if (result) {
            showSnackbar('Der Task wurde erfolgreich erstellt!');
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
    window.localContacts = {}; 
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (selectedContactsList) {
        selectedContactsList.innerHTML = ""; 
    }
}



function resetForm() {
    const form = document.getElementById("addTaskFormTask");
    if (form) form.reset(); 
    const subTasksList = document.getElementById("subTasksList");
    if (subTasksList) subTasksList.innerHTML = ""; 
    const contactSelection = document.getElementById("contactSelection");
    if (contactSelection) contactSelection.selectedIndex = 0; 
    document.querySelectorAll(".priorityBtn.active").forEach(button => button.classList.remove("active"));
    clearLocalContacts();
}





function getLocalSubtasks() {
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
            await initializeTaskLists();
        }
        const postResponse = await fetch(taskUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });
        if (!postResponse.ok) return null;
        return await postResponse.json();
    } catch {
        return null;
    }
}



async function initializeTaskLists() {
    try {
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks.json`;
        const response = await fetch(taskUrl);
        if (response.ok) {
            const data = await response.json();
            if (data) return true;
        }
        const defaultLists = {
            todo: { name: "To Do", task: {} },
            inProgress: { name: "In Progress", task: {} },
            awaitFeedback: { name: "Await Feedback", task: {} },
            done: { name: "Done", task: {} },
        };
        const initResponse = await fetch(taskUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(defaultLists),
        });
        return initResponse.ok;
    } catch {
        return false;
    }
}



function setPriority(priority) {
    tempPriority = priority;
    document.querySelectorAll('.priorityBtn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`prio${priority}`)?.classList.add('active'); // Fragezeichen-Operator ? Verhindert, dass ein Fehler auftritt, wenn das Element nicht gefunden wird. Wenn kein Button mit der passenden ID gefunden wird, passiert einfach nichts.  
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
    const isExistingContact = Object.values(window.localContacts || {}).some(
        contact => contact.name === selectedContactName
    );
    if (isExistingContact) return;
    const color = getColorHex(selectedContactName, "");
    const initials = getInitials(selectedContactName);
    const contactId = `contact_${Date.now()}`;
    const newContact = { id: contactId, name: selectedContactName, color };
    window.localContacts = window.localContacts || {};
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
    contactSelection.value = "";
}



function removeContact(contactId) {
    const contactElement = document.getElementById(contactId)?.closest(".workerInformation");
    if (contactElement) {
        contactElement.remove(); 
    }
    if (window.localContacts) {
        delete window.localContacts[contactId];
    }
}



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



function handleSubtaskKey(event) {
    if (event.key === "Enter") {
        event.preventDefault(); 
        addNewSubtask(); 
    }
}
