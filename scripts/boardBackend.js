const BASE_URL = 'https://join-a403d-default-rtdb.europe-west1.firebasedatabase.app/';

let tasksArray = [];

async function initBoard() {
    loadTasks();
}

async function loadTasks(path = 'data/user/user/tasks') {
    tasksArray = [];
    let response = await fetch(BASE_URL + path + '.json');
    let data = await response.json();
    if (data) {
        tasksArray = Object.values(data).map(entry => entry); // Tasks ins Array laden
        console.log('Tasks erfolgreich geladen:', tasksArray);
    } else {
        console.warn('Keine Tasks gefunden.');
    }
}

