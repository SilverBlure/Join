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
                        <p class="ContactUserTag">${contacts[i].firstName.slice(0, 1)}${contacts[i].lastName.slice(0, 1)}</p>
                    </div>
                    <div>
                        <p>${contacts[i].firstName} ${contacts[i].lastName}</p>
                        <a href="mailto:${contacts[i].email}"><p>${contacts[i].email}</p></a>
                    </div>
                </div>
            </div>`;
}


function ContactDetailsTemps(i) {
    return `<div class="InfoBoxHead">
    <div><p class="userTagBig">${contacts[i].firstName.slice(0, 1)}${contacts[i].lastName.slice(0, 1)}</p></div>
    <div>
        <div><H2>${contacts[i].firstName} ${contacts[i].lastName}</H2></div>
        <div><a href=""><img src="../assets/icons/png/edit.png" alt=""></a><a href=""><img src="../assets/icons/png/Delete contact.png" alt=""></a></div>
    </div>
    </div>
    <h4>Contact Information</h4>
    <div>
        <div><b>Email</b><br><a href="mailto:"${contacts[i].email}">${contacts[i].email}</a></div>
        <div><b>Phone</b><br>${contacts[i].phone}</div>
    </div> `;
}