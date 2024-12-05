let tasks = [];



async function initSummary() {
    try {
        const tasksArray = await fetchAndPrepareTasks();
        if (!tasksArray || !Array.isArray(tasksArray)) {
            setDefaultDashboardValues();
            return;
        }
        renderDashboard(tasksArray);
        getNextDueDate(tasksArray)
    } catch (error) {
        setDefaultDashboardValues();
    }
}



async function fetchAndPrepareTasks() {
    try {
        const sessionKey = localStorage.getItem('sessionKey');
        if (!sessionKey) {
            return null;
        }
        const url = `${BASE_URL}data/user/${sessionKey}/user/tasks.json`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Fehler beim Abrufen der Aufgaben: ${response.status}`);
        }
        const tasksData = await response.json();
        const tasksArray = Object.entries(tasksData).map(([listId, listData]) => ({
            id: listId,
            name: listData.name || listId,
            tasks: listData.task 
                ? Object.entries(listData.task).map(([taskId, taskData]) => ({
                    id: taskId,
                    ...taskData,
                }))
                : [],
        }));
        return tasksArray;
    } catch (error) {
        console.error("Fehler beim Laden und Konvertieren der Tasks:", error);
        return null;
    }
}




function parseDateString(dateString) {
    if (!dateString) return null;
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
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
        setDefaultDashboardValues();
        return;
    }
    const hasTasks = tasksArray.some((list) => list.tasks && list.tasks.length > 0);
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
        setNoDueDateMessage();
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
    const nextDueDateElement = document.getElementById("nextDueDate");
    if (nextDueDateElement) {
        if (closestDate) {
            const formattedDate = closestDate.toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
            nextDueDateElement.innerHTML = formattedDate;
        } else {
            setNoDueDateMessage();
        }
    }
}



function setNoDueDateMessage() {
    const nextDueDateElement = document.getElementById("nextDueDate");
    if (nextDueDateElement) {
        nextDueDateElement.innerHTML = "Keine Aufgaben verfügbar";
    }
}




function convertTasksToArray(tasksObject) {
    if (!tasksObject || typeof tasksObject !== "object") return [];
    return Object.entries(tasksObject).map(([listId, listData]) => ({
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




function setUserName(userName) {
    const userElement = document.getElementById("user");
    if (userElement) {
        userElement.textContent = userName || ""; 
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

