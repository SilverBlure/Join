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

let defaultTasks=[
    {
        "tasks": [
          {
            "key": "TODO",
            "tasks": [
              {
                "task": "Low - Dateisystem überprüfen",
                "description": "Überprüfe das Dateisystem deines Systems auf Fehler und stelle sicher, dass genügend freier Speicherplatz vorhanden ist, um eine reibungslose Leistung zu gewährleisten.",
                "category": "Technical Task",
                "duedate": "2024-12-23",
                "contacts": [
                  {"name": "ADAC Service", "email": "info@adac.com", "phone": "089558959697"},
                  {"name": "DA Mentor", "email": "mentor@da.de", "phone": "151207589589"}
                ],
                "subtasks": [
                  "Überprüfen, ob genügend freier Speicherplatz vorhanden ist",
                  "Dateisystem auf Fehler überprüfen",
                  "Nicht benötigte Dateien löschen"
                ]
              },
              {
                "task": "Low - Benutzerverwaltung",
                "description": "Verwalte Benutzerkonten und ihre Rechte auf dem System. Dies umfasst das Anlegen neuer Benutzer, das Anpassen von Rechten und das Zurücksetzen von Passwörtern.",
                "category": "Technical Task",
                "duedate": "2024-12-30",
                "contacts": [
                  {"name": "Gast Account", "email": "Gast@join.com", "phone": "editMe"},
                  {"name": "Kevin Fischer", "email": "kevin.fi92@gmail.com", "phone": "234414112343421"}
                ],
                "subtasks": [
                  "Neuen Benutzer anlegen",
                  "Benutzerrechte anpassen",
                  "Passwort des Benutzers zurücksetzen"
                ]
              },
              {
                "task": "Low - Software aktualisieren",
                "description": "Halte das System auf dem neuesten Stand, indem du alle verfügbaren Software-Updates installierst und nicht mehr benötigte Pakete entfernst.",
                "category": "Technical Task",
                "duedate": "2025-01-06",
                "contacts": [
                  {"name": "Max Mustermann", "email": "mustermann@mail.com", "phone": "298424824"},
                  {"name": "Merle Musterfrau", "email": "mmusterfrau@gmail.com", "phone": "1512075555"}
                ],
                "subtasks": [
                  "System auf die neueste Version aktualisieren",
                  "Nicht mehr benötigte Software entfernen",
                  "Paketmanager-Cache bereinigen"
                ]
              },
              {
                "task": "Low - Backups erstellen",
                "description": "Erstelle regelmäßige Backups wichtiger Daten und stelle sicher, dass diese auf einem sicheren, externen Medium gespeichert sind.",
                "category": "User Story",
                "duedate": "2025-01-13",
                "contacts": [
                  {"name": "Nicolai Österle", "email": "oesterle.ni@onlinehome.de", "phone": "1766072226"},
                  {"name": "Ozan Orhan", "email": "o&o@gmail.com", "phone": "12345678"}
                ],
                "subtasks": [
                  "Wöchentliche Backups planen",
                  "Backups in der Cloud speichern",
                  "Überprüfen, ob Backups regelmäßig laufen"
                ]
              },
              {
                "task": "Middle - Netzwerkanalyse",
                "description": "Analysiere das Netzwerk, um Verbindungsprobleme zu identifizieren und sicherzustellen, dass die Netzwerkgeräte ordnungsgemäß funktionieren.",
                "category": "Technical Task",
                "duedate": "2025-01-20",
                "contacts": [
                  {"name": "Peter Lustig", "email": "peter@loewenzahn.de", "phone": "15120797589"},
                  {"name": "Stanislav Levin", "email": "Stani@gmail.com", "phone": "12345678"}
                ],
                "subtasks": [
                  "Verfügbare Netzwerkgeräte auflisten",
                  "Netzwerkgeschwindigkeit testen",
                  "Netzwerkverbindungen auf Sicherheit prüfen"
                ]
              },
              {
                "task": "Middle - E-Mail-Server einrichten",
                "description": "Richte einen funktionalen E-Mail-Server ein, der das Senden und Empfangen von E-Mails für das Unternehmen ermöglicht.",
                "category": "Technical Task",
                "duedate": "2025-01-27",
                "contacts": [
                  {"name": "ADAC Service", "email": "info@adac.com", "phone": "089558959697"},
                  {"name": "Kevin Fischer", "email": "kevin.fi92@gmail.com", "phone": "234414112343421"}
                ],
                "subtasks": [
                  "SMTP-Server konfigurieren",
                  "Benutzerkonten für E-Mail einrichten",
                  "SPF und DKIM für die E-Mail-Sicherheit einrichten"
                ]
              },
              {
                "task": "Middle - Datenbank optimieren",
                "description": "Optimiere die Leistung von Datenbanken durch Indexierung und das Beheben langsamer Abfragen, um die Effizienz zu steigern.",
                "category": "Technical Task",
                "duedate": "2025-02-03",
                "contacts": [
                  {"name": "Stanislav Levin", "email": "Stani@gmail.com", "phone": "12345678"},
                  {"name": "Nicolai Österle", "email": "oesterle.ni@onlinehome.de", "phone": "1766072226"}
                ],
                "subtasks": [
                  "Indizes für häufige Abfragen erstellen",
                  "Datenbank-Backups planen",
                  "Langsame Abfragen analysieren und optimieren"
                ]
              },
              {
                "task": "High - Virtualisierung implementieren",
                "description": "Implementiere eine Virtualisierungsplattform, um die Nutzung von Hardware-Ressourcen zu optimieren und die Verwaltung von Servern zu vereinfachen.",
                "category": "Technical Task",
                "duedate": "2025-02-10",
                "contacts": [
                  {"name": "Ozan Orhan", "email": "o&o@gmail.com", "phone": "12345678"},
                  {"name": "Merle Musterfrau", "email": "mmusterfrau@gmail.com", "phone": "1512075555"}
                ],
                "subtasks": [
                  "Hypervisor auf dem Server installieren",
                  "Virtuelle Maschinen für verschiedene Anwendungen einrichten",
                  "Virtuelle Maschinen regelmäßig überwachen und optimieren"
                ]
              }
            ]
          },
          {
            "key": "IN_PROGRESS",
            "tasks": [
              {
                "task": "Middle - Firewall konfigurieren",
                "description": "Stelle sicher, dass die Firewall deines Systems so konfiguriert ist, dass sie nur autorisierten Datenverkehr durchlässt und alle potenziellen Bedrohungen blockiert.",
                "category": "Technical Task",
                "duedate": "2025-01-13",
                "contacts": [
                  {"name": "Peter Lustig", "email": "peter@loewenzahn.de", "phone": "15120797589"},
                  {"name": "Kevin Fischer", "email": "kevin.fi92@gmail.com", "phone": "234414112343421"}
                ],
                "subtasks": [
                  "Ports für den eingehenden und ausgehenden Verkehr überprüfen",
                  "Firewall-Regeln erstellen",
                  "Protokolle der Firewall auf verdächtige Aktivitäten überprüfen"
                ]
              },
              {
                "task": "Middle - Serverleistung optimieren",
                "description": "Optimiere die Leistung des Servers, indem du die Ressourcennutzung überwachst und unnötige Prozesse eliminierst, um eine bessere Systemstabilität zu gewährleisten.",
                "category": "Technical Task",
                "duedate": "2025-01-20",
                "contacts": [
                  {"name": "Stanislav Levin", "email": "Stani@gmail.com", "phone": "12345678"},
                  {"name": "Ozan Orhan", "email": "o&o@gmail.com", "phone": "12345678"}
                ],
                "subtasks": [
                  "CPU-Auslastung überwachen und unnötige Prozesse beenden",
                  "RAM-Nutzung überprüfen und optimieren",
                  "Festplattennutzung überwachen und defragmentieren"
                ]
              }
            ]
          },
          {
            "key": "AWAIT_FEEDBACK",
            "tasks": [
              {
                "task": "High - Sicherheitslücke schließen",
                "description": "Identifiziere und behebe Sicherheitslücken im System, um das Risiko von Angriffen zu minimieren und die Integrität des Systems zu gewährleisten.",
                "category": "Technical Task",
                "duedate": "2025-02-03",
                "contacts": [
                  {"name": "Merle Musterfrau", "email": "mmusterfrau@gmail.com", "phone": "1512075555"},
                  {"name": "Ozan Orhan", "email": "o&o@gmail.com", "phone": "12345678"}
                ],
                "subtasks": [
                  "Sicherheitsupdates für alle Software-Pakete anwenden",
                  "Zugangskontrollen und Benutzerrechte auf allen Systemen überprüfen",
                  "Eingehende Verbindungen auf verdächtige Aktivitäten überprüfen"
                ]
              },
              {
                "task": "High - Notfallwiederherstellungsplan erstellen",
                "description": "Erstelle und dokumentiere einen Notfallwiederherstellungsplan, um sicherzustellen, dass im Falle eines Systemausfalls eine schnelle Wiederherstellung möglich ist.",
                "category": "User Story",
                "duedate": "2025-02-10",
                "contacts": [
                  {"name": "Max Mustermann", "email": "mustermann@mail.com", "phone": "298424824"},
                  {"name": "Stanislav Levin", "email": "Stani@gmail.com", "phone": "12345678"}
                ],
                "subtasks": [
                  "Wiederherstellungsprozesse für Daten und Systeme dokumentieren",
                  "Regelmäßige Tests und Simulationen durchführen",
                  "Sicherstellen, dass kritische Systeme schnell wiederhergestellt werden können"
                ]
              }
            ]
          }
        ]
      }
];


async function guestProtocol(){                 //Wird in die GuestLogin funktion gesetzt
    checkIfGuest();
}

function resetGuestLogin(){

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
        for(let i = 0; i<defaultTasks.length;i++){
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


async function checkIfGuest(){
    let keyFromLocalstorage = localStorage.getItem('sessionKey');
    if(keyFromLocalstorage === '-ODHuokeuYDB2yZbvrDx'){
        deleteGuestContacts();
        deleteGuestTasks();
        addBasicContacts();
        addBasicTasks();
    }
}