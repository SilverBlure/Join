function renderDashboard() {
     renderToDoTasks();
     renderDoneTasks();
     renderUrgentTasks();
     renderAllTasks();
     renderInProgressTasks();
     renderAwaitingFeedbackTasks();
}


function renderToDoTasks() {
    const toDoTasks = tasks.find(list => list.id === 'todo').task.length;
    document.getElementById('toDoTasks').textContent = toDoTasks;
}


function renderDoneTasks() {
    const doneTasks = tasks.find(list => list.id === 'done').task.length;
    document.getElementById('doneTasks').textContent = doneTasks;
}


function renderUrgentTasks() {
    const urgentTasks = tasks.reduce((count, list) => 
        count + list.task.filter(task => task.priority === 'Urgent').length
    , 0);
    document.getElementById('urgentTasks').textContent = urgentTasks;
}


function renderAllTasks() {
    const allTasks = tasks.reduce((count, list) => count + list.task.length, 0);
    document.getElementById('allTasks').textContent = allTasks;
}


function renderInProgressTasks() {
    const inProgressTasks = tasks.find(list => list.id === 'inProgress').task.length;
    document.getElementById('inProgressTasks').textContent = inProgressTasks;
}


function renderAwaitingFeedbackTasks() {
    const awaitingFeedbackTasks = tasks.find(list => list.id === 'awaitFeedback').task.length;
    document.getElementById('awaitFeddbackTasks').textContent = awaitingFeedbackTasks;
}


function getNextDueDate() {
    const today = new Date(); 
    let closestDate = null;

    tasks.forEach(list => {
        list.task.forEach(task => {
            const taskDate = new Date(task.due_Date); 

            if (taskDate > today && (!closestDate || taskDate < closestDate)) {
                closestDate = taskDate;
            }
        });
    });

    if (closestDate) {
        const formattedDate = closestDate.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
        document.getElementById('nextDueDate').innerHTML = formattedDate;
    } else {
        document.getElementById('nextDueDate').innerHTML = "Kein zukünftiges Datum gefunden";
    }
}



function setGreeting() {
    const greetingElement = document.getElementById('greeting');
    const currentHour = new Date().getHours();
    let greetingText;

    if (currentHour < 12) {
        greetingText = "Good Morning,";
    } else if (currentHour < 18) {
        greetingText = "Good Afternoon,";
    } else {
        greetingText = "Good Evening,";
    }
    greetingElement.textContent = greetingText;
}



//----------------------------------------------------------------------------------------

async function init(){
    console.log(sessionId);
}