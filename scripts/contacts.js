let contacts = [
    {
        "userID": 1,
        "firstName": "Albert",
        "lastName": "Neu",
        "email": "aneu@gmail.com",
        "phone": "+491234347"

    },
    {
        "userID": 2,
        "firstName": "Heinz",
        "lastName": "Alt",
        "email": "halt@gmail.com",
        "phone": "+491234853"

    },
    {
        "userID": 3,
        "firstName": "Felix",
        "lastName": "Test",
        "email": "ftest@gmail.com",
        "phone": "+491237531"

    },
    {
        "userID": 4,
        "firstName": "Kevin",
        "lastName": "Fischer",
        "email": "kfischer@gmail.com",
        "phone": "+491234976"

    },
    {
        "userID": 4,
        "firstName": "Kevin",
        "lastName": "Fischer",
        "email": "kfischer@gmail.com",
        "phone": "+491234419"

    },
    {
        "userID": 5,
        "firstName": "Nicolai",
        "lastName": "Österle",
        "email": "nösterle@gmail.com",
        "phone": "+491234567"

    },
    {
        "userID": 6,
        "firstName": "Stanislav",
        "lastName": "Levin",
        "email": "slevin@gmail.com",
        "phone": "+491234357"

    },

];


const baseUrl = "https://test-b993b-default-rtdb.europe-west1.firebasedatabase.app/";

function renderContacts() {
 

    

     contacts.sort((a, b) => a.firstName.localeCompare(b.firstName));

    document.getElementById('contacts').innerHTML = "";
    let currentLetter = ""; 

    for (let i = 1; i < contacts.length; i++) {
        let firstLetter = contacts[i].firstName.slice(0, 1);

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
   let contactDatas =[];
   contacts.push(contactData);
   
for (let i = 1; i < contactDatas.length; i++) {
    let UserInfos = {
        id: i,
        firstName: contacs[0].contacts[i].firstName,
        lastName: contacts[0].contacts[i].lastName,
        email: contacts[0].contacts[i].email,
        phone: contacts[0].contacts[i].phone
    };
    contacts.push(UserInfos);
}
console.log(contacts);

renderContacts();


}
