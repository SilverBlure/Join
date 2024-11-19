

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

async function loadEmails(path ='data/signtInUsers/emails'){
    emailArray = [];
    let response = await fetch(BASE_URL + path + '.json');
    let data = await response.json();
    emailArray = Object.values(data).map(entry => entry.email);
    console.log(emailArray);
}







// async function manualAdding() {
//     addSign(path='data/signtInUsers/emails', 'n92@gmail.com');
// }

async function addSign(path='', emailString) {
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



function signIn(){
    
}