const API_BASE = "http://localhost:5000/api";
const POSTS_API = `${API_BASE}/posts`;
const USERS_API = `${API_BASE}/users`;
const COMMENTS_API = `${API_BASE}/comments`;
const FOLLOW_API = `${API_BASE}/follow`;

// Premium Customizations & Helpers

let activeTagFilter = null;
let showBookmarksOnly = false;
let feedSortMode = 'forYou'; // 'forYou' | 'latest'


// Avatar custom seed and style parser
function getAvatarUrl(user) {
    if (!user) return `https://api.dicebear.com/7.x/adventurer/svg?seed=default`;
    const img = user.profileImage || "";
    if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) {
        return img;
    }
    if (img.includes(":")) {
        const [style, seed] = img.split(":");
        return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    }
    const seed = img && img !== "default.png" ? img : user.username;
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
}

// Verification badges for realistic creators
function getVerificationBadge(username) {
    const verifiedUsers = ["admin", "connectify", "sparky", "alex", "john_doe", "sarah", "dhruv"];
    if (verifiedUsers.includes(username.toLowerCase())) {
        return `<span class="verified-badge" title="Verified Connectify Creator">☑️</span>`;
    }
    return "";
}

// Parse hashtags and turn them into links
function formatPostContent(content) {
    if (!content) return "";
    let escaped = content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
        
    return escaped.replace(/#(\w+)/g, '<a class="hashtag-link" onclick="filterByTag(event, \'$1\')">#$1</a>');
}

// Bookmarks local storage management
function getBookmarks() {
    try {
        const bookmarks = localStorage.getItem("bookmarks");
        return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (e) {
        return [];
    }
}

function toggleBookmark(postId) {
    let bookmarks = getBookmarks();
    const idx = bookmarks.indexOf(postId);
    if (idx > -1) {
        bookmarks.splice(idx, 1);
        showToast("Removed from Bookmarks", "info");
    } else {
        bookmarks.push(postId);
        showToast("Added to Bookmarks", "success");
    }
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    
    const btn = document.getElementById(`bookmark-btn-${postId}`);
    if (btn) {
        btn.classList.toggle("bookmarked");
    }
    
    if (showBookmarksOnly) {
        loadPosts();
    }
}

// Unsplash Preset Images for creator card
const PRESET_IMAGES = [
    { name: "Coffee", url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop" },
    { name: "Tech", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop" },
    { name: "Nature", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop" },
    { name: "Travel", url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop" },
    { name: "Gaming", url: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop" },
    { name: "Setup", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop" }
];

function populatePresetPicker() {
    const grid = document.getElementById("presetImagesGrid");
    if (!grid) return;
    grid.innerHTML = PRESET_IMAGES.map(img => `
        <button type="button" class="preset-img-btn" onclick="selectPresetImage('${img.url}')" title="${img.name}">
            <img src="${img.url}" alt="${img.name}">
        </button>
    `).join("");
}

function togglePresetPicker() {
    const grid = document.getElementById("presetImagesGrid");
    if (!grid) return;
    grid.style.display = grid.style.display === "none" ? "grid" : "none";
    if (grid.innerHTML === "") {
        populatePresetPicker();
    }
}

function selectPresetImage(url) {
    const input = document.getElementById("postImageUrl");
    if (input) {
        input.value = url;
        handleImageInput(url);
    }
    const grid = document.getElementById("presetImagesGrid");
    if (grid) grid.style.display = "none";
}

function handleImageInput(url) {
    // This is for optional preset/URL mode.
    // If user uploads from gallery, selectedImageDataUrl will be used in createPost().
    selectedImageDataUrl = "";

    const previewContainer = document.getElementById("postImagePreviewContainer");
    const previewImg = document.getElementById("postImagePreview");
    if (!previewContainer || !previewImg) return;
    
    if (url.trim()) {
        previewImg.src = url.trim();
        previewContainer.style.display = "block";
    } else {
        previewContainer.style.display = "none";
    }
}

let selectedImageDataUrl = "";

function handleImageFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        selectedImageDataUrl = reader.result;
        const previewContainer = document.getElementById("postImagePreviewContainer");
        const previewImg = document.getElementById("postImagePreview");
        if (previewContainer) previewContainer.style.display = "block";
        if (previewImg) previewImg.src = selectedImageDataUrl;
    };
    reader.onerror = () => {
        showToast("Failed to read selected image.", "error");
        selectedImageDataUrl = "";
    };
    reader.readAsDataURL(file);
}

function removeImagePreview() {
    selectedImageDataUrl = "";

    const urlInput = document.getElementById("postImageUrl");
    if (urlInput) urlInput.value = "";

    const fileInput = document.getElementById("postImageFile");
    if (fileInput) fileInput.value = "";

    const previewContainer = document.getElementById("postImagePreviewContainer");
    if (previewContainer) previewContainer.style.display = "none";

    const previewImg = document.getElementById("postImagePreview");
    if (previewImg) previewImg.src = "";
}

// Hashtag Filters and Trending logic
function filterByTag(event, tag) {
    if (event) event.preventDefault();
    activeTagFilter = tag;
    
    // Switch navigation styles to Home Feed
    showBookmarksOnly = false;
    updateNavLinkActiveState("homeFeedNavLink");
    
    const filterPanel = document.getElementById("activeTagFilter");
    const filterText = document.getElementById("activeTagText");
    if (filterPanel && filterText) {
        filterText.innerText = `Filtered by: #${tag}`;
        filterPanel.style.display = "flex";
    }
    loadPosts();
}

function clearTagFilter() {
    activeTagFilter = null;
    const filterPanel = document.getElementById("activeTagFilter");
    if (filterPanel) {
        filterPanel.style.display = "none";
    }
    loadPosts();
}

function setFeedSort(mode) {
    feedSortMode = mode;

    const forYouBtn = document.getElementById("sortForYouBtn");
    const latestBtn = document.getElementById("sortLatestBtn");

    if (forYouBtn && latestBtn) {
        if (mode === 'forYou') {
            forYouBtn.classList.add('active');
            latestBtn.classList.remove('active');

            forYouBtn.classList.remove('btn-secondary');
            latestBtn.classList.add('btn-secondary');
        } else {
            latestBtn.classList.add('active');
            forYouBtn.classList.remove('active');

            latestBtn.classList.remove('btn-secondary');
            forYouBtn.classList.add('btn-secondary');
        }
    }

    loadPosts();
}


function toggleBookmarksFeed(event) {
    if (event) event.preventDefault();
    showBookmarksOnly = true;
    activeTagFilter = null;
    
    const filterPanel = document.getElementById("activeTagFilter");
    if (filterPanel) filterPanel.style.display = "none";
    
    updateNavLinkActiveState("bookmarksNavLink");
    loadPosts();
}

function updateNavLinkActiveState(activeId) {
    const links = ["homeFeedNavLink", "bookmarksNavLink"];
    links.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === activeId) {
                el.classList.add("active");
            } else {
                el.classList.remove("active");
            }
        }
    });
}

function renderTrendingWidget(posts) {
    const container = document.getElementById("trendingTopics");
    if (!container) return;
    
    const tagCounts = {};
    posts.forEach(post => {
        const tags = post.content.match(/#(\w+)/g);
        if (tags) {
            tags.forEach(tag => {
                const cleanTag = tag.substring(1).toLowerCase();
                tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
            });
        }
    });
    
    const defaultTrends = {
        "connectify": 42,
        "creativity": 31,
        "nature": 24,
        "tech2026": 18,
        "design": 14,
        "developer": 11
    };
    
    Object.keys(defaultTrends).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + defaultTrends[tag];
    });
    
    const sortedTrends = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
        
    const categories = ["Technology", "Lifestyle", "Trending", "Nature", "Business"];
    
    container.innerHTML = sortedTrends.map(([tag, count], index) => `
        <div class="trending-item" onclick="filterByTag(null, '${tag}')">
            <span class="trending-category">${categories[index % categories.length]}</span>
            <span class="trending-tag">#${tag}</span>
            <span class="trending-count">${count} posts</span>
        </div>
    `).join("");
}


// Theme management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
        themeBtn.innerText = newTheme === "dark" ? "☀️" : "🌙";
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <div>${message}</div>
    `;
    
    container.appendChild(toast);
    
    // Smooth fade out
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3600);
}

// Toggle password input visibility
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
}

// Session helpers
function getLoggedInUser() {
    try {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        return null;
    }
}

function getAuthToken() {
    return localStorage.getItem("token");
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showToast("Logged out successfully", "success");
    setTimeout(() => {
        window.location.href = "login.html";
    }, 500);
}

// Date formatter
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Global user state variables
let currentUserFollowing = new Set();

async function fetchCurrentUserFollowing() {
    const currentUser = getLoggedInUser();
    if (!currentUser) return;
    try {
        const response = await fetch(`${USERS_API}/profile/${currentUser.id}`);
        if (response.ok) {
            const data = await response.json();
            currentUserFollowing = new Set((data.following || []).map(f => f._id || f));
        }
    } catch (error) {
        console.error("Error fetching following list:", error);
    }
}

// Page initialization
document.addEventListener("DOMContentLoaded", () => {
    // Setup theme from local storage
    const currentTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
        themeBtn.innerText = currentTheme === "dark" ? "☀️" : "🌙";
    }

    const path = window.location.pathname;
    const page = path.split("/").pop();
    const user = getLoggedInUser();

    // Route guards
    if (page === "login.html" || page === "register.html") {
        if (user) {
            window.location.href = "index.html";
        }
        return;
    }

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Check for Bookmarks landing from Profile page URL query
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("feed") === "bookmarks") {
        showBookmarksOnly = true;
        updateNavLinkActiveState("bookmarksNavLink");
    }

    // Render navigation sidebar elements
    renderSidebarUser(user);

    if (page === "index.html" || page === "") {
        const createPostAvatar = document.getElementById("createPostUserAvatar");
        if (createPostAvatar) {
            createPostAvatar.src = getAvatarUrl(user);
        }
        loadPosts();
        loadSuggestions();
    } else if (page === "profile.html") {
        initProfilePage(user);
    }
});

function renderSidebarUser(user) {
    const container = document.getElementById("currentUserCard");
    if (!container) return;
    container.innerHTML = `
        <img src="${getAvatarUrl(user)}" alt="${user.username}" class="avatar">
        <div class="user-info" style="flex: 1;">
            <div class="user-displayname" style="cursor: pointer;" onclick="window.location.href='profile.html'">
                ${user.username} ${getVerificationBadge(user.username)}
            </div>
            <div class="user-handle" style="cursor: pointer; color: var(--danger); font-weight:600;" onclick="logout()">Logout 📤</div>
        </div>
    `;
}

// Authentication handlers
async function registerUser() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !email || !password) {
        showToast("Please fill in all registration fields.", "error");
        return;
    }

    try {
        const response = await fetch(`${USERS_API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        
        if (response.ok) {
            showToast("Registration Successful! Redirecting to login...", "success");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } else {
            showToast(data.message || "Registration failed.", "error");
        }
    } catch (error) {
        showToast("Error connecting to backend.", "error");
    }
}

async function loginUser() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showToast("Please enter email and password.", "error");
        return;
    }

    try {
        const response = await fetch(`${USERS_API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            showToast("Login successful! Welcome back.", "success");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        } else {
            showToast(data.message || "Invalid credentials.", "error");
        }
    } catch (error) {
        showToast("Error connecting to backend.", "error");
    }
}

// Characters limit update
function updateCharCount() {
    const content = document.getElementById("content").value;
    const counter = document.getElementById("charCounter");
    if (counter) {
        counter.innerText = `${content.length} / 280`;
        if (content.length > 280) {
            counter.style.color = "var(--danger)";
        } else {
            counter.style.color = "var(--text-muted)";
        }
    }
}

// Create post handler
async function createPost() {
    const user = getLoggedInUser();
    const content = document.getElementById("content").value.trim();

    // image can be either: uploaded file (base64 data URL) OR preset/URL
    const urlInput = document.getElementById("postImageUrl");
    const imageFromUrl = urlInput ? urlInput.value.trim() : "";
    const image = selectedImageDataUrl || imageFromUrl;

    if (!content) {
        showToast("Post content cannot be empty.", "error");
        return;
    }
    if (content.length > 280) {
        showToast("Post content exceeds 280 characters limit.", "error");
        return;
    }

    try {
        const response = await fetch(POSTS_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user: user.id,
                content,
                image
            })
        });

        if (response.ok) {
            showToast("Post created successfully!", "success");
            document.getElementById("content").value = "";
            document.getElementById("postImageUrl").value = "";
            removeImagePreview();
            updateCharCount();
            loadPosts();
        } else {
            const data = await response.json();
            showToast(data.message || "Failed to create post.", "error");
        }
    } catch (error) {
        showToast("Error creating post.", "error");
    }
}

// Load feed posts
async function loadPosts() {
    const currentUser = getLoggedInUser();
    await fetchCurrentUserFollowing();

    try {
        const response = await fetch(POSTS_API);
        let posts = await response.json();

        // Feed sorting
        if (feedSortMode === 'latest') {
            posts = posts.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        const postsContainer = document.getElementById("posts");

        if (!postsContainer) return;

        // Render Trending side panel based on initial raw posts
        renderTrendingWidget(posts);

        // Client-side filtering: Hashtags & Bookmarks
        if (activeTagFilter) {
            const lowerTag = activeTagFilter.toLowerCase();
            posts = posts.filter(post => 
                post.content.toLowerCase().includes(`#${lowerTag}`)
            );
        }

        if (showBookmarksOnly) {
            const bookmarks = getBookmarks();
            posts = posts.filter(post => bookmarks.includes(post._id));
        }

        if (posts.length === 0) {
            const msg = showBookmarksOnly 
                ? "No bookmarked posts yet. Save posts to read them later!"
                : activeTagFilter 
                    ? `No posts found matching #${activeTagFilter}.`
                    : "No posts yet. Be the first to share something!";
            postsContainer.innerHTML = `
                <div class="glass-card post-card" style="text-align: center; color: var(--text-muted); padding: 40px;">
                    ${msg}
                </div>
            `;
            return;
        }

        let html = "";
        posts.forEach(post => {
            const isLiked = post.likes.includes(currentUser.id);
            const likeBtnClass = isLiked ? "post-action-btn liked" : "post-action-btn";
            const deleteBtnHtml = post.user._id === currentUser.id 
                ? `<button class="post-delete-btn" onclick="deletePost('${post._id}')" title="Delete Post">🗑️</button>` 
                : "";

            const postImageHtml = post.image 
                ? `<img src="${post.image}" alt="Post Image" class="post-image" onerror="this.style.display='none'">` 
                : "";

            const isBookmarked = getBookmarks().includes(post._id);
            const bookmarkBtnClass = isBookmarked ? "post-action-btn bookmark-btn bookmarked" : "post-action-btn bookmark-btn";

            html += `
                <div class="post-card glass-card" id="post-${post._id}">
                    <div class="post-header">
                        <div class="post-author" onclick="viewUserProfile('${post.user._id}')">
                            <img src="${getAvatarUrl(post.user)}" alt="${post.user.username}" class="avatar" style="width: 40px; height: 40px;">
                            <div>
                                <div class="post-author-name">
                                    ${post.user.username} ${getVerificationBadge(post.user.username)}
                                </div>
                                <div class="post-time">${formatRelativeTime(post.createdAt)}</div>
                            </div>
                        </div>
                        ${deleteBtnHtml}
                    </div>
                    
                    <div class="post-content">${formatPostContent(post.content)}</div>
                    ${postImageHtml}
                    
                    <div class="post-footer">
                        <button class="${likeBtnClass}" onclick="toggleLike('${post._id}')">
                            ❤️ <span id="like-count-${post._id}">${post.likes.length}</span>
                        </button>
                        <button class="post-action-btn" onclick="toggleCommentsSection('${post._id}')">
                            💬 Comment
                        </button>
                        <button class="${bookmarkBtnClass}" id="bookmark-btn-${post._id}" onclick="toggleBookmark('${post._id}')">
                            🔖 <span>Bookmark</span>
                        </button>
                    </div>
                    
                    <!-- Inline Comments Section -->
                    <div class="comments-section" id="comments-section-${post._id}" style="display: none;">
                        <div id="comments-list-${post._id}">
                            <div style="color: var(--text-muted); font-size: 0.85rem;">Loading comments...</div>
                        </div>
                        <div class="create-comment-form">
                            <input type="text" id="comment-input-${post._id}" class="comment-input" placeholder="Write a comment..." onkeydown="handleCommentSubmit(event, '${post._id}')">
                            <button class="btn comment-submit-btn" onclick="submitComment('${post._id}')">Post</button>
                        </div>
                    </div>
                </div>
            `;
        });

        postsContainer.innerHTML = html;
    } catch (error) {
        showToast("Error loading posts feed.", "error");
    }
}

// Toggle post likes
async function toggleLike(postId) {
    const currentUser = getLoggedInUser();
    
    // Heart popping micro-animation trigger
    const likeBtn = document.querySelector(`#post-${postId} .post-action-btn:first-child`);
    if (likeBtn) {
        likeBtn.classList.add("heart-pop");
        setTimeout(() => likeBtn.classList.remove("heart-pop"), 350);
    }

    try {
        const response = await fetch(`${POSTS_API}/like/${postId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: currentUser.id })
        });
        const updatedPost = await response.json();
        
        if (response.ok) {
            const isLiked = updatedPost.likes.includes(currentUser.id);
            const likeCountSpan = document.getElementById(`like-count-${postId}`);
            
            if (likeCountSpan) likeCountSpan.innerText = updatedPost.likes.length;
            if (likeBtn) {
                if (isLiked) {
                    likeBtn.classList.add("liked");
                } else {
                    likeBtn.classList.remove("liked");
                }
            }
        }
    } catch (error) {
        showToast("Error updating like status.", "error");
    }
}

// Delete post handler
async function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
        const response = await fetch(`${POSTS_API}/${postId}`, {
            method: "DELETE"
        });
        
        if (response.ok) {
            showToast("Post deleted successfully", "success");
            const postCard = document.getElementById(`post-${postId}`);
            if (postCard) postCard.remove();
            
            // If on profile page, reload profile stats
            const path = window.location.pathname;
            if (path.includes("profile.html")) {
                const user = getLoggedInUser();
                initProfilePage(user);
            }
        } else {
            showToast("Failed to delete post", "error");
        }
    } catch (error) {
        showToast("Error deleting post.", "error");
    }
}

// Comments UI interactions
function toggleCommentsSection(postId) {
    const section = document.getElementById(`comments-section-${postId}`);
    if (!section) return;
    
    if (section.style.display === "none") {
        section.style.display = "flex";
        loadComments(postId);
    } else {
        section.style.display = "none";
    }
}

async function loadComments(postId) {
    const listContainer = document.getElementById(`comments-list-${postId}`);
    if (!listContainer) return;
    
    try {
        const response = await fetch(`${COMMENTS_API}/post/${postId}`);
        const comments = await response.json();
        
        if (comments.length === 0) {
            listContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; padding: 5px 0;">No comments yet. Be the first to comment!</div>';
            return;
        }
        
        let html = "";
        comments.forEach(comment => {
            html += `
                <div class="comment-item">
                    <img src="${getAvatarUrl(comment.user)}" alt="${comment.user.username}" class="comment-avatar">
                    <div class="comment-body">
                        <div>
                            <span class="comment-author-name" onclick="viewUserProfile('${comment.user._id}')" style="cursor:pointer;">
                                ${comment.user.username} ${getVerificationBadge(comment.user.username)}
                            </span>
                            <span class="comment-text">${comment.comment}</span>
                        </div>
                        <div class="comment-time">${formatRelativeTime(comment.createdAt)}</div>
                    </div>
                </div>
            `;
        });
        listContainer.innerHTML = html;
    } catch (error) {
        listContainer.innerHTML = '<div style="color: var(--danger); font-size: 0.85rem;">Error loading comments.</div>';
    }
}

function handleCommentSubmit(event, postId) {
    if (event.key === "Enter") {
        submitComment(postId);
    }
}

async function submitComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    if (!input) return;
    
    const text = input.value.trim();
    if (!text) return;
    
    const user = getLoggedInUser();
    
    try {
        const response = await fetch(COMMENTS_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                post: postId,
                user: user.id,
                comment: text
            })
        });
        
        if (response.ok) {
            input.value = "";
            loadComments(postId);
            showToast("Comment added!", "success");
        } else {
            showToast("Failed to add comment", "error");
        }
    } catch (error) {
        showToast("Error submitting comment.", "error");
    }
}

// Who to follow sidebar recommendations
async function loadSuggestions() {
    const currentUser = getLoggedInUser();
    await fetchCurrentUserFollowing();
    
    try {
        const response = await fetch(`${USERS_API}/all`);
        const allUsers = await response.json();
        
        const suggestionsContainer = document.getElementById("followSuggestions");
        if (!suggestionsContainer) return;
        
        // Filter out current user
        const otherUsers = allUsers.filter(u => u._id !== currentUser.id);
        
        if (otherUsers.length === 0) {
            suggestionsContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem; text-align: center;">No other users to follow.</div>';
            return;
        }
        
        let html = "";
        otherUsers.slice(0, 5).forEach(user => {
            const isFollowing = currentUserFollowing.has(user._id);
            const btnText = isFollowing ? "Unfollow" : "Follow";
            const btnClass = isFollowing ? "btn btn-secondary follow-btn" : "btn follow-btn";
            
            html += `
                <div class="suggestion-card">
                    <div class="suggestion-user" onclick="viewUserProfile('${user._id}')">
                        <img src="${getAvatarUrl(user)}" alt="${user.username}" class="avatar" style="width: 36px; height: 36px;">
                        <span class="suggestion-name">${user.username} ${getVerificationBadge(user.username)}</span>
                    </div>
                    <button class="${btnClass}" onclick="toggleFollow('${user._id}', this)">${btnText}</button>
                </div>
            `;
        });
        suggestionsContainer.innerHTML = html;
    } catch (error) {
        console.error("Error loading follow suggestions:", error);
    }
}

function viewUserProfile(userId) {
    window.location.href = `profile.html?id=${userId}`;
}

async function toggleFollow(targetUserId, buttonElement) {
    const currentUser = getLoggedInUser();
    
    try {
        const response = await fetch(`${FOLLOW_API}/toggle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                followerId: currentUser.id,
                followingId: targetUserId
            })
        });
        const data = await response.json();
        
        if (response.ok) {
            showToast(data.message, "success");
            
            // Check follow state and refresh list
            if (data.following) {
                currentUserFollowing.add(targetUserId);
                if (buttonElement) {
                    buttonElement.innerText = "Unfollow";
                    buttonElement.className = "btn btn-secondary follow-btn";
                }
            } else {
                currentUserFollowing.delete(targetUserId);
                if (buttonElement) {
                    buttonElement.innerText = "Follow";
                    buttonElement.className = "btn follow-btn";
                }
            }
            
            // If on home feed, reload suggestions and posts
            const path = window.location.pathname;
            if (path.includes("index.html") || path.endsWith("/")) {
                loadSuggestions();
                loadPosts();
            }
        }
    } catch (error) {
        showToast("Error updating follow status.", "error");
    }
}

// Profile Page management
async function initProfilePage(loggedInUser) {
    const urlParams = new URLSearchParams(window.location.search);
    const profileUserId = urlParams.get("id") || loggedInUser.id;
    const isOwnProfile = profileUserId === loggedInUser.id;
    
    // Adjust edit UI if profile is not owned by logged-in user
    const editBioBtn = document.getElementById("editBioBtn");
    const actionsArea = document.getElementById("profileActionsArea");
    
    if (isOwnProfile) {
        if (editBioBtn) editBioBtn.style.display = "block";
    } else {
        if (editBioBtn) editBioBtn.style.display = "none";
        
        // Render Follow/Unfollow button on profile header instead
        await fetchCurrentUserFollowing();
        const isFollowing = currentUserFollowing.has(profileUserId);
        const btnText = isFollowing ? "Unfollow" : "Follow User";
        const btnClass = isFollowing ? "btn btn-secondary" : "btn";
        
        if (actionsArea) {
            actionsArea.innerHTML = `
                <button class="${btnClass}" onclick="toggleProfileFollow('${profileUserId}', this)">${btnText}</button>
            `;
        }
    }
    
    await fetchUserProfile(profileUserId);
    await loadUserPosts(profileUserId, isOwnProfile);
}

async function fetchUserProfile(userId) {
    try {
        const response = await fetch(`${USERS_API}/profile/${userId}`);
        if (!response.ok) {
            showToast("Failed to fetch user profile details.", "error");
            return;
        }
        
        const profileData = await response.json();
        
        // Update profile cover
        const coverElement = document.querySelector(".profile-cover");
        if (coverElement) {
            if (profileData.coverImage) {
                coverElement.style.backgroundImage = `url('${profileData.coverImage}')`;
                coverElement.style.backgroundSize = "cover";
                coverElement.style.backgroundPosition = "center";
            } else {
                coverElement.style.backgroundImage = "linear-gradient(135deg, var(--primary) 0%, #ec4899 100%)";
            }
        }

        // Update profile DOM
        const avatarImg = document.getElementById("profileUserAvatar");
        const nameHeading = document.getElementById("profileUserName");
        const emailDiv = document.getElementById("profileUserEmail");
        const bioDiv = document.getElementById("bioDisplay");
        const bioTextarea = document.getElementById("bioEditTextarea");
        
        const statsFollowers = document.getElementById("statsFollowersCount");
        const statsFollowing = document.getElementById("statsFollowingCount");
        
        if (avatarImg) avatarImg.src = getAvatarUrl(profileData);
        if (nameHeading) {
            nameHeading.innerHTML = `${profileData.username} ${getVerificationBadge(profileData.username)}`;
        }
        if (emailDiv) emailDiv.innerText = profileData.email;
        if (bioDiv) bioDiv.innerText = profileData.bio || "No bio added yet.";
        if (bioTextarea) bioTextarea.value = profileData.bio || "";
        
        // Update Custom Cover and Avatar Fields in editor
        const coverInput = document.getElementById("coverUrlInput");
        const seedInput = document.getElementById("avatarSeedInput");
        if (coverInput) coverInput.value = profileData.coverImage || "";
        if (seedInput) {
            const avatarVal = profileData.profileImage || "";
            if (avatarVal.includes(":")) {
                const [style, seed] = avatarVal.split(":");
                seedInput.value = seed;
                selectAvatarStyle(style);
            } else {
                seedInput.value = avatarVal !== "default.png" ? avatarVal : profileData.username;
                selectAvatarStyle("adventurer");
            }
        }

        if (statsFollowers) statsFollowers.innerText = (profileData.followers || []).length;
        if (statsFollowing) statsFollowing.innerText = (profileData.following || []).length;
        
    } catch (error) {
        showToast("Error loading user profile.", "error");
    }
}

async function toggleProfileFollow(targetUserId, buttonElement) {
    await toggleFollow(targetUserId, null);
    await fetchCurrentUserFollowing();
    const isFollowing = currentUserFollowing.has(targetUserId);
    
    if (buttonElement) {
        buttonElement.innerText = isFollowing ? "Unfollow" : "Follow User";
        buttonElement.className = isFollowing ? "btn btn-secondary" : "btn";
    }
    
    // Refresh stats
    fetchUserProfile(targetUserId);
}

async function loadUserPosts(userId, isOwnProfile) {
    const postsContainer = document.getElementById("posts");
    if (!postsContainer) return;
    
    try {
        const response = await fetch(`${USERS_API}/profile/${userId}/posts`);
        const posts = await response.json();
        
        const statsPosts = document.getElementById("statsPostCount");
        if (statsPosts) statsPosts.innerText = posts.length;
        
        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="glass-card post-card" style="text-align: center; color: var(--text-muted); padding: 40px;">
                    No posts shared by this user yet.
                </div>
            `;
            return;
        }
        
        let html = "";
        posts.forEach(post => {
            const isLiked = post.likes.includes(getLoggedInUser().id);
            const likeBtnClass = isLiked ? "post-action-btn liked" : "post-action-btn";
            const deleteBtnHtml = isOwnProfile 
                ? `<button class="post-delete-btn" onclick="deletePost('${post._id}')" title="Delete Post">🗑️</button>` 
                : "";
                
            const postImageHtml = post.image 
                ? `<img src="${post.image}" alt="Post Image" class="post-image" onerror="this.style.display='none'">` 
                : "";

            const isBookmarked = getBookmarks().includes(post._id);
            const bookmarkBtnClass = isBookmarked ? "post-action-btn bookmark-btn bookmarked" : "post-action-btn bookmark-btn";

            html += `
                <div class="post-card glass-card" id="post-${post._id}">
                    <div class="post-header">
                        <div class="post-author">
                            <img src="${getAvatarUrl(post.user)}" alt="${post.user.username}" class="avatar" style="width: 40px; height: 40px;">
                            <div>
                                <div class="post-author-name">
                                    ${post.user.username} ${getVerificationBadge(post.user.username)}
                                </div>
                                <div class="post-time">${formatRelativeTime(post.createdAt)}</div>
                            </div>
                        </div>
                        ${deleteBtnHtml}
                    </div>
                    
                    <div class="post-content">${formatPostContent(post.content)}</div>
                    ${postImageHtml}
                    
                    <div class="post-footer">
                        <button class="${likeBtnClass}" onclick="toggleLike('${post._id}')">
                            ❤️ <span id="like-count-${post._id}">${post.likes.length}</span>
                        </button>
                        <button class="post-action-btn" onclick="toggleCommentsSection('${post._id}')">
                            💬 Comment
                        </button>
                        <button class="${bookmarkBtnClass}" id="bookmark-btn-${post._id}" onclick="toggleBookmark('${post._id}')">
                            🔖 <span>Bookmark</span>
                        </button>
                    </div>
                    
                    <!-- Inline Comments Section -->
                    <div class="comments-section" id="comments-section-${post._id}" style="display: none;">
                        <div id="comments-list-${post._id}">
                            <div style="color: var(--text-muted); font-size: 0.85rem;">Loading comments...</div>
                        </div>
                        <div class="create-comment-form">
                            <input type="text" id="comment-input-${post._id}" class="comment-input" placeholder="Write a comment..." onkeydown="handleCommentSubmit(event, '${post._id}')">
                            <button class="btn comment-submit-btn" onclick="submitComment('${post._id}')">Post</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        postsContainer.innerHTML = html;
    } catch (error) {
        postsContainer.innerHTML = '<div style="color: var(--danger); text-align: center; padding: 20px;">Error fetching user posts.</div>';
    }
}

// Edit bio logic
function toggleBioEdit() {
    const display = document.getElementById("bioDisplay");
    const container = document.getElementById("bioEditContainer");
    
    if (display && container) {
        if (display.style.display === "none") {
            display.style.display = "block";
            container.style.display = "none";
        } else {
            display.style.display = "none";
            container.style.display = "block";
        }
    }
}

let selectedAvatarStyle = "adventurer";
function selectAvatarStyle(style) {
    selectedAvatarStyle = style;
    const styles = ["adventurer", "lorelei", "avataaars", "bottts"];
    styles.forEach(opt => {
        const el = document.getElementById(`opt-${opt}`);
        if (el) {
            if (opt === style) {
                el.classList.add("selected");
            } else {
                el.classList.remove("selected");
            }
        }
    });
}

async function saveBio() {
    const user = getLoggedInUser();
    const newBio = document.getElementById("bioEditTextarea").value.trim();
    const newCover = document.getElementById("coverUrlInput").value.trim();
    const avatarSeed = document.getElementById("avatarSeedInput").value.trim() || user.username;
    const newAvatar = `${selectedAvatarStyle}:${avatarSeed}`;
    
    try {
        const response = await fetch(`${USERS_API}/profile/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                bio: newBio,
                profileImage: newAvatar,
                coverImage: newCover
            })
        });
        const data = await response.json();
        
        if (response.ok) {
            // Update local storage representation
            const updatedUser = { 
                ...user, 
                bio: data.user.bio,
                profileImage: data.user.profileImage,
                coverImage: data.user.coverImage
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            
            showToast("Profile settings saved successfully!", "success");
            toggleBioEdit();
            fetchUserProfile(user.id);
            renderSidebarUser(updatedUser);
        } else {
            showToast(data.message || "Failed to save bio", "error");
        }
    } catch (error) {
        showToast("Error saving bio details.", "error");
    }
}
