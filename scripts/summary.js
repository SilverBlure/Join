let tasks = [];


async function initSummary() {
    try {
        const tasksArray = await fetchAndPrepareTasks();
        if (tasksArray) {
            renderDashboard(tasksArray);
            getNextDueDate(tasksArray);
        } else {
            console.error("Tasks konnten nicht geladen werden.");
        }
    } catch (error) {
        console.error("Fehler beim Initialisieren:", error);
    }
}




async function fetchAndPrepareTasks() {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        if (!sessionKey) {
            console.error("Session Key fehlt.");
            return null;
        }

        const response = await fetch(`${BASE_URL}data/user/${sessionKey}/user/tasks.json`);
        if (!response.ok) {
            throw new Error(`Fehler beim Abrufen der Aufgaben: ${response.status}`);
        }

        const tasksData = await response.json();
        console.log("Rohdaten der Tasks aus Firebase:", tasksData);

        // Tasks in ein Array konvertieren
        const tasksArray = Object.entries(tasksData).map(([listId, listData]) => ({
            id: listId,
            name: listData.name || listId,
            tasks: listData.task ? Object.entries(listData.task).map(([taskId, taskData]) => ({
                id: taskId,
                ...taskData,
            })) : [],
        }));

        console.log("Konvertierte Tasks in Array:", tasksArray);
        return tasksArray;
    } catch (error) {
        console.error("Fehler beim Laden und Konvertieren der Tasks:", error);
        return null;
    }
}



function parseDateString(dateString) {
    if (!dateString) return null;

    // Überprüfen, ob das Datum korrekt erkannt wird
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) {
        console.warn("Ungültiges Datum gefunden:", dateString);
        return null;
    }

    return parsedDate;
}




async function renderDashboard(tasksArray) {
    if (!Array.isArray(tasksArray)) {
        console.error("Tasks ist kein gültiges Array:", tasksArray);
        return;
    }

    // Die Rendering-Funktionen aufrufen
    renderToDoTasks(tasksArray);
    renderDoneTasks(tasksArray);
    renderInProgressTasks(tasksArray);
    renderAwaitingFeedbackTasks(tasksArray);
    renderUrgentTasks(tasksArray);
    renderAllTasks(tasksArray);
}

function renderToDoTasks(tasksArray) {
    const todoList = tasksArray.find(list => list.id === "todo");
    const taskCount = todoList ? todoList.tasks.length : 0;
    document.getElementById("toDoTasks").textContent = taskCount;
}

function renderDoneTasks(tasksArray) {
    const doneList = tasksArray.find(list => list.id === "done");
    const taskCount = doneList ? doneList.tasks.length : 0;
    document.getElementById("doneTasks").textContent = taskCount;
}

function renderInProgressTasks(tasksArray) {
    const inProgressList = tasksArray.find(list => list.id === "inProgress");
    const taskCount = inProgressList ? inProgressList.tasks.length : 0;
    document.getElementById("inProgressTasks").textContent = taskCount;
}

function renderAwaitingFeedbackTasks(tasksArray) {
    const awaitFeedbackList = tasksArray.find(list => list.id === "awaitFeedback");
    const taskCount = awaitFeedbackList ? awaitFeedbackList.tasks.length : 0;
    document.getElementById("awaitFeddbackTasks").textContent = taskCount;
}

function renderUrgentTasks(tasksArray) {
    const urgentCount = tasksArray.reduce((total, list) => {
        return (
            total +
            list.tasks.filter(task => task.priority === "Urgent").length
        );
    }, 0);

    document.getElementById("urgentTasks").textContent = urgentCount;
}

function renderAllTasks(tasksArray) {
    const totalCount = tasksArray.reduce((total, list) => {
        return total + list.tasks.length;
    }, 0);

    document.getElementById("allTasks").textContent = totalCount;
}

function getNextDueDate(tasksArray) {
    if (!Array.isArray(tasksArray)) {
        console.error("Ungültige Tasks-Daten in getNextDueDate:", tasksArray);
        document.getElementById("nextDueDate").innerHTML = "Keine Aufgaben verfügbar";
        return;
    }

    const today = new Date();
    let closestDate = null;

    tasksArray.forEach(list => {
        list.tasks.forEach(task => {
            const taskDate = parseDateString(task.dueDate);
            if (taskDate && taskDate > today && (!closestDate || taskDate < closestDate)) {
                closestDate = taskDate;
            }
        });
    });

    if (closestDate) {
        const formattedDate = closestDate.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        document.getElementById("nextDueDate").innerHTML = formattedDate;
    } else {
        document.getElementById("nextDueDate").innerHTML = "Kein zukünftiges Datum gefunden";
    }
}




function convertTasksToArray(tasksObject) {
    if (!tasksObject || typeof tasksObject !== "object") {
        console.error("Ungültige Tasks-Daten:", tasksObject);
        return [];
    }

    return Object.entries(tasksObject).map(([listId, listData]) => ({
        id: listId,
        name: listData.name || listId,
        tasks: listData.task
            ? Object.entries(listData.task).map(([taskId, taskData]) => ({
                  id: taskId,
                  ...taskData,
              }))
            : [],
    }));
}


function setUserName(userName) {
    const userElement = document.getElementById('user');

    if (userName) {
        userElement.textContent = userName; // Name des Benutzers anzeigen
    } else {
        userElement.textContent = ""; // Keine Anzeige, wenn kein Name gefunden wird
    }
}



function setGreeting() {
    const currentHour = new Date().getHours();
    const greetingElement = document.getElementById('greeting');
    if (currentHour < 12) {
        greetingElement.textContent = "Good Morning,";
    } else if (currentHour < 18) {
        greetingElement.textContent = "Good Afternoon,";
    } else {
        greetingElement.textContent = "Good Evening,";
    }
}




//----------------------------------------------------------------------------------------

async function init() {
    getUserData();
}


async function getUserData() {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        if (!sessionKey) {
            console.error("Session Key fehlt.");
            return null;
        }

        const response = await fetch(`${BASE_URL}data/user/${sessionKey}.json`);
        if (!response.ok) {
            throw new Error(`Fehler beim Abrufen der Benutzerdaten: ${response.status}`);
        }

        const userData = await response.json();
        console.log("Benutzerdaten erfolgreich geladen:", userData);

        // Benutzername anzeigen
        setUserName(userData?.user?.userData?.name);

        return userData;
    } catch (error) {
        console.error(error.message);

        // Setze leeren Benutzernamen, wenn ein Fehler auftritt
        setUserName(null);

        return null;
    }
}
