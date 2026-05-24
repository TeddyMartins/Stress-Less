document.addEventListener('DOMContentLoaded', () => {
  const p = StressLessStore.getProfile();
  if (document.getElementById('profileName')) profileName.textContent = p.name || 'Demo Student';
  if (document.getElementById('profileEmail')) profileEmail.textContent = p.email || 'local.demo@example.com';
  const term = document.getElementById('term'); if (term) term.value = p.term || 'Spring 2026';
  const focus = document.getElementById('focus_time'); if (focus) focus.value = p.defaultFocusTime || 15;
  const list = document.getElementById('profileCourseList'); if (list) list.innerHTML = StressLessStore.getCourses().map(c => `<div class="course-item">${escapeHtml(c.course_name)}</div>`).join('') || '<div class="course-item">No courses added yet.</div>';
  document.querySelectorAll('.profile-actions .btn').forEach(btn => { if (btn.textContent.trim() === 'Save Term') btn.addEventListener('click', () => { StressLessStore.saveProfile({ term: term.value }); alert('Term saved.'); }); });
  const form = document.getElementById('timerPrefForm'); if (form) form.addEventListener('submit', e => {
    e.preventDefault();

    const defaultFocusTime = Number(focus.value);

    /* Save the new Default Focus Timer from epic4 profile page so epic6 can read it immediately. */
    StressLessStore.saveProfile({ defaultFocusTime });

    /* Clear epic6's saved paused/default timer state so the new profile default shows right away on epic6. */
    localStorage.removeItem('stressLessFocusTimerState');

    /* Timestamp lets an already-open epic6 page know the default timer setting changed. */
    localStorage.setItem('stressLessDefaultFocusUpdatedAt', String(Date.now()));

    timerPrefMessage.textContent = 'Timer preference saved.';
  });
});
