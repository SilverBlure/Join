

const BASE_URL = 'https://join-a403d-default-rtdb.europe-west1.firebasedatabase.app/';

//registrierungs section

let emailArray = [];

async function initReg() {
    loadEmails();
}

async function loadEmails(path = 'data/signtInUsers/emails') {
    emailArray = [];
    let response = await fetch(BASE_URL + path + '.json');
    let data = await response.json();
    emailArray = Object.values(data).map(entry => entry.email);
}

function signIn() {
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let password_1 = document.getElementById('password_1').value;
    let password_2 = document.getElementById('password_2').value;
    if(emailCheck(email) && passwordCheck(password_1, password_2)){
    createNewEntry(name, email, password_1);
    createNewMailEntry(email);
    alert('Das erstellen deines Benutzer Accounts war erfolgreich, du wirst auf die LoginSeite weitergeleietet!');
    location.href ='./login.html';
    }
}

async function createNewEntry(name, email, pw) {
    let response = await fetch(BASE_URL + "data/user" + '.json', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user: {
                userData: {
                    name: `${name}`,
                    email: `${email}`,
                    password: `${pw}`,
                },
                tasks: {
                    task: "noTaskTillNow"
                },
                contacts: {
                    contact: "noContactsTillNow"
                }
            }
        })
    });
    return responseAsJson = await response.json();
}

//kleine notiz du kannst in firebase keine null undefined oder andere leerwerte als platzhalter übergeben das geht nicht 
// fuer alle die das lesen es muss immer was mit angegeben werden

async function createNewMailEntry(email){
    let response = await fetch(BASE_URL + 'data/signtInUsers/emails' + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "email": `${email}`
        })
    })
    let responseAsJson = await response.json();
    console.log(responseAsJson)
}
//-----------------------------------------------------------------------------------------------------------------

//login section
let loginArray = [];

async function initLog(){
    loadLoginData();
}

async function loadLoginData(){
    loginArray = [];
    let response = await fetch(BASE_URL + 'data/user' + '.json');
    let responseToJson = await response.json();
    let fechedLoginData =  Object.entries(responseToJson);
    for(let i = 0; i<fechedLoginData.length; i++){
        let user ={
        id: fechedLoginData[i][0],
        email: fechedLoginData[i][1]['user']['userData']['email'],
        password: fechedLoginData[i][1]['user']['userData']['password'],
         };
         //
         console.log(user);
         loginArray.push(user);
    }
    console.log(loginArray);
}

function login(){
    let emailInput = document.getElementById('email').value;
    let pwInput =document.getElementById('password').value;
    let checkbox = document.getElementById('checkbox').value;
    // if(checkLogin(emailInput, pwInput)){
    //     localStorage.setItem(JSON.stringify('email', emailInput));
    //     localStorage.setItem(JSON.stringify('pw', pwInput));
    //     alert('Das hat geklappt!!!!!! Nice')
    // }
    console.log(checkbox);


}

//remember me funktion wird ausgefuehrt wenn die abfrage richtig wahr dann werdern die daten in den local storrage gespeichert

function checkLogin(emailInput, pwInput){
    let login = loginArray.find(user => user.email === emailInput && user.password === pwInput);
    if(login){
        return {match: true, id: login.id};
    } else {
        return {match: false, id: null};
    }
}