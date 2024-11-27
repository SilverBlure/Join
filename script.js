function includeHTML() {
    var z, i, elmnt, file, xhttp;
    
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
      elmnt = z[i];
      file = elmnt.getAttribute("w3-include-html");
      if (file) {
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4) {
            if (this.status == 200) {
              elmnt.innerHTML = this.responseText;
            }
            if (this.status == 404) {
              elmnt.innerHTML = "Page not found.";
            }
            elmnt.removeAttribute("w3-include-html");
            includeHTML();
          }
        };
        xhttp.open("GET", file, true);
        xhttp.send();
        return;
      }
    }
  }

  function startIntro() {
    setTimeout(() => {
        showLogin();
    }, 3000);
};

function showLogin() {
    window.location.href = './html/login.html'; 
}


function logOut() {
  localStorage.removeItem('email');
  localStorage.removeItem('password');
  window.location.href = '../index.html';
}


function toggleSubtaskStatus(taskId, subtaskIndex, isChecked) {
  const task = tasks.flatMap(list => list.task).find(t => t.id === taskId); // Finde die Aufgabe
  if (!task || !task.subtasks[subtaskIndex]) {
      console.error(`Task oder Subtask nicht gefunden (Task ID: ${taskId}, Subtask Index: ${subtaskIndex})`);
      return;
  }
  const subtask = task.subtasks[subtaskIndex];
  // Status des Subtasks ändern
  if (isChecked) {
      subtask.done = subtask.todo; // Markiere als erledigt
      delete subtask.todo; // Entferne das `todo`-Feld
  } else {
      subtask.todo = subtask.done; // Setze zurück auf `todo`
      delete subtask.done; // Entferne das `done`-Feld
  }
  // Aktualisiere die Darstellung des Subtasks
  const subtaskElement = document.querySelector(`#subtask-${taskId}-${subtaskIndex} .subtaskText`);
  if (subtaskElement) {
      subtaskElement.style.textDecoration = isChecked ? "line-through" : "none";
  }
  openTaskPopup(taskId); // Aktualisiere das Popup
  renderBoard(); // Aktualisiere das Board
}


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