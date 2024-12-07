
let loginArray = [];
let sessionId;

async function initLog(){
    loadLoginData();
    checkGuest();
    loadFromLocal();
}

function checkGuest(){
    let guest = loginArray.find((element) => {element.email == 'Gast@join.com'});
    console.log(guest);
}

function loadFromLocal(){
    let email = localStorage.getItem('email');
    let pw = localStorage.getItem('pw');
    if(email&&pw){
        document.getElementById('email').value =`${email}`;
        document.getElementById('password').value=`${pw}`;}
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
         loginArray.push(user);
    }
}

function login(email, pw){
    if(!email){
        email = document.getElementById('email').value;
        pw =document.getElementById('password').value;
    }
    let checkbox = document.getElementById('checkbox');
    let check = checkLogin(email, pw);
    let isChecked = checkbox.checked;
    if(check.match&&isChecked){
        localStorage.setItem('email', email);
        localStorage.setItem('pw', pw);
        localStorage.setItem('sessionKey', check.id);
        showSnackbar('Deine Anmelde Daten werden für das näche mal gespeichert');
        location.href ='./summary.html';
        
    }else if(check.match){
        localStorage.setItem('sessionKey', check.id);
        showSnackbar('Du wirst weitergeleitet, deine Anmeldedaten werden nicht local gespeichert!')
        location.href ='./summary.html';
    }else{
        showSnackbar('Überprüfe deine Anmeldedaten!')
    }
}

function checkLogin(emailInput, pwInput){
    let login = loginArray.find(user => user.email === emailInput && user.password === pwInput);
    if(login){
        return {match: true, id: login.id};
    } else {
        return {match: false, id: null};
    }
}

async function getUserTag(){
    let sessionKey = localStorage.getItem("sessionKey");
    let response = await fetch(BASE_URL + 'data/user/' + sessionKey + '.json');
    let data = await response.json();
    let [vorname, nachname] = data.user.userData.name.split(" ");
    userTag = vorname[0] + nachname[0];
    console.log(userTag);
    return userTag;
}


function showSnackbar(message){
    let snackbar= document.getElementById('snackbar');
    snackbar.textContent = message;
    snackbar.classList.remove('hidden');
    snackbar.classList.add('visible');
    setTimeout(() => {
        snackbar.classList.remove('visible');
        snackbar.classList.add('hidden');
    }, 3000);
  }


function enableButton(){
    document.getElementById('signUpBtn').toggleAttribute('disabled');
}

function emailCheck(email){
    if(emailArray.includes(email)){
         showSnackbar('Die eingegebene Emailadresse besteht bereits, bitte geb eine andere an!');
        } else {
           return true;
        }
}

function passwordCheck(pw1, pw2){
    if(pw1!=pw2){
       showSnackbar('Die beiden Passworter stimmen nicht überein, Bitte kontrolliere diese noch einmal!')
    }else{
        return true;
    }
}
