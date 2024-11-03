function startTransformation(){  //the join icon removes actualy after 3seconds
    setTimeout(
        trasformLoginScreen ,
        3000);
}

function trasformLoginScreen(){
    let page = document.getElementById('loginPage');
    page.innerHTML= '';

}