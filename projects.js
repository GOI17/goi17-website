// Wait for translations to be loaded before initializing
window.addEventListener('translationsLoaded', (event) => {
  const { translations: t, lang: storedLang } = event.detail;

  /* Load projects (only on projects page) */
  const projectList = document.getElementById('project-list');
  if (projectList) {
    fetch('projects.json')
      .then(res => res.json())
      .then(projects => {
        projects.forEach(p => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${p.title}</strong><p>${p.description}</p><a href="${p.link}" target="_blank">View on GitHub</a>`;
          projectList.appendChild(li);
        });
      })
      .catch(err => console.error('Error loading projects:', err));
  }
});