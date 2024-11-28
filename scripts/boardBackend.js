const BASE_URL = 'https://join-a403d-default-rtdb.europe-west1.firebasedatabase.app/';
let tasks = {}; // Globale Variable für die Aufgaben
let ID = null;  // Globale Variable für die Session-ID

async function main() {
    loadSessionId();
    const isInitialized = await initializeTaskLists();
    if (!isInitialized) {
        console.error("Fehler beim Initialisieren der Listenstruktur. Anwendung kann nicht fortgesetzt werden.");
        return;
    }

    await getTasks(); // Aufgaben laden
    renderBoard();    // Aufgaben im Board anzeigen
}

// **Laden der Session-ID**
function loadSessionId() {
    ID = localStorage.getItem('sessionKey');
    if (!ID) {
        console.error("Session-ID nicht gefunden. Der Benutzer ist möglicherweise nicht angemeldet.");
    }
}

// **Abrufen und Verarbeiten der Aufgaben aus Firebase**
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
            tasks = {}; // Setze Aufgaben auf leeres Objekt
            return;
        }

        // Aufgabenstruktur aus Firebase direkt in ein konsistentes Format bringen
        tasks = Object.entries(data).reduce((acc, [listKey, listValue]) => {
            acc[listKey] = {
                id: listKey,
                name: listValue.name || listKey, // Setze den Namen oder den Schlüssel
                task: listValue.task || {}       // Behalte die Tasks als Objekte mit IDs bei
            };
            return acc;
        }, {});

        console.log("Aufgaben erfolgreich geladen:", tasks);
    } catch (error) {
        console.error("Fehler beim Abrufen der Aufgaben:", error);
    }
}

// **Initialisierung der Standard-Listenstruktur in Firebase**
async function initializeTaskLists() {
    try {
        const url = `${BASE_URL}data/user/${ID}/user/tasks.json`;

        // Prüfen, ob die Listenstruktur bereits existiert
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (data) {
                console.log("Bestehende Listenstruktur gefunden:", data);
                return true; // Listenstruktur vorhanden, keine Initialisierung notwendig
            }
        }

        // Standard-Listen definieren
        const defaultLists = {
            todo: { name: "To Do", task: {} },
            inProgress: { name: "In Progress", task: {} },
            awaitFeedback: { name: "Await Feedback", task: {} },
            done: { name: "Done", task: {} },
        };

        // Standard-Listenstruktur hochladen
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
