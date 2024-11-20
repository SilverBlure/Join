// Benutzer-Array
let users = [
    {
        id: '1',
        name: 'Stanislav',
        email: 'stanislav1994@live.de',
        password: '111',
        tasks: [
            {
                id: 'todo',
                name: 'To Do',
                task: [
                    {
                        id: 1,
                        title: 'Gießen',
                        description: '300ml Wasser gießen',
                        workers: [
                            { name: 'Stanislav Levin', class: 'worker-stanislav' },
                            { name: 'Ozan Orhan', class: 'worker-ozan' }
                        ],
                        due_Date: '2025-01-01',
                        priority: 'Middle',
                        category: { name: 'Technical Task', class: 'categoryTechnicalTask' },
                        subtasks: [
                            { todo: 'Wasser abstehen lassen' },
                            { todo: 'Dünger hinzugeben' },
                            { todo: 'PH Wert anpassen' },
                            { todo: 'im Ring gießen' }
                        ]
                    },
                    {
                        id: 2,
                        title: 'coden',
                        description: 'Join coden',
                        workers: [
                            { name: 'Stanislav Levin', class: 'worker-stanislav' },
                            { name: 'Kevin Fischer', class: 'worker-kevin' }
                        ],
                        due_Date: '2025-10-24',
                        priority: 'Low',
                        category: { name: 'Technical Task', class: 'categoryTechnicalTask' },
                        subtasks: [
                            { done: 'JS Datei einbinden' },
                            { todo: 'Summary Styling bearbeiten' },
                            { todo: 'auf github pushen' },
                            { todo: 'mit Team besprechen' }
                        ]
                    }
                ]
            },
            {
                id: 'inProgress',
                name: 'In Progress',
                task: [
                    {
                        id: 3,
                        title: 'HTML templates einbinden',
                        description: 'alle HTML datein zusammenfassen',
                        workers: [
                            { name: 'Stanislav Levin', class: 'worker-stanislav' },
                            { name: 'Nicolai Österle', class: 'worker-nicolai' }
                        ],
                        due_Date: '2044-08-15',
                        priority: 'Urgent',
                        category: { name: 'Technical Task', class: 'categoryTechnicalTask' },
                        subtasks: [
                            { todo: 'Code Schnipsel sammeln' },
                            { todo: 'auf github mergen' },
                            { todo: 'mit dem Team besprechen' },
                            { todo: 'änderungen anpassen und clean code beachten' }
                        ]
                    },
                    {
                        id: 4,
                        title: 'add Task einbinden',
                        description: 'add task erfolgreich ins array einbinden',
                        workers: [
                            { name: 'Stanislav Levin', class: 'worker-stanislav' },
                            { name: 'Ozan Orhan', class: 'worker-ozan' }
                        ],
                        due_Date: '2036-06-28',
                        priority: 'Middle',
                        category: { name: 'User Story', class: 'categoryUserStory' },
                        subtasks: [
                            { todo: 'datenstruktur besprechen' },
                            { todo: 'Änderungen übernehmen' }
                        ]
                    }
                ]
            },
            {
                id: 'awaitFeedback',
                name: 'Await Feedback',
                task: [
                    {
                        id: 5,
                        title: 'contacts einbinden',
                        description: 'codeblöcke miteinander verbinden',
                        workers: [
                            { name: 'Stanislav Levin', class: 'worker-stanislav' },
                            { name: 'Kevin Fischer', class: 'worker-kevin' }
                        ],
                        due_Date: '2024-11-30',
                        priority: 'Middle',
                        category: { name: 'Technical Task', class: 'categoryTechnicalTask' },
                        subtasks: [
                            { todo: 'contacts array erstellen' },
                            { todo: 'die daten im tasks aktualisieren' },
                            { done: 'dateien einbinden' },
                            { done: 'Contacts anzeigen lassen' }
                        ]
                    }
                ]
            },
            {
                id: 'done',
                name: 'Done',
                task: []
            }
        ]
    }
];












function acceptPrivacyPolicy() {
    const checkbox = document.getElementById('checkbox');
    const signUpBtn = document.getElementById('signUpBtn');
    signUpBtn.disabled = !checkbox.checked; // Enable button only if checkbox is checked
}





function signUp(event) {
    event.preventDefault(); // Verhindert das Standard-Formular-Absenden.

    // Werte aus den Eingabefeldern holen
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password1 = document.getElementById('password_1').value;
    const password2 = document.getElementById('password_2').value;

    // Validierung
    if (!name || !email || !password1 || !password2) {
        alert('Bitte füllen Sie alle Felder aus!');
        return;
    }

    if (password1 !== password2) {
        alert('Die Passwörter stimmen nicht überein!');
        return;
    }

    // Erstelle ein neues Benutzerobjekt
    const newUser = {
        id: Date.now(), // Eindeutige ID auf Basis der Zeit
        name: name,
        email: email,
        password: password1, // Speichern des Passworts (nicht sicher, aber als Beispiel)
        tasks: [] // Leeres Tasks-Array für den Benutzer
    };

    // Benutzer ins Array hinzufügen
    users.push(newUser);

    // Ausgabe zur Kontrolle
    console.log('Neuer Benutzer hinzugefügt:', newUser);
    console.log('Alle Benutzer:', users);

    // Formular zurücksetzen und Feedback geben
    document.getElementById('signUpForm').reset(); // Setzt das Formular zurück
    alert('Registrierung erfolgreich!');

    // Weiterleitung zur Login-Seite
    window.location.href = './../html/login.html'; // URL der Login-Seite anpassen
}




function logIn(event) {
    event.preventDefault(); // Verhindert das Standard-Formular-Absenden

    // Werte aus dem Formular holen
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Benutzer suchen, der mit den eingegebenen Daten übereinstimmt
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        window.location.href = './../html/summary.html'; // Zielseite anpassen
    } else {
        alert('E-Mail oder Passwort falsch. Bitte erneut versuchen.');
    }
}
