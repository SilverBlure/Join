

function enableButton(){
    document.getElementById('signUpBtn').toggleAttribute('disabled');
}

// der Button sollte noch irgendwie ausgegraut werden er nicht pressbar ist!

function emailCheck(email){
    if(emailArray.includes(email)){
        return alert('Die eingegebene Emailadresse besteht bereits, bitte geb eine andere an!')
     };
}

function passwordCheck(pw1, pw2){
    if(pw1!=pw2){
       return alert('Die beiden Passworter stimmen nicht überein, Bitte kontrolliere diese noch einmal!')
    }
}