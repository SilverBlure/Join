
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
    document.getElementById('ContactDetailed').innerHTML =
        contactDetailsTemps(i, initialien);
}


function openAddContact() {
    document.getElementById('contactDialog').style.display = "block";
    addContact();
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
    await getContacts();
    renderContacts()
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

async function putContact(contactId, name, email, phone, i) {
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
    closeAddContact();
    await getContacts();
    renderContactDetails(i)
    return responseAsJson = response.json();
}

function closeAddContact() {
    document.getElementById('contactDialog').style.display = "none";
   

}

async function getContacts() {
    contactsArray = []
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

async function deleteContactDatabase(i) {
    contactId = contactsArray[i].id;
    await fetch(BASE_URL + 'data/user/' + ID + '/user/contacts/' + contactId + '.json', {
        method: "DELETE",
    })
    document.getElementById('ContactDetailed').innerHTML = "";
    getContacts();
    closeAddContact();
}


function addContact(){
    document.getElementById('editContact').innerHTML ="";
    document.getElementById('editContact').innerHTML = addContactTemp();
}

function editContact(i){
    openAddContact();
    document.getElementById('dialogInfo').innerHTML ="Edit contact";
    document.getElementById('editContact').innerHTML ="";
    document.getElementById('editContact').innerHTML = editContactTemp(i);
    openEditContact(i) 
}

function deleteContact(i){
    openAddContact();
    document.getElementById('dialogInfo').innerHTML ="Delete contact";
    document.getElementById('editContact').innerHTML ="";
    document.getElementById('editContact').innerHTML = deleteContactTemp(i);  
     
}


function openEditContact(i) {
    console.log('edit', i);
    document.getElementById('name').value=`${contactsArray[i].name}`;
    document.getElementById('email').value=`${contactsArray[i].email}`;
    document.getElementById('phone').value=`${contactsArray[i].phone}`; 
    
}


function getFromEdit(i) {
    let name = document.getElementById('name').value;
    let phone = document.getElementById('phone').value;
    let email= document.getElementById('email').value;
    let contactId = contactsArray[i].id;
    putContact(contactId, name, email, phone, i)
}


function checkInput(){
    let fullname = document.getElementById('name').value;

  if (fullname.split(" ").length < 2) {
    alert("please insert first and lastname")
  } else {
    createContact();
  }
}