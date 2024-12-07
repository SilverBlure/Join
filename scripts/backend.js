
const BASE_URL = 'https://join-a403d-default-rtdb.europe-west1.firebasedatabase.app/';

let emailArray = [];
/**This is a on load funktion */
async function initReg() {
    loadEmails();
}
/**This is an function to fetch all used email Adresses from server
 * @param {string} [path='data/signtInUsers/emails'] 
 */
async function loadEmails(path = 'data/signtInUsers/emails') {
    emailArray = [];
    let response = await fetch(BASE_URL + path + '.json');
    let data = await response.json();
    emailArray = Object.values(data).map(entry => entry.email);
}
/**This function takes the values and check the then u get the access to ur account */
function signIn() {
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let password_1 = document.getElementById('password_1').value;
    let password_2 = document.getElementById('password_2').value;
    if(emailCheck(email) && passwordCheck(password_1, password_2)){
    createNewEntry(name, email, password_1);
    createNewMailEntry(email);
    showSnackbar('Das erstellen deines Benutzer Accounts war erfolgreich, du wirst gleich auf die LoginSeite weitergeleitet!');
    setTimeout(() => {
        location.href="./login.html";
    }, 3000);
    }
}
/**This funktion Posts a new account on the firebase
 * @param {string} name 
 * @param {string} email 
 * @param {string} pw 
 */
async function createNewEntry(name, email, pw) {
    let response = await fetch(BASE_URL + "data/user"+  '.json', {
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
                }
            }
        })
    });
    return responseAsJson = await response.json();
}
/**create a new email enrty in the Firebase
 * @param {string} email
 */
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
/** render the userttag in html doc*/
async function setUserTag(){
    document.getElementById('logedInUser').innerHTML = `${await getUserTag()}`;
}
/** load names with session key from firebase*/
async function getUserTag(){
    let sessionKey = localStorage.getItem("sessionKey");
    let response = await fetch(BASE_URL + 'data/user/' + sessionKey + '.json');
    let data = await response.json();
    let [vorname, nachname] = data.user.userData.name.split(" ");
    userTag = vorname[0] + nachname[0];
    return userTag;
}
