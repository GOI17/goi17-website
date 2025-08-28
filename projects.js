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
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <h3>${p.title}</h3>
            <p>${p.description}</p>
            <a href="${p.link}" target="_blank" class="btn btn-sm">View on GitHub →</a>
          `;
          projectList.appendChild(card);
        });
      })
      .catch(err => console.error('Error loading projects:', err));
  }
});