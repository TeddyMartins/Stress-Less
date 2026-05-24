(function () {
  const KEYS = { events: 'stressLessEvents', courses: 'stressLessCourses', tasks: 'tasks', profile: 'stressLessProfile' };
  const uid = () => String(Date.now()) + Math.random().toString(16).slice(2);
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const seed = () => {
    if (!localStorage.getItem(KEYS.profile)) write(KEYS.profile, { name: 'Demo Student', email: 'local.demo@example.com', term: 'Spring 2026', defaultFocusTime: 15 });
    if (!localStorage.getItem(KEYS.courses)) write(KEYS.courses, [{ id: uid(), course_name: 'INFO-I 341', course_time: 'MWF 10:00 AM', instructor: 'Instructor' }]);
    if (!localStorage.getItem(KEYS.events)) {
      const now = new Date(); now.setHours(10, 0, 0, 0);
      write(KEYS.events, [{ id: uid(), title: 'Study Session', start: now.toISOString(), category: 'study', description: 'LocalStorage sample event', durationHours: 1 }]);
    }
    if (!localStorage.getItem(KEYS.tasks)) write(KEYS.tasks, [{ title: 'Finish project update', className: 'INFO-I 495', completed: false }]);
  };
  seed();
  window.StressLessStore = {
    getProfile: () => read(KEYS.profile, {}),
    saveProfile: p => write(KEYS.profile, { ...read(KEYS.profile, {}), ...p }),
    getTasks: () => read(KEYS.tasks, []),
    saveTasks: tasks => write(KEYS.tasks, tasks),
    addTask: task => { const tasks = read(KEYS.tasks, []); tasks.unshift({ ...task, completed: !!task.completed }); write(KEYS.tasks, tasks); return task; },
    getCourses: () => read(KEYS.courses, []),
    saveCourses: courses => write(KEYS.courses, courses),
    upsertCourse: course => { const courses = read(KEYS.courses, []); if (course.id) { const i = courses.findIndex(c => c.id === course.id); if (i >= 0) courses[i] = { ...courses[i], ...course }; else courses.push(course); } else courses.push({ id: uid(), ...course }); write(KEYS.courses, courses); },
    deleteCourse: id => write(KEYS.courses, read(KEYS.courses, []).filter(c => c.id !== id)),
    getEvents: () => read(KEYS.events, []),
    saveEvents: events => write(KEYS.events, events),
    addEvent: event => { const events = read(KEYS.events, []); const saved = { id: uid(), ...event }; events.push(saved); write(KEYS.events, events); return saved; },
    updateEvent: (id, changes) => write(KEYS.events, read(KEYS.events, []).map(e => e.id === id ? { ...e, ...changes } : e)),
    deleteEvent: id => write(KEYS.events, read(KEYS.events, []).filter(e => e.id !== id)),
  };

  function formatDateTime(value) { const d = new Date(value); return isNaN(d) ? 'Unknown time' : d.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
  window.renderSharedSidebar = function () {
    const upcoming = document.getElementById('sidebarUpcoming');
    const coursesBox = document.getElementById('sidebarCourses');
    if (document.querySelector('[data-term-label]')) document.querySelector('[data-term-label]').textContent = StressLessStore.getProfile().term || 'Spring 2026';
    if (upcoming) {
      const events = StressLessStore.getEvents().filter(e => new Date(e.start) >= new Date()).sort((a, b) => new Date(a.start) - new Date(b.start)).slice(0, 5);
      upcoming.innerHTML = events.length ? events.map(e => `<div class="course"><div class="course_row"><div>&#9734;</div><div><div class="course_code">${escapeHtml(e.title)}</div><div class="course_title">${formatDateTime(e.start)}${e.category ? ' • ' + escapeHtml(e.category) : ''}</div></div></div></div>`).join('') : `<div class="course"><div class="course_row"><div>&#9734;</div><div><div class="course_code">No Upcoming Events</div><div class="course_title">Add something to your planner</div></div></div></div>`;
    }
    if (coursesBox) {
      const courses = StressLessStore.getCourses();
      coursesBox.innerHTML = courses.length ? courses.map(c => `<div class="course course-clickable" data-toggle="modal" data-target="#courseModal" data-id="${c.id}" data-name="${escapeHtml(c.course_name)}" data-time="${escapeHtml(c.course_time || '')}" data-instructor="${escapeHtml(c.instructor || '')}"><div class="course_row"><div>&#9734;</div><div><div class="course_code">${escapeHtml(c.course_name)}</div><div class="course_title">${escapeHtml(c.course_time || '')}</div></div></div></div>`).join('') : `<div class="course"><div class="course_row"><div>&#9734;</div><div><div class="course_code">No Courses</div><div class="course_title">Add a class!</div></div></div></div>`;
    }
  };
  window.escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  document.addEventListener('DOMContentLoaded', () => {
    renderSharedSidebar();
    if (window.jQuery) {
      $('#courseModal').on('show.bs.modal', function (event) {
        const course = $(event.relatedTarget);
        $('#modalCourseId').val(course.data('id')); $('#modalCourseName').val(course.data('name')); $('#modalCourseTime').val(course.data('time')); $('#modalCourseInstructor').val(course.data('instructor'));
      });
    }
    const form = document.getElementById('courseEditForm');
    if (form) form.addEventListener('submit', e => { e.preventDefault(); StressLessStore.upsertCourse({ id: document.getElementById('modalCourseId').value, course_name: document.getElementById('modalCourseName').value, course_time: document.getElementById('modalCourseTime').value, instructor: document.getElementById('modalCourseInstructor').value }); $('#courseModal').modal('hide'); renderSharedSidebar(); });
    const del = document.getElementById('deleteCourseBtn');
    if (del) del.addEventListener('click', () => { const id = document.getElementById('modalCourseId').value; if (confirm('Are you sure you want to delete this Course?')) { StressLessStore.deleteCourse(id); $('#courseModal').modal('hide'); renderSharedSidebar(); } });
  });
})();
