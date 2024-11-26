function renderCurrentLetter(currentLetter) {
    return `<div>
    <div class="separator">${currentLetter}</div>
        <div class="contact-group" id="group-${currentLetter}"></div>
    </div>`;

}


function contactTemps(i, initialien) {
    return `<div class="contact">
                <div class="shortInfo" onclick="renderContactDetails(${i})">
                    <div class="tag">
                        <p class="ContactUserTag">${initialien}</p>
                    </div>
                    <div>
                        <p>${contactsArray[i].name}</p>
                        <a class="mailTo" href="mailto:${contactsArray[i].email}"><p>${contactsArray[i].email}</p></a>
                    </div>
                </div>
            </div>`;
}


function contactDetailsTemps(i, initialien) {
    return `<div class="InfoBoxHead">
<div><p class="userTagBig">${initialien}</p></div>
    <div>
        <div><H2>${contactsArray[i].name}</H2></div>
        <img class="pointer" onclick="editContact(${i})" src="../assets/icons/png/edit.png" alt=""><img class="pointer" onclick="deleteContact(${i})" src="../assets/icons/png/Delete contact.png" alt="">
    </div>
    </div>
    <h4>Contact Information</h4>
    <div>
        <div class="email"><b>Email</b><br><a class="mailTo" href="mailto:"${contactsArray[i].email}">${contactsArray[i].email}</a></div>
        <div class="phone"><b>Phone</b><br>${contactsArray[i].phone}</div>
    </div> `;
}

function addContactTemp(){
    return `
    <div>
        <img src="../assets/icons/png/userpic_leer.png" alt="">
    </div>
    <div class="createContact">
    <div class="closeBtn">
        <img class="close" onclick="closeAddContact()" src="../assets/icons/png/iconoir_cancel.png" alt="">
    </div>
    <div>
    <form class="contacInput" id="contactForm">
        <div class="inputBorder">
            <innerInputfield class="innerInputfield">
                <input class="noBorder" id="name" placeholder="Name" required>
                <img src="../../assets/icons/png/person.png">
            </innerInputfield>
        </div>
    
        <div class="inputBorder">
            <innerInputfield class="innerInputfield">
                <input id="email" type="email" class="noBorder" placeholder="Email" required>
                <img src="../../assets/icons/svg/mail.svg">
            </innerInputfield>
        </div>
    
        <div class="inputBorder">
            <innerInputfield class="innerInputfield">
                <input id="phone" type="number" class="noBorder" placeholder="phone" required>
                <img src="../assets/icons/png/call.png">
            </innerInputfield>
        </div>
    </form>
    </div>
    <div class="createContactBtn">
        <button onclick="closeAddContact()">cancel</button><button onclick="createContact()">create contact <img src="../assets/icons/png/check.png"></button>
    </div>
</div>
`;
}

function editContactTemp(i){
    return `
    <div>
        <img src="../assets/icons/png/userpic_leer.png" alt="">
    </div>
    <div class="createContact">
    <div class="closeBtn">
        <img class="close" onclick="closeAddContact()" src="../assets/icons/png/iconoir_cancel.png" alt="">
    </div>
    <div>
    <form class="contacInput" id="contactForm">
        <div class="inputBorder">
            <innerInputfield class="innerInputfield">
                <input class="noBorder" id="name" placeholder="Name" required>
                <img src="../../assets/icons/png/person.png">
            </innerInputfield>
        </div>
    
        <div class="inputBorder">
            <innerInputfield class="innerInputfield">
                <input id="email" type="email" class="noBorder" placeholder="Email" required>
                <img src="../../assets/icons/svg/mail.svg">
            </innerInputfield>
        </div>
    
        <div class="inputBorder">
            <innerInputfield class="innerInputfield">
                <input id="phone" type="number" class="noBorder" placeholder="phone" required>
                <img src="../assets/icons/png/call.png">
            </innerInputfield>
        </div>
    </form>
    </div>
    <div class="createContactBtn">
        <button onclick="closeAddContact()">cancel</button><button onclick="getFromEdit(${i})">edit contact <img src="../assets/icons/png/check.png"></button>
    </div>
</div>
`;
}

function deleteContactTemp(i){
    return `<div class="deleteDialog"><div>Do you really want to delete the contact?</div>
    <div class="deleteBtn"><button onclick="closeAddContact()">cancel</button><button onclick="deleteContactDatabase(${i})">delete Contact</button></div></div>
    `
}