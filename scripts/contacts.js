
let ID;
let contactsArray = [];


function init() {
    loadSessionId();
    getContacts();

}


function renderContacts() {
    contactsArray.sort((a, b) => a.name.localeCompare(b.name));
    document.getElementById('contacts').innerHTML = '';
    let currentLetter = ""; 
    for (let i = 0; i < contactsArray.length; i++) {
        let [vorname, nachname] = contactsArray[i].name.split(" ");
        let initialien = vorname[0] + nachname[0];
        let firstLetter = contactsArray[i].name.slice(0,1);
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            document.getElementById('contacts').innerHTML += 
            renderCurrentLetter(currentLetter);
        }
       document.getElementById(`group-${currentLetter}`).innerHTML +=
       contactTemps(i, initialien); 
    }
}


function renderContactDetails(i) {
    let [vorname, nachname] = contactsArray[i].name.split(" ");
    let initialien = vorname[0] + nachname[0];
    document.getElementById('ContactDetailed').innerHTML = "";
    document.getElementById('ContactDetailed').innerHTML +=
        ContactDetailsTemps(i, initialien);
}


function openAddContact() {
    document.getElementById('contactDialog').style.display = "block";
}

function openEditContact(i) {
    console.log('edit', i);
    openAddContact();
    document.getElementById('name').value=`${contactsArray[i].name}`;
    document.getElementById('email').value=`${contactsArray[i].email}`;
    document.getElementById('phone').value=`${contactsArray[i].phone}`; // hier werden die daten nochmal 
    //aus dem array eintrag abgerufen und im Formular aufge zeigt
    // die daten muessen genommenwerden und in das json hochgeladen 
    //danach muss der inhalt neu geladen werden


}


function deleteContact(i) {
    console.log(contactsArray[i].id);
    deleteContactDatabase(contactsArray[i].id);
    contactsArray = [];
    getContacts();
}


function loadSessionId() {
    ID = localStorage.getItem('sessionKey');
}

async function createContact() {
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let phone = +document.getElementById('phone').value;
    console.log(name, email, phone, ID);
    pushData(name, email, phone);
    closeAddContact();
    renderContacts();
}

async function pushData(name, email, phone) {
    let response = await fetch(BASE_URL + "data/user/" + ID + "/user/contacts/" + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contact: {
                name: `${name}`,
                email: `${email}`,
                phone: `${phone}`,
            }
        })
    }
    )
    return responseAsJson = response.json();
}

async function putContact(contactId, name, email, phone) {
    let response = await fetch(BASE_URL + 'data/user/' + ID + '/user/contacts/' + contactId + '.json', {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contact: {
                name: `${name}`,
                email: `${email}`,
                phone: `${phone}`,
            }
        })
    }
    )
    return responseAsJson = response.json();
}

function closeAddContact() {
    document.getElementById('contactDialog').style.display = "none";
    document.getElementById("contactForm").reset();

}

async function getContacts() {
    let response = await fetch(BASE_URL + 'data/user/' + ID + '/user/contacts' + '.json');
    let data = await response.json();
    let keys = Object.keys(data);
    data = Object.values(data);
    for (let i = 0; i < data.length; i++) {

        const contact = {
            name: data[i].contact.name,
            email: data[i].contact.email,
            phone: data[i].contact.phone,
            id: keys[i],
        }
        contactsArray.push(contact);
    }
    renderContacts();
}

async function deleteContactDatabase(contactId) {
    await fetch(BASE_URL + 'data/user/' + ID + '/user/contacts/' + contactId + '.json', {
        method: "DELETE",
    })
}

