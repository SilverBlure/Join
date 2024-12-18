let defaultContacts=[
    {
    email : "info@adac.com",
    name : "ADAC Service",
    phone: "089558959697"
},{
    name: 'DA Mentor',
    email: 'mentor@da.de',
    phone: '151207589589'
},{
    name: 'Gast Account',
    email: 'Gast@join.com',
    phone: 'editMe'
},{
    name: 'Kevin Fischer',
    email: 'kevin.fi92@gmail.com',
    phone: '234414112343421'
},{
    name: 'Max Mustermann',
    email: 'mustermann@mail.com',
    phone: '298424824'
},{
    name: 'Merle Musterfrau',
    email: 'mmusterfrau@gmail.com',
    phone: '1512075555'
},{
    name: 'Nicolai Österle',
    email: 'oesterle.ni@onlinehome.de',
    phone: '1766072226'
},{
    name: 'Ozan Orhan',
    email: 'o&o@gmail.com',
    phone: '12345678'
},{
    name: 'Peter Lustig',
    email: 'peter@loewenzahn.de',
    phone: '15120797589'
},{
    name: 'Stanislav Levin',
    email: 'Stani@gmail.com',
    phone: '12345678'
}
];


async function guestProtocol(){                 //Wird in die GuestLogin funktion gesetzt
    checkIfGuest();
}

async function checkIfGuest(){
  let keyFromLocalstorage = localStorage.getItem('sessionKey');
  if(keyFromLocalstorage === '-OEFGOkrvbIp5IOhyFV9'){
     await deleteGuestContacts();
     await deleteGuestTasks();
     await addBasicContacts();
     await addBasicTasks();
  }
}


async function deleteGuestContacts(){
let userId = localStorage.getItem('sessionKey')

    await fetch(BASE_URL + 'data/user/' + userId + '/user/contacts' + '.json', {
        method: "DELETE",
    })
}

async function deleteGuestTasks(){
    let userId = localStorage.getItem('sessionKey')

    await fetch(BASE_URL + 'data/user/' + userId + '/user/tasks' + '.json', {
        method: "DELETE",
    })
}


async function addBasicContacts(){
    let ID = localStorage.getItem('sessionKey')
    for(let i = 0; i<defaultContacts.length;i++){
    await fetch(BASE_URL + "data/user/" + ID + "/user/contacts/" + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contact: {
                name: `${defaultContacts[i].name}`,
                email: `${defaultContacts[i].email}`,
                phone: `${defaultContacts[i].phone}`,
            }
        })
    }
    )
    }}

async function addBasicTasks(){
        let ID = localStorage.getItem('sessionKey')
        await fetch(BASE_URL + "data/user/" + ID + "/user/tasks/" + ".json", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                        "awaitFeedback": {
                            "name": "Await Feedback"
                        },
                        "done": {
                            "name": "Done"
                        },
                        "inProgress": {
                            "name": "In Progress",
                            "task": {
                                "-OEFIk4xQeaeEWiTqdVg": {
                                    "category": {
                                        "class": "categoryTechnicalTask",
                                        "name": "Technical Task"
                                    },
                                    "description": "Mehrer Personen können angewählt werden",
                                    "dueDate": "2024-12-28",
                                    "priority": "Low",
                                    "subtasks": {
                                        "subtask_1734366651521": {
                                            "done": false,
                                            "title": "eins"
                                        }
                                    },
                                    "title": "Kontakte können Tasks zugewiesen werden",
                                    "workers": [
                                        {
                                            "id": "-OEFHjKjyyROiwBXdK9A",
                                            "name": "ADAC Service"
                                        },
                                        {
                                            "id": "-OEFHjOlO7DL4WBzAmLv",
                                            "name": "Merle Musterfrau"
                                        }
                                    ]
                                }
                            }
                        },
                        "todo": {
                            "name": "To Do",
                            "task": {
                                "-OEFHxpVRq2XwjdLH5Gt": {
                                    "category": {
                                        "class": "categoryTechnicalTask",
                                        "name": "Technical Task"
                                    },
                                    "description": "Test",
                                    "dueDate": "2024-12-20",
                                    "priority": "Urgent",
                                    "subtasks": {
                                        "subtask_1734366453011": {
                                            "done": false,
                                            "title": "wertwer"
                                        }
                                    },
                                    "title": "Test task",
                                    "workers": [
                                        {
                                            "id": "-OEFHjMgdkgpNLyE-6y7",
                                            "name": "DA Mentor"
                                        }
                                    ]
                                },
                                "-OEFIyslWj86gtepNDlq": {
                                    "category": {
                                        "class": "categoryTechnicalTask",
                                        "name": "Technical Task"
                                    },
                                    "description": "Die Firebase einrichten",
                                    "dueDate": "2025-01-05",
                                    "priority": "Urgent",
                                    "subtasks": {
                                        "subtask_1734366718358": {
                                            "done": false,
                                            "title": "Firebas eroeffnen"
                                        }
                                    },
                                    "title": "Fire Base",
                                    "workers": [
                                        {
                                            "id": "-OEFHjMgdkgpNLyE-6y7",
                                            "name": "DA Mentor"
                                        },
                                        {
                                            "id": "-OEFHjNFXPBUiD6tH8Vs",
                                            "name": "Gast Account"
                                        }
                                    ]
                                },
                                "-OEFJCgpsUx3qD-vyN5h": {
                                    "category": {
                                        "class": "categoryUserStory",
                                        "name": "User Story"
                                    },
                                    "description": "Eine Contact Seite in html erstellen",
                                    "dueDate": "2024-12-29",
                                    "priority": "Urgent",
                                    "subtasks": {
                                        "subtask_1734366776733": {
                                            "done": false,
                                            "title": "Test"
                                        }
                                    },
                                    "title": "Contact Seite erstellen",
                                    "workers": [
                                        {
                                            "id": "-OEFHjNlgri_UNKmZeLH",
                                            "name": "Kevin Fischer"
                                        },
                                        {
                                            "id": "-OEFHjPLhOYL_aciP3yZ",
                                            "name": "Nicolai Österle"
                                        }
                                    ]
                                },
                                "-OEFJUCcOWw_kk27Z_ma": {
                                    "category": {
                                        "class": "categoryTechnicalTask",
                                        "name": "Technical Task"
                                    },
                                    "description": "Alle Html elemente responsive gestallten",
                                    "dueDate": "2025-01-03",
                                    "priority": "Urgent",
                                    "title": "Responsive Design",
                                    "workers": [
                                        {
                                            "id": "-OEFHjMgdkgpNLyE-6y7",
                                            "name": "DA Mentor"
                                        },
                                        {
                                            "id": "-OEFHjQLo-VhUB37uORP",
                                            "name": "Peter Lustig"
                                        }
                                    ]
                                },
                                "-OEFJirNM3U22VgT0uwg": {
                                    "category": {
                                        "class": "categoryTechnicalTask",
                                        "name": "Technical Task"
                                    },
                                    "description": "Eine Ordnerstruktur fuer das Join Projekt erstellen",
                                    "dueDate": "2024-12-19",
                                    "priority": "Urgent",
                                    "title": "Ordner Struktur erstellen",
                                    "workers": [
                                        {
                                            "id": "-OEFHjOG312e9DqRI0wd",
                                            "name": "Max Mustermann"
                                        },
                                        {
                                            "id": "-OEFHjQrViorXS4iivek",
                                            "name": "Stanislav Levin"
                                        }
                                    ]
                                }
                            }
                        }
                    
                
               
        })
        }
        )
        }



        