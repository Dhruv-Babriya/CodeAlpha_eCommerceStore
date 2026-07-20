const API = "http://localhost:5000/api/users/wishlist";

const token = localStorage.getItem("token");

const container = document.getElementById("wishlistContainer");

if (!token) {
    container.innerHTML = "<p>Please login to view your wishlist.</p>";
    setTimeout(() => {
        window.location = "login.html";
    }, 1200);
} else {
    loadWishlist();
}

async function loadWishlist() {
    try {
        const response = await fetch(API, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load wishlist.");
        }

        const products = Array.isArray(data) ? data : [];
        container.innerHTML = "";

        if (products.length === 0) {
            container.innerHTML = "<p>Your wishlist is empty. Add products from the home page to see them here.</p>";
            return;
        }

        products.forEach(product => {
            const imgSrc = product.image || "";
            const imgUrl = imgSrc && imgSrc.startsWith("/uploads") ? `http://localhost:5000${imgSrc}` : (imgSrc || "https://via.placeholder.com/180");
            container.innerHTML += `
                <div class="product-card">
                    <img
                        src="${imgUrl}"
                        loading="lazy"
                        referrerpolicy="no-referrer"
                        onerror="this.onerror=null;this.src='https://via.placeholder.com/180'">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <h2>₹${product.price}</h2>
                    <button onclick="removeItem('${product._id}')">Remove</button>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = `<p>${error.message}</p>`;
    }
}

async function removeItem(id) {

    await fetch(API + "/" + id, {

        method: "DELETE",

        headers: {
            Authorization: `Bearer ${token}`
        }

    });

    loadWishlist();

}