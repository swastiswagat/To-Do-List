import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCT7XOOhytzvSFuY2KhfpzG0erE1IqtZN8",
  authDomain: "to-do-list-a0478.firebaseapp.com",
  projectId: "to-do-list-a0478",
  storageBucket: "to-do-list-a0478.appspot.com",
  messagingSenderId: "1040173633653",
  appId: "1:1040173633653:web:224fbdb9ef2ee8d847683c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tasksRef = collection(db, "tasks");

async function renderTasks() {
  const list = document.getElementById("task-list");
  list.innerHTML = "";
  try {
    const taskQuery = query(tasksRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(taskQuery);
    snapshot.forEach(docSnap => {
      const task = docSnap.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <input 
          type="checkbox" 
          class="task-checkbox" 
          ${task.completed ? "checked" : ""} 
          onchange="toggleComplete('${docSnap.id}', ${!task.completed})" 
        />
        <span 
          class="task-text" 
          contenteditable="true" 
          onblur="editTask('${docSnap.id}', this)"
        >
          ${task.text}
        </span>
        <button 
          class="delete-btn" 
          onclick="deleteTask('${docSnap.id}')"
        >
          <box-icon name='trash-alt' type='solid' class="trash-icon"></box-icon>
        </button>
      `;
      if (task.completed) li.classList.add("completed");
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    showToast("❌ Failed to load tasks.");
  }
}

window.addTask = async function () {
  const input = document.getElementById("task-input");
  const text = input.value.trim();
  if (text === "") {
    showToast("⚠️ Task cannot be empty!");
    return;
  }
  try {
    await addDoc(tasksRef, {
      text,
      completed: false,
      createdAt: new Date()
    });
    input.value = "";
    showToast("✅ Task added!");
    renderTasks();
  } catch (err) {
    console.error("Error adding task:", err);
    showToast("❌ Failed to add task.");
  }
};

window.toggleComplete = async function (id, status) {
  try {
    await updateDoc(doc(db, "tasks", id), { completed: status });
    showToast(status ? "✅ Marked complete!" : "🔄 Marked incomplete!");
    renderTasks();
  } catch (err) {
    console.error("Error updating task:", err);
    showToast("❌ Failed to update task.");
  }
};

window.deleteTask = async function (id) {
  try {
    await deleteDoc(doc(db, "tasks", id));
    showToast("🗑️ Task deleted!");
    renderTasks();
  } catch (err) {
    console.error("Error deleting task:", err);
    showToast("❌ Failed to delete task.");
  }
};

window.editTask = async function (id, element) {
  const text = element.innerText.trim();
  try {
    await updateDoc(doc(db, "tasks", id), { text });
    showToast("✏️ Task updated!");
    renderTasks();
  } catch (err) {
    console.error("Error editing task:", err);
    showToast("❌ Failed to update task.");
  }
};

document.getElementById("task-input").addEventListener("keydown", function (e) {
  if (e.key === "Enter") addTask();
});

function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 700);
}

const themeSwitch = document.getElementById("themeSwitch");
themeSwitch.addEventListener("change", () => {
  document.body.classList.toggle("dark", themeSwitch.checked);
  localStorage.setItem("theme", themeSwitch.checked ? "dark" : "light");
});

window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeSwitch.checked = true;
  }
  renderTasks();
});
