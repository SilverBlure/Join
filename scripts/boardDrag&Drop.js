let currentDraggedElement = null;



function startDragging(taskId) {
    console.log("Dragging gestartet für Task-ID:", taskId);
    currentDraggedElement = taskId; 
    const card = document.getElementById(`boardCard-${taskId}`);
    if (card) {
        card.classList.add("dragging");
    } else {
        console.error(`Card mit ID boardCard-${taskId} nicht gefunden.`);
    }
}



function stopDragging() {
    console.log("Dragging beendet für Task:", currentDraggedElement);
    const card = document.getElementById(`boardCard-${currentDraggedElement}`);
    if (card) {
        card.classList.remove("dragging");
    }
    currentDraggedElement = null;
}



function allowDrop(event) {
    event.preventDefault();
    event.stopPropagation();
}



function highlightList(listId) {
    const list = document.getElementById(listId);
    if (list) {
        list.classList.add("highlight");
    } else {
        console.error(`Liste mit ID ${listId} nicht gefunden.`);
    }
}



function unhighlightList(listId) {
    const list = document.getElementById(listId);
    if (list) {
        list.classList.remove("highlight");
    } else {
        console.error(`Liste mit ID ${listId} nicht gefunden.`);
    }
}



async function handleDrop(event, targetListId) {
    event.preventDefault();
    event.stopPropagation();
    console.log("Target List-ID:", targetListId);
    console.log("Aktuell gezogene Task-ID:", currentDraggedElement);
    const sourceListId = await findTaskSourceList(currentDraggedElement);
    if (!sourceListId) {
        console.error(`Quell-Liste für Task ${currentDraggedElement} nicht gefunden.`);
        stopDragging(); 
        return;
    }
    try {
        console.log(`Verschiebe Task ${currentDraggedElement} von ${sourceListId} nach ${targetListId}`);
        const task = await fetchTaskFromFirebase(sourceListId, currentDraggedElement);
        if (!task) {
            console.error(`Task ${currentDraggedElement} konnte nicht aus Liste ${sourceListId} geladen werden.`);
            stopDragging();
            return;
        }
        await deleteTaskFromFirebase(sourceListId, currentDraggedElement);
        await addTaskToFirebase(targetListId, task);
        await getTasks(); 
        renderBoard();
    } catch (error) {
        console.error("Fehler beim Verschieben des Tasks:", error);
    } finally {
        stopDragging();
        unhighlightList(`${targetListId}List`);
    }
}



async function findTaskSourceList(taskId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks.json`;
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Fehler beim Abrufen der Listen: ${response.status}`);
        return null;
    }
    const data = await response.json();
    console.log("Datenstruktur für Aufgaben:", data);
    for (const listId in data) {
        const tasks = data[listId]?.task || {};
        if (tasks[taskId]) {
            console.log(`Task ${taskId} gefunden in Liste ${listId}`);
            return listId;
        }
    }
    console.error(`Task ${taskId} nicht gefunden in irgendeiner Liste.`);
    return null;
}



async function fetchTaskFromFirebase(listId, taskId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Fehler beim Abrufen des Tasks ${taskId} aus Liste ${listId}: ${response.status}`);
        return null;
    }
    return await response.json();
}



async function deleteTaskFromFirebase(listId, taskId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) {
        console.error(`Fehler beim Löschen des Tasks ${taskId} aus Liste ${listId}: ${response.status}`);
    }
}



async function addTaskToFirebase(listId, task) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task.json`;
    console.log(`Füge Task zu Liste ${listId} hinzu:`, task);
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Fehler beim Hinzufügen des Tasks zu Liste ${listId}: ${response.status}`, errorText);
    } else {
        console.log(`Task erfolgreich zu Liste ${listId} hinzugefügt.`);
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
    if (!window.localEditedContacts) {
        window.localEditedContacts = []; // Initialisieren, falls nicht vorhanden
    }

    const contactSelection = document.getElementById("contactSelection");
    const selectedContactsList = document.getElementById("selectedContactsList");
    const selectedContactName = contactSelection.value;

    if (!selectedContactName) return;

    // Überprüfen, ob der Kontakt bereits existiert
    if (window.localEditedContacts.includes(selectedContactName)) {
        console.warn("Kontakt ist bereits ausgewählt.");
        return;
    }

    // Kontakt hinzufügen
    window.localEditedContacts.push(selectedContactName);

    // Rendern der Kontakte
    renderSelectedContacts();
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
    dropdown.innerHTML = ""; // Sicherstellen, dass keine Duplikate auftreten
    for (let contact of contactsArray) {
        dropdown.innerHTML += `
            <option value="${contact.name}">${contact.name}</option>
        `;
    }
}






function removeContactFromEdit(workerName) {
    if (!Array.isArray(window.localEditedContacts)) {
        console.warn("Es gibt keine lokalen bearbeiteten Kontakte oder die Struktur ist ungültig.");
        return;
    }

    // Kontakt aus der lokalen Liste entfernen
    window.localEditedContacts = window.localEditedContacts.filter(contact => contact.name !== workerName);
    console.log(`Kontakt "${workerName}" aus der Bearbeitungsliste entfernt.`, window.localEditedContacts);

    // Liste der ausgewählten Kontakte aktualisieren
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (!selectedContactsList) {
        console.error("Das HTML-Element für die ausgewählten Kontakte wurde nicht gefunden.");
        return;
    }

    // Aktualisierte Kontakte als HTML neu rendern
    const updatedContactsHTML = window.localEditedContacts.map(contact => {
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
    }).join("");

    // Aktualisiere die UI
    selectedContactsList.innerHTML = updatedContactsHTML || '<p>Keine zugewiesenen Arbeiter.</p>';
}

 function handleContactSelectionForEdit() {
    const dropdown = document.getElementById("contactSelection");
    const selectedContactName = dropdown.value;
    if (!selectedContactName) return; 

    // Prüfen, ob der Kontakt bereits existiert
    if (window.localEditedContacts.some(contact => contact.name === selectedContactName)) {
        console.warn("Kontakt ist bereits ausgewählt.");
        return;
    }

    // Kontakt hinzufügen
    const newContact = { name: selectedContactName };
    window.localEditedContacts.push(newContact);
    console.log("Kontakt hinzugefügt:", newContact);
    console.log("Aktualisierte Kontakte:", window.localEditedContacts);

    // UI aktualisieren
    const selectedContactsList = document.getElementById("selectedContactsList");
    const initials = getInitials(selectedContactName);
    const color = getColorHex(selectedContactName, "");
    selectedContactsList.insertAdjacentHTML("beforeend", `
        <div class="workerInformation">
            <p class="workerEmblem workerIcon" style="background-color: ${color};">
                ${initials}
            </p>
            <p class="workerName">${selectedContactName}</p>
            <img 
                class="hoverBtn" 
                src="../../assets/icons/png/iconoir_cancel.png" 
                onclick="removeContactFromEdit('${selectedContactName}')"
                alt="Remove Worker">
        </div>
    `);

    // Dropdown zurücksetzen
    dropdown.value = "";
}


 
async function deleteTask(listId, taskId) {
    if (!listId || !taskId) {
        console.error("Ungültige Parameter für das Löschen:", { listId, taskId });
        return;
    }
    try {
        const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
        const response = await fetch(taskUrl, {
            method: "DELETE",
        });
        if (!response.ok) {
            console.error(`Fehler beim Löschen des Tasks ${taskId} aus Liste ${listId}: ${response.status}`);
            return;
        }
        console.log(`Task ${taskId} erfolgreich aus Liste ${listId} gelöscht.`);
        await getTasks(); 
        renderBoard(); 
        closeTaskPopup(); 
    } catch (error) {
        console.error("Fehler beim Löschen des Tasks:", error);
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