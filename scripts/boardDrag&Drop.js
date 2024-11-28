


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


function handleDrop(event, targetListId) {
    event.preventDefault();
    event.stopPropagation();
    let sourceList, task;
    // Die Liste und den Task finden, aus der der Task entfernt wird
    tasks.forEach(list => {
        const taskIndex = list.task.findIndex(t => t.id === currentDraggedElement);
        if (taskIndex !== -1) {
            sourceList = list;
            [task] = sourceList.task.splice(taskIndex, 1); // Task aus der Quell-Liste entfernen
        }
    });
    // Ziel-Liste finden und Task hinzufügen
    const targetList = tasks.find(list => list.id === targetListId);
    if (targetList && task) {
        targetList.task.push(task); // Task in die Ziel-Liste verschieben
        renderBoard(); // Board neu rendern
    } else {
        console.error(`Ziel-Liste mit ID "${targetListId}" oder Task nicht gefunden.`);
    }
    stopDragging(); // Dragging beenden
    unhighlightList(`${targetListId}List`); // Hervorhebung entfernen
}