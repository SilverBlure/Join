let defaultContacts=[
    {
    email : "info@adac.com",
    name : "ADAC Service",
    phone: "089558959697"
},


{
    name: 'DA Mentor',
    email: 'mentor@da.de',
    phone: '151207589589'
},

{
    name: 'Gast Account',
    email: 'Gast@join.com',
    phone: 'editMe'
},

{
    name: 'Kevin Fischer',
    email: 'kevin.fi92@gmail.com',
    phone: '234414112343421'
},

{
    name: 'Max Mustermann',
    email: 'mustermann@mail.com',
    phone: '298424824'
},

{
    name: 'Merle Musterfrau',
    email: 'mmusterfrau@gmail.com',
    phone: '1512075555'},

{
    name: 'Nicolai Österle',
    email: 'oesterle.ni@onlinehome.de',
    phone: '1766072226'
},

{
    name: 'Ozan Orhan',
    email: 'o&o@gmail.com',
    phone: '12345678'
},

{
    name: 'Peter Lustig',
    email: 'peter@loewenzahn.de',
    phone: '15120797589'},

{
    name: 'Stanislav Levin',
    email: 'Stani@gmail.com',
    phone: '12345678'
}
];

let defaultTasks=[];


async function guestProtocol(){                 //Wird in die GuestLogin funktion gesetzt
    
}

function resetGuestLogin(){

}

async function deleteGuestContacts(){
let userId = localStorage.getItem('sessionKey')

    await fetch(BASE_URL + 'data/user/' + userId + '/user/contacts' + '.json', {
        method: "DELETE",
    })
}

function pushContact(){

}

function pushtasks(){
    
}