const API = "http://localhost:5000/api/users";

const table = document.getElementById("userTable");
const search = document.getElementById("search");

let users = [];

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

async function loadUsers() {

    try {

        const response = await fetch(API, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        users = await response.json();

        showUsers(users);

    } catch (error) {

        console.error(error);
        table.innerHTML = `<tr><td colspan="5"><div style="text-align: center; padding: 40px; color: #94a3b8;">
            <i class="fas fa-users" style="font-size: 32px; display: block; margin-bottom: 12px;"></i>
            No users found.
        </div></td></tr>`;

    }

}

function showUsers(list) {

    table.innerHTML = "";

    if (list.length === 0) {
        table.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">No users match your search.</td></tr>`;
        return;
    }

    list.forEach(user => {

        const isAdmin = user.isAdmin || false;

        table.innerHTML += `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #06b6d4); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; font-size: 14px; flex-shrink: 0;">
                            ${user.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                            <strong>${user.name || "Unknown"}</strong>
                            <br><small style="color: #94a3b8;">Joined ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</small>
                        </div>
                    </div>
                </td>
                <td>${user.email || "N/A"}</td>
                <td>
                    <span class="${isAdmin ? 'status-badge completed' : 'status-badge pending'}">
                        ${isAdmin ? 'Admin' : 'User'}
                    </span>
                </td>
                <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm ${isAdmin ? 'btn-danger' : 'btn-primary'}" onclick="toggleAdmin('${user._id}', ${!isAdmin})">
                        <i class="fas ${isAdmin ? 'fa-user-minus' : 'fa-user-shield'}"></i>
                        ${isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${user._id}')" style="margin-left: 6px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;

    });

}

async function toggleAdmin(id, makeAdmin) {

    const user = users.find(u => u._id === id);
    if (!user) return;

    try {
        const response = await fetch(`${API}/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                name: user.name,
                email: user.email,
                isAdmin: makeAdmin
            })
        });

        if (!response.ok) {
            throw new Error("Failed to update user");
        }

        showToast(`User is now ${makeAdmin ? 'an Admin' : 'a User'}!`);
        loadUsers();
    } catch (error) {
        console.error(error);
        showToast("Failed to update user role", true);
    }

}

async function deleteUser(id) {

    if (!confirm("Delete this user permanently?")) return;

    try {
        const response = await fetch(`${API}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error("Failed to delete user");
        }

        showToast("User deleted!");
        loadUsers();
    } catch (error) {
        console.error(error);
        showToast("Failed to delete user", true);
    }

}

function showToast(message, isError = false) {
    const toast = document.createElement("div");
    toast.className = `toast ${isError ? 'error' : 'success'}`;
    toast.innerHTML = `<i class="fas ${isError ? 'fa-times-circle' : 'fa-check-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

search.addEventListener("keyup", () => {

    const keyword = search.value.toLowerCase();

    const filtered = users.filter(user =>
        user.name?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword)
    );

    showUsers(filtered);

});

loadUsers();

