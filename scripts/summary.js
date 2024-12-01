let tasks = [];


async function initSummary() {
    try {
        const tasksArray = await fetchAndPrepareTasks();
        if (!tasksArray || !Array.isArray(tasksArray)) {
            console.warn("Keine gültigen Tasks für das Dashboard verfügbar.");
            setDefaultDashboardValues(); // Aufruf bei fehlenden Daten
            return;
        }

        renderDashboard(tasksArray);
        getNextDueDate(tasksArray);
    } catch (error) {
        console.error("Fehler beim Initialisieren der Summary-Seite:", error);
        setDefaultDashboardValues(); // Aufruf bei einem Fehler
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
    if (!dateString || typeof dateString !== "string") return null;

    // Überprüfe, ob das Datum korrekt erkannt wird
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) {
        console.warn("Ungültiges Datum gefunden:", dateString);
        return null;
    }

    return parsedDate;
}


function setDefaultDashboardValues() {
    document.getElementById("toDoTasks").textContent = "0";
    document.getElementById("doneTasks").textContent = "0";
    document.getElementById("inProgressTasks").textContent = "0";
    document.getElementById("awaitFeddbackTasks").textContent = "0";
    document.getElementById("urgentTasks").textContent = "0";
    document.getElementById("allTasks").textContent = "0";
    document.getElementById("nextDueDate").innerHTML = "Keine Aufgaben verfügbar";
    document.getElementById("noTaskInBoard").style.display = "none";
}


function renderDashboard(tasksArray) {
    if (!Array.isArray(tasksArray)) {
        console.error("TasksArray ist kein gültiges Array:", tasksArray);
        setDefaultDashboardValues();
        return;
    }

    // Prüfen, ob mindestens eine Liste Tasks enthält
    const hasTasks = tasksArray.some((list) => list.tasks && list.tasks.length > 0);
    if (!hasTasks) {
        console.warn("Keine Tasks in den Listen gefunden. Dashboard wird zurückgesetzt.");
        setDefaultDashboardValues();
        return;
    }

    // Die restlichen Rendering-Funktionen aufrufen
    renderToDoTasks(tasksArray);
    renderDoneTasks(tasksArray);
    renderUrgentTasks(tasksArray);
    renderAllTasks(tasksArray);
    renderInProgressTasks(tasksArray);
    renderAwaitingFeedbackTasks(tasksArray);
}




function renderToDoTasks(tasksArray) {
    const toDoList = tasksArray.find((list) => list.id === "todo");
    const taskCount = toDoList?.tasks ? toDoList.tasks.length : 0;
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
    if (!Array.isArray(tasksArray) || tasksArray.length === 0) {
        console.warn("Keine Tasks verfügbar. Standardwert wird angezeigt.");
        document.getElementById("nextDueDate").innerHTML = "Keine Aufgaben verfügbar";
        return;
    }

    const today = new Date();
    let closestDate = null;

    // Iteriere durch alle Listen und deren Tasks
    tasksArray.forEach((list) => {
        list.tasks.forEach((task) => {
            const taskDate = parseDateString(task.dueDate); // Konvertiere dueDate in ein gültiges Date-Objekt
            if (taskDate && taskDate > today && (!closestDate || taskDate < closestDate)) {
                closestDate = taskDate; // Setze das nächste Datum
            }
        });
    });

    // Ergebnis formatieren und anzeigen
    if (closestDate) {
        const formattedDate = closestDate.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        document.getElementById("nextDueDate").innerHTML = formattedDate;
    } else {
        document.getElementById("nextDueDate").innerHTML = "Keine Aufgaben verfügbar";
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
