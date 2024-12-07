function includeHTML() {
    var z, i, elmnt, file, xhttp;
    
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
      elmnt = z[i];
      file = elmnt.getAttribute("w3-include-html");
      if (file) {
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4) {
            if (this.status == 200) {
              elmnt.innerHTML = this.responseText;
            }
            if (this.status == 404) {
              elmnt.innerHTML = "Page not found.";
            }
            elmnt.removeAttribute("w3-include-html");
            includeHTML();
          }
        };
        xhttp.open("GET", file, true);
        xhttp.send();
        return;
      }
    }
    setUserTag();
  }

  function startIntro() {
    setTimeout(() => {
        showLogin();
    }, 3000);
};

function showLogin() {
    window.location.href = './html/login.html'; 
}


function logOut() {
  localStorage.removeItem('email');
  localStorage.removeItem('password');
  localStorage.removeItem('sessionKey');
  window.location.href = '../index.html';
}



function setPriority(priority) {
  tempPriority = priority;
  document.querySelectorAll('.priorityBtn').forEach(btn => btn.classList.remove('active'));
  const activeButton = document.getElementById(`prio${priority}`);
  if (activeButton) {
      activeButton.classList.add('active');
  } else {
      console.warn(`Button für Priorität "${priority}" nicht gefunden.`);
  }
}


function getColorHex(vorname, nachname){
  let completeName = (vorname+nachname).toLowerCase();
  let hash = 0;

  for( let i = 0; i< completeName.length; i++){
      hash += completeName.charCodeAt(i);
  }

  let r = (hash * 123) % 256;
  let g = (hash * 456) % 256;
  let b = (hash * 789) % 256;

  let hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  return hexColor;
}

function toggleShowMenu() {
  const dropdownMenu = document.getElementById('dropdownMenu');
  if (dropdownMenu.classList.contains('active')) {
      dropdownMenu.classList.remove('active'); 
  } else {
      dropdownMenu.classList.add('active'); 
  }
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