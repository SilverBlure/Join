let contacts = [];


const baseUrl = "https://test-b993b-default-rtdb.europe-west1.firebasedatabase.app/";

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


function addContact(){
    document.getElementById('contactDialog').style.display = "block";
 
}
