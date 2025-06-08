import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy
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

let currentSort = "desc";
let currentFilter = "all";

window.setSort = (order) => {
  currentSort = order;
  renderTasks();
};

window.setFilter = (filter) => {
  currentFilter = filter;
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderTasks();
};

window.addTask = async () => {
  const input = document.getElementById("task-input");
  const text = input.value.trim();
  if (!text) return showToast("⚠️ Task cannot be empty!");

  try {
    await addDoc(tasksRef, {
      text,
      completed: false,
      createdAt: new Date()
    });
    input.value = "";
    showToast("✅ Task added!");
    renderTasks();
  } catch (e) {
    console.error(e);
    showToast("❌ Failed to add task.");
  }
};

window.toggleComplete = async (id, status) => {
  try {
    await updateDoc(doc(db, "tasks", id), { completed: status });
    showToast(status ? "✅ Marked complete!" : "🔄 Marked incomplete!");
    renderTasks();
  } catch (e) {
    console.error(e);
    showToast("❌ Update failed.");
  }
};

window.deleteTask = async (id) => {
  try {
    await deleteDoc(doc(db, "tasks", id));
    showToast("🗑️ Task deleted!");
    renderTasks();
  } catch (e) {
    console.error(e);
    showToast("❌ Delete failed.");
  }
};

window.editTask = async (id, el) => {
  const txt = el.innerText.trim();
  try {
    await updateDoc(doc(db, "tasks", id), { text: txt });
    showToast("✏️ Task updated!");
  } catch (e) {
    console.error(e);
    showToast("❌ Update failed.");
  }
};

async function renderTasks() {
  const list = document.getElementById("task-list");
  const loader = document.getElementById("loader");
  loader.style.display = "block";
  list.innerHTML = "";

  try {
    const q = query(tasksRef, orderBy("createdAt", currentSort));
    const snap = await getDocs(q);
    let count = 0;

    snap.forEach(docSnap => {
      const task = docSnap.data();
      if (currentFilter === "completed" && !task.completed) return;
      if (currentFilter === "incomplete" && task.completed) return;

      const li = document.createElement("li");
      li.className = task.completed ? "completed" : "";
      li.innerHTML = `
        <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleComplete('${docSnap.id}', ${!task.completed})"/>
        <span contenteditable="true" onblur="editTask('${docSnap.id}', this)">${task.text}</span>
        <button onclick="deleteTask('${docSnap.id}')"><box-icon name='trash-alt' type='solid'></box-icon></button>
      `;
      list.appendChild(li);
      if (!task.completed) count++;
    });

    document.getElementById("task-count").textContent = `📝 ${count} Task${count !== 1 ? "s" : ""} Going On`;
  } catch (e) {
    console.error(e);
    showToast("❌ Failed to load tasks.");
  } finally {
    loader.style.display = "none";
  }
}

function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.getElementById("toast-container").appendChild(t);
  setTimeout(() => t.remove(), 1200);
}

document.getElementById("task-input").addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});

document.getElementById("themeSwitch").addEventListener("change", evt => {
  document.body.classList.toggle("dark", evt.target.checked);
  localStorage.setItem("theme", evt.target.checked ? "dark" : "light");
});

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    document.getElementById("themeSwitch").checked = true;
  }
  renderTasks();
});
