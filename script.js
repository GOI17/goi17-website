document.addEventListener('DOMContentLoaded', () => {
  /* Language selector logic */
  const storedLang = localStorage.getItem('lang') || 'en';
  document.documentElement.lang = storedLang;
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.value = storedLang;
    langSelect.addEventListener('change', (e) => {
      const newLang = e.target.value;
      localStorage.setItem('lang', newLang);
      document.documentElement.lang = newLang;
      location.reload();
    });
  }

  /* Theme selector logic */
  const storedTheme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.body.classList.add(storedTheme + '-theme');
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.value = storedTheme;
    themeSelect.addEventListener('change', (e) => {
      const newTheme = e.target.value;
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(newTheme + '-theme');
      localStorage.setItem('theme', newTheme);
    });
  }

  /* Load translations and apply them */
  fetch('translations.json')
    .then(res => res.json())
    .then(translations => {
      const t = translations[storedLang] || translations['en'];

      /* Set page title and translate all elements with data-i18n */
      document.title = t.title;
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
          el.innerText = t[key];
        }
      });

      /* Load projects */
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

      /* Load blog posts */
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

      /* Section loader */
      const sections = {
        home: document.getElementById('home'),
        projects: document.getElementById('projects'),
        blog: document.getElementById('blog'),
        twitch: document.getElementById('twitch')
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

      loadSection(location.hash);
      window.addEventListener('hashchange', () => loadSection(location.hash));
    })
    .catch(err => console.error('Error loading translations:', err));
});
