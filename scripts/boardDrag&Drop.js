let currentDraggedElement = null;



function startDragging(taskId) {
    currentDraggedElement = taskId;
    const card = document.getElementById(`boardCard-${taskId}`);
    if (card) card.classList.add("dragging");
}



function stopDragging() {
    const card = document.getElementById(`boardCard-${currentDraggedElement}`);
    if (card) card.classList.remove("dragging");
    currentDraggedElement = null;
}



function allowDrop(event) {
    event.preventDefault();
    event.stopPropagation();
}



function highlightList(listId) {
    const list = document.getElementById(listId);
    if (list) list.classList.add("highlight");
}



function unhighlightList(listId) {
    const list = document.getElementById(listId);
    if (list) list.classList.remove("highlight");
}



async function handleDrop(event, targetListId) {
    event.preventDefault();
    event.stopPropagation();
    const sourceListId = await findTaskSourceList(currentDraggedElement);
    if (!sourceListId) {
        stopDragging();
        return;
    }
    try {
        const task = await fetchTaskFromFirebase(sourceListId, currentDraggedElement);
        if (!task) {
            stopDragging();
            return;
        }
        await deleteTaskFromFirebase(sourceListId, currentDraggedElement);
        await addTaskToFirebase(targetListId, task);
        await getTasks();
        renderBoard();
    } finally {
        stopDragging();
        unhighlightList(`${targetListId}List`);
    }
}



async function findTaskSourceList(taskId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks.json`;
    const response = await fetch(url);
    if (!response.ok) {
        return null;
    }
    const data = await response.json();
    for (const listId in data) {
        const tasks = data[listId]?.task || {};
        if (tasks[taskId]) {
            showSnackbar('Der Task wurde erfolgreich verschoben!');
            return listId;
        }
    }
    return null;
}



async function fetchTaskFromFirebase(listId, taskId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    const response = await fetch(url);
    return response.ok ? await response.json() : null;
}



async function deleteTaskFromFirebase(listId, taskId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    await fetch(url, { method: "DELETE" });
}



async function addTaskToFirebase(listId, task) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task.json`;
    await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
    });
}














































async function toggleSubtaskStatus(listId, taskId, subtaskId, isChecked) {
    console.log("toggleSubtaskStatus aufgerufen mit:", { listId, taskId, subtaskId, isChecked });
    if (!listId || !taskId || !subtaskId) {
        console.error("Ungültige Parameter übergeben:", { listId, taskId, subtaskId });
        return;
    }
    try {
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
        const response = await fetch(taskUrl);
        if (!response.ok) {
            console.error(`Fehler beim Abrufen des Tasks ${taskId} aus Liste ${listId}: ${response.status}`);
            return;
        }
        const task = await response.json();
        if (!task || !task.subtasks || !task.subtasks[subtaskId]) {
            console.error(`Subtask mit ID '${subtaskId}' nicht gefunden (Task ID: ${taskId}, Liste: ${listId}).`);
            return;
        }
        task.subtasks[subtaskId].done = isChecked;
        const updateResponse = await fetch(taskUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(task),
        });
        if (!updateResponse.ok) {
            showSnackbar("Fehler beim Aktualisieren des Subtasks!");
            return;
        }
        showSnackbar("Subtask erfolgreich aktualisiert!");
        await updateSingleTaskElement(listId, taskId, task);
        await openTaskPopup(taskId, listId);
    } catch (error) {
        console.error("Fehler beim Umschalten des Subtask-Status:", error);
    }
  }
  
  
  
  async function updateSingleTaskElement(listId, taskId, updatedTask) {
    const taskElement = document.getElementById(`boardCard-${taskId}`);
    const listContainer = document.getElementById(`${listId}List`)?.querySelector('.taskContainer');
  
    if (!taskElement || !listContainer) {
        console.error("Task-Element oder List-Container nicht gefunden:", { taskId, listId });
        return;
    }
  
    // Subtasks-Informationen berechnen
    const subtasks = updatedTask.subtasks ? Object.values(updatedTask.subtasks) : [];
    const totalCount = subtasks.length;
    const doneCount = subtasks.filter(st => st.done).length;
    const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
  
    // Fortschrittsanzeige
    const progressHTML = totalCount > 0 ? /*html*/ `
        <div class="subtasksContainer">
            <div class="progress" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                <div class="progress-bar" style="width: ${progressPercent}%;"></div>
            </div>
            <p class="taskCardSubtasks">${doneCount}/${totalCount} Subtasks</p>
        </div>
    ` : "";
  
    // Arbeiter-Daten verarbeiten
    const workersHTML = Array.isArray(updatedTask.workers) && updatedTask.workers.length > 0
        ? updatedTask.workers.map(worker => {
              const initials = worker.name ? getInitials(worker.name) : "?"; // Initialen extrahieren
              const color = worker.color || getColorHex(worker.name, "default"); // Standardfarbe nutzen, wenn keine vorhanden
              return `
                  <p class="workerEmblem" style="background-color: ${color};">
                      ${initials}
                  </p>
              `;
          }).join("")
        : "";
  
    // Neues HTML für die Task-Card generieren
    const newTaskHTML = /*html*/ `
        <div id="boardCard-${taskId}" 
             draggable="true"
             ondragstart="startDragging('${taskId}', '${listId}')"
             onclick="openTaskPopup('${taskId}', '${listId}')"
             class="boardCard">
            <p class="${updatedTask.category?.class || 'defaultCategory'} taskCategory">
                ${updatedTask.category?.name || "No Category"}
            </p>
            <p class="taskCardTitle">${updatedTask.title}</p>
            <p class="taskCardDescription">${updatedTask.description}</p>
            ${progressHTML}
            <div class="BoardCardFooter">
                <div class="worker">${workersHTML}</div>
                <img class="priority" src="../../assets/icons/png/PrioritySymbols${updatedTask.priority || 'Low'}.png">
            </div>
        </div>
    `;
  
    // Task-Element im DOM ersetzen
    taskElement.outerHTML = newTaskHTML;
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



function renderSelectedContacts() {
    const selectedContactsList = document.getElementById("selectedContactsList");
    selectedContactsList.innerHTML = window.localEditedContacts
        .map(workerName => {
            const initials = getInitials(workerName);
            const color = getColorHex(workerName, "");
            return `
                <div class="workerInformation">
                    <p class="workerEmblem workerIcon" style="background-color: ${color};">
                        ${initials}
                    </p>
                    <p class="workerName">${workerName}</p>
                    <img 
                        class="hoverBtn" 
                        src="../../assets/icons/png/iconoir_cancel.png" 
                        onclick="removeContact('${workerName}')"
                        alt="Remove Worker">
                </div>
            `;
        })
        .join("");
}



function removeContact(workerName) {
    window.localEditedContacts = window.localEditedContacts.filter(contact => contact !== workerName);
    renderSelectedContacts();
}


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






function removeContactFromEdit(workerName) {
    if (!Array.isArray(window.localEditedContacts)) return; 
    window.localEditedContacts = window.localEditedContacts.filter(contact => contact.name !== workerName);
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (selectedContactsList) {
        selectedContactsList.innerHTML = window.localEditedContacts.length > 0
            ? window.localEditedContacts.map(contact => {
                  const initials = getInitials(contact.name);
                  const color = getColorHex(contact.name, "");
                  return `
                      <div class="workerInformation">
                          <p class="workerEmblem workerIcon" style="background-color: ${color};">
                              ${initials}
                          </p>
                          <p class="workerName">${contact.name}</p>
                          <img 
                              class="hoverBtn" 
                              src="../../assets/icons/png/iconoir_cancel.png" 
                              onclick="removeContactFromEdit('${contact.name}')"
                              alt="Remove Worker">
                      </div>
                  `;
              }).join("")
            : '<p>Keine zugewiesenen Arbeiter.</p>';
    }
}





function handleContactSelectionForEdit() {
    const dropdown = document.getElementById("contactSelection");
    const selectedContactName = dropdown.value;
    if (!selectedContactName) return; 
    if (window.localEditedContacts.some(contact => contact.name === selectedContactName)) return;
    const newContact = { name: selectedContactName };
    window.localEditedContacts.push(newContact);
    const selectedContactsList = document.getElementById("selectedContactsList");
    const initials = getInitials(selectedContactName);
    const color = getColorHex(selectedContactName, "");
    selectedContactsList.insertAdjacentHTML("beforeend", `
        <div class="workerInformation">
            <p class="workerEmblem workerIcon" style="background-color: ${color};">${initials}</p>
            <p class="workerName">${selectedContactName}</p>
            <img 
                class="hoverBtn" 
                src="../../assets/icons/png/iconoir_cancel.png" 
                onclick="removeContactFromEdit('${selectedContactName}')"
                alt="Remove Worker">
        </div>
    `);
    dropdown.value = "";
}


 
async function deleteTask(listId, taskId) {
    if (!listId || !taskId) {
        console.error("Fehlende Parameter für deleteTask:", { listId, taskId });
        return;
    }
    try {
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
        console.log("DELETE-URL:", taskUrl);

        const response = await fetch(taskUrl, {
            method: "DELETE",
        });

        if (!response.ok) {
            console.error("Fehler beim Löschen der Aufgabe:", response.status, response.statusText);
            return;
        }

        console.log("Task erfolgreich gelöscht:", taskId);
        showSnackbar('Der Task wurde erfolgreich gelöscht!');

        console.log("Aufgaben werden nach Löschung neu geladen...");
        await getTasks();
        console.log("Aufgaben erfolgreich neu geladen.");

        renderBoard();
        console.log("Board erfolgreich neu gerendert.");

        closeTaskPopup();
        console.log("Popup erfolgreich geschlossen.");
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}





function findTask() {
    const searchTerm = document.getElementById('findTask').value.trim().toLowerCase();
    const allTaskContainers = document.querySelectorAll('.taskContainer');
    allTaskContainers.forEach(container => {
        const taskCards = container.querySelectorAll('.boardCard');
        let hasMatchingTask = false;
        taskCards.forEach(card => {
            const title = card.querySelector('.taskCardTitle')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.taskCardDescription')?.textContent.toLowerCase() || '';
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = ''; 
                hasMatchingTask = true;
            } else {
                card.style.display = 'none';
            }
        });
        if (!hasMatchingTask) {
            const nothingToDo = container.querySelector('.nothingToDo');
            if (!nothingToDo) {
                container.innerHTML += /*html*/`
                    <div class="nothingToDo">
                        <p class="nothingToDoText">No matching tasks found</p>
                    </div>
                `;
            }
        } else {
            const nothingToDo = container.querySelector('.nothingToDo');
            if (nothingToDo) {
                nothingToDo.remove();
            }
        }
        if (searchTerm === '') {
            taskCards.forEach(card => {
                card.style.display = ''; 
            });
            container.querySelector('.nothingToDo')?.remove(); 
        }
    });
}