function renderCurrentLetter(currentLetter) {
    return `<div>
    <div class="separator">${currentLetter}</div>
        <div class="contact-group" id="group-${currentLetter}"></div>
    </div>`;

}


function contactTemps(i) {
    return `<div class="contact">
                <div class="shortInfo" onclick="renderContactDetails(${i})">
                    <div class="tag">
                        <p class="ContactUserTag">${contactsArray[i].name}</p>
                    </div>
                    <div>
                        <p>${contactsArray[i].name}</p>
                        <a href="mailto:${contactsArray[i].email}"><p>${contactsArray[i].email}</p></a>
                    </div>
                </div>
            </div>`;
}


function ContactDetailsTemps(i) {
    return `<div class="InfoBoxHead">
<div><p class="userTagBig">${contactsArray[i].name}</p></div>
    <div>
        <div><H2>${contactsArray[i].name}</H2></div>
        <img class="pointer" onclick="editContact(${i})" src="../assets/icons/png/edit.png" alt=""><img class="pointer" onclick="deleteContact(${i})" src="../assets/icons/png/Delete contact.png" alt="">
    </div>
    </div>
    <h4>Contact Information</h4>
    <div>
        <div><b>Email</b><br><a href="mailto:"${contactsArray[i].email}">${contactsArray[i].email}</a></div>
        <div><b>Phone</b><br>${contactsArray[i].phone}</div>
    </div> `;
}