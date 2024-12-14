/**
 * Setzt den aktuellen Task für Dragging.
 * @param {string} taskId - Die ID des zu ziehenden Tasks.
 */
function startDragging(taskId) {
    currentDraggedElement = taskId;
    const card = document.getElementById(`boardCard-${taskId}`);
    if (card) {
        card.classList.add("dragging");
    }
}

/**
 * Beendet das Dragging und entfernt die Hervorhebung.
 */
function stopDragging() {
    const card = document.getElementById(`boardCard-${currentDraggedElement}`);
    if (card) {
        card.classList.remove("dragging");
    }
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
    if (list) {
        list.classList.add("highlight");
    }
}

/**
 * Entfernt die Hervorhebung von der Liste.
 * @param {string} listId - Die ID der Liste, die nicht mehr hervorgehoben werden soll.
 */
function unhighlightList(listId) {
    const list = document.getElementById(listId);
    if (list) {
        list.classList.remove("highlight");
    }
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
 * Deaktiviert das Scrollen der Seite.
 */
function disableScroll() {
    document.body.style.overflow = "hidden";
}

/**
 * Aktiviert das Scrollen der Seite.
 */
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

let currentDraggedElement = null;
let touchStartTimestamp = null;
let touchMoved = false; // Verfolgt, ob eine Bewegung erfolgt
const LONG_PRESS_THRESHOLD = 200; // Zeit in Millisekunden für Dragging

/**
 * Startet das Touch-Event, differenziert zwischen Click und Dragging.
 * @param {Event} event - Das Touch-Event.
 * @param {string} taskId - Die ID des Tasks.
 */
function startTouchDragging(event, taskId) {
    const target = document.getElementById(`boardCard-${taskId}`);
    if (!target) return;

    touchStartTimestamp = Date.now();
    touchMoved = false; // Zurücksetzen des Bewegungsstatus
    currentDraggedElement = taskId;

    // Startet ein Timeout, um Dragging zu aktivieren
    setTimeout(() => {
        if (touchMoved) {
            target.classList.add("dragging");
            disableScroll(); // Scrollen deaktivieren
            console.log("Dragging gestartet für Task ID:", taskId);
        }
    }, LONG_PRESS_THRESHOLD);
}

/**
 * Handhabt die Bewegung eines Touch-Events.
 * @param {Event} event - Das Touch-Event.
 */
function handleTouchMove(event) {
    if (!currentDraggedElement) return;

    touchMoved = true; // Kennzeichnet, dass es sich um eine Bewegung handelt
    const touch = event.touches[0];
    const targetElement = document.elementFromPoint(touch.pageX, touch.pageY);

    if (targetElement?.classList.contains("listBody")) {
        highlightList(targetElement.id);
    } else {
        document.querySelectorAll(".listBody").forEach(list => unhighlightList(list.id));
    }
}

/**
 * Handhabt das Ablegen eines Touch-Events.
 * @param {Event} event - Das Touch-Event.
 */
async function handleTouchDrop(event) {
    if (!currentDraggedElement) {
        return;
    }

    const touchDuration = Date.now() - touchStartTimestamp;

    if (touchDuration < LONG_PRESS_THRESHOLD && !touchMoved) {
        // Wenn der Touch kurz war und keine Bewegung erfolgte -> Click
        const taskId = currentDraggedElement;
        const listId = await findTaskSourceList(taskId);
        openTaskPopup(taskId, listId); // Popup öffnen
    } else {
        const touch = event.changedTouches[0];
        const targetElement = document.elementFromPoint(touch.pageX, touch.pageY);
        const targetList = targetElement?.closest(".listBody");

        if (targetList) {
            const targetListId = targetList.id.replace("List", "");
            await handleDrop(event, targetListId);
        } else {
            console.warn("Drop target is not a valid list body.");
        }
    }

    stopTouchDragging();
}

/**
 * Beendet das Touch-Dragging oder behandelt einen Click.
 */
function stopTouchDragging() {
    const card = document.getElementById(`boardCard-${currentDraggedElement}`);
    if (card) {
        card.classList.remove("dragging");
    }

    currentDraggedElement = null;
    touchStartTimestamp = null;
    touchMoved = false; // Zurücksetzen
    enableScroll(); // Scrollen wieder aktivieren
}

/**
 * Öffnet ein Popup für die Task.
 * @param {string} taskId - Die ID des Tasks.
 * @param {string} listId - Die ID der Liste.
 */
async function openTaskPopup(taskId, listId) {
    console.log(`Task Popup öffnen für Task ID: ${taskId}, List ID: ${listId}`);
    // Deine Popup-Logik hier einfügen
}

// Event Listeners
window.addEventListener(
    "touchstart",
    (event) => {
        const target = event.target.closest(".boardCard");
        if (target) {
            const taskId = target.id.split("-")[1];
            startTouchDragging(event, taskId);
        }
    },
    { passive: false }
);

window.addEventListener("touchmove", handleTouchMove, { passive: false });

window.addEventListener("touchend", handleTouchDrop, { passive: false });
