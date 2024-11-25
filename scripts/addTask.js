<<<<<<< HEAD
// Beispielbenutzerstruktur
let users = [
    {
        id: '1',
        name: 'Stanislav',
        email: 'stanislav1994@live.de',
        password: '111',
        tasks: [
            {
                id: 'todo',
                name: 'To Do',
                task: [
                    {
                        id: 1,
                        title: 'Gießen',
                        description: '300ml Wasser gießen',
                        workers: [
                            { name: 'Stanislav Levin', class: 'worker-stanislav' },
                            { name: 'Ozan Orhan', class: 'worker-ozan' }
                        ],
                        due_Date: '2025-01-01',
                        priority: 'Middle',
                        category: { name: 'Technical Task', class: 'categoryTechnicalTask' },
                        subtasks: [
                            { todo: 'Wasser abstehen lassen' },
                            { todo: 'Dünger hinzugeben' },
                            { todo: 'PH Wert anpassen' },
                            { todo: 'im Ring gießen' }
                        ]
                    }
                ]
            },
            {
                id: 'done',
                name: 'Done',
                task: []
            }
        ]
    }
];

// Aktueller Benutzer
let currentUser = users.find(user => user.id === '1');

// Standardmäßig auf "To-Do"-Liste setzen
let currentListId = 'todo';

/**
 * Task zu einer Liste hinzufügen
 */
function addTaskToList(event) {
    if (event) event.preventDefault();

    // Überprüfen, ob ein Benutzer angemeldet ist
    if (!currentUser) {
        console.error('Kein Benutzer ist angemeldet!');
        return;
    }

    // Aufgabenliste finden
    const targetList = currentUser.tasks.find(list => list.id === currentListId);
    if (!targetList) {
        console.error(`Liste mit ID "${currentListId}" nicht gefunden.`);
        return;
    }

    // Formulardaten erfassen
    const title = document.getElementById('title').value.trim();
    const dueDate = document.getElementById('date').value;
    const category = document.getElementById('category').value;

    // Validierung
    if (!title || !dueDate || !category) {
        alert('Alle Pflichtfelder müssen ausgefüllt werden!');
        return;
    }

    // Neues Task-Objekt erstellen
    const newTask = {
        id: Date.now(), // Automatisch generierte ID
        title: title,
        description: document.getElementById('description').value.trim(),
        workers: [{ name: 'Default Worker', class: 'worker-default' }],
        due_Date: dueDate,
        priority: tempPriority || 'Low', // Standard-Priorität verwenden
        category: { name: category, class: `category${category.replace(' ', '')}` },
        subtasks: Array.from(document.querySelectorAll('.addSubTaskInput'))
            .map(input => ({ todo: input.value.trim() }))
            .filter(st => st.todo) // Nur gültige Subtasks hinzufügen
    };

    // Task zur Ziel-Liste hinzufügen
    targetList.task.push(newTask);

    // Formular zurücksetzen
    document.getElementById('addTaskFormTask').reset();
    tempPriority = null; // Temporäre Priorität zurücksetzen

    console.log(`Task erfolgreich zu Liste "${currentListId}" hinzugefügt:`, newTask);
}

/**
 * Priorität setzen
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
 * Subtask hinzufügen
 */
function addNewSubtask(taskId) {
    if (!currentUser) {
        console.error('Kein Benutzer ist angemeldet!');
        return;
    }

    // Task finden
    const task = currentUser.tasks.flatMap(list => list.task).find(t => t.id === taskId);
    const newSubtaskInput = document.getElementById('newSubtaskInput');

    // Subtask hinzufügen
    if (task && newSubtaskInput && newSubtaskInput.value.trim() !== '') {
        task.subtasks.push({ todo: newSubtaskInput.value.trim() });
        newSubtaskInput.value = '';
        console.log(`Subtask zu Task ${taskId} hinzugefügt.`);
    } else {
        console.error("Fehler beim Hinzufügen des Subtasks oder Eingabe ist leer.");
=======
let subtaskCounter = 0;
let assignedContacts = [];
let sub;

async function onloadFunction() {
    includeHTML();
    await loadSpecificUserDataFromLocalStorage();
    await displayNamesOfContacts();
    showLoggedUserInitials();
    changeBgColorMenu();
}

/**
 * This function checks whether the entries have been entered correctly before adding a new task
 */
function validateAndAddTask() {
    const taskTitle = document.getElementById('taskTitle');
    const date = document.getElementById('date');
    const categoryContainer = document.getElementById('selectCategoryContainer');
    const category = document.getElementById('selectCategory');
    let titleChosen = document.getElementById('corectTitle');
    let dateChosen = document.getElementById('corectDate');
    let categoryChosen = document.getElementById('corectCategory');
    
    // Reset styles and error messages
    taskTitle.style.borderColor = '';
    date.style.borderColor = '';
    categoryContainer.style.borderColor = '';
    titleChosen.textContent = '';
    dateChosen.textContent = '';
    categoryChosen.textContent = '';
    
    let isValid = true;
    
    // Validation checks
    if (taskTitle.value.trim().length < 4) {
        taskTitle.style.borderColor = 'red';
        titleChosen.textContent = 'Title must be at least 4 characters.';
        titleChosen.style.color = 'red';
        isValid = false;
    }
    if (!date.value) {
        date.style.borderColor = 'red';
        dateChosen.textContent = 'Please select a valid date.';
        dateChosen.style.color = 'red';
        isValid = false;
    }
    if (category.textContent === 'Select task category') {
        categoryContainer.style.borderColor = 'red';
        categoryChosen.textContent = 'Please select a task category.';
        categoryChosen.style.color = 'red';
        isValid = false;
    }
    
    if (isValid) {
        addTask();
>>>>>>> c32cf52c266df74e03e866ad4be3b9746f4305dc
    }
}

/**
 * This function checks if something was entered into the input field to show or hide buttons
 */
function onInputChange() {
    let subtaskImg = document.getElementById('plusImg');
    let subtaskButtons = document.getElementById('closeOrAccept');
    let inputField = document.getElementById('inputFieldSubtask');
    
    if (inputField.value.length > 0) {
        subtaskImg.style.display = 'none';
        subtaskButtons.style.display = 'flex';
    } else {
        subtaskImg.style.display = 'flex';
        subtaskButtons.style.display = 'none';
    }
}

/**
 * This function clears all inputs on AddTask
 */
function removeAllInput() {
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDescription").value = "";
    document.getElementById("selectContact").textContent = "Search Contact";
    document.getElementById("contactsDisplayBubble").innerHTML = "";
    document.getElementById("date").value = "";

    // Reset priority buttons
    const priorityButtons = document.querySelectorAll(".button-prio");
    priorityButtons.forEach(button => {
        button.classList.remove("mediumSelected", "lowSelected", "urgentSelected");
    });
    document.getElementById("mediumButton").classList.add("mediumSelected");

    document.getElementById("selectCategory").textContent = "Select task category";
    document.getElementById("inputFieldSubtask").value = "";
    document.getElementById("subtasksContainer").innerHTML = "";

    // Reset contact checkboxes
    const checkboxes = document.querySelectorAll('.assign-contact-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    const contacts = document.querySelectorAll("[id^='contactToChose']");
    contacts.forEach(contact => {
        contact.style.backgroundColor = "";
        contact.style.color = "";
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('lowButton').onclick = function () { changeColor(this); };
    document.getElementById('mediumButton').onclick = function () { changeColor(this); };
    document.getElementById('urgentButton').onclick = function () { changeColor(this); };
});

/**
 * This function changes the color of priority buttons and saves the selected priority
 */
function changeColor(clickedButton) {
    let mediumButton = document.getElementById('mediumButton');
    mediumButton.classList.remove('orange-background');
    
    const buttons = [
        { element: document.getElementById('lowButton'), class: 'lowSelected' },
        { element: document.getElementById('mediumButton'), class: 'mediumSelected' },
        { element: document.getElementById('urgentButton'), class: 'urgentSelected' }
    ];
    
    buttons.forEach(button => {
        button.element.classList.toggle(button.class, button.element === clickedButton);
        if (button.element !== clickedButton) {
            button.element.classList.remove(button.class);
        }
    });
}

/**
 * This function adds click event listeners to each option on dropdown menus
 * 
 * @param {element} options 
 * @param {element} select 
 * @param {element} caret 
 * @param {element} menu 
 * @param {element} selected 
 */
function addOptionListeners(options, select, caret, menu, selected) {
    options.forEach(option => {
        option.addEventListener('click', () => {
            selected.innerText = option.innerText;
            select.classList.remove('selectClicked');
            caret.classList.remove('createRotate');
            menu.classList.remove('menu-open');
            options.forEach(opt => {
                opt.classList.remove('active');
            });
            option.classList.add('active');
        });
    });
}

/**
 * Initialize all dropdown menus on load
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropDowns = document.querySelectorAll('.drop-down');
    dropDowns.forEach(dropDown => {
        const select = dropDown.querySelector('.select');
        const caret = dropDown.querySelector('.caret');
        const menu = dropDown.querySelector('.menu');
        const options = dropDown.querySelectorAll('.menu li');
        const selected = dropDown.querySelector('.selected');
        
        select.addEventListener('click', (event) => {
            event.stopPropagation();
            select.classList.toggle('selectClicked');
            caret.classList.toggle('createRotate');
            menu.classList.toggle('menu-open');
        });
        
        addOptionListeners(options, select, caret, menu, selected);
        
        document.addEventListener('click', (event) => {
            if (!dropDown.contains(event.target)) {
                select.classList.remove('selectClicked');
                caret.classList.remove('createRotate');
                menu.classList.remove('menu-open');
            }
        });
    });
});

/**
 * This function resets the form so the user can create a new task
 * 
 * @param {object} assignedContactsContainer 
 * @param {number} date 
 * @param {string} subtasksContainer 
 */
function resetForm(assignedContactsContainer, date, subtasksContainer) {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    assignedContactsContainer.innerHTML = '';
    date.value = '';
    subtasksContainer.innerHTML = '';
    
    localStorage.removeItem('dragCategory');
    localStorage.removeItem('subtasks');
    localStorage.removeItem('lastClickedButton');
}

/**
 * This function shows a confirmation that the task has been created
 */
function showConfirmationTask() {
    let addedToBoard = document.getElementById('addedToBoard');
    addedToBoard.classList.remove('d-none');
    setTimeout(() => {
        addedToBoard.classList.add('d-none');
        window.location.href = 'board.html';
    }, 1500);
}

/**
 * This function allows saving the input from the subtask using the enter key
 */
const subtaskInput = document.getElementById('inputFieldSubtask');
subtaskInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        addSubtask();
    }
});

/**
 * This function generates the current day
 * 
 * @returns {string} current day in yyyy-mm-dd format
 */
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    dateInput.setAttribute('min', getTodayDate());
});
