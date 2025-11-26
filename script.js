/* ------------------------------
   QUANTUMBOARD — DATA MODEL
--------------------------------*/

// PROJECT LIST
const projects = [
  {
    id: "quantum-dashboard",
    name: "QuantumBoard · Dashboard",
    tasks: [
      {
        id: "1",
        title: "Set up authentication UI",
        description: "Create login + register + forgot password screens.",
        assignee: "You",
        due: "2025-11-29",
        status: "inprogress",
        label: "medium",
        subtasks: ["Layout", "Input fields", "Validation"],
        comments: []
      },
      {
        id: "2",
        title: "Project list screen",
        description: "Show projects and filters",
        assignee: "Dev A",
        due: "2025-11-30",
        status: "todo",
        label: "feature",
        subtasks: [],
        comments: []
      },
      {
        id: "3",
        title: "Task comments section",
        description: "Threaded comments feature",
        assignee: "Dev B",
        due: "2025-11-25",
        status: "review",
        label: "bug",
        subtasks: ["UI", "API"],
        comments: []
      },
      {
        id: "4",
        title: "Deploy build",
        description: "Deploy to Vercel",
        assignee: "You",
        due: "2025-11-24",
        status: "done",
        label: "low",
        subtasks: ["Build", "Test", "Deploy"],
        comments: []
      }
    ]
  },

  {
    id: "student-portal",
    name: "Student Portal Revamp",
    tasks: [
      {
        id: "5",
        title: "User interviews",
        description: "Interview 5 students",
        assignee: "UX",
        due: "2025-12-01",
        status: "todo",
        label: "high",
        subtasks: ["Prepare doc"],
        comments: []
      },
      {
        id: "6",
        title: "Wireframes",
        description: "Make Figma mockups",
        assignee: "UX",
        due: "2025-11-28",
        status: "inprogress",
        label: "medium",
        subtasks: [],
        comments: []
      }
    ]
  }
];

const columns = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" }
];

let currentProjectId = projects[0].id;
let searchQuery = "";
let filterDueToday = false;


/* ------------------------------
   HELPERS
--------------------------------*/

function getCurrentProject() {
  return projects.find(p => p.id === currentProjectId);
}

function isOverdue(date) {
  if (!date) return false;
  const today = new Date();
  const d = new Date(date);
  return d < today && d.toDateString() !== today.toDateString();
}

function isToday(date) {
  const today = new Date();
  const d = new Date(date);
  return (
    today.getFullYear() === d.getFullYear() &&
    today.getMonth() === d.getMonth() &&
    today.getDate() === d.getDate()
  );
}

function addActivity(message) {
  const list = document.getElementById("activityList");
  const li = document.createElement("li");
  li.className = "activity-item";
  li.innerHTML = `<strong>${message}</strong><div class="activity-meta">Just now</div>`;
  list.prepend(li);
}


/* ------------------------------
   RENDER PROJECT LIST
--------------------------------*/

function renderProjects() {
  const projectSelect = document.getElementById("projectSelect");
  const projectList = document.getElementById("projectList");
  const currentProjectName = document.getElementById("currentProjectName");

  projectSelect.innerHTML = "";
  projectList.innerHTML = "";

  projects.forEach(p => {
    // Sidebar project list
    const li = document.createElement("li");
    li.className = "nav-item" + (p.id === currentProjectId ? " active" : "");
    li.innerHTML = `<span>${p.name}</span><span class="pill-count">${p.tasks.length}</span>`;
    li.onclick = () => {
      currentProjectId = p.id;
      renderProjects();
      renderBoard();
    };
    projectList.appendChild(li);

    // Dropdown selector
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    projectSelect.appendChild(opt);
  });

  projectSelect.value = currentProjectId;
  currentProjectName.textContent = "· " + getCurrentProject().name;
}


/* ------------------------------
   RENDER KANBAN BOARD
--------------------------------*/

function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  const project = getCurrentProject();

  let total = 0;
  let overdue = 0;
  let done = 0;

  columns.forEach(col => {
    const columnEl = document.createElement("div");
    columnEl.className = "column";

    // Column Header
    const header = document.createElement("div");
    header.className = "column-header";

    const tasks = project.tasks.filter(t => {
      if (t.status !== col.id) return false;

      if (searchQuery &&
        !(
          t.title.toLowerCase().includes(searchQuery) ||
          t.description.toLowerCase().includes(searchQuery) ||
          t.assignee.toLowerCase().includes(searchQuery)
        )) return false;

      if (filterDueToday && !isToday(t.due)) return false;

      return true;
    });

    header.innerHTML = `
      <div class="column-title">${col.title}</div>
      <div class="column-badge">${tasks.length}</div>
    `;

    const body = document.createElement("div");
    body.className = "column-body";

    // Drop Zone
    const dropZone = document.createElement("div");
    dropZone.className = "drop-zone";

    dropZone.addEventListener("dragover", e => {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", e => {
      e.preventDefault();
      dropZone.classList.remove("drag-over");
      const taskId = e.dataTransfer.getData("text/plain");
      moveTask(taskId, col.id);
    });

    // Tasks
    tasks.forEach(t => {
      total++;

      if (t.status === "done") done++;
      if (isOverdue(t.due) && t.status !== "done") overdue++;

      const card = document.createElement("div");
      card.className = "card";
      card.draggable = true;
      card.dataset.taskId = t.id;

      const overdueClass = isOverdue(t.due)
        ? "date-danger"
        : t.status === "done"
        ? "date-success"
        : "";

      // Progress
      const completed = t.subtasksCompleted || 0;
      const percent = t.subtasks.length
        ? (completed / t.subtasks.length) * 100
        : 0;

      card.innerHTML = `
        <div class="card-top">
          <div class="card-title">${t.title}</div>
          <button class="archive-btn" onclick="archiveTask('${t.id}')">🗄</button>
        </div>

        <div class="card-desc">${t.description}</div>

        ${
          t.label !== "none"
            ? `<div class="label-chip ${t.label}">${t.label}</div>`
            : ""
        }

        <div class="subtasks">
          ${t.subtasks
            .map(
              (s, idx) =>
                `<div class="subtask-chip">${
                  s.length > 14 ? s.slice(0, 12) + "…" : s
                }</div>`
            )
            .join("")}
        </div>

        <div class="progress">
          <div class="progress-fill" style="width:${percent}%"></div>
        </div>

        <div class="comment-badge">${t.comments.length} comments</div>

        <div class="card-meta">
          <div class="chip-meta">${t.assignee}</div>
          <div class="chip-meta ${overdueClass}">${t.due || "N/A"}</div>
        </div>
      `;

      // Drag events
      card.ondragstart = e => {
        e.dataTransfer.setData("text/plain", t.id);
        card.classList.add("dragging");
      };

      card.ondragend = () => {
        card.classList.remove("dragging");
      };

      dropZone.appendChild(card);
    });

    if (tasks.length === 0) {
      dropZone.innerHTML = `<div class="empty-state">No tasks here</div>`;
    }

    body.appendChild(dropZone);

    const footer = document.createElement("div");
    footer.className = "column-footer";
    footer.innerHTML = `<button onclick="openModal('${col.id}')">＋ Add task here</button>`;

    columnEl.appendChild(header);
    columnEl.appendChild(body);
    columnEl.appendChild(footer);
    board.appendChild(columnEl);
  });

  document.getElementById("taskCount").textContent = total;
  document.getElementById("overdueCount").textContent = overdue;
  document.getElementById("doneCount").textContent = done;
}


/* ------------------------------
   MOVE TASK
--------------------------------*/

function moveTask(taskId, newStatus) {
  const project = getCurrentProject();
  const task = project.tasks.find(t => t.id === taskId);
  if (!task) return;
  task.status = newStatus;

  addActivity(`Moved "${task.title}" → ${newStatus}`);
  renderBoard();
}


/* ------------------------------
   ARCHIVE TASK
--------------------------------*/

function archiveTask(taskId) {
  const project = getCurrentProject();
  project.tasks = project.tasks.filter(t => t.id !== taskId);
  addActivity(`Archived task #${taskId}`);
  renderBoard();
}


/* ------------------------------
   MODAL CONTROL
--------------------------------*/

function openModal(columnId) {
  document.getElementById("taskModalBackdrop").classList.add("show");
  document.getElementById("taskColumnInput").value = columnId;
}

function closeModal() {
  document.getElementById("taskModalBackdrop").classList.remove("show");
}

document.getElementById("closeModalBtn").onclick = closeModal;
document.getElementById("cancelModalBtn").onclick = closeModal;


/* ------------------------------
   SAVE NEW TASK
--------------------------------*/

document.getElementById("saveTaskBtn").onclick = () => {
  const project = getCurrentProject();

  const title = document.getElementById("taskTitleInput").value.trim();
  const description = document
    .getElementById("taskDescriptionInput")
    .value.trim();
  const assignee =
    document.getElementById("taskAssigneeInput").value.trim() || "You";
  const due = document.getElementById("taskDueInput").value;
  const label = document.getElementById("taskLabelInput").value;
  const status = document.getElementById("taskColumnInput").value;

  const subtasks = document
    .getElementById("taskSubtaskInput")
    .value.split(",")
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const commentText = document
    .getElementById("taskCommentInput")
    .value.trim();

  if (!title) return alert("Task must have a title!");

  project.tasks.push({
    id: Date.now().toString(),
    title,
    description,
    assignee,
    due,
    status,
    label,
    subtasks,
    subtasksCompleted: 0,
    comments: commentText ? [{ text: commentText, time: new Date() }] : []
  });

  addActivity(`Created task "${title}"`);

  closeModal();
  renderBoard();
};


/* ------------------------------
   SEARCH & FILTER
--------------------------------*/

document.getElementById("searchInput").oninput = e => {
  searchQuery = e.target.value.toLowerCase();
  renderBoard();
};

document.getElementById("filterToday").onclick = () => {
  filterDueToday = !filterDueToday;
  renderBoard();
};


/* ------------------------------
   EXPORT PROJECT
--------------------------------*/

document.getElementById("exportBtn").onclick = () => {
  const data = JSON.stringify(getCurrentProject(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${getCurrentProject().name}.json`;
  a.click();
};


/* ------------------------------
   CLEAR ACTIVITY
--------------------------------*/

document.getElementById("clearActivityBtn").onclick = () => {
  document.getElementById("activityList").innerHTML = "";
};


/* ------------------------------
   THEME TOGGLE
--------------------------------*/

document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("light-theme");
};


/* ------------------------------
   INIT
--------------------------------*/

window.onload = () => {
  renderProjects();
  renderBoard();

  const today = new Date();
  document.getElementById("todayLabel").textContent =
    today.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
};
