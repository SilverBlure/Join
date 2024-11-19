

function enableButton(){
    document.getElementById('signUpBtn').toggleAttribute('disabled');
}

// der Button sollte noch irgendwie ausgegraut werden er nicht pressbar ist!
// die Passwort eingabefelder sollten ausgegraut werden wenn ein wert eingegeben wird!

function emailCheck(email){
    if(emailArray.includes(email)){
         alert('Die eingegebene Emailadresse besteht bereits, bitte geb eine andere an!');
        } else {
           return true;
        }
    }


function passwordCheck(pw1, pw2){
    if(pw1!=pw2){
       alert('Die beiden Passworter stimmen nicht überein, Bitte kontrolliere diese noch einmal!')
    }else{
        return true;
    }
}