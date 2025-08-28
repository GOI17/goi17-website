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

      // Make translations available globally for other scripts
      window.translations = t;
      window.currentLang = storedLang;

      // Dispatch event to notify other scripts that translations are loaded
      window.dispatchEvent(new CustomEvent('translationsLoaded', { detail: { translations: t, lang: storedLang } }));
    })
    .catch(err => console.error('Error loading translations:', err));
});