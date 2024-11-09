function setPriority(priority) {
    const buttons = document.querySelectorAll('#prioUrgent, #prioMedium, #prioLow');

    buttons.forEach(button => {
        button.classList.remove('prioUrgentActive', 'prioMediumActive', 'prioLowActive');
    });

    if (priority === 'urgent') {
        document.getElementById('prioUrgent').classList.add('prioUrgentActive');
    } else if (priority === 'medium') {
        document.getElementById('prioMedium').classList.add('prioMediumActive');
    } else if (priority === 'low') {
        document.getElementById('prioLow').classList.add('prioLowActive');
    }
}
