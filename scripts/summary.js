let tasks = [];

/**
 * Initialisiert das Dashboard, lädt die Tasks und zeigt die Begrüßung sowie das nächste Fälligkeitsdatum an.
 * Setzt Standardwerte bei Fehlern.
 */
async function initSummary() {
    try {
        const tasksArray = await fetchAndPrepareTasks();
        renderDashboard(tasksArray);
        setGreeting()
        getNextDueDate(tasksArray);
    } catch (error) {
        setDefaultDashboardValues();
    }
}

/**
 * Holt den Session Key aus dem lokalen Speicher.
 * @returns {string|null} Der Session Key oder null, wenn nicht vorhanden.
 */
function getSessionKey() {
    const sessionKey = localStorage.getItem('sessionKey');
    return sessionKey || null;
}

/**
 * Ruft Daten von der angegebenen URL ab.
 * @param {string} url - Die URL zum Abrufen der Daten.
 * @returns {Object} Die abgerufenen Daten.
 * @throws Fehler, wenn die Anfrage fehlschlägt.
 */
async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fehler beim Abrufen der Daten: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

/**
 * Konvertiert Tasks aus einem Objektformat in ein Array-Format.
 * @param {Object} tasksData - Die Daten der Tasks.
 * @returns {Array} Ein Array von Task-Listen.
 */
function convertTasksToArray(tasksData) {
    if (!tasksData || typeof tasksData !== "object") {
        return [];
    }
    return Object.entries(tasksData).map(([listId, listData]) => ({
        id: listId,
        name: listData?.name || listId,
        tasks: listData?.task
            ? Object.entries(listData.task).map(([taskId, taskData]) => ({
                id: taskId,
                ...taskData,
            }))
            : [],
    }));
}

/**
 * Lädt und bereitet die Tasks vor, indem die Daten abgerufen und konvertiert werden.
 * @returns {Array|null} Ein Array von Tasks oder null bei Fehlern.
 */
async function fetchAndPrepareTasks() {
    try {
        const sessionKey = getSessionKey();
        if (!sessionKey) {
            return null;
        }
        const url = `${BASE_URL}data/user/${sessionKey}/user/tasks.json`;
        const tasksData = await fetchData(url);
        const tasksArray = convertTasksToArray(tasksData);
        return tasksArray;
    } catch (error) {
        return null;
    }
}

/**
 * Konvertiert einen Datum-String in ein Date-Objekt.
 * @param {string} dateString - Der Datum-String.
 * @returns {Date|null} Das Date-Objekt oder null, wenn ungültig.
 */
function parseDateString(dateString) {
    if (!dateString) return null;
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

/**
 * Setzt Standardwerte für das Dashboard, wenn keine Tasks verfügbar sind.
 */
function setDefaultDashboardValues() {
    const elements = {
        toDo: document.getElementById("toDoTasks"),
        done: document.getElementById("doneTasks"),
        inProgress: document.getElementById("inProgressTasks"),
        awaitFeedback: document.getElementById("awaitFeedbackTasks"),
        urgent: document.getElementById("urgentTasks"),
        all: document.getElementById("allTasks"),
        nextDueDate: document.getElementById("nextDueDate"),
    };
    Object.entries(elements).forEach(([key, element]) => {
        if (element) {
            element.textContent = key === "nextDueDate" ? "No Tasks in Board" : "0";
        }
    });
    const noTaskInBoardElement = document.getElementById("noTaskInBoard");
    if (noTaskInBoardElement) {
        noTaskInBoardElement.style.display = "none";
    }
}

/**
 * Rendert die Daten des Dashboards basierend auf den Tasks.
 * @param {Array} tasksArray - Das Array der Tasks.
 */
function renderDashboard(tasksArray) {
    if (!tasksArray) {
        setDefaultDashboardValues();
        return;
    }
    const hasTasks = tasksArray.some(list => list.tasks && list.tasks.length > 0);
    if (!hasTasks) {
        setDefaultDashboardValues();
        return;
    }
    renderToDoTasks(tasksArray);
    renderDoneTasks(tasksArray);
    renderUrgentTasks(tasksArray);
    renderAllTasks(tasksArray);
    renderInProgressTasks(tasksArray);
    renderAwaitingFeedbackTasks(tasksArray);
}

/**
 * Rendert die Anzahl der "To Do"-Tasks im Dashboard.
 * @param {Array} tasksArray - Das Array der Tasks.
 */
function renderToDoTasks(tasksArray) {
    const toDoList = tasksArray.find(list => list.id === "todo");
    const taskCount = toDoList?.tasks ? toDoList.tasks.length : 0;
    const toDoTasksElement = document.getElementById("toDoTasks");
    toDoTasksElement.textContent = taskCount;

}

/**
 * Rendert die Anzahl der erledigten Tasks im Dashboard.
 * @param {Array} tasksArray - Das Array der Tasks.
 */
function renderDoneTasks(tasksArray) {
    const doneList = tasksArray.find(list => list.id === "done");
    const taskCount = doneList ? doneList.tasks.length : 0;
    document.getElementById("doneTasks").textContent = taskCount;
}

/**
 * Rendert die Anzahl der Tasks im Status "In Progress" im Dashboard.
 * @param {Array} tasksArray - Das Array der Tasks.
 */
function renderInProgressTasks(tasksArray) {
    const inProgressList = tasksArray.find(list => list.id === "inProgress");
    const taskCount = inProgressList ? inProgressList.tasks.length : 0;
    document.getElementById("inProgressTasks").textContent = taskCount;
}

/**
 * Rendert die Anzahl der Tasks im Status "Awaiting Feedback" im Dashboard.
 * @param {Array} tasksArray - Das Array der Tasks.
 */
function renderAwaitingFeedbackTasks(tasksArray) {
    const awaitFeedbackList = tasksArray.find(list => list.id === "awaitFeedback");
    const taskCount = awaitFeedbackList ? awaitFeedbackList.tasks.length : 0;
    document.getElementById("awaitFeedbackTasks").textContent = taskCount;
}

/**
 * Berechnet und zeigt die Anzahl der dringenden Tasks im Dashboard an.
 * @param {Array} tasksArray - Das Array der Tasks.
 */
function renderUrgentTasks(tasksArray) {
    const urgentCount = tasksArray.reduce((total, list) => {
        return (
            total +
            list.tasks.filter(task => task.priority === "Urgent").length
        );
    }, 0);
    document.getElementById("urgentTasks").textContent = urgentCount;
}

/**
 * Berechnet und zeigt die Gesamtanzahl der Tasks im Dashboard an.
 * @param {Array} tasksArray - Das Array der Tasks.
 */
function renderAllTasks(tasksArray) {
    const totalCount = tasksArray.reduce((total, list) => {
        return total + list.tasks.length;
    }, 0);
    document.getElementById("allTasks").textContent = totalCount;
}

/**
 * Findet und zeigt das nächste Fälligkeitsdatum im Dashboard an.
 * @param {Array} tasksArray - Das Array der Tasks.
 */
function getNextDueDate(tasksArray) {
    if (!isValidTasksArray(tasksArray)) {
        setNoDueDateMessage();
        return;
    }
    const closestDate = findClosestDueDate(tasksArray, new Date());
    updateDueDateUI(closestDate);
}

/**
 * Überprüft, ob das Tasks-Array gültig ist.
 * @param {Array} tasksArray - Das Array der Tasks.
 * @returns {boolean} True, wenn gültig; sonst false.
 */
function isValidTasksArray(tasksArray) {
    return tasksArray.length > 0;
}

/**
 * Überprüft, ob ein Task-Datum gültig und naher als das aktuelle nächste Fälligkeitsdatum ist.
 * @param {Date} taskDate - Das Datum des Tasks.
 * @param {Date} today - Das heutige Datum.
 * @param {Date} closestDate - Das aktuell nächste Fälligkeitsdatum.
 * @returns {boolean} True, wenn gültig; sonst false.
 */
function isValidTaskDate(taskDate, today, closestDate) {
    return taskDate && taskDate > today && (!closestDate || taskDate < closestDate);
}

/**
 * Findet das nächste Fälligkeitsdatum im Tasks-Array.
 * @param {Array} tasksArray - Das Array der Tasks.
 * @param {Date} today - Das heutige Datum.
 * @returns {Date|null} Das nächste Fälligkeitsdatum oder null, wenn nicht vorhanden.
 */
function findClosestDueDate(tasksArray, today) {
    let closestDate = null;
    tasksArray.forEach(list => {
        list.tasks.forEach(task => {
            const taskDate = parseDateString(task.dueDate);
            if (isValidTaskDate(taskDate, today, closestDate)) {
                closestDate = taskDate;
            }
        });
    });
    return closestDate;
}

/**
 * Aktualisiert die Benutzeroberfläche mit dem nächsten Fälligkeitsdatum.
 * @param {Date|null} closestDate - Das nächste Fälligkeitsdatum.
 */
function updateDueDateUI(closestDate) {
    const nextDueDateElement = document.getElementById("nextDueDate");
    const noTaskInBoardElement = document.getElementById("noTaskInBoard");
    if (!nextDueDateElement) {
        return;
    }
    if (closestDate) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = closestDate.toLocaleDateString('de-DE', options);
        nextDueDateElement.textContent = formattedDate;
        if (noTaskInBoardElement) {
            noTaskInBoardElement.style.display = "block";
        }
    }
}

/**
 * Zeigt eine Nachricht an, dass keine Fälligkeitsdaten vorhanden sind.
 */
function setNoDueDateMessage() {
    const nextDueDateElement = document.getElementById("nextDueDate");
    if (nextDueDateElement) {
        nextDueDateElement.innerHTML = "No Tasks in Board";
    }
}

/**
 * Setzt den Namen des Benutzers in der Benutzeroberfläche.
 * @param {string} userName - Der Benutzername.
 */
function setUserName(userName) {
    const userElement = document.getElementById("user");
    if (userElement) {
        userElement.textContent = userName || "";
    }
}

/**
 * Setzt eine Begrüßung basierend auf der aktuellen Tageszeit.
 */
function setGreeting() {
    const currentHour = new Date().getHours();

    const greetingElement = document.getElementById('greeting');
    if (currentHour < 12) {
        return greetingElement.textContent = "Good Morning,";
    } else if (currentHour < 18) {
        return greetingElement.textContent = "Good Afternoon,";
    } else {
        return greetingElement.textContent = "Good Evening,";
    }
}

/**
 * Initialisiert die Anwendung und lädt Benutzerdaten.
 */
async function init() {
    getUserData();
}

/**
 * Lädt die Benutzerdaten basierend auf dem Session Key und zeigt den Benutzernamen an.
 * @returns {Object|null} Die Benutzerdaten oder null bei Fehlern.
 */
async function getUserData() {
    try {
        const sessionKey = localStorage.getItem("sessionKey");
        if (!sessionKey) return null;
        const response = await fetch(`${BASE_URL}data/user/${sessionKey}.json`);
        if (!response.ok) return null;
        const userData = await response.json();
        setUserName(userData?.user?.userData?.name || null);
        return userData;
    } catch {
        setUserName(null);
        return null;
    }
}

function goToBoard() {
        window.location.href = "./../html/board.html"; 
}