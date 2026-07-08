const API = "http://localhost:5000/api/users/wishlist";

const token = localStorage.getItem("token");

const container = document.getElementById("wishlistContainer");

loadWishlist();

async function loadWishlist() {

    const response = await fetch(API, {

        headers: {
            Authorization: `Bearer ${token}`
        }

    });

    const products = await response.json();

    container.innerHTML = "";

    products.forEach(product => {

        container.innerHTML += `

        <div class="product-card">

            <img src="https://picsum.photos/300?random=${product._id}">

            <h3>${product.name}</h3>

            <p>${product.description}</p>

            <h2>₹${product.price}</h2>

            <button onclick="removeItem('${product._id}')">

                Remove

            </button>

        </div>

        `;

    });

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