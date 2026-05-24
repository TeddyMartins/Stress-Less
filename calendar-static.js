/* Interactive planner renders and updates LocalStorage events */
let currentWeekSunday = startOfWeek(new Date());
let draggedEventId = null;
function pad(n) { return String(n).padStart(2, '0') }
function toYMD(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
function startOfWeek(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - x.getDay()); return x; }
function colorFor(cat) { return cat === 'assignment' ? '#ef4444' : cat === 'study' ? '#10b981' : '#3b82f6' }
function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  grid.querySelectorAll('.day-header,.time-label,.calendar-cell,.cal-event').forEach(el => el.remove());
  for (let day = 0; day < 7; day++) { const d = new Date(currentWeekSunday); d.setDate(d.getDate() + day); grid.insertAdjacentHTML('beforeend', `<div class="day-header" style="grid-column:${day + 2};grid-row:1;">${d.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' })}</div>`) }
  for (let hour = 0; hour < 24; hour++) { grid.insertAdjacentHTML('beforeend', `<div class="time-label" style="grid-column:1;grid-row:${hour + 2};">${hour}:00</div>`); for (let day = 0; day < 7; day++) grid.insertAdjacentHTML('beforeend', `<div class="calendar-cell" data-day="${day}" data-hour="${hour}" style="grid-column:${day + 2};grid-row:${hour + 2};"></div>`) }
  const end = new Date(currentWeekSunday); end.setDate(end.getDate() + 7);
  StressLessStore.getEvents().filter(e => new Date(e.start) >= currentWeekSunday && new Date(e.start) < end).forEach(e => {
    const s = new Date(e.start), day = s.getDay(), hour = s.getHours(), dur = Math.max(1, Number(e.durationHours || 1));
    grid.insertAdjacentHTML('beforeend', `<div class="cal-event" draggable="true" data-id="${e.id}" data-title="${escapeHtml(e.title)}" data-category="${escapeHtml(e.category || 'other')}" data-start="${e.start}" data-desc="${escapeHtml(e.description || '')}" style="background:${colorFor(e.category)};grid-column:${day + 2};grid-row:${hour + 2} / ${hour + 2 + dur};">${escapeHtml(e.title)}<span class="sub">${escapeHtml(e.category || 'other')}</span></div>`)
  });
  document.getElementById('weekchange').textContent = `Week of ${currentWeekSunday.toLocaleDateString()}`;
  if (window.renderSharedSidebar) renderSharedSidebar();
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('previous').onclick = () => { currentWeekSunday.setDate(currentWeekSunday.getDate() - 7); renderCalendar(); };
  document.getElementById('nextweek').onclick = () => { currentWeekSunday.setDate(currentWeekSunday.getDate() + 7); renderCalendar(); };
  document.getElementById('today').onclick = () => { currentWeekSunday = startOfWeek(new Date()); renderCalendar(); };
  document.addEventListener('click', e => { const b = e.target.closest('.cal-event'); if (!b) return; modalDeleteBtn.dataset.eventId = b.dataset.id; modalTitle.textContent = b.dataset.title; modalCategory.textContent = b.dataset.category; modalStart.textContent = new Date(b.dataset.start).toLocaleString(); modalDesc.textContent = b.dataset.desc || 'None'; $('#eventModal').modal('show'); });
  modalDeleteBtn.addEventListener('click', () => { if (confirm('Delete this event?')) { StressLessStore.deleteEvent(modalDeleteBtn.dataset.eventId); $('#eventModal').modal('hide'); renderCalendar(); } });
  document.addEventListener('dragstart', e => { const b = e.target.closest('.cal-event'); if (b) draggedEventId = b.dataset.id; });
  calendarGrid.addEventListener('dragover', e => e.preventDefault());
  calendarGrid.addEventListener('drop', e => { e.preventDefault(); if (!draggedEventId) return; const cell = e.target.closest('.calendar-cell'); if (!cell) return; const day = Number(cell.dataset.day), hour = Number(cell.dataset.hour); const d = new Date(currentWeekSunday); d.setDate(d.getDate() + day); d.setHours(hour, 0, 0, 0); StressLessStore.updateEvent(draggedEventId, { start: d.toISOString() }); draggedEventId = null; renderCalendar(); });
  renderCalendar();
});
