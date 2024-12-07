let tasks = {};



async function main() {
    loadSessionId();
    const isInitialized = await initializeTaskLists();
    if (!isInitialized) {
        return;
    }
    await getTasks();
    getContacts();
    renderBoard();
}



function loadSessionId() {
    ID = localStorage.getItem('sessionKey');
    if (!ID) console.error("Session ID not found. The user might not be logged in.");
}



async function getTasks() {
    try {
        const url = `${BASE_URL}data/user/${ID}/user/tasks.json`;
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching tasks: ${response.status} - ${response.statusText}`);
            return;
        }

        const data = await response.json();
        console.log("Rohdaten von Firebase:", data);

        tasks = Object.entries(data || {}).reduce((acc, [listKey, listValue]) => {
            acc[listKey] = {
                id: listKey,
                name: listValue.name || listKey,
                task: Object.entries(listValue.task || {}).reduce((taskAcc, [taskId, taskValue]) => {
                    taskAcc[taskId] = {
                        ...taskValue,
                        subtasks: taskValue.subtasks || {}, // Standardisiere Subtasks
                    };
                    return taskAcc;
                }, {}),
            };
            return acc;
        }, {});

        console.log("Verarbeitete Tasks:", tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}





function getInitials(fullName) {
    const nameParts = fullName.trim().split(" ");
    return `${nameParts[0]?.charAt(0).toUpperCase() || ""}${nameParts[1]?.charAt(0).toUpperCase() || ""}`;
}



function getColorHex(vorname, nachname) {
    const completeName = (vorname + nachname).toLowerCase();
    let hash = 0;
    for (let i = 0; i < completeName.length; i++) {
        hash += completeName.charCodeAt(i);
    }
    const r = (hash * 123) % 256;
    const g = (hash * 456) % 256;
    const b = (hash * 789) % 256;
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}



async function initializeTaskLists() {
    try {
        const url = `${BASE_URL}data/user/${ID}/user/tasks.json`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (data) return true; 
        }
        const defaultLists = {
            todo: { name: "To Do", task: {} },
            inProgress: { name: "In Progress", task: {} },
            awaitFeedback: { name: "Await Feedback", task: {} },
            done: { name: "Done", task: {} },
        };
        const initResponse = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(defaultLists),
        });
        return initResponse.ok;
    } catch (error) {
        return false;
    }
}

