
let loginArray = [];
let sessionId;

/**initialize moor funktions */
async function initLog(){
    loadLoginData();
    
}


/**Loading Login Data in a Array vor check with actual input to get access */
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
    checkGuest();
}

/**this function makes the logon to ur account 
 * @param {string} email
 * @param {string} pw  
*/
function login(){
    let email = document.getElementById('email').value;
    let pw =document.getElementById('password').value;
    let checkbox = document.getElementById('checkbox');
    let check = checkLogin(email, pw);
    let isChecked = checkbox.checked;
    if(check.match&&isChecked){
        localStorage.setItem('email', email);
        localStorage.setItem('pw', pw);
        localStorage.setItem('sessionKey', check.id);
        showSnackbar('Deine Anmelde Daten werden für das näche mal gespeichert');
        location.href ='./../html/summary.html';
    }else if(check.match){
        localStorage.setItem('sessionKey', check.id);
        showSnackbar('Du wirst weitergeleitet, deine Anmeldedaten werden nicht local gespeichert!')
        location.href ='./../html/summary.html';
    }else{
        showSnackbar('Überprüfe deine Anmeldedaten!')
    }
}

/**this function makes the login to ur account 
 * @param {string} email
 * @param {string} pw  
*/
async function guestLogin(email, pw){
    let checkbox = document.getElementById('checkbox');
    let check = checkLogin(email, pw);
    let isChecked = checkbox.checked;
    if(check.match&&isChecked){
        localStorage.setItem('email', email);
        localStorage.setItem('pw', pw);
        localStorage.setItem('sessionKey', check.id);
        showSnackbar('Deine Anmelde Daten werden für das näche mal gespeichert');
        location.href ='./../html/summary.html';
        
    }else if(check.match){
        localStorage.setItem('sessionKey', check.id);
        showSnackbar('Du wirst weitergeleitet, deine Anmeldedaten werden nicht local gespeichert!')
        location.href ='./../html/summary.html';
    }else{
        showSnackbar('Überprüfe deine Anmeldedaten!')
    }
}

/**this funktion searches for email an pw in the login array 
 * @param {string} emailInput 
 * @param {string}  pwInput
*/
function checkLogin(emailInput, pwInput){
    let login = loginArray.find(user => user.email === emailInput && user.password === pwInput);
    if(login){
        return {match: true, id: login.id};
    } else {
        return {match: false, id: null};
    }
}

/**enables the buttonfor sign up */
function enableButton(){
    document.getElementById('signUpBtn').toggleAttribute('disabled');
}

/** check if there are equeal email
 */
function emailCheck(email){
    if(emailArray.includes(email)){
         showSnackbar('Die eingegebene Emailadresse besteht bereits, bitte geb eine andere an!');
        } else {
           return true;
        }
}

/**checks if boath password are the same */
function passwordCheck(pw1, pw2){
    if(pw1!=pw2){
       showSnackbar('Die beiden Passworter stimmen nicht überein, Bitte kontrolliere diese noch einmal!')
    }else{
        return true;
    }
}
