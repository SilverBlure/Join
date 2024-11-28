


let currentDraggedElement;



function startDragging(taskId) {
    currentDraggedElement = taskId;
    const card = document.getElementById(`boardCard-${taskId}`);
    if (card) {
        card.classList.add('dragging');
    } else {
        console.error(`Card mit ID boardCard-${taskId} nicht gefunden.`);
    }
}



function stopDragging() {
    const card = document.getElementById(`boardCard-${currentDraggedElement}`);
    if (card) {
        card.classList.remove('dragging');
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
        list.classList.add('highlight');
    } else {
        console.error(`Liste mit ID ${listId} nicht gefunden.`);
    }
}



function unhighlightList(listId) {
    const list = document.getElementById(listId);
    if (list) {
        list.classList.remove('highlight');
    } else {
        console.error(`Liste mit ID ${listId} nicht gefunden.`);
    }
}

async function handleDrop(event, targetListId) {
    event.preventDefault();
    event.stopPropagation();

    const sourceListId = await findTaskSourceList(currentDraggedElement); // Quell-Liste ermitteln
    if (!sourceListId) {
        console.error(`Quell-Liste für Task ${currentDraggedElement} nicht gefunden.`);
        stopDragging();
        return;
    }

    try {
        // Task-Daten aus Firebase holen
        const task = await fetchTaskFromFirebase(sourceListId, currentDraggedElement);

        if (!task) {
            console.error(`Task ${currentDraggedElement} konnte nicht aus Liste ${sourceListId} geladen werden.`);
            stopDragging();
            return;
        }

        // Task aus der Quell-Liste entfernen
        await deleteTaskFromFirebase(sourceListId, currentDraggedElement);

        // Task in die Ziel-Liste einfügen
        await addTaskToFirebase(targetListId, task);

        // **Direkt das Board aktualisieren**
        // Daten erneut abrufen und rendern
        const tasks = await getTasks(); // `getTasks()` aktualisiert globalen Zustand
        renderBoard(); // Board neu rendern
    } catch (error) {
        console.error("Fehler beim Verschieben des Tasks:", error);
    } finally {
        stopDragging();
        unhighlightList(`${targetListId}List`);
    }
}


// **Hilfsfunktionen für Firebase**

async function findTaskSourceList(taskId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks.json`;
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Fehler beim Abrufen der Listen: ${response.status}`);
        return null;
    }

    const data = await response.json();
    for (const listId in data) {
        if (data[listId].task && data[listId].task[taskId]) {
            return listId; // Quell-Liste gefunden
        }
    }
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
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
        console.error(`Fehler beim Löschen des Tasks ${taskId} aus Liste ${listId}: ${response.status}`);
    }
}

async function addTaskToFirebase(listId, task) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task.json`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
    });
    if (!response.ok) {
        console.error(`Fehler beim Hinzufügen des Tasks zu Liste ${listId}: ${response.status}`);
    }
}