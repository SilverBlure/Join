let ID;
let contactsArray = [];


function init() {
    loadSessionId();
    getContacts();
}


/**
 * This function renders all Contacts from the contactsArray and sorts them alphabetical
 * 
 * 
 */
function renderContacts() {
    const contactsElement = document.getElementById('contacts');
    if (!contactsElement) {return;}
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


/**
 * This function renders a detailed view of the contacts
 * 
 * @param {number} i - index of contact in contactsArray
 */
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


/**
 * This function opens the dialog to add new contacts
 * 
 */
function openAddContact() {
    document.getElementById('contactDialog').style.display = "block";
    addContact();
}


/**
 * This function opens the dialog to edit contacts
 * 
 * @param {number} i -  the id of the contact to edit
 */
function openEditContact(i) {
    document.getElementById('contactDialog').style.display = "block";
    document.getElementById('name').value=`${contactsArray[i].name}`;
    document.getElementById('email').value=`${contactsArray[i].email}`;
    document.getElementById('phone').value=`${contactsArray[i].phone}`; 
}


function openDeleteContact(i){
    openAddContact();
    document.getElementById('dialogInfo').innerHTML ="Delete contact";
    document.getElementById('editContact').innerHTML ="";
    document.getElementById('editContact').innerHTML = deleteContactTemp(i);  
     
}


/**
 * this function opens a dialog to delete the contact
 * 
 * @param {number} i - id of the contact to delete
 */
function deleteContact(i) {
    deleteContactDatabase(i);
    contactsArray = [];
    getContacts();
}


/**
 * this function loads the id of the logged in user from localstorage
 * 
 */
function loadSessionId() {
    ID = localStorage.getItem('sessionKey');
}


/**
 * this function gets data from inputfields an hands it to the function to push into backend
 * 
 */
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


/**
 * this function pushes the data of a new added contact into the backend
 * 
 * @param {string} name - name of the new added contact
 * @param {string} email - email of the new added contact
 * @param {number} phone - phonenumber of the new added contact
 * 
 */
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


/**
 * this function updates contact information in the backend
 * 
 * @param {*} contactId - id of the loged in user
 * @param {*} name  - name of the edited contact
 * @param {*} email - email of the edited contact
 * @param {*} phone - phone of the edited contact
 * @param {*} i - id of the edited contact
 * 
 */
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
    showSnackbar('Der Kontakt wurde erfolgreich geändert!');
       await getContacts();
        renderContactDetails(i);
    return responseAsJson = response.json();
}


/**
 * this function closes the dialog to add a new contact
 * 
 */
function closeAddContact() {
    document.getElementById('contactDialog').style.display = "none";
}


/**
 * this function gets the contacts from the backend and push them into contactsArray
 * 
 */
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


/**
 * this function checks if the user is on the contacts.html
 * 
 * @returns true or false
 */
function checkLockation(){
    let data = window.location.href;
    return data.includes('contacts');
}


/**
 * this function deletes contact from the backend
 * 
 * @param {number} i - index of the contact to delete
 */
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


/**
 * this function renders the dialog to add a new contact
 */
function addContact(){
    document.getElementById('dialogInfo').innerHTML ="Add contact";
    document.getElementById('editContact').innerHTML ="";
    document.getElementById('editContact').innerHTML = addContactTemp();

    document.getElementById('contactForm').addEventListener('submit', function(event) {
        event.preventDefault();
        if (this.checkValidity()) {
            checkInput(createContact);
        }
    });
}


/**
 * this function validates the input for creating or editing a new contact
 */
function checkInput(createEdit, i) {
    let fullname = document.getElementById('name').value.trim(); 
    if (fullname.split(" ").length < 2) {
        showSnackbar("Please enter first and last name.");
    }else{
        createEdit(i)
    } 
}


/**
 * this function renders the dialog to edit a new contact
 */
function editContact(i){
    document.getElementById('dialogInfo').innerHTML ="Edit contact";
    document.getElementById('editContact').innerHTML ="";
    document.getElementById('editContact').innerHTML = editContactTemp(i);
    openEditContact(i); 

    document.getElementById('contactForm').addEventListener('submit', function(event) {
        event.preventDefault();
        if (this.checkValidity()) {
            checkInput(getFromEdit, i);
        }
    });
}



/**
 * this function gets the contact informations to edit and hands them to the backend
 * @param {number} i - index of the contact to edit
 */
function getFromEdit(i) {
    let name = document.getElementById('name').value;
    let phone = document.getElementById('phone').value;
    let email= document.getElementById('email').value;
    let contactId = contactsArray[i].id;
  putContact(contactId, name, email, phone, i)
}


/**
 * this function creates for every contact a random color for the usertag
 * 
 * @param {*} vorname - firstname of the contact
 * @param {*} nachname - lastname of the contact
 * @returns a hexcolorcode 
 */
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


/**
 * this function sets the color of the small usertag in the contacts list
 * @param {*} vorname - firstname of the contact
 * @param {*} nachname - lastname of the contact
 * @param {*} i - index of the contact
 */
function setUserTagColor(vorname, nachname, i){
    document.getElementById(`userTag${i}`).style.backgroundColor = `${getColorHex(vorname, nachname)}`;
}


/**
 * this function sets the color of the big usertag in the detailed contact view
 * @param {*} vorname - firstname of the contact
 * @param {*} nachname - lastname of the contact
 * @param {*} i - index of the contact
 */
function setUserTagBigColor(vorname, nachname, i){
    document.getElementById(`userTagBig${i}`).style.backgroundColor = `${getColorHex(vorname, nachname)}`;

}


/**
 * this function is to go back from detailed contact view to the contacts list (only in mobile)
 */
function backToContactList(){
    document.getElementById('contactList').style.display = "flex";
    document.getElementById('details').style.display = "none";
}