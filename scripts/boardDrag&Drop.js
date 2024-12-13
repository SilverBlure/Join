/**
 * Setzt den aktuellen Task für Dragging.
 * @param {string} taskId - Die ID des zu ziehenden Tasks.
 */
function startDragging(taskId) {
    currentDraggedElement = taskId;
    const card = document.getElementById(`boardCard-${taskId}`);
    if (card) card.classList.add("dragging");
}

/**
 * Beendet das Dragging und entfernt die Hervorhebung.
 */
function stopDragging() {
    const card = document.getElementById(`boardCard-${currentDraggedElement}`);
    if (card) card.classList.remove("dragging");
    currentDraggedElement = null;
}

/**
 * Erlaubt das Ablegen eines Elements auf dem Ziel.
 * @param {Event} event - Das Dragging-Event.
 */
function allowDrop(event) {
    event.preventDefault();
    event.stopPropagation();
}

/**
 * Hebt die Ziel-Liste hervor.
 * @param {string} listId - Die ID der Ziel-Liste.
 */
function highlightList(listId) {
    const list = document.getElementById(listId);
    if (list) list.classList.add("highlight");
}

/**
 * Entfernt die Hervorhebung von der Ziel-Liste.
 * @param {string} listId - Die ID der Ziel-Liste.
 */
function unhighlightList(listId) {
    const list = document.getElementById(listId);
    if (list) list.classList.remove("highlight");
}


async function handleDrop(event, targetListId) {
    event.preventDefault();

    if (!currentDraggedElement) {
        console.warn("Kein aktuelles Dragging-Element.");
        return;
    }

    console.log("HandleDrop: Verschiebe zu Ziel-Liste:", targetListId);

    const sourceListId = await findTaskSourceList(currentDraggedElement);
    if (!sourceListId) {
        console.error("Ursprungsliste nicht gefunden.");
        stopDragging();
        return;
    }

    try {
        const task = await fetchTaskFromFirebase(sourceListId, currentDraggedElement);
        if (!task) {
            console.error("Task konnte nicht geladen werden.");
            stopDragging();
            return;
        }
        await deleteTaskFromFirebase(sourceListId, currentDraggedElement);
        await addTaskToFirebase(targetListId, task);
        console.log("Task erfolgreich verschoben:", task);
        await getTasks();
        renderBoard();
    } finally {
        stopDragging();
        unhighlightList(targetListId);
    }
}




/**
 * Findet die Ursprungs-Liste eines Tasks.
 * @param {string} taskId - Die ID des zu suchenden Tasks.
 * @returns {Promise<string|null>} - Die ID der Ursprungs-Liste oder null, wenn nicht gefunden.
 */
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

/**
 * Ruft einen Task aus Firebase ab.
 * @param {string} listId - Die ID der Liste, aus der der Task abgerufen werden soll.
 * @param {string} taskId - Die ID des abzurufenden Tasks.
 * @returns {Promise<Object|null>} - Der Task oder null, wenn nicht gefunden.
 */
async function fetchTaskFromFirebase(listId, taskId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    const response = await fetch(url);
    return response.ok ? await response.json() : null;
}

/**
 * Löscht einen Task aus Firebase.
 * @param {string} listId - Die ID der Liste, aus der der Task gelöscht werden soll.
 * @param {string} taskId - Die ID des zu löschenden Tasks.
 */
async function deleteTaskFromFirebase(listId, taskId) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
    await fetch(url, { method: "DELETE" });
}

/**
 * Fügt einen Task in Firebase hinzu.
 * @param {string} listId - Die ID der Ziel-Liste.
 * @param {Object} task - Die Daten des Tasks.
 */
async function addTaskToFirebase(listId, task) {
    const url = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task.json`;
    await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
    });
}

/**
 * Touch-Unterstützung für Drag-and-Drop
 */
let touchStartX = 0;
let touchStartY = 0;

/**
 * Startet das Dragging per Touch.
 * @param {Event} event - Das Touch-Event.
 * @param {string} taskId - Die ID des zu ziehenden Tasks.
 */
function startTouchDragging(event, taskId) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    currentDraggedElement = taskId;
    const card = document.getElementById(`boardCard-${taskId}`);
    if (card) card.classList.add("dragging");
    disableScroll(); // Scrollen deaktivieren
}

function handleTouchMove(event) {
    if (!currentDraggedElement) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    const card = document.getElementById(`boardCard-${currentDraggedElement}`);
    if (card) {
        card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }

    // Ziel-Element überprüfen
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    console.log("TouchMove target:", targetElement?.id); // Debug: Zeigt das Ziel-Element an

    if (targetElement && targetElement.classList.contains("listBody")) {
        highlightList(targetElement.id);
    }
}


async function handleTouchDrop(event) {
    if (!currentDraggedElement) return;

    const touch = event.changedTouches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

    console.log("TouchDrop target:", targetElement?.id); // Debug: Zeigt das Ziel-Element an

    if (targetElement && targetElement.classList.contains("listBody")) {
        const targetListId = targetElement.id;
        await handleDrop(event, targetListId);
    } else {
        console.warn("Kein gültiges Ziel für den Drop erkannt.");
    }

    stopTouchDragging();
}



function stopTouchDragging() {
    const card = document.getElementById(`boardCard-${currentDraggedElement}`);
    if (card) {
        card.classList.remove("dragging");
        card.style.transform = ""; // Position zurücksetzen
    }
    currentDraggedElement = null;
    enableScroll(); // Scrollen wieder aktivieren
}




function disableScroll() {
    document.body.style.overflow = "hidden";
}

function enableScroll() {
    document.body.style.overflow = "";
}


document.addEventListener("touchstart", (event) => {
    const target = event.target.closest(".boardCard");
    if (target) {
        const taskId = target.id.split("-")[1];
        startTouchDragging(event, taskId);
    }
}, { passive: false });

document.addEventListener("touchmove", handleTouchMove, { passive: false });
document.addEventListener("touchend", handleTouchDrop, { passive: false });
