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
