document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('assignmentCardGrid');
  const tabs = document.querySelectorAll('.tracker-tab');
  if (!grid) return;

  let activeFilter = 'assignments';

  function getDateText(task) {
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      if (!isNaN(d)) return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return task.due || 'Mar 20';
  }

  function isPastDue(task) {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !isNaN(due) && due < today && !task.completed;
  }

  function filteredTasks(tasks) {
    return tasks.filter(task => {
      const type = String(task.type || 'assignment').toLowerCase();

      // Once an item is marked complete, it should only show in the Completed tab.
      if (activeFilter === 'completed') return task.completed;
      if (task.completed) return false;

      if (activeFilter === 'quizzes') return type.includes('quiz');
      if (activeFilter === 'pastDue') return isPastDue(task);
      return !type.includes('quiz');
    });
  }

  function render() {
    const tasks = StressLessStore.getTasks();
    const visibleTasks = filteredTasks(tasks);

    grid.innerHTML = visibleTasks.length ? visibleTasks.map((task, index) => {
      const originalIndex = tasks.indexOf(task);
      return `
        <article class="assignment-card ${task.completed ? 'is-completed' : ''}">
          <div class="assignment-label">${String(task.type || 'Assignment').toLowerCase().includes('quiz') ? 'Quiz' : 'Assignment'}</div>
          <h3>${escapeHtml(task.title || 'Week Summary')}</h3>
          <p class="assignment-body">${escapeHtml(task.description || task.body || 'Body')}</p>
          <div class="assignment-meta">
            <span>${escapeHtml(task.className || 'INFO I-341')}</span>
            <span>Due ${escapeHtml(getDateText(task))}</span>
          </div>
          <div class="assignment-actions">
            <button type="button" class="assignment-action-btn complete-btn" data-index="${originalIndex}"><i class="bi bi-check-circle"></i> ${task.completed ? 'Mark Pending' : 'Mark as Completed'}</button>
            <button type="button" class="assignment-action-btn edit-btn" data-edit="${originalIndex}"><i class="bi bi-pencil"></i> Edit</button>
            <button type="button" class="assignment-action-btn delete-btn" data-delete="${originalIndex}"><i class="bi bi-trash"></i> Delete</button>
          </div>
        </article>`;
    }).join('') : '<p class="tracker-empty">No assignments found for this filter.</p>';
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activeFilter = tab.dataset.filter;
      tabs.forEach(item => item.classList.remove('is-active'));
      tab.classList.add('is-active');
      render();
    });
  });

  grid.addEventListener('click', e => {
    const completeBtn = e.target.closest('[data-index]');
    const deleteBtn = e.target.closest('[data-delete]');
    const editBtn = e.target.closest('[data-edit]');
    const tasks = StressLessStore.getTasks();

    if (completeBtn) {
      const i = Number(completeBtn.dataset.index);
      tasks[i].completed = !tasks[i].completed;
      StressLessStore.saveTasks(tasks);
      render();
      return;
    }

    if (deleteBtn) {
      const i = Number(deleteBtn.dataset.delete);
      tasks.splice(i, 1);
      StressLessStore.saveTasks(tasks);
      render();
      if (window.renderSharedSidebar) renderSharedSidebar();
      return;
    }

    if (editBtn) {
      const i = Number(editBtn.dataset.edit);
      const task = tasks[i];
      if (!task) return;

      // Reuse the Add Assignment modal as the Edit Assignment modal instead of using a prompt.
      document.getElementById('editCardId').value = String(i);
      document.getElementById('editCardIsCustom').value = '1';
      document.getElementById('assignmentTitle').value = task.title || '';
      document.getElementById('assignmentDesc').value = task.description || task.body || '';
      document.getElementById('assignmentClass').value = task.className || '';
      document.getElementById('assignmentDue').value = task.dueDate || '';

      const type = String(task.type || 'Assignment').toLowerCase();
      let modalType = 'assignments';
      if (task.completed) modalType = 'completed';
      else if (type.includes('quiz')) modalType = 'quizzes';
      else if (isPastDue(task)) modalType = 'past';
      document.getElementById('assignmentType').value = modalType;

      document.getElementById('addAssignmentModalLabel').textContent = 'Edit Assignment';
      document.getElementById('saveAssignmentBtn').textContent = 'Save Changes';

      $('#addAssignmentModal').modal('show');
      return;
    }
  });

  render();
});
