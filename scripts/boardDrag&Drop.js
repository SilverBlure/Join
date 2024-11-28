let currentDraggedElement = null;

// **Drag starten**
function startDragging(taskId) {
    console.log("Dragging gestartet für Task-ID:", taskId);
    currentDraggedElement = taskId; // Speichere die Task-ID
    const card = document.getElementById(`boardCard-${taskId}`);
    if (card) {
        card.classList.add("dragging");
    } else {
        console.error(`Card mit ID boardCard-${taskId} nicht gefunden.`);
    }
}

// **Drag stoppen**
function stopDragging() {
    console.log("Dragging beendet für Task:", currentDraggedElement);
    const card = document.getElementById(`boardCard-${currentDraggedElement}`);
    if (card) {
        card.classList.remove("dragging");
    }
    currentDraggedElement = null;
}

// **Drop erlauben**
function allowDrop(event) {
    event.preventDefault();
    event.stopPropagation();
}

// **Liste hervorheben**
function highlightList(listId) {
    const list = document.getElementById(listId);
    if (list) {
        list.classList.add("highlight");
    } else {
        console.error(`Liste mit ID ${listId} nicht gefunden.`);
    }
}

// **Hervorhebung entfernen**
function unhighlightList(listId) {
    const list = document.getElementById(listId);
    if (list) {
        list.classList.remove("highlight");
    } else {
        console.error(`Liste mit ID ${listId} nicht gefunden.`);
    }
}

// **Drop-Logik**
async function handleDrop(event, targetListId) {
    event.preventDefault();
    event.stopPropagation();

    console.log("Target List-ID:", targetListId);
    console.log("Aktuell gezogene Task-ID:", currentDraggedElement);

    const sourceListId = await findTaskSourceList(currentDraggedElement);
    if (!sourceListId) {
        console.error(`Quell-Liste für Task ${currentDraggedElement} nicht gefunden.`);
        stopDragging(); // Dragging beenden
        return;
    }

    try {
        console.log(`Verschiebe Task ${currentDraggedElement} von ${sourceListId} nach ${targetListId}`);

        // Task aus Firebase holen
        const task = await fetchTaskFromFirebase(sourceListId, currentDraggedElement);
        if (!task) {
            console.error(`Task ${currentDraggedElement} konnte nicht aus Liste ${sourceListId} geladen werden.`);
            stopDragging();
            return;
        }

        // Task aus der Quell-Liste löschen
        await deleteTaskFromFirebase(sourceListId, currentDraggedElement);

        // Task in die Ziel-Liste hinzufügen
        await addTaskToFirebase(targetListId, task);

        // Aufgaben neu laden und Board aktualisieren
        await getTasks(); 
        renderBoard();
    } catch (error) {
        console.error("Fehler beim Verschieben des Tasks:", error);
    } finally {
        stopDragging();
        unhighlightList(`${targetListId}List`);
    }
}

// **Hilfsfunktionen**

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
