let tasks = {}; 


async function main() {
    loadSessionId();
    const isInitialized = await initializeTaskLists();
    if (!isInitialized) {
        console.error("Fehler beim Initialisieren der Listenstruktur. Anwendung kann nicht fortgesetzt werden.");
        return;
    }
    await getTasks(); 
    getContacts();
    renderBoard();   
}



function loadSessionId() {
    ID = localStorage.getItem('sessionKey');
    if (!ID) {
        console.error("Session-ID nicht gefunden. Der Benutzer ist möglicherweise nicht angemeldet.");
    }
}



async function getTasks() {
    try {
        const url = `${BASE_URL}data/user/${ID}/user/tasks.json`;
        console.log("Lade Aufgaben von:", url);
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Fehler beim Abrufen der Aufgaben: ${response.status} - ${response.statusText}`);
            return;
        }
        const data = await response.json();
        if (!data) {
            console.warn("Keine Aufgaben gefunden.");
            tasks = {};
            return;
        }

        tasks = Object.entries(data).reduce((acc, [listKey, listValue]) => {
            acc[listKey] = {
                id: listKey,
                name: listValue.name || listKey,
                task: listValue.task
                    ? Object.entries(listValue.task).reduce((taskAcc, [taskId, taskValue]) => {
                          taskAcc[taskId] = {
                              ...taskValue,
                              workers: (taskValue.workers || []).map(workerName => ({
                                  name: workerName,
                                  initials: getInitials(workerName), // Initialen berechnen
                                  color: getColorHex(workerName, ""), // Farbe generieren
                              })),
                          };
                          return taskAcc;
                      }, {})
                    : {},
            };
            return acc;
        }, {});

        console.log("Aufgaben erfolgreich geladen:", tasks);
    } catch (error) {
        console.error("Fehler beim Abrufen der Aufgaben:", error);
    }
}




function getInitials(fullName) {
    const nameParts = fullName.trim().split(" ");
    const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || "";
    const lastInitial = nameParts[1]?.charAt(0).toUpperCase() || "";
    return `${firstInitial}${lastInitial}`;
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
            if (data) {
                console.log("Bestehende Listenstruktur gefunden:", data);
                return true; 
            }
        }
        const defaultLists = {
            todo: { name: "To Do", task: {} },
            inProgress: { name: "In Progress", task: {} },
            awaitFeedback: { name: "Await Feedback", task: {} },
            done: { name: "Done", task: {} },
        };
        const initResponse = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(defaultLists),
        });
        if (initResponse.ok) {
            console.log("Listenstruktur erfolgreich initialisiert.");
            return true;
        } else {
            const errorText = await initResponse.text();
            console.error("Fehler beim Initialisieren der Listen:", initResponse.status, errorText);
            return false;
        }
    } catch (error) {
        console.error("Ein Fehler ist beim Initialisieren aufgetreten:", error);
        return false;
    }
}
