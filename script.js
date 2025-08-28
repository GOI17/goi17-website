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
      const titleElement = document.querySelector('[data-i18n="title"]');
      if (titleElement) {
        document.title = titleElement.textContent || t.title;
      }
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
          el.innerText = t[key];
        }
      });

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

      /* Load blog posts (only on blog page) */
      const blogList = document.getElementById('blog-list');
      if (blogList) {
        fetch('blog.json')
          .then(res => res.json())
          .then(posts => {
            posts.forEach(p => {
              const li = document.createElement('li');
              // Use the correct translation key pattern: blog_<key>_title / blog_<key>_excerpt
              const titleKey = `blog_${p.key}_title`;
              const excerptKey = `blog_${p.key}_excerpt`;

              // Get title and excerpt based on current language
              let title = t[titleKey] || p.title;
              let excerpt = t[excerptKey] || p.excerpt;

              if (storedLang === 'es') {
                title = p.title_es || title;
                excerpt = p.excerpt_es || excerpt;
              }

              li.innerHTML = `<strong>${title}</strong> <em>(${p.date})</em><p>${excerpt}</p><a href="post.html?file=${encodeURIComponent(p.link)}">${t.read_more || "Read more"}</a>`;
              blogList.appendChild(li);
            });
          })
          .catch(err => console.error('Error loading blog posts:', err));
      }

      /* Handle blog post loading (only on post page) */
      const postContent = document.getElementById('post-content');
      if (postContent) {
        const urlParams = new URLSearchParams(window.location.search);
        const file = urlParams.get('file');
        if (file) {
          fetch(file)
            .then(r => r.text())
            .then(md => {
              // Split content by language sections (separated by ---)
              const sections = md.split(/^---$/gm).filter(section => section.trim());
              let contentToShow = md; // Default to full content

              if (sections.length > 1) {
                // Find the section that matches the current language
                const englishSection = sections.find(section =>
                  section.includes('# Understanding Carets') ||
                  section.includes('# Why you should not compare') ||
                  section.includes('# Docker is OK')
                );
                const spanishSection = sections.find(section =>
                  section.includes('# Entendiendo los Carets') ||
                  section.includes('# ¿Por qué no deberías') ||
                  section.includes('# Docker está bien')
                );

                // Show content based on current language
                if (storedLang === 'es' && spanishSection) {
                  contentToShow = spanishSection.trim();
                } else if (storedLang === 'en' && englishSection) {
                  contentToShow = englishSection.trim();
                }
              }

              postContent.innerHTML = marked.parse(contentToShow);
            })
            .catch(err => console.error('Error loading post:', err));
        }
      }

      /* Back button for post view */
      const backBtn = document.getElementById('post-back');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          window.location.href = 'blog.html';
        });
      }
    })
    .catch(err => console.error('Error loading translations:', err));
});
