function renderCurrentLetter(currentLetter) {
    return `<div>
    <div class="separator">${currentLetter}</div>
        <div class="contact-group" id="group-${currentLetter}"></div>
    </div>`;

}


function contactTemps(i, initialien) {
    return /*html*/ `<div class="contact">
                <div class="shortInfo" onclick="renderContactDetails(${i})">
                    <div class="tag">
                        <p id="userTag${i}" class="contactUserTag">${initialien}</p>
                    </div>
                    <div>
                        <p>${contactsArray[i].name}</p>
                        <a class="mailTo" href="mailto:${contactsArray[i].email}"><p>${contactsArray[i].email}</p></a>
                    </div>
                </div>
            </div>`;
}


function contactDetailsTemps(i, initialien) {
    return /*html*/`<div class="InfoBoxHead">
<div><p id="userTagBig${i}" class="userTagBig">${initialien}</p></div>
    <div>
        <div><H2>${contactsArray[i].name}</H2></div>
       <div class="detailsBtn"><img class="pointer edit" onclick="editContact(${i})" src="../assets/icons/png/edit.png" alt="">
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

function addContactTemp(){
    return /*html*/ `
    <div>
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
                <input class="noBorder" name="name" type="text" id="name" placeholder="Firstname Lastname" required>
                <img src="./../assets/icons/png/person.png">
            </span>
        </div>
    
        <div class="inputBorder">
            <span class="innerInputfield">
                <input id="email" name="email" type="email" class="noBorder" placeholder="Email"  required>
                <img src="./../assets/icons/svg/mail.svg">
            </span>
        </div>
    
        <div class="inputBorder">
            <span class="innerInputfield">
                <input id="phone" name="phone" type="number" class="noBorder" placeholder="phone" required>
                <img src="../assets/icons/png/call.png">
            </span>
        </div>
    </form>
    </div>
    <div class="createContactBtn">
        <button type="submit" class="dialogBtnWhite notOnMobile" onclick="closeAddContact()">Cancel<img class="cancel" src="../assets/icons/png/iconoir_cancel.png"></button>
        <button class="dialogBtn" type="submit" form="contactForm">Create contact <img src="../assets/icons/png/check.png"></button>
    </div>
</div>
`;
}

function editContactTemp(i){
    return /*html*/ `
    <div>
        <img class="editImg" src="../assets/icons/png/userpic_leer.png" alt="">
    </div>
    <div class="createContact">
    <div class="closeBtn">
        <img class="close" onclick="closeAddContact()" src="../assets/icons/png/iconoir_cancel.png" alt="">
    </div>
    <div>
    <form class="contacInput" id="contactForm">
        <div class="inputBorder">
            <span class="innerInputfield">
                <input class="noBorder" id="name" placeholder="Name" required>

                <img src="./../assets/icons/png/person.png">
            </span>
        </div>
    
        <div class="inputBorder">
            <span class="innerInputfield">
                <input id="email" type="email" class="noBorder" placeholder="Email" required>
                <img src="./../assets/icons/svg/mail.svg">
            </span>
        </div>
    
        <div class="inputBorder">
            <span class="innerInputfield">
                <input id="phone" type="number" class="noBorder" placeholder="phone" required>
                <img src="../assets/icons/png/call.png">
            </span>
        </div>
    </form>
    </div>
    <div class="createContactBtn">
        <button class="dialogBtnWhite notOnMobile" onclick="closeAddContact()">cancel<img class="cancel" src="../assets/icons/png/iconoir_cancel.png"></button>
        <button class="dialogBtn" type="submit" form="contactForm">Save<img src="../assets/icons/png/check.png"></button>
    </div>
</div>                      
`;
}

function deleteContactTemp(i){
    return /*html*/ `<div class="deleteDialog"><div>Do you really want to delete the contact?</div>
    <div class="deleteBtn"><button class="dialogBtnWhite notOnMobile" onclick="closeAddContact()">cancel<img class="cancel" src="../assets/icons/png/iconoir_cancel.png"></button><button class="dialogBtn" onclick="deleteContactDatabase(${i})">delete Contact</button></div></div>
    `
}




// addTask.js Templates

function generateSubtaskHTML(subtaskId, title) {
    return /*html*/`
        <div class="subtask-item" id="${subtaskId}">
            <input type="checkbox" onchange="toggleLocalSubtaskStatus('${subtaskId}', this.checked)">
            <p class="subtaskText" onclick="editLocalSubtask('${subtaskId}')">${title}</p>
            <img src="./../assets/icons/png/iconoir_cancel.png" onclick="removeSubtaskFromList('${subtaskId}')" alt="Remove Subtask">
        </div>
    `;
}



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