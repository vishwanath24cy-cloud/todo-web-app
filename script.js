"use strict";

(function () {
  var taskForm = document.getElementById("taskForm");
  var taskInput = document.getElementById("taskInput");
  var dateInput = document.getElementById("dateInput");
  var timeInput = document.getElementById("timeInput");
  var taskList = document.getElementById("taskList");
  var emptyState = document.getElementById("emptyState");
  var statsText = document.getElementById("statsText");
  var filterButtons = document.querySelectorAll("[data-filter]");

  var tasks = [];
  var activeFilter = "all";

  function createTask(title, date, time) {
    return {
      id: Date.now() + Math.floor(Math.random() * 1000),
      title: title,
      date: date || "",
      time: time || "",
      completed: false
    };
  }

  function formatDueText(task) {
    if (!task.date && !task.time) return "No due date";
    if (task.date && task.time) return "Due: " + task.date + " at " + task.time;
    if (task.date) return "Due: " + task.date;
    return "Time: " + task.time;
  }

  function getVisibleTasks() {
    if (activeFilter === "pending") {
      return tasks.filter(function (task) {
        return !task.completed;
      });
    }
    if (activeFilter === "completed") {
      return tasks.filter(function (task) {
        return task.completed;
      });
    }
    return tasks;
  }

  function updateStats() {
    var total = tasks.length;
    var completed = tasks.filter(function (task) {
      return task.completed;
    }).length;
    var pending = total - completed;
    statsText.textContent =
      total + " total · " + completed + " completed · " + pending + " pending";
  }

  function renderTasks() {
    var visibleTasks = getVisibleTasks();
    taskList.innerHTML = "";

    if (visibleTasks.length === 0) {
      emptyState.hidden = false;
      emptyState.textContent =
        tasks.length === 0
          ? "No tasks yet. Add your first task above."
          : "No tasks in this filter.";
    } else {
      emptyState.hidden = true;
    }

    for (var i = 0; i < visibleTasks.length; i += 1) {
      var task = visibleTasks[i];
      var li = document.createElement("li");
      li.className = "task-item" + (task.completed ? " is-completed" : "");
      li.setAttribute("data-id", String(task.id));

      var checkWrap = document.createElement("div");
      checkWrap.className = "check-wrap";
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.setAttribute("aria-label", "Mark task as completed");
      checkbox.addEventListener("change", onToggleTask);
      checkWrap.appendChild(checkbox);

      var main = document.createElement("div");
      main.className = "task-main";
      var title = document.createElement("p");
      title.className = "task-title";
      title.textContent = task.title;
      var meta = document.createElement("p");
      meta.className = "meta";
      meta.textContent = formatDueText(task);
      main.appendChild(title);
      main.appendChild(meta);

      var actions = document.createElement("div");
      actions.className = "task-actions";
      var editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn btn-small btn-edit";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", onStartEditTask);

      var deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn-small btn-delete";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", onDeleteTask);

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(checkWrap);
      li.appendChild(main);
      li.appendChild(actions);
      taskList.appendChild(li);
    }

    updateStats();
  }

  function onAddTask(event) {
    event.preventDefault();
    var title = taskInput.value.trim();
    if (!title) return;

    tasks.unshift(createTask(title, dateInput.value, timeInput.value));
    taskForm.reset();
    taskInput.focus();
    renderTasks();
  }

  function getTaskFromEventTarget(target) {
    var listItem = target.closest(".task-item");
    if (!listItem) return null;
    var id = Number(listItem.getAttribute("data-id"));
    for (var i = 0; i < tasks.length; i += 1) {
      if (tasks[i].id === id) return tasks[i];
    }
    return null;
  }

  function onToggleTask(event) {
    var task = getTaskFromEventTarget(event.target);
    if (!task) return;
    task.completed = event.target.checked;
    renderTasks();
  }

  function onDeleteTask(event) {
    var task = getTaskFromEventTarget(event.target);
    if (!task) return;
    tasks = tasks.filter(function (item) {
      return item.id !== task.id;
    });
    renderTasks();
  }

  function onStartEditTask(event) {
    var task = getTaskFromEventTarget(event.target);
    if (!task) return;

    var listItem = event.target.closest(".task-item");
    var main = listItem ? listItem.querySelector(".task-main") : null;
    if (!main) return;

    var editGrid = document.createElement("div");
    editGrid.className = "edit-grid";

    var titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = task.title;
    titleInput.required = true;

    var editDate = document.createElement("input");
    editDate.type = "date";
    editDate.value = task.date;

    var editTime = document.createElement("input");
    editTime.type = "time";
    editTime.value = task.time;

    var saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "btn btn-small btn-edit";
    saveBtn.textContent = "Save";

    var cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn-small";
    cancelBtn.textContent = "Cancel";

    saveBtn.addEventListener("click", function () {
      var newTitle = titleInput.value.trim();
      if (!newTitle) {
        titleInput.focus();
        return;
      }
      task.title = newTitle;
      task.date = editDate.value;
      task.time = editTime.value;
      renderTasks();
    });

    cancelBtn.addEventListener("click", renderTasks);

    editGrid.appendChild(titleInput);
    editGrid.appendChild(editDate);
    editGrid.appendChild(editTime);
    editGrid.appendChild(saveBtn);
    editGrid.appendChild(cancelBtn);

    main.innerHTML = "";
    main.appendChild(editGrid);
    titleInput.focus();
  }

  function setActiveFilter(filter) {
    activeFilter = filter;
    for (var i = 0; i < filterButtons.length; i += 1) {
      var btn = filterButtons[i];
      btn.classList.toggle("is-active", btn.getAttribute("data-filter") === filter);
    }
    renderTasks();
  }

  taskForm.addEventListener("submit", onAddTask);

  for (var i = 0; i < filterButtons.length; i += 1) {
    filterButtons[i].addEventListener("click", function (event) {
      setActiveFilter(event.currentTarget.getAttribute("data-filter"));
    });
  }

  renderTasks();
})();
