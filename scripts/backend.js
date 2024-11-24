const BASE_URL = 'https://join-b023c-default-rtdb.europe-west1.firebasedatabase.app/';







async function saveData(users) {
    try {
        const response = await fetch(`${BASE_URL}/users.json`, {
            method: 'PUT', // Überschreibt den vorhandenen Knoten
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(users)
        });

        if (!response.ok) throw new Error('Fehler beim Speichern der Daten');
        console.log('Daten erfolgreich gespeichert!');
    } catch (error) {
        console.error('Fehler:', error.message);
    }
}

// Test-Aufruf
saveData(users);



async function loadData() {
    try {
        const response = await fetch(`${BASE_URL}/users.json`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Fehler beim Laden der Daten');
        const data = await response.json();

        console.log('Geladene Daten:', data);
        return data;
    } catch (error) {
        console.error('Fehler:', error.message);
    }
}

// Test-Aufruf
loadData();



async function initApp() {
    const usersData = await loadData();
    if (usersData) {
        users = Object.values(usersData); // Konvertiert Firebase-Objekte in Array
        currentUser = users.find(user => user.id === '1'); // Beispiel: Benutzer mit ID '1'
        console.log('Anwendung erfolgreich initialisiert.');
    } else {
        console.error('Keine Daten verfügbar!');
    }
}

initApp();
