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
  localStorage.removeItem('sessionKey');
  window.location.href = '../index.html';
}





async function toggleSubtaskStatus(listId, taskId, subtaskId, isChecked) {
  console.log("toggleSubtaskStatus aufgerufen mit:", { listId, taskId, subtaskId, isChecked });

  if (!listId || !taskId || !subtaskId) {
      console.error("Ungültige Parameter übergeben:", { listId, taskId, subtaskId });
      return;
  }

  try {
      // 1. Task von Firebase abrufen
      const taskUrl = `${BASE_URL}data/user/${ID}/user/tasks/${listId}/task/${taskId}.json`;
      const response = await fetch(taskUrl);

      if (!response.ok) {
          console.error(`Fehler beim Abrufen des Tasks ${taskId} aus Liste ${listId}: ${response.status}`);
          return;
      }

      const task = await response.json();
      if (!task || !task.subtasks || !task.subtasks[subtaskId]) {
          console.error(`Subtask mit ID '${subtaskId}' nicht gefunden (Task ID: ${taskId}, Liste: ${listId}).`);
          return;
      }

      // 2. Subtask-Status aktualisieren
      const subtaskKey = Object.keys(task.subtasks)[subtaskIndex];
      const subtask = task.subtasks[subtaskKey];
            if (isChecked) {
          subtask.done = subtask.todo; // Markiere als erledigt
          delete subtask.todo; // Entferne das `todo`-Feld
      } else {
          subtask.todo = subtask.done; // Setze zurück auf `todo`
          delete subtask.done; // Entferne das `done`-Feld
      }

      // 3. Aktualisierten Task in Firebase speichern
      const updateResponse = await fetch(taskUrl, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(task),
      });

      if (!updateResponse.ok) {
          console.error(`Fehler beim Aktualisieren des Subtasks: ${updateResponse.statusText}`);
          return;
      }

      console.log("Subtask erfolgreich aktualisiert:", subtask);

      // 4. Darstellung aktualisieren
      await renderBoard(); // Board neu rendern
      await openTaskPopup(taskId, listId); // Popup aktualisieren
  } catch (error) {
      console.error("Fehler beim Umschalten des Subtask-Status:", error);
  }
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