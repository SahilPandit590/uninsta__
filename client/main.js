// State management
const state = {
  user: null,
  token: null,
  posts: []
};

// Config
const API_URL = '/api'; // Adjusted for Vercel unified deployment

// --- Initialization ---

function init() {
  const storedUser = localStorage.getItem('uninsta_user');
  const storedToken = localStorage.getItem('uninsta_token');
  
  if (storedUser && storedToken) {
    state.user = JSON.parse(storedUser);
    state.token = storedToken;
  }

  updateNavbar();
  route();
}

// --- Routing & Views ---

function route() {
  const hash = window.location.hash.slice(1) || '/';
  const appEl = document.getElementById('app');
  appEl.innerHTML = '<div class="loader"></div>';

  if (hash === '/') {
    renderHome();
  } else if (hash === '/login') {
    renderLogin();
  } else if (hash === '/register') {
    renderRegister();
  } else if (hash === '/upload') {
    if (!state.token) return navigateTo('/login');
    renderUpload();
  } else if (hash.startsWith('/post/')) {
    const postId = hash.split('/')[2];
    renderPostDetail(postId);
  } else {
    appEl.innerHTML = '<h2>404 - Page not found</h2>';
  }
}

window.addEventListener('hashchange', route);

function navigateTo(path) {
  window.location.hash = path;
}

// --- UI Components ---

function updateNavbar() {
  const navLinks = document.getElementById('nav-links');
  if (state.user) {
    navLinks.innerHTML = `
      <span style="color: var(--text-muted); font-size: 0.9rem;">Welcome, ${state.user.username}</span>
      <a href="#/" class="btn btn-ghost">Feed</a>
      <a href="#/upload" class="btn btn-primary">Upload PDF</a>
      <button id="logout-btn" class="btn btn-ghost">Logout</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', () => {
      localStorage.removeItem('uninsta_user');
      localStorage.removeItem('uninsta_token');
      state.user = null;
      state.token = null;
      updateNavbar();
      navigateTo('/login');
      showToast('Logged out successfully');
    });
  } else {
    navLinks.innerHTML = `
      <a href="#/" class="btn btn-ghost">Feed</a>
      <a href="#/login" class="btn btn-ghost">Login</a>
      <a href="#/register" class="btn btn-primary">Sign Up</a>
    `;
  }

  document.querySelector('.nav-brand').onclick = () => navigateTo('/');
}

function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${isError ? 'error' : ''}`;
  setTimeout(() => {
    toast.className = 'toast hidden';
  }, 3000);
}

// --- API Helpers ---

async function fetchAPI(endpoint, options = {}) {
  const headers = { ...options.headers };
  if (state.token && !options.body instanceof FormData) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  
  if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
  }

  // Allow formdata through without setting content type strictly (browser handles boundary)
  if (options.body instanceof FormData && state.token) {
     headers['Authorization'] = `Bearer ${state.token}`;
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();
    
    if (res.status === 429) {
      throw new Error(data.message || 'Too many requests. Please slow down (1 req / 10s).');
    }
    
    if (!res.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  } catch (err) {
    showToast(err.message, true);
    throw err;
  }
}

// --- Render Functions ---

async function renderHome() {
  const appEl = document.getElementById('app');
  appEl.innerHTML = `
    <div class="posts-header">
      <h2>Recent Resources</h2>
      <select id="category-filter" class="form-control" style="width: 200px;">
        <option value="">All Categories</option>
        <option value="Computer Science">Computer Science</option>
        <option value="Mathematics">Mathematics</option>
        <option value="Physics">Physics</option>
        <option value="Literature">Literature</option>
      </select>
    </div>
    <div id="posts-container" class="posts-grid"><div class="loader"></div></div>
  `;

  document.getElementById('category-filter').addEventListener('change', (e) => {
    loadPosts(e.target.value);
  });

  await loadPosts();
}

async function loadPosts(category = '') {
  const container = document.getElementById('posts-container');
  try {
    const query = category ? `?subjectCategory=${encodeURIComponent(category)}` : '';
    const posts = await fetchAPI(`/posts${query}`);
    
    if (posts.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">No resources found. Be the first to upload!</p>';
      return;
    }

    container.innerHTML = posts.map(post => `
      <div class="glass-panel post-card" onclick="window.location.hash='/post/${post._id}'">
        <h3 class="post-card-title">${escapeHTML(post.title)}</h3>
        <p class="post-card-desc">${escapeHTML(post.description.substring(0, 100))}${post.description.length > 100 ? '...' : ''}</p>
        <div class="post-meta">
          <span class="badge">${escapeHTML(post.subjectCategory)}</span>
          <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right:4px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> ${post.views}</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">
          By ${escapeHTML(post.author.username)}
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p class="error">Failed to load posts.</p>';
  }
}

function renderLogin() {
  const appEl = document.getElementById('app');
  appEl.innerHTML = `
    <div class="auth-wrapper glass-panel">
      <h2>Welcome Back</h2>
      <form id="login-form">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="email" class="form-control" required placeholder="john@university.edu" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="password" class="form-control" required placeholder="••••••••" />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Log In</button>
      </form>
      <p>Don't have an account? <a href="#/register">Sign Up</a></p>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Logging in...';
    btn.disabled = true;

    try {
      const data = await fetchAPI('/auth/login', {
        method: 'POST',
        body: {
          email: e.target.email.value,
          password: e.target.password.value
        }
      });
      
      handleAuthSuccess(data);
    } catch (err) {
      btn.textContent = 'Log In';
      btn.disabled = false;
    }
  });
}

function renderRegister() {
  const appEl = document.getElementById('app');
  appEl.innerHTML = `
    <div class="auth-wrapper glass-panel">
      <h2>Join Uninsta</h2>
      <form id="register-form">
        <div class="form-group">
          <label>Username</label>
          <input type="text" id="username" class="form-control" required placeholder="johndoe123" />
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="email" class="form-control" required placeholder="john@university.edu" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="password" class="form-control" required minlength="6" placeholder="••••••••" />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Create Account</button>
      </form>
      <p>Already have an account? <a href="#/login">Log In</a></p>
    </div>
  `;

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Creating...';
    btn.disabled = true;

    try {
      const data = await fetchAPI('/auth/register', {
        method: 'POST',
        body: {
          username: e.target.username.value,
          email: e.target.email.value,
          password: e.target.password.value
        }
      });
      
      handleAuthSuccess(data);
    } catch (err) {
      btn.textContent = 'Create Account';
      btn.disabled = false;
    }
  });
}

function handleAuthSuccess(data) {
  state.user = { id: data._id, username: data.username, email: data.email };
  state.token = data.token;
  localStorage.setItem('uninsta_user', JSON.stringify(state.user));
  localStorage.setItem('uninsta_token', state.token);
  
  updateNavbar();
  navigateTo('/');
  showToast('Authentication successful!');
}

function renderUpload() {
  const appEl = document.getElementById('app');
  appEl.innerHTML = `
    <div class="glass-panel" style="max-width: 600px; margin: 0 auto;">
      <h2 style="margin-bottom: 2rem;">Share a Resource</h2>
      <form id="upload-form">
        <div class="form-group">
          <label>Resource Title</label>
          <input type="text" id="title" class="form-control" required placeholder="Introduction to Machine Learning Notes" />
        </div>
        <div class="form-group">
          <label>Subject Category</label>
          <select id="category" class="form-control" required>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Literature">Literature</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="description" class="form-control" required placeholder="Detailed notes covering Chapter 1-4..."></textarea>
        </div>
        <div class="form-group">
          <label>PDF File (Max 10MB)</label>
          <input type="file" id="pdf" class="form-control" accept="application/pdf" required />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Upload Resource</button>
      </form>
    </div>
  `;

  document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const fileEl = document.getElementById('pdf');
    
    if (fileEl.files[0].size > 10 * 1024 * 1024) {
      return showToast('File size must be less than 10MB', true);
    }

    btn.textContent = 'Uploading to Cloudflare R2...';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('subjectCategory', document.getElementById('category').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('pdf', fileEl.files[0]);

    try {
      await fetchAPI('/posts', {
        method: 'POST',
        body: formData // Fetch API doesn't need content-type for FormData
      });
      
      showToast('Resource uploaded successfully!');
      setTimeout(() => navigateTo('/'), 1000);
    } catch (err) {
      btn.textContent = 'Upload Resource';
      btn.disabled = false;
    }
  });
}

async function renderPostDetail(id) {
  const appEl = document.getElementById('app');
  appEl.innerHTML = '<div class="loader"></div>';

  try {
    const data = await fetchAPI(`/posts/${id}`);
    const { post, comments } = data;

    appEl.innerHTML = `
      <div class="post-detail">
        <div class="post-detail-header">
          <span class="badge" style="margin-bottom: 1rem; display: inline-block;">${escapeHTML(post.subjectCategory)}</span>
          <h1>${escapeHTML(post.title)}</h1>
          <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto;">${escapeHTML(post.description)}</p>
          <div style="margin-top: 1rem; color: var(--text-muted); font-size: 0.9rem;">
            Uploaded by <strong>${escapeHTML(post.author.username)}</strong> • ${post.views} views
          </div>
        </div>

        <div class="pdf-container">
          <iframe src="${post.pdfUrl}#toolbar=0" frameborder="0"></iframe>
        </div>

        <div class="comments-section glass-panel">
          <h3>Discussion</h3>
          ${state.token ? `
            <form id="comment-form" style="margin-top: 1.5rem; display: flex; gap: 1rem;">
              <input type="text" id="comment-text" class="form-control" style="flex-grow: 1;" placeholder="Add to the discussion..." required />
              <button type="submit" class="btn btn-primary">Post</button>
            </form>
          ` : `
            <p style="margin-top: 1rem; color: var(--text-muted);">Please <a href="#/login">log in</a> to leave a comment.</p>
          `}
          
          <div class="comments-list" id="comments-list">
            ${comments.length ? comments.map(c => `
              <div class="comment-item">
                <div class="comment-author">${escapeHTML(c.author.username)} <span style="color: var(--text-muted); font-size: 0.75rem; font-weight: normal;">${new Date(c.createdAt).toLocaleDateString()}</span></div>
                <div class="comment-text">${escapeHTML(c.text)}</div>
              </div>
            `).join('') : '<p style="color: var(--text-muted);">No comments yet.</p>'}
          </div>
        </div>
      </div>
    `;

    if (state.token) {
      document.getElementById('comment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const textInput = document.getElementById('comment-text');
        const text = textInput.value;
        const btn = e.target.querySelector('button');
        
        btn.disabled = true;
        try {
          const newComment = await fetchAPI(`/posts/${id}/comments`, {
            method: 'POST',
            body: { text }
          });
          
          // Prepend new comment to UI
          const listEl = document.getElementById('comments-list');
          if(listEl.innerHTML.includes('No comments yet')) listEl.innerHTML = '';
          
          listEl.insertAdjacentHTML('afterbegin', `
            <div class="comment-item" style="animation: fadeIn 0.3s ease;">
              <div class="comment-author">${escapeHTML(newComment.author.username)} <span style="color: var(--text-muted); font-size: 0.75rem; font-weight: normal;">Just now</span></div>
              <div class="comment-text">${escapeHTML(newComment.text)}</div>
            </div>
          `);
          textInput.value = '';
          showToast('Comment added');
        } catch (err) {
          // Handled by fetchAPI
        } finally {
          btn.disabled = false;
        }
      });
    }

  } catch (err) {
    appEl.innerHTML = '<div class="glass-panel" style="text-align: center;"><h2>Error loading record.</h2><button class="btn btn-primary" onclick="route()">Go Back</button></div>';
  }
}

// Security Helper to prevent DOM XSS when parsing JSON to InnerHTML
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Start
init();
