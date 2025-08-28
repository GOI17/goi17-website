// Wait for translations to be loaded before initializing
window.addEventListener('translationsLoaded', (event) => {
  const { translations: t, lang: storedLang } = event.detail;

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
});