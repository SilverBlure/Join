
let loginArray = [];
let sessionId;

/**initialize moor funktions */
async function initLog() {
    loadLoginData();

}


/**Loading Login Data in a Array vor check with actual input to get access */
async function loadLoginData() {
    loginArray = [];
    let response = await fetch(BASE_URL + 'data/user' + '.json');
    let responseToJson = await response.json();
    let fechedLoginData = Object.entries(responseToJson);
    for (let i = 0; i < fechedLoginData.length; i++) {
        let user = {
            id: fechedLoginData[i][0],
            email: fechedLoginData[i][1]['user']['userData']['email'],
            password: fechedLoginData[i][1]['user']['userData']['password'],
        };
        loginArray.push(user);
    }
}

/**this function makes the login to ur account 
 * @param {string} email
 * @param {string} pw  
*/
function login(loginType) {
    let pw, email, logindata, isChecked;
    if (loginType == 'normal') {
        email = document.getElementById('email').value;
        pw = document.getElementById('password').value;
        isChecked = document.getElementById('checkSvg').getAttribute('value');
        if (checkLogin(email, pw).match && isChecked) {
            logindata = checkLogin(email, pw);
            localStorage.setItem('email', email);
            localStorage.setItem('pw', pw);
            localStorage.setItem('sessionKey', logindata.id);
            showSnackbar('Deine Anmelde Daten werden für das näche mal gespeichert');
            location.href = './../html/summary.html';
        } else if (checkLogin(email, pw).match) {
            logindata = checkLogin(email, pw);
            localStorage.setItem('sessionKey', logindata.id);
            showSnackbar('Du wirst weitergeleitet, deine Anmeldedaten werden nicht local gespeichert!');
            location.href = './../html/summary.html';
        } else {
            showSnackbar('Überprüfe deine Anmeldedaten!');
        }
    } else if (loginType == 'Gast') {
        pw = 'Gast';
        email = 'test.Join@Join.com';
        if (checkLogin(email, pw).match) {
            logindata = checkLogin(email, pw);
            localStorage.setItem('sessionKey', logindata.id);
            showSnackbar('Du wirst weitergeleitet, deine Anmeldedaten werden nicht local gespeichert!');
            location.href = './../html/summary.html';
        }
    }
    deleteGuestContacts();
}


/**this function makes the login to ur account 
 * @param {string} email
 * @param {string} pw  
*/
function guestLogin(email, pw) {
    setTimeout(() => { showSnackbar('You are logged in as Guest') }, 2500);
    location.href = './../html/summary.html';
}

/**this funktion searches for email an pw in the login array 
 * @param {string} emailInput 
 * @param {string}  pwInput
*/
function checkLogin(emailInput, pwInput) {
    let login = loginArray.find(user => user.email === emailInput && user.password === pwInput);
    if (login) {
        return { match: true, id: login.id };
    } else {
        return { match: false, id: null };
    }
}

/**enables the buttonfor sign up */
function enableButton() {
    document.getElementById('signUpBtn').toggleAttribute('disabled');
}

/** check if there are equeal email
 */
function emailCheck(email) {
    if (emailArray.includes(email)) {
        showSnackbar('Die eingegebene Emailadresse besteht bereits, bitte geb eine andere an!');
    } else {
        return true;
    }
}

/**checks if boath password are the same */
function passwordCheck(pw1, pw2) {
    if (pw1 != pw2) {

    } else {
        document.getElementById('pwWarning').classList.toggle('none');
        return true;
    }
}


/**change Remembermy icon to checked
 */
function changeToChecked() {
    let doc = document.getElementById('checkSvg');
    doc.src = './../assets/icons/svg/vollCheckbox.svg';
    doc.setAttribute('class', 'unCheck');
    doc.setAttribute('onclick', 'changeToUncheck()');
    doc.setAttribute('value', 'true');
}

/*change Remembermy icon to  unchecked
 */
function changeToUncheck() {
    let doc = document.getElementById('checkSvg');
    doc.src = `./../assets/icons/svg/leereCheckbox.svg`;
    doc.setAttribute('class', 'checkSvg');
    doc.setAttribute('onclick', 'changeToChecked()');
    doc.setAttribute('value', 'false');
}

/** check if email and pw is valide 
 */
function checkInput() {
    let doc = document.getElementById('warningText');
    let emailFromInput = document.getElementById('email').value;
    let pwFromInput = document.getElementById('password').value;

    if (!check(emailFromInput, pwFromInput)) {
        doc.classList.replace('hidden-text', 'visible-text');
    } else {
        doc.classList.replace('visible-text', 'hidden-text');
    }
}

/** check if email and pw is right
 * 
 * @param {string} emailFromInput 
 * @param {string} pwFromInput 
 * @returns 
 */
function check(emailFromInput, pwFromInput) {
    let isChecked = loginArray.find((element) => element.email == emailFromInput && element.password == pwFromInput);
    return isChecked;
}                                                                                                                                                                  

function checkName(){
    let name = document.getElementById('name').value;
    if(!name.includes(' ')){
        document.getElementById('nameWarning').classList.remove('hidden-text');
        document.getElementById('nameWarning').classList.add('visible-text');
    }else{
        document.getElementById('nameWarning').classList.remove('visible-text');
        document.getElementById('nameWarning').classList.add('hidden-text');
    }
    setTimeout(()=>{
        if(name === ''){
            document.getElementById('nameWarning').classList.remove('visible-text');
        document.getElementById('nameWarning').classList.add('hidden-text');
        }
    },500);
}