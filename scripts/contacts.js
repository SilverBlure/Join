


let contacts = [];


function renderContacts() {
 

    

     contacts.sort((a, b) => a.firstName.localeCompare(b.firstName));

    document.getElementById('contacts').innerHTML = "";
    let currentLetter = ""; 

    for (let i = 1; i < contacts.length; i++) {
        let firstLetter = contacts.i.firstName.slice(0, 1);

        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            document.getElementById('contacts').innerHTML += 
            renderCurrentLetter(currentLetter);
        }

       document.getElementById(`group-${currentLetter}`).innerHTML +=
       contactTemps(i); 
    }
}


function renderContactDetails(i){
    document.getElementById('ContactDetailed').innerHTML="";
    document.getElementById('ContactDetailed').innerHTML+=
    ContactDetailsTemps(i);
}


async function loadContacts(){

   let response= await fetch(baseUrl + ".json")
   let contactData = await response.json();
   console.log(contactData);
   
   
for (let i = 1; i < contactData.length; i++) {
    let UserInfos = {
        id: i,
        firstName: contactData.i.firstName,
        lastName: contactData.i.lastName,
        email: contactData.i.email,
        phone: contactData.i.phone
    };
    contacts.push(UserInfos);
    console.log(UserInfos);
    
}
console.log(contacts);

renderContacts();


}


function openAddContact(){
    document.getElementById('contactDialog').style.display = "block";
}


let ID;


function init(){
    loadSessionId();
}

function loadSessionId(){
    ID = localStorage.getItem('sessionKey');
}




async function createContact(name, email, phone){
    let response = await fetch(BASE_URL + "data/user" + ID + "user/contacts" + ".json", {
        method: "POST",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contact:{
                name:`${name}`,
                email:`${email}`,
                phone:`${phone}`,
            }
        })
    }
    )
    return responseAsJson = response.json();
}

async function editContact(){
    let response = await fetch(BASE_URL + "data/user" + ID + "user/contacts"  + ".json", {
        method: "Put",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contact:{
                name:`${name}`,
                email:`${email}`,
                phone:`${phone}`,
            }
        })
    }
    )
    return responseAsJson = response.json();
}
function closeAddContact(){
    document.getElementById('contactDialog').style.display = "none";
 
}
