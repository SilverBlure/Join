

const BASE_URL = 'https://join-a403d-default-rtdb.europe-west1.firebasedatabase.app/';

async function initializeEmptyDatabase() {
    let response = await fetch(BASE_URL + "/data" + ".json", {
        method: 'POST',
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "users": {
                "user": {
                    "attribute": {
                        "name": "user",
                        "passwort": "password",
                        "email": "test@email.de",
                        "privacyPolicy": true
                    },
                    "tasks": {
                        "task": {
                            "title": "",
                            "discription": "",
                            "asigntTo": {
                                "user": {}
                            },
                            "dueDate": 777,
                            "prio": "middle",
                            "category": "tech",
                            "subtask": ""
                        }
                    },
                    "contacts": {
                        "contact": {
                            "name": "Max Scherzinger",
                            "email": "M.Scherzinger@gmail.com",
                            "phone": "0176/60122552"
                        }
                    }
                }
            },
            "signtInUsers": {
                "user": {
                    "name": "",
                    "email": ""
                }
            }
        }
        ),

    })
}

let userArray = [];
let emailArray = [];

async function init() {
    loadEmails();
}

async function loadEmails(path = 'data/signtInUsers/emails') {
    emailArray = [];
    let response = await fetch(BASE_URL + path + '.json');
    let data = await response.json();
    emailArray = Object.values(data).map(entry => entry.email);
}







// async function manualAdding() {
//     addSign(path='data/signtInUsers/emails', 'n92@gmail.com');
// }

async function addSign(path = '', emailString) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "email": `${emailString}`
        })
    })
    let responseAsJson = await response.json();
    console.log(responseAsJson)
}



function signIn() {
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let password_1 = document.getElementById('password_1').value;
    let password_2 = document.getElementById('password_2').value;
    if(emailCheck(email) && passwordCheck(password_1, password_2)){
    createNewEntry(name, email, password_1);
    createNewMailEntry(email);
    alert('Das erstellen deines Benutzer Accounts war erfolgreich, du wirst auf die LoginSeite weitergeleietet!');
    location.href ='./login.html';
    }
}

async function createNewEntry(name, email, pw) {
    // hier brauchen wir die BaseStuckture fuer die json
    let response = await fetch(BASE_URL + "data/user" + '.json', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user: {
                userData: {
                    name: `${name}`,
                    email: `${email}`,
                    password: `${pw}`,
                },
                tasks: {
                    task: "noTaskTillNow"
                },
                contacts: {
                    contact: "noContactsTillNow"
                }
            }
        })
    });
    return responseAsJson = await response.json();
}

//kleine notiz du kannst in firebase keine null undefined oder andere leerwerte als platzhalter übergeben das geht nicht 
// fuer alle die das lesen es muss immer was mit angegeben werden

async function createNewMailEntry(email){
    let response = await fetch(BASE_URL + 'data/signtInUsers/emails' + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "email": `${email}`
        })
    })
    let responseAsJson = await response.json();
    console.log(responseAsJson)
}