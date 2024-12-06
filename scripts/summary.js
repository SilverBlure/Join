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



function getSessionKey() {
    const sessionKey = localStorage.getItem('sessionKey');
    return sessionKey || null;
}



async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fehler beim Abrufen der Daten: ${response.status}`);
    }
    return await response.json();
}



function convertTasksToArray(tasksData) {
    return Object.entries(tasksData).map(([listId, listData]) => ({
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



async function fetchAndPrepareTasks() {
    try {
        const sessionKey = getSessionKey();
        if (!sessionKey) return null;
        const url = `${BASE_URL}data/user/${sessionKey}/user/tasks.json`;
        const tasksData = await fetchData(url);
        return convertTasksToArray(tasksData);
    } catch (error) {
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
    document.getElementById("nextDueDate").innerHTML = "No Tasks in Board";
    document.getElementById("noTaskInBoard").style.display = "none";
}



function renderDashboard(tasksArray) {
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
    if (!isValidTasksArray(tasksArray)) {
        setNoDueDateMessage();
        return;
    }
    const closestDate = findClosestDueDate(tasksArray, new Date());
    updateDueDateUI(closestDate);
}
 


function isValidTasksArray(tasksArray) {
    return tasksArray.length > 0;
}



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



function setNoDueDateMessage() {
    const nextDueDateElement = document.getElementById("nextDueDate");
    if (nextDueDateElement) {
        nextDueDateElement.innerHTML = "No Tasks in Board";
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
