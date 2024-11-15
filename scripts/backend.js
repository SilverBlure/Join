

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

async function init() {
    loadSignedInUserData('data/-OBk-K36Ltlzr3ce7zOD/signtInUsers');
}

async function loadSignedInUserData(path = '') {
    let response = await fetch(BASE_URL + path + ".json")
    let responseAsJson = await response.json();
    let respondUser = responseAsJson.user
    for (let i = 0; i < respondUser.length; i++) {
        const MyUser = new Object; 
            MyUser.name= respondUser.name;
            MyUser.email= respondUser.email;
        console.log(MyUser);
        userArray.push(MyUser);
    }
    
}
