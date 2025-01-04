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

async function handleDrop(event, targetListId) {
    const sourceListId = await findTaskSourceList(currentDraggedElement);
    if (!sourceListId) {
        stopTouchDragging();
        return;
    }
    const task = await fetchTaskFromFirebase(sourceListId, currentDraggedElement);
    if (!task) {
        stopTouchDragging();
        return;
    }
    await deleteTaskFromFirebase(sourceListId, currentDraggedElement);
    await addTaskToFirebase(targetListId, task);
    await getTasks(); // Tasks neu laden
    renderBoard();    // Board neu rendern
}



const LONG_PRESS_THRESHOLD = 200; 
const THRESHOLD_DISTANCE = 10;    
let currentDraggedElement = null;
let touchStartTimestamp = null;
let touchStartX = null;
let touchStartY = null;
let isDragging = false; // Neu: Status, ob Dragging aktiv ist
let touchMoved = false; 
let isAutoScrolling = false;
let scrollDirection = 0;
const SCROLL_EDGE_OFFSET = 100; 
const SCROLL_SPEED = 500;        


function startTouchDragging(event, taskId) {
    const target = document.getElementById(`boardCard-${taskId}`);
    if (!target) return;

    touchStartTimestamp = Date.now();
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchMoved = false; // Bewegung wird zurückgesetzt
    currentDraggedElement = taskId;

    setTimeout(() => {
        if (!touchMoved && currentDraggedElement) {
            // Nur Dragging starten bei langem Drücken
            target.classList.add("dragging");
            disableScroll();
        }
    }, LONG_PRESS_THRESHOLD);
}

function handleTouchEnd(taskId, listId) {
    const touchDuration = Date.now() - touchStartTimestamp;
    if (touchMoved) {
        return;
    }
    if (!touchMoved && touchDuration < LONG_PRESS_THRESHOLD) {
        openTaskPopup(taskId, listId);
    }

    stopTouchDragging(); // Zustand zurücksetzen
}


/**
 * Stoppt das Auto-Scrolling.
 */
function stopAutoScrolling() {
    isAutoScrolling = false;
    scrollDirection = 0;
}


function handleTouchMove(event) {
    if (!currentDraggedElement) return;
    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartX);
    const deltaY = Math.abs(touch.clientY - touchStartY);
    if (deltaX > THRESHOLD_DISTANCE || deltaY > THRESHOLD_DISTANCE) {
        touchMoved = true;
        if (event.cancelable) {
            event.preventDefault();
        }
    }
    const adjustedX = touch.pageX - window.pageXOffset;
    const adjustedY = touch.pageY - window.pageYOffset;
    const targetElement = document.elementFromPoint(adjustedX, adjustedY);
    if (targetElement?.classList.contains("listBody")) {
        highlightList(targetElement.id);
    } else {
        document.querySelectorAll(".listBody").forEach((list) =>
            unhighlightList(list.id)
        );
    }
    const viewportHeight = window.innerHeight;
    const y = touch.clientY;

    if (y < SCROLL_EDGE_OFFSET) {
        startAutoScrolling(-1); // Scrollt nach oben
    } else if (y > viewportHeight - SCROLL_EDGE_OFFSET) {
        startAutoScrolling(1); // Scrollt nach unten
    } else {
        stopAutoScrolling();
    }
}


async function handleTouchDrop(event) {
    if (!currentDraggedElement) {
        stopTouchDragging();
        return;
    }
    stopAutoScrolling(); // Auto-Scroll anhalten
    const touch = event.changedTouches[0];
    const adjustedX = touch.pageX - window.pageXOffset;
    const adjustedY = touch.pageY - window.pageYOffset;
    const targetElement = document.elementFromPoint(adjustedX, adjustedY);
    const targetList = targetElement?.closest(".listBody");
    if (!targetList) {
        stopTouchDragging();
        return;
    }
    const targetListId = targetList.id.replace("List", "");
    try {
        await handleDrop(event, targetListId); // Verschiebe das Element
    } catch (error) {
        console.error("Fehler beim Verschieben des Tasks:", error);
    } finally {
        stopTouchDragging();
    }
}


/**
 * Stoppt das Touch-Dragging und setzt den Zustand zurück.
 */
function stopTouchDragging() {
    const card = document.getElementById(`boardCard-${currentDraggedElement}`);
    if (card) {
        card.classList.remove("dragging");
    }
    currentDraggedElement = null;
    touchStartX = null;
    touchStartY = null;
    isDragging = false;
    enableScroll(); // Scrollen aktivieren
}

/**
 * Startet das Auto-Scrolling in der angegebenen Richtung.
 * @param {number} direction - -1 für nach oben, 1 für nach unten.
 */
function startAutoScrolling(direction) {
    if (scrollDirection === direction && isAutoScrolling) return; // Bereits scrollend in dieser Richtung
    scrollDirection = direction;
    if (!isAutoScrolling) {
        isAutoScrolling = true;
        requestAnimationFrame(autoScroll);
    }
}

function autoScroll() {
    if (!isAutoScrolling) return;

    const viewportHeight = window.innerHeight;
    const touchY = scrollDirection === -1 ? SCROLL_EDGE_OFFSET : viewportHeight - SCROLL_EDGE_OFFSET;
    const distanceToEdge = Math.abs(touchY - touchStartY);

    // Dynamische Geschwindigkeit: näher am Rand = langsamer
    const dynamicSpeed = Math.max(SCROLL_SPEED / (distanceToEdge / 10), 10); // Mindestgeschwindigkeit 10px/Frame
    const scrollStep = scrollDirection * (dynamicSpeed / 60); // Geschwindigkeit basierend auf 60 FPS

    window.scrollBy(0, scrollStep);

    requestAnimationFrame(autoScroll); // Nächsten Scroll-Schritt planen
}


/**
 * Deaktiviert das Scrollen.
 */
function disableScroll() {
    document.body.style.overflow = "hidden";
}

/**
 * Aktiviert das Scrollen.
 */
function enableScroll() {
    document.body.style.overflow = "";
}
