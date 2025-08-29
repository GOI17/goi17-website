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
    console.log('Fetching post file:', postFile);
    fetch(postFile)
      .then(r => {
        console.log('Fetch response status:', r.status);
        console.log('Response ok:', r.ok);
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.text();
      })
      .then(md => {
        console.log('Markdown loaded successfully, length:', md.length);
        console.log('Markdown preview:', md.substring(0, 300) + '...');

        // Check if AI summary section exists
        const hasAISummary = md.includes('## 🤖 AI Summary:');
        console.log('Contains AI Summary section:', hasAISummary);

        const summary = extractAISummary(md);
        const title = extractTitle(md);

        console.log('Final extracted title:', title);
        console.log('Final extracted summary exists:', !!summary);

        console.log('Setting modal content:');
        console.log('Title:', title);
        console.log('Summary available:', !!summary);
        console.log('Summary length:', summary ? summary.length : 0);

        modalTitle.textContent = `${storedLang === 'es' ? 'Resumen IA:' : 'AI Summary:'} ${title}`;

        if (summary && summary.trim()) {
          modalSummary.innerHTML = summary;
          console.log('Modal content set successfully');
        } else {
          const noSummaryMsg = storedLang === 'es' ? 'Resumen no disponible' : 'Summary not available';
          modalSummary.innerHTML = `<p style="text-align: center; color: #666;">${noSummaryMsg}</p>`;
          console.log('No summary available, showing fallback message');
        }
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
    console.log('Extracting AI summary from markdown, length:', md.length);
    console.log('First 500 chars:', md.substring(0, 500));

    // Find the AI Summary section - more flexible pattern
    const summaryMatch = md.match(/## 🤖 AI Summary:.*?\n([\s\S]*?)(?=---|\n## |\n### |\*\*|$)/);
    console.log('Summary match result:', summaryMatch);

    if (summaryMatch && summaryMatch[1]) {
      const summaryContent = summaryMatch[1].trim();
      console.log('Summary content length:', summaryContent.length);
      console.log('Summary content preview:', summaryContent.substring(0, 200));

      if (summaryContent.length > 0) {
        try {
          const parsed = marked.parse(summaryContent);
          console.log('Successfully parsed summary, length:', parsed.length);
          return parsed;
        } catch (error) {
          console.error('Error parsing summary with marked:', error);
          return `<pre>${summaryContent}</pre>`; // Return as preformatted text
        }
      }
    }

    // Try a simpler pattern
    const simpleMatch = md.match(/## 🤖 AI Summary:(.*?)(?=---|$)/s);
    console.log('Simple match result:', simpleMatch);

    if (simpleMatch && simpleMatch[1]) {
      const content = simpleMatch[1].trim();
      console.log('Simple match content length:', content.length);
      if (content.length > 0) {
        try {
          return marked.parse(content);
        } catch (error) {
          console.error('Error parsing simple match:', error);
          return `<pre>${content}</pre>`;
        }
      }
    }

    // Last resort: look for any content after AI Summary
    const lines = md.split('\n');
    let inSummary = false;
    let summaryLines = [];

    for (const line of lines) {
      if (line.includes('## 🤖 AI Summary:')) {
        inSummary = true;
        continue;
      }

      if (inSummary) {
        if (line.startsWith('## ') || line.startsWith('### ') || line.trim() === '---') {
          break; // Stop at next section or separator
        }
        if (line.trim()) {
          summaryLines.push(line);
        }
      }
    }

    if (summaryLines.length > 0) {
      const manualContent = summaryLines.join('\n').trim();
      console.log('Manual extraction content length:', manualContent.length);
      if (manualContent.length > 0) {
        try {
          return marked.parse(manualContent);
        } catch (error) {
          console.error('Error parsing manual extraction:', error);
          return `<pre>${manualContent}</pre>`;
        }
      }
    }

    console.log('No AI summary found in the content');
    return null;
  }
});