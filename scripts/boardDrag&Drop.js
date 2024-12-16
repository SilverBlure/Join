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
    event.preventDefault();
    event.stopPropagation();

    const sourceListId = await findTaskSourceList(currentDraggedElement);
    if (!sourceListId) {
        stopTouchDragging(); // Stoppen, falls keine Quellliste gefunden wurde
        return;
    }

    try {
        const task = await fetchTaskFromFirebase(sourceListId, currentDraggedElement);
        if (!task) {
            stopTouchDragging();
            return;
        }

        await deleteTaskFromFirebase(sourceListId, currentDraggedElement);
        await addTaskToFirebase(targetListId, task);
        await getTasks();
        renderBoard();
    } finally {
        stopTouchDragging(); // Stoppen, nachdem das Element verschoben wurde
        unhighlightList(`${targetListId}List`);
    }
}


const LONG_PRESS_THRESHOLD = 200; // Zeit in Millisekunden für Dragging
const THRESHOLD_DISTANCE = 10; // Minimale Bewegung in Pixeln für Dragging
let currentDraggedElement = null;
let touchStartTimestamp = null;
let touchStartX = null;
let touchStartY = null;
let touchMoved = false; // Ob eine signifikante Bewegung erfolgt
let autoScrollInterval = null;
let scrollDisabled = false;


window.addEventListener("touchstart", (event) => {
    const target = event.target.closest(".boardCard");
    if (target) {
        const taskId = target.id.split("-")[1];
        startTouchDragging(event, taskId);
    }
}, { passive: false });

window.addEventListener("touchmove", handleTouchMove, { passive: false });

window.addEventListener("touchend", handleTouchDrop, { passive: false });


/**
 * Startet das Touch-Event, differenziert zwischen Click und Dragging.
 * @param {Event} event - Das Touch-Event.
 * @param {string} taskId - Die ID des Tasks.
 */
function startTouchDragging(event, taskId) {
    const target = document.getElementById(`boardCard-${taskId}`);
    if (!target) return;

    touchStartTimestamp = Date.now();
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchMoved = false; // Zurücksetzen des Bewegungsstatus
    currentDraggedElement = taskId;

    // Timeout starten, um zwischen Click und Dragging zu unterscheiden
    setTimeout(() => {
        if (!touchMoved) {
            console.log("OnClick erkannt für Task ID:", taskId);
            openTaskPopup(taskId, findTaskSourceList(taskId)); // Beispiel-OnClick-Aktion
        } else {
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
    const touchY = touch.clientY;

    // Nur während des Dragging-Prozesses Auto-Scroll auslösen
    if (currentDraggedElement) {
        autoScroll(touchY);
    }

    const targetElement = document.elementFromPoint(touch.pageX, touch.pageY);
    if (targetElement?.classList.contains("listBody")) {
        highlightList(targetElement.id);
    } else {
        document.querySelectorAll(".listBody").forEach((list) =>
            unhighlightList(list.id)
        );
    }
}


/**
 * Handhabt das Ablegen eines Tasks oder ein Click-Event.
 * @param {Event} event - Das Touch-Event.
 */
/**
 * Handhabt das Ablegen eines Tasks oder ein Click-Event.
 * @param {Event} event - Das Touch-Event.
 */
async function handleTouchDrop(event) {
    if (!currentDraggedElement) {
        return;
    }

    const touchDuration = Date.now() - touchStartTimestamp;

    // Prüfen, ob es sich um einen Click handelt
    if (touchDuration < LONG_PRESS_THRESHOLD && !touchMoved) {
        const taskId = currentDraggedElement;
        const listId = await findTaskSourceList(taskId);
        openTaskPopup(taskId, listId); // Beispiel-OnClick-Aktion
        stopTouchDragging();
        return;
    }

    // Dragging-Logik fortsetzen
    const touch = event.changedTouches[0];
    const adjustedX = touch.pageX - window.pageXOffset;
    const adjustedY = touch.pageY - window.pageYOffset;

    const targetElement = document.elementFromPoint(adjustedX, adjustedY);

    console.log("Touch ended on element:", targetElement);

    const targetList = targetElement?.closest(".listBody");
    if (!targetList) {
        console.warn("Drop target is not a valid list body.");
        stopTouchDragging();
        return;
    }

    console.log("Valid drop target:", targetList.id);

    const targetListId = targetList.id.replace("List", "");

    try {
        await handleDrop(event, targetListId);
    } catch (error) {
        console.error("Fehler beim Drop:", error);
    } finally {
        stopTouchDragging();
    }
}


function stopTouchDragging() {
    const card = document.getElementById(`boardCard-${currentDraggedElement}`);
    if (card) {
        card.classList.remove("dragging");
    }
    currentDraggedElement = null;
    touchStartTimestamp = null;
    touchMoved = false; // Zurücksetzen
    stopAutoScroll(); // Beende Auto-Scroll
    enableScroll(); // Scrollen wieder aktivieren
}



function autoScroll(touchY) {
    const scrollThreshold = 50; // Bereich vom Rand des Bildschirms
    const scrollSpeed = 10; // Geschwindigkeit des Scrollens in Pixeln
    const scrollInterval = 50; // Intervalldauer in Millisekunden

    // Beende ein bestehendes Auto-Scroll-Intervall
    stopAutoScroll();

    if (scrollDisabled) {
        // Scrollen blockiert, keine Auto-Scroll-Aktion
        console.log("Scrollen ist deaktiviert. Auto-Scroll wird nicht ausgeführt.");
        return;
    }

    if (touchY < scrollThreshold) {
        // Scroll nach oben
        autoScrollInterval = setInterval(() => {
            window.scrollBy({ top: -scrollSpeed });
        }, scrollInterval);
    } else if (touchY > window.innerHeight - scrollThreshold) {
        // Scroll nach unten
        autoScrollInterval = setInterval(() => {
            window.scrollBy({ top: scrollSpeed });
        }, scrollInterval);
    }
}


/**
 * Stoppt das Auto-Scrolling.
 */
function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

/**
 * Deaktiviert das Scrollen der Seite, außer während des Auto-Scrolls.
 */
function disableScroll() {
    if (!autoScrollInterval) {
        document.body.style.overflow = "hidden";
        scrollDisabled = true;
    }
}

/**
 * Aktiviert das Scrollen der Seite.
 */
function enableScroll() {
    if (!autoScrollInterval) {
        document.body.style.overflow = "";
        scrollDisabled = false;
    }
}