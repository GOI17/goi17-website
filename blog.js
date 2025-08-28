// Wait for translations to be loaded before initializing
window.addEventListener('translationsLoaded', (event) => {
  const { translations: t, lang: storedLang } = event.detail;

  /* Load blog posts (only on blog page) */
  const blogList = document.getElementById('blog-list');
  if (blogList) {
    fetch('blog.json')
      .then(res => res.json())
      .then(posts => {
        const cardGrid = document.createElement('div');
        cardGrid.className = 'card-grid';

        posts.forEach(p => {
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

          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <div class="date">${p.date}</div>
            <h3>${title}</h3>
            <p>${excerpt}</p>
            <a href="post.html?file=${encodeURIComponent(p.link)}" class="btn btn-sm">${t.read_more || "Read more"} →</a>
          `;
          cardGrid.appendChild(card);
        });

        blogList.appendChild(cardGrid);
      })
      .catch(err => console.error('Error loading blog posts:', err));
  }
});