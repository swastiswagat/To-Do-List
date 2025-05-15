import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCT7XOOhytzvSFuY2KhfpzG0erE1IqtZN8",
  authDomain: "to-do-list-a0478.firebaseapp.com",
  projectId: "to-do-list-a0478",
  storageBucket: "to-do-list-a0478.firebasestorage.app",
  messagingSenderId: "1040173633653",
  appId: "1:1040173633653:web:224fbdb9ef2ee8d847683c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tasksRef = collection(db, "tasks");

async function renderTasks() {
  const list = document.getElementById("task-list");
  list.innerHTML = "";
  const snapshot = await getDocs(tasksRef);
  snapshot.forEach(docSnap => {
    const task = docSnap.data();
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleComplete('${docSnap.id}', ${!task.completed})" />
      <span contenteditable="true" onblur="editTask('${docSnap.id}', this)">${task.text}</span>
      <button onclick="deleteTask('${docSnap.id}')">Delete</button>
    `;
    list.appendChild(li);
  });
}

window.addTask = async function () {
  const input = document.getElementById("task-input");
  const text = input.value.trim();
  if (text === "") {
    alert("Task cannot be empty!");
    return;
  }

  await addDoc(tasksRef, { text, completed: false });
  alert("✅ Task added successfully");
  input.value = "";
  renderTasks();
};

window.toggleComplete = async function (id, status) {
  await updateDoc(doc(db, "tasks", id), { completed: status });
  renderTasks();
};

window.deleteTask = async function (id) {
  await deleteDoc(doc(db, "tasks", id));
  renderTasks();
};

window.editTask = async function (id, element) {
  const text = element.innerText.trim();
  await updateDoc(doc(db, "tasks", id), { text });
  renderTasks();
};

renderTasks();
