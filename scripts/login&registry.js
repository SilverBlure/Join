

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
