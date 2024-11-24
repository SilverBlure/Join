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
    signUpBtn.disabled = !checkbox.checked; 
}





function signUp(event) {
    event.preventDefault(); 
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password1 = document.getElementById('password_1').value;
    const password2 = document.getElementById('password_2').value;
    if (!name || !email || !password1 || !password2) {
        alert('Bitte füllen Sie alle Felder aus!');
        return;
    }
    if (password1 !== password2) {
        alert('Die Passwörter stimmen nicht überein!');
        return;
    }
    const newUser = {
        id: Date.now(), 
        name: name,
        email: email,
        password: password1,
        tasks: [] 
    };
    users.push(newUser);
    console.log('Neuer Benutzer hinzugefügt:', newUser);
    console.log('Alle Benutzer:', users);
    document.getElementById('signUpForm').reset(); 
    alert('Registrierung erfolgreich!');
    window.location.href = './../html/login.html'; 
}




function handleRememberMe(event) {
    event.preventDefault(); 
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('checkbox').checked; 
    if (rememberMe) {
        localStorage.setItem('email', email);
        localStorage.setItem('password', password);
    } else {
        localStorage.removeItem('email');
        localStorage.removeItem('password');
    }
    logIn(email, password);  
}




function logIn(email, password) {
    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        window.location.href = './../html/summary.html';  
    } else {
        alert('E-Mail oder Passwort sind falsch. Bitte versuche es erneut.');
    }
}




window.onload = function() {
    const savedEmail = localStorage.getItem('email');
    const savedPassword = localStorage.getItem('password');
    if (savedEmail && savedPassword) {
        document.getElementById('email').value = savedEmail;
        document.getElementById('password').value = savedPassword;
        logIn(savedEmail, savedPassword);
    }
};


