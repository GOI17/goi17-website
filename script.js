document.addEventListener('DOMContentLoaded', () => {
  const sections = {
    home: document.getElementById('home'),
    projects: document.getElementById('projects'),
    blog: document.getElementById('blog'),
    twitch: document.getElementById('twitch') // Added twitch section
  };

  const loadSection = (hash) => {
    const sectionName = hash.replace('#', '') || 'home';
    Object.values(sections).forEach(sec => {
      if (sec) sec.classList.add('hidden');
    });
    if (sections[sectionName] && sections[sectionName].classList.contains('hidden')) {
      sections[sectionName].classList.remove('hidden');
    }
  };

  // Initial load
  loadSection(location.hash);

  // Listen for hash changes
  window.addEventListener('hashchange', () => loadSection(location.hash));

  // Load projects
  fetch('projects.json')
    .then(res => res.json())
    .then(projects => {
      const list = document.getElementById('project-list');
      projects.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${p.title}</strong><p>${p.description}</p><a href="${p.link}" target="_blank">View on GitHub</a>`;
        list.appendChild(li);
      });
    })
    .catch(err => console.error('Error loading projects:', err));

  // Load blog posts
  fetch('blog.json')
    .then(res => res.json())
    .then(posts => {
      const list = document.getElementById('blog-list');
      posts.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${p.title}</strong> <em>(${p.date})</em><p>${p.excerpt}</p><a href="${p.link}" target="_blank">Read more</a>`;
        list.appendChild(li);
      });
    })
    .catch(err => console.error('Error loading blog posts:', err));
});
