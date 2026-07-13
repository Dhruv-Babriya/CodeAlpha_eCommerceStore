const API_BASE = "http://localhost:5000/api";
const POSTS_API = `${API_BASE}/posts`;
const USERS_API = `${API_BASE}/users`;
const COMMENTS_API = `${API_BASE}/comments`;
const FOLLOW_API = `${API_BASE}/follow`;

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

    // Render navigation sidebar elements
    renderSidebarUser(user);

    if (page === "index.html" || page === "") {
        const createPostAvatar = document.getElementById("createPostUserAvatar");
        if (createPostAvatar) {
            createPostAvatar.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`;
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
        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}" alt="${user.username}" class="avatar">
        <div class="user-info" style="flex: 1;">
            <div class="user-displayname" style="cursor: pointer;" onclick="window.location.href='profile.html'">${user.username}</div>
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
    const image = document.getElementById("postImageUrl").value.trim();

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
        const posts = await response.json();

        const postsContainer = document.getElementById("posts");
        if (!postsContainer) return;

        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="glass-card post-card" style="text-align: center; color: var(--text-muted); padding: 40px;">
                    No posts yet. Be the first to share something!
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

            html += `
                <div class="post-card glass-card" id="post-${post._id}">
                    <div class="post-header">
                        <div class="post-author" onclick="viewUserProfile('${post.user._id}')">
                            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${post.user.username}" alt="${post.user.username}" class="avatar" style="width: 40px; height: 40px;">
                            <div>
                                <div class="post-author-name">${post.user.username}</div>
                                <div class="post-time">${formatRelativeTime(post.createdAt)}</div>
                            </div>
                        </div>
                        ${deleteBtnHtml}
                    </div>
                    
                    <div class="post-content">${post.content}</div>
                    ${postImageHtml}
                    
                    <div class="post-footer">
                        <button class="${likeBtnClass}" onclick="toggleLike('${post._id}')">
                            ❤️ <span id="like-count-${post._id}">${post.likes.length}</span>
                        </button>
                        <button class="post-action-btn" onclick="toggleCommentsSection('${post._id}')">
                            💬 Comment
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
    try {
        const response = await fetch(`${POSTS_API}/like/${postId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: currentUser.id })
        });
        const updatedPost = await response.json();
        
        if (response.ok) {
            const isLiked = updatedPost.likes.includes(currentUser.id);
            const likeBtn = document.querySelector(`#post-${postId} .post-action-btn:first-child`);
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
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${comment.user.username}" alt="${comment.user.username}" class="comment-avatar">
                    <div class="comment-body">
                        <div>
                            <span class="comment-author-name" onclick="viewUserProfile('${comment.user._id}')" style="cursor:pointer;">${comment.user.username}</span>
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
                        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}" alt="${user.username}" class="avatar" style="width: 36px; height: 36px;">
                        <span class="suggestion-name">${user.username}</span>
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
        
        // Update profile DOM
        const avatarImg = document.getElementById("profileUserAvatar");
        const nameHeading = document.getElementById("profileUserName");
        const emailDiv = document.getElementById("profileUserEmail");
        const bioDiv = document.getElementById("bioDisplay");
        const bioTextarea = document.getElementById("bioEditTextarea");
        
        const statsFollowers = document.getElementById("statsFollowersCount");
        const statsFollowing = document.getElementById("statsFollowingCount");
        
        if (avatarImg) avatarImg.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profileData.username}`;
        if (nameHeading) nameHeading.innerText = profileData.username;
        if (emailDiv) emailDiv.innerText = profileData.email;
        if (bioDiv) bioDiv.innerText = profileData.bio || "No bio added yet.";
        if (bioTextarea) bioTextarea.value = profileData.bio || "";
        
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

            html += `
                <div class="post-card glass-card" id="post-${post._id}">
                    <div class="post-header">
                        <div class="post-author">
                            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${post.user.username}" alt="${post.user.username}" class="avatar" style="width: 40px; height: 40px;">
                            <div>
                                <div class="post-author-name">${post.user.username}</div>
                                <div class="post-time">${formatRelativeTime(post.createdAt)}</div>
                            </div>
                        </div>
                        ${deleteBtnHtml}
                    </div>
                    
                    <div class="post-content">${post.content}</div>
                    ${postImageHtml}
                    
                    <div class="post-footer">
                        <button class="${likeBtnClass}" onclick="toggleLike('${post._id}')">
                            ❤️ <span id="like-count-${post._id}">${post.likes.length}</span>
                        </button>
                        <button class="post-action-btn" onclick="toggleCommentsSection('${post._id}')">
                            💬 Comment
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

async function saveBio() {
    const user = getLoggedInUser();
    const newBio = document.getElementById("bioEditTextarea").value.trim();
    
    try {
        const response = await fetch(`${USERS_API}/profile/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bio: newBio })
        });
        const data = await response.json();
        
        if (response.ok) {
            // Update local storage representation
            const updatedUser = { ...user, bio: data.user.bio };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            
            showToast("Bio updated successfully!", "success");
            toggleBioEdit();
            fetchUserProfile(user.id);
        } else {
            showToast(data.message || "Failed to save bio", "error");
        }
    } catch (error) {
        showToast("Error saving bio details.", "error");
    }
}
