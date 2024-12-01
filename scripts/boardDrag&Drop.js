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
