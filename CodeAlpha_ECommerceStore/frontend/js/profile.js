const API = "http://localhost:5000/api/users/profile";

const token = localStorage.getItem("token");

function getAvatarUrl(user) {
    const imagePath = user?.image || localStorage.getItem("userImage") || "";

    if (imagePath) {
        if (imagePath.startsWith("http")) {
            return imagePath;
        }

        const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
        return `http://localhost:5000${normalizedPath}`;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=2563EB&color=fff&size=200`;
}

loadProfile();

async function loadProfile(){

try {
    const response = await fetch(API,{

    headers:{

    Authorization:`Bearer ${token}`

    }

    });

    const user = await response.json();

    if (!response.ok) {
        console.error("Failed to load profile", user);
        return;
    }

    document.getElementById("userName").innerHTML=user.name;

    document.getElementById("userEmail").innerHTML=user.email;

    document.getElementById("name").value=user.name;

    document.getElementById("email").value=user.email;

    document.getElementById("address").value =
    user.address || "";

    if (user.image) {
        localStorage.setItem("userImage", user.image);
    } else {
        localStorage.removeItem("userImage");
    }

    const avatarUrl = getAvatarUrl(user);
    document.getElementById("profileImage").src = avatarUrl;
    document.getElementById("profileImage").onerror = function () {
        this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=2563EB&color=fff&size=200`;
    };
} catch (error) {
    console.error("Profile load error:", error);
}

}

async function loadStats() {
    const token = localStorage.getItem("token");

    if (!token) {
        document.getElementById("cartCount").innerHTML = "0";
        document.getElementById("wishlistCount").innerHTML = "0";
        document.getElementById("orderCount").innerHTML = "0";
        return;
    }

    try {
        const wishlistResponse = await fetch("http://localhost:5000/api/users/wishlist", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const wishlistData = wishlistResponse.ok ? await wishlistResponse.json() : [];
        const wishlistCount = Array.isArray(wishlistData) ? wishlistData.length : 0;

        const ordersResponse = await fetch("http://localhost:5000/api/orders", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const ordersData = ordersResponse.ok ? await ordersResponse.json() : [];
        const orderCount = Array.isArray(ordersData) ? ordersData.length : 0;

        document.getElementById("cartCount").innerHTML = (JSON.parse(localStorage.getItem("cart")) || []).length;
        document.getElementById("wishlistCount").innerHTML = wishlistCount;
        document.getElementById("orderCount").innerHTML = orderCount;
    } catch (error) {
        document.getElementById("cartCount").innerHTML = (JSON.parse(localStorage.getItem("cart")) || []).length;
        document.getElementById("wishlistCount").innerHTML = "0";
        document.getElementById("orderCount").innerHTML = "0";
    }
}

loadStats();

async function updateProfile(){

    let image = "";

    const file =
    document.getElementById("imageFile").files[0];

    if(file){
        document.getElementById("profileImage").src = URL.createObjectURL(file);

        const formData = new FormData();

        formData.append("image", file);

       const uploadResponse = await fetch(
    "http://localhost:5000/api/upload/profile",
    {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    }
);

console.log("Upload Status:", uploadResponse.status);

const uploadData = await uploadResponse.json();

console.log("Upload Response:", uploadData);

image = uploadData.image;

    }

    const response = await fetch(API, {
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        address: document.getElementById("address").value,
        image: image || "",
        avatar: image || "",
        profileImage: image || ""
    })
});

console.log("Update Status:", response.status);

const data = await response.json();

console.log("Update Response:", data);

    if(response.ok){

        if (data?.image) {
            localStorage.setItem("userImage", data.image);
        } else if (image) {
            localStorage.setItem("userImage", image);
        }

        alert("Profile Updated!");

        await loadProfile();

    }

}


async function changePassword() {

    const oldPassword =
        document.getElementById("oldPassword").value;

    const newPassword =
        document.getElementById("newPassword").value;

    const response = await fetch(
        "http://localhost:5000/api/users/change-password",
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                oldPassword,
                newPassword
            })
        }
    );

    const data = await response.json();

    if (response.ok) {

        alert(data.message);

        document.getElementById("oldPassword").value = "";
        document.getElementById("newPassword").value = "";

    } else {

        alert(data.message);

    }
}



function logout(){

localStorage.clear();

window.location="login.html";

}