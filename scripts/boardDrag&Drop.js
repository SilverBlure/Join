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
        stopTouchDragging(); 
        unhighlightList(`${targetListId}List`);
    }
}

const LONG_PRESS_THRESHOLD = 200; 
const THRESHOLD_DISTANCE = 10; 
let currentDraggedElement = null;
let touchStartTimestamp = null;
let touchStartX = null;
let touchStartY = null;
let touchMoved = false; 
let autoScrollInterval = null; 
let isAutoScrolling = false;
let scrollDirection = 0; 

const SCROLL_EDGE_OFFSET = 100; 
const SCROLL_SPEED = 20; 

window.addEventListener("touchstart", (event) => {
    const target = event.target.closest(".boardCard");
    if (target) {
        const taskId = target.id.split("-")[1];
        startTouchDragging(event, taskId);
    }
}, { passive: false });

window.addEventListener("touchmove", handleTouchMove, { passive: false });
window.addEventListener("touchend", handleTouchDrop, { passive: false });

async function startTouchDragging(event, taskId) {
    const target = document.getElementById(`boardCard-${taskId}`);
    if (!target) return;
    touchStartTimestamp = Date.now();
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchMoved = false;
    currentDraggedElement = taskId;

    setTimeout(async () => {
        if (!touchMoved) {
            const listId = await findTaskSourceList(taskId);
            openTaskPopup(taskId, listId);
            stopTouchDragging();
        } else {
            target.classList.add("dragging");
            disableScroll();
        }
    }, LONG_PRESS_THRESHOLD);
}

function handleTouchMove(event) {
    if (!currentDraggedElement) return;

    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartX);
    const deltaY = Math.abs(touch.clientY - touchStartY);


    if (deltaX > THRESHOLD_DISTANCE || deltaY > THRESHOLD_DISTANCE) {
        touchMoved = true;
    }

    // Hervorheben der Ziel-Liste
    if (currentDraggedElement) {
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
    }

    // Auto-Scroll Logik:
    const viewportHeight = window.innerHeight;
    const y = touch.clientY; 
    if (y < SCROLL_EDGE_OFFSET) {
        startAutoScrolling(-1);
    } else if (y > viewportHeight - SCROLL_EDGE_OFFSET) {
        startAutoScrolling(1);
    } else {
        stopAutoScrolling();
    }
}

async function handleTouchDrop(event) {
    if (!currentDraggedElement) {
        return;
    }

    stopAutoScrolling(); 

    const touchDuration = Date.now() - touchStartTimestamp;


    if (touchDuration < LONG_PRESS_THRESHOLD && !touchMoved) {
        const taskId = currentDraggedElement;
        const listId = await findTaskSourceList(taskId);
        openTaskPopup(taskId, listId);
        stopTouchDragging();
        return;
    }

    // Drag-Drop
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
        await handleDrop(event, targetListId);
    } catch (error) {
        console.error(error);
    } finally {
        stopTouchDragging();
    }
}

function stopTouchDragging() {
    stopAutoScrolling();
    const card = currentDraggedElement && document.getElementById(`boardCard-${currentDraggedElement}`);
    if (card) {
        card.classList.remove("dragging");
    }
    currentDraggedElement = null;
    touchStartTimestamp = null;
    touchMoved = false;
    enableScroll();
}

// Auto-Scrolling starten
function startAutoScrolling(direction) {
    if (scrollDirection === direction && isAutoScrolling) return; 
    scrollDirection = direction;
    if (!isAutoScrolling) {
        isAutoScrolling = true;
        autoScroll();
    }
}

// Auto-Scrolling stoppen
function stopAutoScrolling() {
    isAutoScrolling = false;
    scrollDirection = 0;
}

function autoScroll() {
    if (!isAutoScrolling) return;
    window.scrollBy(0, scrollDirection * SCROLL_SPEED);
    requestAnimationFrame(autoScroll);
}

async function handleDrop(event, targetListId) {
    // Nur wenn abbrechbar:
    if (event.cancelable) {
        event.preventDefault();
        event.stopPropagation();
    }

    const sourceListId = await findTaskSourceList(currentDraggedElement);
    if (!sourceListId) {
        stopTouchDragging(); 
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
        stopTouchDragging(); 
        unhighlightList(`${targetListId}List`);
    }
}



function disableScroll() {
    document.body.style.overflow = "hidden";
}


function enableScroll() {
    document.body.style.overflow = "";
}

