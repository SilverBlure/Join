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
    setUserTag();
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

      // Subtask-Status aktualisieren
      task.subtasks[subtaskId].done = isChecked;

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

      console.log("Subtask erfolgreich aktualisiert:", task.subtasks[subtaskId]);

      // Nur das betroffene Task-Element aktualisieren
      await updateSingleTaskElement(listId, taskId, task);

      // Das Pop-up erneut mit aktualisierten Daten öffnen
      await openTaskPopup(taskId, listId);

  } catch (error) {
      console.error("Fehler beim Umschalten des Subtask-Status:", error);
  }
}



async function updateSingleTaskElement(listId, taskId, updatedTask) {
  const taskElement = document.getElementById(`boardCard-${taskId}`);
  const listContainer = document.getElementById(`${listId}List`)?.querySelector('.taskContainer');

  if (!taskElement || !listContainer) {
      console.error("Task-Element oder List-Container nicht gefunden:", { taskId, listId });
      return;
  }

  // Neues HTML für das Task-Element generieren
  const subtasks = updatedTask.subtasks ? Object.values(updatedTask.subtasks) : [];
  const totalCount = subtasks.length;
  const doneCount = subtasks.filter(st => st.done).length;
  const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
  const progressHTML = totalCount > 0 ? /*html*/ `
      <div class="subtasksContainer">
          <div class="progress" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-bar" style="width: ${progressPercent}%;"></div>
          </div>
          <p class="taskCardSubtasks">${doneCount}/${totalCount} Subtasks</p>
      </div>
  ` : "";

  const workersHTML = Array.isArray(updatedTask.workers)
      ? updatedTask.workers.map(worker => {
            const workerClass = worker?.class || "defaultWorker";
            const workerInitial = worker?.name?.charAt(0) || "?";
            return `<p class="${workerClass} workerEmblem">${workerInitial}</p>`;
        }).join("")
      : "";

  const newTaskHTML = /*html*/ `
      <div id="boardCard-${taskId}" 
           draggable="true"
           ondragstart="startDragging('${taskId}', '${listId}')"
           onclick="openTaskPopup('${taskId}', '${listId}')"
           class="boardCard">
          <p class="${updatedTask.category?.class || 'defaultCategory'} taskCategory">
              ${updatedTask.category?.name || "No Category"}
          </p>
          <p class="taskCardTitle">${updatedTask.title}</p>
          <p class="taskCardDescription">${updatedTask.description}</p>
          ${progressHTML}
          <div class="BoardCardFooter">
              <div class="worker">${workersHTML}</div>
              <img class="priority" src="../../assets/icons/png/PrioritySymbols${updatedTask.priority || 'Low'}.png">
          </div>
      </div>
  `;

  // Task-Element im DOM ersetzen
  taskElement.outerHTML = newTaskHTML;
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

function toggleShowMenu(event) {
  event.stopPropagation(); // Verhindert, dass das Klicken auf das Menü andere Ereignisse auslöst
  const dropdownMenu = document.getElementById('dropdownMenu');
  if (dropdownMenu.classList.contains('display-none')) {
      dropdownMenu.classList.remove('display-none');
  } else {
      dropdownMenu.classList.add('display-none');
  }
}

// Schließt das Dropdown-Menü, wenn außerhalb geklickt wird
document.addEventListener('click', function () {
  const dropdownMenu = document.getElementById('dropdownMenu');
  if (!dropdownMenu.classList.contains('display-none')) {
      dropdownMenu.classList.add('display-none');
  }
});