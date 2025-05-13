const db = firebase.firestore();
const tasksRef = db.collection("tasks");

function renderTasks() {
  tasksRef.get().then(snapshot => {
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    snapshot.forEach(doc => {
      const task = doc.data();
      const li = document.createElement('li');
      li.innerHTML = `
        <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleComplete('${doc.id}', ${!task.completed})" />
        <span contenteditable="true" onblur="editTask('${doc.id}', this)">${task.text}</span>
        <button onclick="deleteTask('${doc.id}')">Delete</button>
      `;
      list.appendChild(li);
    });
  });
}

function addTask() {
  const input = document.getElementById('task-input');
  const text = input.value.trim();
  if (text === '') {
    alert('Task cannot be empty!');
    return;
  }

  tasksRef.add({ text, completed: false }).then(() => {
    input.value = '';
    renderTasks();
  });
}

function toggleComplete(id, status) {
  tasksRef.doc(id).update({ completed: status }).then(renderTasks);
}

function deleteTask(id) {
  tasksRef.doc(id).delete().then(renderTasks);
}

function editTask(id, element) {
  const text = element.innerText.trim();
  tasksRef.doc(id).update({ text }).then(renderTasks);
}

window.onload = renderTasks;
