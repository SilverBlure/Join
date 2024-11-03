document.addEventListener('DOMContentLoaded', function () {
    const prioButtons = document.querySelectorAll('.prio-button');
    prioButtons.forEach(button => {
        button.addEventListener('click', function () {
            prioButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
});