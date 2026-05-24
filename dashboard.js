/* Dashboard counts are calculated from LocalStorage. */
document.addEventListener('DOMContentLoaded', () => {
  const events = StressLessStore.getEvents();
  const now = new Date();
  const today = now.toDateString();
  const upcoming = events.filter(e => new Date(e.start) >= now).sort((a, b) => new Date(a.start) - new Date(b.start));
  const todayEvents = events.filter(e => new Date(e.start).toDateString() === today);
  if (document.getElementById('upcomingCount')) upcomingCount.textContent = upcoming.length;
  if (document.getElementById('todayCount')) todayCount.textContent = todayEvents.length;
  if (document.getElementById('nextEventLine')) nextEventLine.innerHTML = upcoming[0] ? `Next: <strong>${escapeHtml(upcoming[0].title)}</strong><br><span class="text-muted">${new Date(upcoming[0].start).toLocaleString()}</span>` : 'No upcoming events scheduled.';
  document.querySelectorAll('#checkinForm button').forEach(btn => btn.addEventListener('click', () => { localStorage.setItem('stressLessMood', btn.dataset.mood); checkinMessage.textContent = `Saved mood: ${btn.dataset.mood}`; }));
});
