let ID;
let contactsArray = [];


function init() {
    loadSessionId();
    getContacts();
}


function renderContacts() {
    const contactsElement = document.getElementById('contacts');
    if (!contactsElement) {
        return; 
    }
    contactsArray.sort((a, b) => a.name.localeCompare(b.name));
    contactsElement.innerHTML = ``;
    let currentLetter = "";
    for (let i = 0; i < contactsArray.length; i++) {
        let [vorname, nachname] = contactsArray[i].name.split(" ");
        let initialien = vorname[0] + nachname[0];
        let firstLetter = contactsArray[i].name.slice(0, 1);
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            contactsElement.innerHTML += renderCurrentLetter(currentLetter);
        }
        const groupElement = document.getElementById(`group-${currentLetter}`);
        if (groupElement) {
            groupElement.innerHTML += contactTemps(i, initialien);
            setUserTagColor(vorname, nachname, i);
        } else {
            console.warn(`Gruppe mit der ID 'group-${currentLetter}' wurde nicht gefunden.`);
        }
    }
}



function renderContactDetails(i) {
    let [vorname, nachname] = contactsArray[i].name.split(" ");
    let initialien = vorname[0] + nachname[0];
    if (window.innerWidth < 560){
        document.getElementById('contactList').style.display = "none";
        document.getElementById('details').style.display = "flex";
    }
    document.getElementById('ContactDetailed').innerHTML = "";
    document.getElementById('ContactDetailed').innerHTML =
        contactDetailsTemps(i, initialien);
        setUserTagBigColor(vorname, nachname, i); 
}


function openAddContact() {
    document.getElementById('contactDialog').style.display = "block";
    addContact();
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

function createContact() {
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let phone = +document.getElementById('phone').value;
    pushData(name, email, phone);
    closeAddContact();
    setTimeout(() => {
    getContacts();
    renderContacts();
    }, 800);
    
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
    showSnackbar('Der Kontakt wurde erfolgreich erstellt!');
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
    getContacts();
    showSnackbar('Der Kontakt wurde erfolgreich geändert!');
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
    if(data){
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
        if(checkLockation()){
        renderContacts();
    }
    }else{
        let response = await fetch(BASE_URL + '/data/user/' + ID + '/user/userData.json');
        let responseAsJson = await response.json();
        pushData(responseAsJson.name, responseAsJson.email, 'editMe');
        setTimeout(()=>{
        getContacts()}
        , 1000);
    }
}

function checkLockation(){
    let data = window.location.href;
    return data.includes('contacts');
}

async function deleteContactDatabase(i) {
    contactId = contactsArray[i].id;
    await fetch(BASE_URL + 'data/user/' + ID + '/user/contacts/' + contactId + '.json', {
        method: "DELETE",
    })
    document.getElementById('ContactDetailed').innerHTML = "";
    getContacts();
    closeAddContact();
    showSnackbar('Der Kontakt wurde erfolgreich gelöscht!');
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
    putContact(contactId, name, email, phone)
}

function getColorHex(vorname, nachname){
    let completeName = (vorname+nachname).toLowerCase();
    let hash = 0;

    for( let i = 0; i< completeName.length; i++){
        hash += completeName.charCodeAt(i);
    }

    let r = (hash * 123) % 256;
    let g = (hash * 456) % 256;
    let b = (hash * 789) % 256;

    let hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    return hexColor;
}


function checkInput(){
    let fullname = document.getElementById('name').value;

  if (fullname.split(" ").length < 2) {
    showSnackbar("Please insert first and lastname");
  } else {
    createContact();
  }
}


function setUserTagColor(vorname, nachname, i){
    document.getElementById(`userTag${i}`).style.backgroundColor = `${getColorHex(vorname, nachname)}`;

}

function setUserTagBigColor(vorname, nachname, i){
    document.getElementById(`userTagBig${i}`).style.backgroundColor = `${getColorHex(vorname, nachname)}`;

}

function backToContactList(){
    document.getElementById('contactList').style.display = "flex";
    document.getElementById('details').style.display = "none";
}


