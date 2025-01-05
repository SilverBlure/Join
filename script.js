/**
 * Lädt externe HTML-Dateien in Elemente mit dem Attribut `w3-include-html` und aktualisiert die Navigation.
 */
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
          updateActiveNav();
        }
      };
      xhttp.open("GET", file, true);
      xhttp.send();
      return;
    }

  }
  setUserTag();
}

/**
 * Startet das Einführungs-Intro und leitet nach einer Verzögerung auf die Login-Seite weiter.
 */
function startIntro() {
  setTimeout(() => {
    showLogin();
  }, 1500);
};

/**
 * Aktualisiert die aktive Navigation basierend auf der aktuellen Seite.
 */
function updateActiveNav() {
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.sidebarNavBtn');

  navLinks.forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    const listItem = link.querySelector('li');
    if (currentPage === href) {
      listItem.classList.add('active');
    } else {
      listItem.classList.remove('active');
    }
  });
}

/**
 * Inhalte laden
 */
document.addEventListener("DOMContentLoaded", includeHTML);

/**
 * Lädt die Login-Seite.
 */
function showLogin() {
  window.location.href = './html/login.html';
}

/**
 * Loggt den Benutzer aus, entfernt lokale Speicherwerte und leitet zur Startseite weiter.
 */
function logOut() {
  localStorage.removeItem('email');
  localStorage.removeItem('password');
  localStorage.removeItem('sessionKey');
  window.location.href = '../index.html';
}

/**
 * Setzt die Priorität eines Tasks und markiert den entsprechenden Button.
 * @param {string} priority - Die gewählte Priorität.
 */
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

/**
 * Berechnet eine hexadezimale Farbe basierend auf Vor- und Nachname.
 * @param {string} vorname - Der Vorname.
 * @param {string} nachname - Der Nachname.
 * @returns {string} Die berechnete Hex-Farbe.
 */
function getColorHex(vorname, nachname) {
  let completeName = (vorname + nachname).toLowerCase();
  let hash = 0;

  for (let i = 0; i < completeName.length; i++) {
    hash += completeName.charCodeAt(i);
  }

  let r = (hash * 123) % 256;
  let g = (hash * 456) % 256;
  let b = (hash * 789) % 256;

  let hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  return hexColor;
}

/**
 * Schaltet das Dropdown-Menü für die Anzeige ein oder aus.
 */
function toggleShowMenu() {
  const dropdownMenu = document.getElementById('dropdownMenu');
  if (dropdownMenu.classList.contains('active')) {
    dropdownMenu.classList.remove('active');
  } else {
    dropdownMenu.classList.add('active');
  }

}

/**
 * Schließt das Dropdown-Menü.
 */
function closeShowMenu() {
  const dropdownMenu = document.getElementById('dropdownMenu');
  dropdownMenu.classList.remove('active');
}

/**
 * Zeigt eine Snackbar mit einer Nachricht an.
 * @param {string} message - Die anzuzeigende Nachricht.
 */
function showSnackbar(message) {
  let snackbar = document.getElementById('snackbar');
  snackbar.textContent = message;
  snackbar.classList.remove('hidden');
  snackbar.classList.add('visible');
  setTimeout(() => {
    snackbar.classList.remove('visible');
    snackbar.classList.add('hidden');
  }, 3000);
}