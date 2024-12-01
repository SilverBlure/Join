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
        return userData;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

async function init() {
    try {
        const userData = await getUserData();
        if (userData && userData.user) {
            currentUser = userData.user;

            const tasksObject = userData.user.tasks;
            const tasksArray = convertTasksToArray(tasksObject);

            console.log("Tasks als Array:", tasksArray);

            renderDashboard(tasksArray); // Dashboard rendern
            getNextDueDate(tasksArray); // Fälligkeitsdatum berechnen
        } else {
            console.error("Benutzerdaten oder Tasks sind nicht verfügbar:", userData);
        }
    } catch (error) {
        console.error("Fehler beim Initialisieren:", error);
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






function renderDashboard(tasks) {
    if (!Array.isArray(tasks)) {
        console.error("Tasks ist kein gültiges Array:", tasks);
        return;
    }

    // Die restlichen Rendering-Funktionen
    renderToDoTasks(tasks);
    renderDoneTasks(tasks);
    renderUrgentTasks(tasks);
    renderAllTasks(tasks);
    renderInProgressTasks(tasks);
    renderAwaitingFeedbackTasks(tasks);
}



function renderToDoTasks(tasks) {
    const toDoTasks = tasks.find(list => list.id === 'todo').tasks.length;
    document.getElementById('toDoTasks').textContent = toDoTasks;
}

function renderDoneTasks(tasks) {
    const doneTasks = tasks.find(list => list.id === 'done').tasks.length;
    document.getElementById('doneTasks').textContent = doneTasks;
}

function renderUrgentTasks(tasks) {
    const urgentTasks = tasks.reduce((count, list) =>
        count + list.tasks.filter(task => task.priority === 'Urgent').length, 0);
    document.getElementById('urgentTasks').textContent = urgentTasks;
}

function renderAllTasks(tasks) {
    const allTasks = tasks.reduce((count, list) => count + list.tasks.length, 0);
    document.getElementById('allTasks').textContent = allTasks;
}

function renderInProgressTasks(tasks) {
    const inProgressTasks = tasks.find(list => list.id === 'inProgress').tasks.length;
    document.getElementById('inProgressTasks').textContent = inProgressTasks;
}

function renderAwaitingFeedbackTasks(tasks) {
    const awaitingFeedbackTasks = tasks.find(list => list.id === 'awaitFeedback').tasks.length;
    document.getElementById('awaitFeddbackTasks').textContent = awaitingFeedbackTasks;
}


function getNextDueDate(tasks) {
    if (!Array.isArray(tasks)) {
        console.error("Ungültige Tasks-Daten in getNextDueDate:", tasks);
        document.getElementById("nextDueDate").innerHTML = "Keine Aufgaben verfügbar";
        return;
    }

    const today = new Date();
    let closestDate = null;

    tasks.forEach((list) => {
        list.tasks.forEach((task) => {
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

async function init(){
    getUserData();
}

async function getUserData(){
    let sessionKey = localStorage.getItem('sessionKey')
    let response = await fetch(BASE_URL + 'data/user/' + sessionKey + '.json');
    let responseAsJson = await response.json();
    console.log(responseAsJson);
}