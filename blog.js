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
            <div class="card-actions">
              <button class="btn btn-sm summary-btn" data-post="${p.link}">
                📋 ${storedLang === 'es' ? 'Mostrar Resumen' : 'Show Summary'}
              </button>
              <a href="post.html?file=${encodeURIComponent(p.link)}" class="btn btn-sm">
                ${t.read_more || "Read more"} →
              </a>
            </div>
          `;
          cardGrid.appendChild(card);
        });

        blogList.appendChild(cardGrid);

        // Initialize summary modal functionality
        initSummaryModal();
      })
      .catch(err => console.error('Error loading blog posts:', err));
  }

  // Summary Modal Functionality
  function initSummaryModal() {
    // Create modal HTML
    const modalHTML = `
      <div id="summary-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modal-title">AI Summary</h3>
            <button class="modal-close" aria-label="Close modal">✕</button>
          </div>
          <div class="modal-body" id="modal-summary">
            <!-- Summary content will be loaded here -->
          </div>
        </div>
      </div>
    `;

    // Add modal to page
    console.log('Adding modal to page');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('Modal HTML added to body');

    // Add event listeners for summary buttons
    document.addEventListener('click', (e) => {
      console.log('Click event:', e.target.className, e.target.tagName);

      if (e.target.classList.contains('summary-btn')) {
        console.log('Summary button clicked');
        e.preventDefault();
        const postFile = e.target.getAttribute('data-post');
        console.log('Post file:', postFile);
        showSummaryModal(postFile);
      }

      if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-overlay')) {
        console.log('Modal close triggered');
        hideSummaryModal();
      }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.getElementById('summary-modal').style.display !== 'none') {
        hideSummaryModal();
      }
    });
  }

  function showSummaryModal(postFile) {
    console.log('Showing summary modal for:', postFile);

    const modal = document.getElementById('summary-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalSummary = document.getElementById('modal-summary');

    console.log('Modal elements found:', {
      modal: !!modal,
      modalTitle: !!modalTitle,
      modalSummary: !!modalSummary
    });

    // Show loading state
    modalTitle.textContent = storedLang === 'es' ? 'Cargando Resumen...' : 'Loading Summary...';
    modalSummary.innerHTML = '<div class="loading">🤖</div>';
    modal.style.display = 'flex';

    console.log('Modal displayed, fetching post:', postFile);

    // Load the blog post and extract AI summary
    fetch(postFile)
      .then(r => {
        console.log('Fetch response status:', r.status);
        return r.text();
      })
      .then(md => {
        console.log('Markdown loaded, length:', md.length);
        const summary = extractAISummary(md);
        const title = extractTitle(md);

        console.log('Extracted title:', title);
        console.log('Extracted summary:', summary);

        modalTitle.textContent = `${storedLang === 'es' ? 'Resumen IA:' : 'AI Summary:'} ${title}`;
        modalSummary.innerHTML = summary || (storedLang === 'es' ? 'Resumen no disponible' : 'Summary not available');
      })
      .catch(err => {
        console.error('Error loading summary:', err);
        modalTitle.textContent = storedLang === 'es' ? 'Error al cargar resumen' : 'Error loading summary';
        modalSummary.innerHTML = storedLang === 'es' ? 'No se pudo cargar el resumen.' : 'Could not load summary.';
      });
  }

  function hideSummaryModal() {
    const modal = document.getElementById('summary-modal');
    modal.style.display = 'none';
  }

  function extractTitle(md) {
    // Extract title from frontmatter or first h1
    const titleMatch = md.match(/^title:\s*([^#\n]+)/m) ||
                      md.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : 'Blog Post';
  }

  function extractAISummary(md) {
    console.log('Extracting AI summary from:', md.substring(0, 200) + '...');

    // Find the AI Summary section
    const summaryMatch = md.match(/## 🤖 AI Summary:.*?\n([\s\S]*?)(?=---|\n## |\n### |\*\*|$)/);
    console.log('Summary match found:', !!summaryMatch);

    if (summaryMatch) {
      console.log('Summary content:', summaryMatch[1].trim());
      try {
        const parsed = marked.parse(summaryMatch[1].trim());
        console.log('Parsed summary:', parsed);
        return parsed;
      } catch (error) {
        console.error('Error parsing summary:', error);
        return summaryMatch[1].trim(); // Return raw text if parsing fails
      }
    }

    // Fallback: look for any summary-like content
    const fallbackMatch = md.match(/(?:##|###).*?(?:summary|resumen|takeaways|conclusión).*?\n([\s\S]*?)(?=---|\n## |\n### |\*\*|$)/i);
    console.log('Fallback match found:', !!fallbackMatch);

    if (fallbackMatch) {
      console.log('Fallback content:', fallbackMatch[1].trim());
      try {
        const parsed = marked.parse(fallbackMatch[1].trim());
        console.log('Parsed fallback:', parsed);
        return parsed;
      } catch (error) {
        console.error('Error parsing fallback:', error);
        return fallbackMatch[1].trim(); // Return raw text if parsing fails
      }
    }

    console.log('No summary found');
    return null;
  }
});