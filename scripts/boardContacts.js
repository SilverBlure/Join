let dropdownOpen = false;

let selectedContacts = [];

/**
 * Schließt das Dropdown-Menü der Kontakte.
 */
function closeContactsDropdown() {
    const dropdownList = document.getElementById("contactsDropdownList");
      dropdownList.classList.remove("open");
}

/**
 * Öffnet oder schließt das Dropdown-Menü der Kontakte.
 * Rendert die Dropdown-Inhalte neu, wenn es geöffnet wird.
 */
function toggleContactsDropdown() {
  const dropdownList = document.getElementById("contactsDropdownList");
  dropdownOpen = !dropdownOpen;
  if (dropdownOpen) {
    renderContactsDropdown();
    dropdownList.classList.add("open");
  } else {
    dropdownList.classList.remove("open");
  }
}

/**
 * Rendert die Kontakte im Dropdown-Menü.
 * Zeigt eine Nachricht an, wenn keine Kontakte verfügbar sind.
 */
function renderContactsDropdown() {
    const dropdownList = document.getElementById("contactsDropdownList");
    dropdownList.innerHTML = "";
    if (!contactsArray || contactsArray.length === 0) {
        dropdownList.innerHTML = "<li>Keine Kontakte verfügbar</li>";
        return;
    }
    contactsArray.forEach((contact) => {
        const li = document.createElement("li");
        li.classList.add("dropdown-item"); 
        if (isContactSelected(contact.name)) {
            li.classList.add("selected-contact-item"); 
        }
        const [vorname, nachname] = contact.name.split(" ");
        const backgroundColor = getColorHex(vorname?.toLowerCase() || "", nachname?.toLowerCase() || "");
        const workerEmblem = document.createElement("p");
        workerEmblem.classList.add("workerEmblemList");
        workerEmblem.style.backgroundColor = backgroundColor; 
        workerEmblem.textContent = getInitials(contact.name); 
        const nameSpan = document.createElement("span");
        nameSpan.classList.add("contact-nameList");
        nameSpan.textContent = contact.name;
        const img = document.createElement("img");
        img.classList.add("status-icon");
        img.src = isContactSelected(contact.name)
            ? "./../assets/icons/png/checkButtonContacts.png" 
            : "./../assets/icons/png/checkButtonEmpty.png"; 
        img.alt = isContactSelected(contact.name) ? "Selected" : "Not Selected";
        img.style.cursor = "pointer";
        li.addEventListener("click", () => {
            const isSelected = isContactSelected(contact.name);
            handleContactSelection(contact, !isSelected);
            if (!isSelected) {
                li.classList.add("selected-contact-item");
            } else {
                li.classList.remove("selected-contact-item");
            }
            img.src = !isSelected
                ? "./../assets/icons/png/checkButtonContacts.png"
                : "./../assets/icons/png/checkButtonEmpty.png";
            img.alt = !isSelected ? "Selected" : "Not Selected";
        });
        li.appendChild(workerEmblem);
        li.appendChild(nameSpan);
        li.appendChild(img);
        dropdownList.appendChild(li);
    });
}

/**
 * Überprüft, ob ein Kontakt in den lokal gespeicherten Kontakten ausgewählt ist.
 *
 * @param {string} contactName - Der Name des zu überprüfenden Kontakts.
 * @returns {boolean} - True, wenn der Kontakt ausgewählt ist, sonst False.
 */
function isContactSelected(contactName) {
    return Object.values(window.localContacts || {}).some(contact => contact.name === contactName);
}

/**
 * Initialisiert die lokalen Kontakte basierend auf einem gegebenen Task.
 * Speichert die Worker des Tasks lokal und rendert die ausgewählten Kontakte.
 *
 * @param {Object} task - Der Task, aus dem die Kontakte extrahiert werden.
 * @param {Array} [task.workers] - Eine Liste von Workern, die dem Task zugeordnet sind.
 */
function initializeLocalContacts(task) {
    if (!task || !Array.isArray(task.workers)) {
        window.localContacts = {};
        return;
    }
    window.localContacts = task.workers.reduce((acc, worker) => {
        acc[worker.id] = { id: worker.id, name: worker.name };
        return acc;
    }, {});
    selectedContacts = Object.values(window.localContacts);
    renderSelectedContacts();
    updateDropdownLabel();
}

/**
 * Synchronisiert die Checkboxen im Dropdown mit den lokal bearbeiteten Kontakten.
 * Stellt sicher, dass ausgewählte Kontakte visuell und logisch korrekt dargestellt werden.
 */
function synchronizeContactCheckboxes() {
    if (!contactsArray || !Array.isArray(contactsArray)) {
        return;
    }
    if (!Array.isArray(window.localEditedContacts)) {
        window.localEditedContacts = [];
    }
    contactsArray.forEach(contact => {
        const checkbox = document.querySelector(`#contactsDropdownList input[value="${contact.name}"]`);
        if (checkbox) {
            checkbox.checked = !!window.localEditedContacts.find(
                editedContact => editedContact.name === contact.name
            );
        }
    });
  
}

/**
 * Aktualisiert die lokal gespeicherten Kontakte basierend auf den Status der Checkboxen.
 * Fügt neue Kontakte hinzu oder entfernt nicht mehr ausgewählte Kontakte.
 */
function updateLocalContactsFromCheckboxes() {
    const checkboxes = document.querySelectorAll('#contactsDropdownList input[type="checkbox"]');
    if (!window.localContacts) {
        window.localContacts = {};
    }
    checkboxes.forEach(checkbox => {
        const contactName = checkbox.value;
        const isChecked = checkbox.checked;
        const existingContact = contactsArray.find(contact => contact.name === contactName);
        if (isChecked) {
            if (!Object.values(window.localContacts).some(contact => contact.name === contactName)) {
                window.localContacts[`contact_${Date.now()}`] = {
                    name: contactName,
                    id: existingContact?.id || `contact_${Date.now()}`, // ID aus vorhandenen Daten oder generieren
                };
            }
        } else {
            const contactKey = Object.keys(window.localContacts).find(
                key => window.localContacts[key].name === contactName
            );
            if (contactKey) {
                delete window.localContacts[contactKey];
            }
        }
    });
}

/**
 * Schließt das Dropdown-Menü für Kontakte, wenn ein Klick außerhalb des Dropdowns,
 * der Kontakt-Erstellungsleiste oder der Liste ausgewählter Kontakte erfolgt.
 *
 * @param {MouseEvent} event - Das Maus-Event, das den Listener auslöst.
 */
document.addEventListener("mousedown", function (event) {
    const dropdownList = document.getElementById("contactsDropdownList");
    const createContactBar = document.querySelector(".createContactBar");
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (!dropdownList || !createContactBar || !selectedContactsList) {
        return;
    }
    const clickedInsideDropdown = dropdownList.contains(event.target);
    const clickedInsideCreateBar = createContactBar.contains(event.target);
    const clickedInsideSelectedContacts = selectedContactsList.contains(event.target);
    if (!clickedInsideDropdown && !clickedInsideCreateBar && !clickedInsideSelectedContacts) {
        dropdownList.classList.remove("open");
        dropdownOpen = false;
    }
});

/**
 * Verarbeitet die Auswahl oder Deselektion eines Kontakts.
 * Aktualisiert die Liste der ausgewählten Kontakte und rendert sie neu.
 *
 * @param {Object} contact - Der Kontakt, der ausgewählt oder abgewählt wird.
 * @param {boolean} isChecked - True, wenn der Kontakt ausgewählt wird, sonst False.
 */
function handleContactSelection(contact, isChecked) {
    if (!window.localContacts) {
        window.localContacts = {}; 
    }
    const selectedContactsList = document.getElementById("selectedContactsList");
    if (!selectedContactsList) return;

    if (isChecked) {
        if (!isContactSelected(contact.name)) {
            selectedContacts.push(contact);
            window.localContacts[contact.id] = contact; 
        }
    } else {
        removeContact(contact);
    }
    renderSelectedContacts();
    updateDropdownLabel();
}

/**
 * Entfernt einen Kontakt aus der Liste der ausgewählten Kontakte.
 * Löscht den Kontakt aus dem lokalen Zustand und aktualisiert die Anzeige.
 *
 * @param {Object} contact - Der Kontakt, der entfernt werden soll.
 */
function removeContact(contact) {
    selectedContacts = selectedContacts.filter(selected => selected.id !== contact.id);
    delete window.localContacts[contact.id];
    const selectedContactItem = document.getElementById(`selected_${contact.id}`);
    if (selectedContactItem) {
        selectedContactItem.remove();
    }
    updateDropdownLabel();
}

/**
 * Aktualisiert die Beschriftung des Dropdown-Menüs basierend auf der Anzahl der ausgewählten Kontakte.
 */
function updateDropdownLabel() {
    const dropdownLabel = document.getElementById("dropdownLabel");
    if (!dropdownLabel) {
        return;
    }
    if (selectedContacts.length === 0) {
        dropdownLabel.textContent = "Wähle einen Kontakt aus";
    } else {
        dropdownLabel.textContent = `${selectedContacts.length} Kontakt(e) ausgewählt`;
    }
}