/* Event saves planner events to LocalStorage */
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('start_date');
  if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().split('T')[0];
  const form = document.getElementById('eventForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const date = document.getElementById('start_date').value;
    const time = document.getElementById('start_time').value || '11:59';
    StressLessStore.addEvent({
      title: document.getElementById('title').value.trim(),
      category: document.getElementById('categorySelect').value,
      start: new Date(`${date}T${time}`).toISOString(),
      durationHours: Math.max(1, Number(document.getElementById('duration').value || 1)),
      description: document.getElementById('description').value.trim()
    });
    window.location.href = 'epic1_classCalendar.html';
  });
});
