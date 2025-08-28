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
              section.includes('# Rendering Strategies for Frontend') ||
              section.includes('# Understanding Carets') ||
              section.includes('# Why you should not compare') ||
              section.includes('# Docker is OK')
            );
            const spanishSection = sections.find(section =>
              section.includes('# Estrategias de Renderizado para Frontend') ||
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

  /* Scroll to Top Button */
  const initScrollToTop = () => {
    // Create scroll-to-top button
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scroll-to-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.title = storedLang === 'es' ? 'Volver arriba' : 'Scroll to Top';
    scrollBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--header-bg);
      color: var(--fg);
      border: 2px solid var(--link-color);
      font-size: 20px;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Add hover effects
    scrollBtn.onmouseover = () => {
      scrollBtn.style.background = 'var(--link-color)';
      scrollBtn.style.color = 'var(--bg)';
    };
    scrollBtn.onmouseout = () => {
      scrollBtn.style.background = 'var(--header-bg)';
      scrollBtn.style.color = 'var(--fg)';
    };

    // Scroll to top function
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    // Show/hide button based on scroll position
    const toggleScrollButton = () => {
      const scrolled = window.pageYOffset;
      const threshold = 300; // Show after scrolling 300px

      if (scrolled > threshold) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.visibility = 'visible';
      } else {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.visibility = 'hidden';
      }
    };

    // Add click event
    scrollBtn.addEventListener('click', scrollToTop);

    // Add scroll event listener
    window.addEventListener('scroll', toggleScrollButton);

    // Append to body
    document.body.appendChild(scrollBtn);
  };

  // Initialize scroll to top button
  initScrollToTop();
});