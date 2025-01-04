/**
 * Behandelt Tasteneingaben beim Bearbeiten eines Subtasks.
 * @param {KeyboardEvent} event - Das Tastendruck-Ereignis.
 */
function handleSubtaskEditKey(event) {
    const subtaskId = event.target.id.replace("edit-input-", ""); // Extrahiere Subtask-ID aus der Eingabe-ID

    if (event.key === "Enter") {
        // Speichere die Änderungen, wenn Enter gedrückt wird
        event.preventDefault();
        saveEditedSubtask(subtaskId);
    } else if (event.key === "Escape") {
        // Breche die Bearbeitung ab, wenn Escape gedrückt wird
        event.preventDefault();
        cancelSubtaskEdit(subtaskId);
    }
}

/**
 * Behandelt das `onblur`-Event eines Subtask-Eingabefelds.
 * @param {Event} event - Das Blur-Event.
 */
function handleSubtaskBlur(event) {
    const subtaskId = event.target.id.replace("edit-input-", ""); // Extrahiere die Subtask-ID
    saveEditedSubtask(subtaskId); // Speichere den Subtask
}

/**
 * Fügt einen neuen Subtask hinzu, wenn die Eingabetaste gedrückt wird.
 * @param {Event} event - Das Event des Tastendrucks.
 */
function handleSubtaskKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addNewSubtask();
    }
}

/**
 * Entfernt einen Subtask aus den lokalen Daten und dem DOM.
 * @param {string} subtaskId - Die ID des zu entfernenden Subtasks.
 */
function deleteSubtaskFromLocal(subtaskId) {
    if (!subtaskId) return;
    if (window.localEditedSubtasks && window.localEditedSubtasks[subtaskId]) {
        delete window.localEditedSubtasks[subtaskId];
    }
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (subtaskElement) {
        subtaskElement.remove();
    }
}

/**
 * Rendert den Fortschritt der Subtasks als HTML.
 * @param {Object} subtasks - Die Subtasks des Tasks.
 * @returns {string} - HTML für den Subtask-Fortschritt.
 */
function renderSubtaskProgress(subtasks) {
    const subtaskArray = subtasks ? Object.values(subtasks) : [];
    if (subtaskArray.length === 0) return "";
    const totalCount = subtaskArray.length;
    const doneCount = subtaskArray.filter(st => st.done).length;
    const progressPercent = (doneCount / totalCount) * 100;
    return generateSubtasksProgressHTML(progressPercent, doneCount, totalCount);
}

/**
 * Sammelt Subtasks aus der DOM-Subtask-Liste und erstellt ein Objekt.
 * @returns {Object} - Ein Objekt mit Subtasks im Format { subtaskId: { title, done } }.
 */
function collectSubtasksFromDOM() {
    const subTasksList = document.getElementById("subTasksList");
    if (!subTasksList) {
        console.warn("Subtask-Liste nicht gefunden.");
        return {};
    }

    const subtasks = {};
    const subtaskItems = subTasksList.querySelectorAll(".subtask-item");

    subtaskItems.forEach(item => {
        const subtaskId = item.id.replace("subtask-", "");
        const titleInput = item.querySelector(".subtaskText, .editSubtaskInput");
        const doneCheckbox = item.querySelector(".subtask-checkbox");

        if (titleInput) {
            subtasks[subtaskId] = {
                title: titleInput.value || titleInput.textContent.trim(),
                done: doneCheckbox ? doneCheckbox.checked : false,
            };
        }
    });

    return subtasks;
}

/**
 * Generiert HTML für die Subtasks eines Tasks.
 * @param {Object} task - Der Task, der Subtasks enthält.
 * @param {string} taskId - Die ID des Tasks.
 * @param {string} listId - Die ID der Liste, zu der der Task gehört.
 * @returns {string} - HTML für die Subtasks.
 */
function generateSubtasksHTML(task, taskId, listId) {
    const subtasks = task.subtasks;
    if (!subtasks) {
        return '<p>No subtasks in task.</p>';
    }
    return Object.entries(subtasks).map(([subtaskId, subtask]) => {
        if (!subtask || typeof subtask !== "object" || !("title" in subtask) || !("done" in subtask)) {
            return `<p>${subtaskId}</p>`;
        }
        return generatePopupSingleSubtaskHTML(subtask, subtaskId, taskId, listId);
    }).join('');
}

/**
 * Generiert HTML für das Bearbeiten von Subtasks.
 * @param {Object} subtasks - Die Subtasks des Tasks.
 * @returns {string} - HTML für das Bearbeiten der Subtasks.
 */
function generateEditSubtasksHTML(subtasks = {}) {
    if (Object.keys(subtasks).length === 0) {
        return '<p>No subtask in Task.</p>';
    }
    return Object.entries(subtasks).map(([subtaskId, subtask]) =>
        generateEditSingleSubtaskHTML(subtaskId, subtask)
    ).join('');
}

/**
 * Ermöglicht die Bearbeitung eines Subtasks direkt im DOM.
 * @param {string} subtaskId - Die ID des Subtasks.
 */
function editSubtaskInLocal(subtaskId) {
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (!subtaskElement) return;

    const subtaskTextElement = subtaskElement.querySelector(".subtaskText");
    if (!subtaskTextElement) return;

    const currentTitle = subtaskTextElement.textContent.trim();
    const editHTML = `
        <input 
            type="text" 
            class="editSubtaskInput" 
            id="edit-input-${subtaskId}" 
            value="${currentTitle}"
            oninput="toggleSubtaskButtons()"
            onkeydown="handleSubtaskKey(event)">
            <div class="subtaskButtons">
            <img src="./../assets/icons/png/Subtasks icons11.png" id="saveSubtaskBtn" class="subtask-btn hidden" onclick="saveEditedSubtask('${subtaskId}')">
            <div id="separatorSubtask" class="separatorSubtask hidden"></div>
            <img src="./../assets/icons/png/iconoir_cancel.png" id="clearSubtaskBtn" class="subtask-btn hidden" onclick="clearSubtaskInput()">
                    </div>
    `;
    subtaskElement.innerHTML = editHTML;
}

/**
 * Speichert die Änderungen eines Subtasks im lokalen Zustand.
 * Falls der Subtask nicht existiert, wird ein neuer Eintrag erstellt.
 *
 * @param {string} subtaskId - Die eindeutige ID des Subtasks.
 */
function saveEditedSubtask(subtaskId) {
    if (!window.localSubtasks) {
        window.localSubtasks = {};
    }
    let subtask = window.localSubtasks[subtaskId];
    if (!subtask) {
        subtask = { title: "", done: false };
        window.localSubtasks[subtaskId] = subtask;
    }
    const inputElement = document.getElementById(`edit-input-${subtaskId}`);
    if (!inputElement) {
        return;
    }
    const newTitle = inputElement.value.trim();
    if (!newTitle) {
    }
    const oldTitle = subtask.title;
    subtask.title = newTitle || oldTitle; 
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (subtaskElement) {
        subtaskElement.innerHTML = `
            <p 
                id="subtask-p-${subtaskId}" 
                class="subtaskText" 
                onclick="editSubtask('${subtaskId}')">
                ${subtask.title}
            </p>
            <div class="subtaskButtons">
                <img 
                    src="./../assets/icons/png/editIcon.png" 
                    class="subtask-btn" 
                    onclick="editSubtask('${subtaskId}')">
                <div class="separatorSubtask"></div>
                <img 
                    src="./../assets/icons/png/D.png" 
                    class="subtask-btn" 
                    onclick="deleteSubtaskFromLocal('${subtaskId}')">
            </div>
        `;
    };
}

/**
 * Initialisiert den lokalen Zustand eines Tasks.
 * Lädt die Worker- und Subtask-Daten in lokale Variablen.
 *
 * @param {Object} task - Der Task, der initialisiert werden soll.
 * @param {Array} [task.workers] - Liste der zugeordneten Worker des Tasks.
 * @param {Object} [task.subtasks] - Liste der Subtasks des Tasks.
 */
function initializeLocalTaskState(task) {
    window.localEditedContacts = Array.isArray(task.workers)
        ? task.workers.map(worker => ({
            name: worker.name,
            id: worker.id || `worker_${Date.now()}`, // Keine Farbe mehr
        }))
        : [];

    window.localEditedSubtasks = task.subtasks && typeof task.subtasks === "object" 
        ? { ...task.subtasks } 
        : {};

}

/**
 * Fügt einen neuen Subtask hinzu und aktualisiert die Subtask-Liste im DOM.
 */
function addNewSubtask() {
    const subTaskInput = document.getElementById("newSubtaskInput") || document.getElementById("subTaskInputAddTask");
    const subTasksList = document.getElementById("subTasksList");
    const subtaskTitle = subTaskInput.value.trim();
    const subtaskId = `subtask_${Date.now()}`;
    const subtaskItem = { title: subtaskTitle, done: false };
    window.localSubtasks = window.localSubtasks || {};
    window.localSubtasks[subtaskId] = subtaskItem;
    const subtaskHTML = generateNewSubtaskHTML(subtaskId, subtaskTitle);
    subTasksList.insertAdjacentHTML("beforeend", subtaskHTML);
    subTaskInput.value = "";
    toggleSubtaskButtons();
}

/**
 * Entfernt einen Subtask aus der Liste und aus dem lokalen Zustand.
 * @param {string} subtaskId - Die ID des zu entfernenden Subtasks.
 */
function removeSubtaskFromList(subtaskId) {
    if (!subtaskId) {
        return;
    }
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (subtaskElement) {
        subtaskElement.remove(); // Entferne das Element aus dem DOM
    } else {
    }
    if (window.localSubtasks && window.localSubtasks[subtaskId]) {
        delete window.localSubtasks[subtaskId]; // Entferne den Subtask aus dem lokalen Zustand
    }
}

/**
 * Schaltet einen Subtask in den Bearbeitungsmodus.
 * Ersetzt das aktuelle Subtask-Element durch ein Eingabefeld.
 *
 * @param {string} subtaskId - Die eindeutige ID des zu bearbeitenden Subtasks.
 * @returns {void}
 */
async function editSubtask(subtaskId) {
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (!subtaskElement) return;
    const subtaskTextElement = subtaskElement.querySelector(".subtaskText");
    if (!subtaskTextElement) {
        console.error("Subtask-Text-Element nicht gefunden.");
        return;
    }
    const currentTitle = subtaskTextElement.textContent.trim();
    if (!currentTitle) {
        console.error("Subtask-Text ist leer.");
        return;
    }
    const editSubtaskHTML = generateEditSubtaskHTML(subtaskId, currentTitle);
    subtaskElement.innerHTML = editSubtaskHTML;
}

/**
 * Speichert die Änderungen eines Subtasks.
 * @param {string} subtaskId - Die ID des Subtasks.
 */
function saveSubtaskEdit(subtaskId) {
    const inputElement = document.getElementById(`edit-input-${subtaskId}`);
    if (!inputElement) {
        return;
    }
    const newTitle = inputElement.value;
       if (!newTitle || newTitle.trim() === "") {
        return;
    }
    const trimmedTitle = newTitle.trim();
    if (window.localSubtasks && window.localSubtasks[subtaskId]) {
        window.localSubtasks[subtaskId].title = trimmedTitle;
      
    } else {
        return;
    }
    const subtaskElement = document.getElementById(`subtask-${subtaskId}`);
    if (subtaskElement) {
        subtaskElement.innerHTML = `
            <p class="subtaskText">${trimmedTitle}</p>
            <div class="subtaskButtons">
                <img src="./../assets/icons/png/editIcon.png" class="subtask-btn" onclick="editSubtask('${subtaskId}')">
                <div class="separatorSubtask"></div>
                <img src="./../assets/icons/png/D.png" class="subtask-btn" onclick="deleteSubtaskFromLocal('${subtaskId}')">
            </div>
        `;
    };
}

/**
 * Schaltet die Sichtbarkeit der Subtask-Buttons basierend auf dem Eingabefeldstatus.
 * Zeigt die Speicher- und Löschen-Buttons, wenn das Eingabefeld nicht leer ist.
 * Versteckt die Buttons, wenn das Eingabefeld leer ist.
 *
 * @returns {void}
 */
function toggleSubtaskButtons() {
    const input = document.getElementById("subTaskInputAddTask");
    const saveBtn = document.getElementById("saveSubtaskBtn");
    const clearBtn = document.getElementById("clearSubtaskBtn");
    const separator = document.getElementById("separatorSubtask")
    const subtaskImg = document.getElementById("subtaskImg");
    if (input.value.trim() !== "") {
        saveBtn.classList.remove("hidden");
        clearBtn.classList.remove("hidden");
        subtaskImg.classList.add("hidden");
        separator.classList.remove("hidden")
    } else {
        saveBtn.classList.add("hidden");
        clearBtn.classList.add("hidden");
        subtaskImg.classList.remove("hidden");
        separator.classList.add("hidden");

    }
}

/**
 * Leert das Eingabefeld für Subtasks.
 *
 * @returns {void}
 */
function clearSubtaskInput() {
    const input = document.getElementById("subTaskInputAddTask");
    input.value = "";
}