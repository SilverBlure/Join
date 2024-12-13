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
 * @param {string} listId - Die ID der Liste, die hervorgehoben werden soll.
 */
function highlightList(listId) {
    const list = document.getElementById(listId);
    if (list) list.classList.add("highlight");
}

/**
 * Entfernt die Hervorhebung von der Liste.
 * @param {string} listId - Die ID der Liste, die nicht mehr hervorgehoben werden soll.
 */
function unhighlightList(listId) {
    const list = document.getElementById(listId);
    if (list) list.classList.remove("highlight");
}

/**
 * Handhabt das Ablegen eines Tasks auf eine neue Liste.
 * @param {Event} event - Das Drop-Event.
 * @param {string} targetListId - Die ID der Ziel-Liste.
 */
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


let touchDraggedElement = null;

function startTouchDragging(event, taskId) {
    const target = document.getElementById(`boardCard-${taskId}`);
    if (!target) {
        return;
    }
    currentDraggedElement = taskId; // Speichert die ID des gezogenen Tasks
    target.classList.add("dragging");
    console.log("Touch start detected. Task ID:", taskId);
    disableScroll(); // Scrollen deaktivieren
}


function handleTouchMove(event) {
    if (!currentDraggedElement) {
        return;
    }
    const touch = event.touches[0];
    const targetElement = document.elementFromPoint(touch.pageX, touch.pageY);
    if (targetElement?.classList.contains("listBody")) {
        highlightList(targetElement.id);
    } else {
        document.querySelectorAll(".listBody").forEach(list => unhighlightList(list.id));
    }
}


async function handleTouchDrop(event) {
    if (!currentDraggedElement) {
        return;
    }
    const touch = event.changedTouches[0];
    const targetElement = document.elementFromPoint(touch.pageX, touch.pageY);
    const targetList = targetElement?.closest(".listBody"); // Findet die nächste Liste
    if (targetList) {
        const targetListId = targetList.id.replace("List", "");
        await handleDrop(event, targetListId);
    } else {
        console.warn("Drop target is not a valid list body.");
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



// Scroll Handling
function disableScroll() {
    document.body.style.overflow = "hidden";
}

function enableScroll() {
    document.body.style.overflow = "";
}

// Event Listeners
window.addEventListener("touchstart", (event) => {
    const target = event.target.closest(".boardCard");
    if (target) {
        const taskId = target.id.split("-")[1];
        startTouchDragging(event, taskId);
    }
}, { passive: false });

window.addEventListener("touchmove", handleTouchMove, { passive: false });

window.addEventListener("touchend", handleTouchDrop, { passive: false });
