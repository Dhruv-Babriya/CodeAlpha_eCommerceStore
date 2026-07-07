const API = "http://localhost:5000/api/users";

const table = document.getElementById("userTable");
const search = document.getElementById("search");

let users = [];

async function loadUsers() {

    try {

        const response = await fetch(API);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        users = await response.json();

        showUsers(users);

    } catch (error) {

        console.error(error);
        table.innerHTML = `<tr><td colspan="4">No users found.</td></tr>`;

    }

}

function showUsers(list) {

    table.innerHTML = "";

    list.forEach(user => {

        table.innerHTML += `

<tr>

<td>${user.name}</td>

<td>${user.email}</td>

<td>

<input
type="checkbox"
${user.isAdmin ? "checked" : ""}
onchange="toggleAdmin('${user._id}',this.checked)"
>

</td>

<td>

<button onclick="deleteUser('${user._id}')">

Delete

</button>

</td>

</tr>

`;

    });

}

async function toggleAdmin(id, isAdmin) {

    const user = users.find(u => u._id === id);

    if (!user) return;

    await fetch(`${API}/${id}`, {

        method: "PUT",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            name: user.name,
            email: user.email,
            isAdmin

        })

    });

}

async function deleteUser(id) {

    if (!confirm("Delete this user?")) return;

    await fetch(`${API}/${id}`, {

        method: "DELETE"

    });

    loadUsers();

}

search.addEventListener("keyup", () => {

    const keyword = search.value.toLowerCase();

    const filtered = users.filter(user =>

        user.name.toLowerCase().includes(keyword) ||

        user.email.toLowerCase().includes(keyword)

    );

    showUsers(filtered);

});

loadUsers();