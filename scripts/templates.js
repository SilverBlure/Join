/**
 * Generiert das HTML für die Anzeige des aktuellen Buchstabens und einer zugehörigen Kontaktgruppe.
 * @param {string} currentLetter - Der aktuelle Buchstabe.
 * @returns {string} Das HTML-Template für den Buchstaben-Separator und die Kontaktgruppe.
 */
function renderCurrentLetter(currentLetter) {
  return `<div>
    <div class="separator">${currentLetter}</div>
        <div class="contact-group" id="group-${currentLetter}"></div>
    </div>`;
}

/**
 * Generiert das HTML für einen einzelnen Kontakt in der Kontaktliste.
 * @param {number} i - Der Index des Kontakts in contactsArray.
 * @param {string} initialien - Die Initialen des Kontakts.
 * @returns {string} Das HTML-Template für den Kontakt.
 */
function contactTemps(i, initialien) {
  return /*html*/ `<div class="contact">
                <div id="shortInfo${i}" class="shortInfo" onclick="renderContactDetails(${i})">
                    <div class="tag">
                        <p id="userTag${i}" class="contactUserTag">${initialien}</p>
                    </div>
                    <div class="contactInList">
                        <p class="contactName">${contactsArray[i].name}</p>
                        <a class="mailTo contactMail" onclick="return false;" href="mailto:${contactsArray[i].email}"><p>${contactsArray[i].email}</p></a>
                    </div>
                </div>
            </div>`;
}

/**
 * Generiert das HTML für die Detailansicht eines Kontakts.
 * @param {number} i - Der Index des Kontakts in contactsArray.
 * @param {string} initialien - Die Initialen des Kontakts.
 * @returns {string} Das HTML-Template für die Kontakt-Details.
 */
function contactDetailsTemps(i, initialien) {
  return /*html*/ `<div class="InfoBoxHead">
<div><p id="userTagBig${i}" class="userTagBig">${initialien}</p></div>
    <div>
        <div><H2>${contactsArray[i].name}</H2></div>
       <div class="detailsBtn"><img class="pointer edit"  onclick="editContact(${i}, '${initialien}')" src="../assets/icons/png/edit.png" alt="">
       <img class="pointer delete" onclick="openDeleteContact(${i})" src="../assets/icons/png/Delete contact.png" alt="">
       </div>
    </div>
    </div>
    <h4>Contact Information</h4>
    <div>
        <div class="email"><b>Email</b><br><a class="mailTo" href="mailto:"${contactsArray[i].email}">${contactsArray[i].email}</a></div>
        <div class="phone"><b>Phone</b><br>${contactsArray[i].phone}</div>
    </div> `;
}

/**
 * Generiert das HTML für das Hinzufügen eines neuen Kontakts.
 * @returns {string} Das HTML-Template für das Hinzufügen eines Kontakts.
 */
function addContactTemp() {
  return /*html*/ `
    <div class="newContactEmblem">
        <img class="userImg" src="../assets/icons/png/userpic_leer.png" alt="">
    </div>
    <div class="createContact">
    <div class="closeBtn">
        <img class="close" onclick="closeAddContact()" src="../assets/icons/png/iconoir_cancel.png" alt="">
    </div>
    <div>
    <form class="contacInput" id="contactForm">
        <div class="inputBorder">
            <span class="innerInputfield">
                <input oninput="checkName()" class="noBorder inputNameImg" name="name" type="text" id="name" placeholder="Firstname Lastname" required>
            </span>
        </div>
    <div>
                            <p id="nameWarning" class="failtureText left hidden-text ">*Please insert first and last
                                name seperated
                            </p>
                        </div>
        <div class="inputBorder">
            <span class="innerInputfield">
                <input  oninput="emailCheck()" id="email" name="email" type="email" class="noBorder inputMailImg" placeholder="Email"  required>
            </span>
        </div>
    <div>
                            <p id="emailWarning" class="failtureText left hidden-text">*The email address you want to
                                use is
                                registered </p>
                        </div>
        <div class="inputBorder">
            <span class="innerInputfield">
                <input id="phone" name="phone" type="number" class="noBorder inputcallImg" placeholder="phone" required>
            </span>
        </div>
    </form>
    </div>
    <div class="createContactBtn">
        <button type="submit" class="dialogBtnWhite notOnMobile" onclick="closeAddContact()">Cancel<img class="cancel" src="../assets/icons/png/iconoir_cancel.png"></button>
        <button class="dialogBtn" type="submit" disabled form="contactForm">Create contact <img src="../assets/icons/png/check.png"></button>
    </div>
</div>
`;
}

/**
 * Generiert das HTML für die Bearbeitung eines vorhandenen Kontakts.
 * @param {number} i - Der Index des Kontakts in contactsArray.
 * @returns {string} Das HTML-Template für die Bearbeitung eines Kontakts.
 */
function editContactTemp(i) {
  return /*html*/ `
    <div id="contactEmblem">
    </div>
    <div class="createContact">
    <div class="closeBtn">
        <img class="close" onclick="closeAddContact()" src="../assets/icons/png/iconoir_cancel.png" alt="">
    </div>
    <div class="editInputDiv">
    <form class="contacInput" id="contactForm">
       <div class="inputBorder">
    <span class="innerInputfield">
        <input oninput="checkName()" class="noBorder inputNameImg" id="name" placeholder="Name" required>
    </span>

</div>
<div>
                            <p id="nameWarning" class="failtureText left hidden-text ">*Please insert first and last
                                name seperated
                            </p>
                        </div>

<div class="inputBorder">
    <span class="innerInputfield">
        <input oninput="emailCheck()"  id="email" type="email" class="noBorder inputMailImg" placeholder="Email" required>
    </span>
</div>
<div>
                            <p id="emailWarning" class="failtureText left hidden-text">*The email address you want to
                                use is
                                registered </p>
                        </div>
    
        <div class="inputBorder">
            <span class="innerInputfield">
                <input id="phone" type="number" class="noBorder inputcallImg" placeholder="phone" required>
            </span>
        </div>
    </form>
    </div>
    <div class="createContactBtn">
        <button class="dialogBtnWhite notOnMobile" onclick="closeAddContact()">cancel<img class="cancel" src="../assets/icons/png/iconoir_cancel.png"></button>
        <button class="dialogBtn" type="submit" disabled form="contactForm">Save<img src="../assets/icons/png/check.png"></button>
    </div>
</div>                      
`;
}

/**
 * Generiert das HTML für das Löschen eines Kontakts.
 * @param {number} i - Der Index des Kontakts in contactsArray.
 * @returns {string} Das HTML-Template für die Lösch-Bestätigung eines Kontakts.
 */
function deleteContactTemp(i) {
  return /*html*/ `<div class="deleteDialog"><div>Do you really want to delete the contact?</div>
    <div class="deleteBtn"><button class="dialogBtnWhite notOnMobile" onclick="closeAddContact()">cancel<img class="cancel" src="../assets/icons/png/iconoir_cancel.png"></button><button class="dialogBtn" onclick="deleteContactDatabase(${i})">delete Contact</button></div></div>
    `;
}

// addTask.js Templates

/**
 * Generiert das HTML für eine einzelne Subtask.
 * @param {string} subtaskId - Die ID der Subtask.
 * @param {string} title - Der Titel der Subtask.
 * @returns {string} Das HTML-Template für die Subtask.
 */
function generateSubtaskHTML(subtaskId, title) {
  return /*html*/ `
        <div class="subtask-item" id="${subtaskId}">
            <input type="checkbox" onchange="toggleLocalSubtaskStatus('${subtaskId}', this.checked)">
            <p class="subtaskText" onclick="editLocalSubtask('${subtaskId}')">${title}</p>
            <img src="./../assets/icons/png/iconoir_cancel.png" onclick="removeSubtaskFromList('${subtaskId}')" alt="Remove Subtask">
        </div>
    `;
}

/**
 * Generiert das HTML für ein einzelnes Kontakt-Element.
 * @param {string} contactId - Die ID des Kontakts.
 * @param {string} initials - Die Initialen des Kontakts.
 * @param {string} name - Der Name des Kontakts.
 * @param {string} color - Die Hintergrundfarbe des Kontakt-Emblems.
 * @returns {string} Das HTML-Template für das Kontakt-Element.
 */
function createContactItem(contactId, initials, name, color) {
  return /*html*/ `
        <div class="workerInformation">
            <p id="${contactId}" class="workerEmblem workerIcon" style="background-color: ${color};">
                ${initials}
            </p>
            <p class="workerName">${name}</p>
            <img src="./../assets/icons/png/iconoir_cancel.png" onclick="removeContact('${contactId}')" alt="Remove Contact">
        </div>
    `;
}