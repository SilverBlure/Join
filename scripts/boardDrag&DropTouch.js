const LONG_PRESS_THRESHOLD = 200; 
const THRESHOLD_DISTANCE = 10;    
let currentDraggedElement = null;
let touchStartTimestamp = null;
let touchStartX = null;
let touchStartY = null;
let isDragging = false; 
let touchMoved = false; 
let isAutoScrolling = false;
let scrollDirection = 0;
const SCROLL_EDGE_OFFSET = 100; 
const SCROLL_SPEED = 500;        

/**
 * Startet das Dragging einer Board Card auf einem Touch-Gerät.
 * Aktiviert das Dragging nur, wenn der Benutzer das Element lange genug gedrückt hält.
 *
 * @param {TouchEvent} event - Das Touch-Event, das das Dragging auslöst.
 * @param {string} taskId - Die ID der Aufgabe, die verschoben werden soll.
 */
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

/**
 * Handhabt das Ende eines Touch-Events.
 * Öffnet ein Popup bei kurzem Tippen oder stoppt das Dragging.
 *
 * @param {string} taskId - Die ID der Aufgabe, die bearbeitet oder verschoben werden soll.
 * @param {string} listId - Die ID der Liste, zu der die Aufgabe gehört.
 */
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

/**
 * Handhabt die Bewegung eines Touch-Events während des Dragging.
 * Aktualisiert das Highlighting der Ziel-Liste und steuert das Auto-Scrolling.
 *
 * @param {TouchEvent} event - Das Touch-Move-Event.
 */
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

/**
 * Handhabt das Ablegen eines Tasks nach einem Dragging-Vorgang auf einem Touch-Gerät.
 * Führt den Drop-Vorgang aus und aktualisiert die Ziel-Liste.
 *
 * @param {TouchEvent} event - Das Touch-End-Event.
 */
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

/**
 * Führt das Auto-Scrolling basierend auf der Scroll-Richtung und der Nähe zum Bildschirmrand aus.
 * Die Scrollgeschwindigkeit wird dynamisch angepasst, je nachdem, wie nah sich der Touchpunkt am Rand befindet.
 */
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