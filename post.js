// Wait for translations to be loaded before initializing
window.addEventListener('translationsLoaded', (event) => {
  const { translations: t, lang: storedLang } = event.detail;

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
});