const API = "http://localhost:5000/api/products";

const container = document.getElementById("product-container");

const search = document.getElementById("search");

let products = [];

async function loadProducts() {

    try {

        const response = await fetch(API);

        console.log("Status:", response.status);

        products = await response.json();

        console.log(products);

        displayProducts(products);

    } catch (error) {

        console.error(error);

    }

}

function getProductDisplayData(product) {
    return {
        name: product.name || product.title || "Untitled Product",
        description: product.description || product.desc || "No description available",
        price: Number(product.price ?? 0),
        image: product.image || "https://via.placeholder.com/180"
    };
}

function displayProducts(items){

    container.innerHTML = "";

    items.forEach(product=>{

        const displayData = getProductDisplayData(product);

      container.innerHTML += `

<div class="product-card">

    <div class="badge">
        -20%
    </div>

    <div
        class="wishlist"
        onclick="addWishlist('${product._id}')">

        🤍

    </div>

    <img
    src="https://picsum.photos/400/300?random=${product._id}">

    <div class="product-info">

        <small class="category">

            ${product.category}

        </small>

        <h3>${product.name}</h3>

        <p>${product.description}</p>

        <div class="rating">

            ⭐⭐⭐⭐⭐ (4.8)

        </div>

        <div class="price">

            ₹${product.price}

        </div>

        <div class="buttons">

            <button
            onclick="viewProduct('${product._id}')">

                Details

            </button>

            <button
            class="cart-btn"
            onclick="addCart('${product._id}')">

                🛒 Cart

            </button>

        </div>

    </div>

</div>

`;

    });

}

function viewProduct(id){

    localStorage.setItem("productId",id);

    window.location="product.html";

}

search.addEventListener("keyup",()=>{

    const keyword=search.value.toLowerCase();

    const filtered=products.filter(product=>{

        const displayData = getProductDisplayData(product);

        return displayData.name.toLowerCase().includes(keyword);

    });

    displayProducts(filtered);

});

const token = localStorage.getItem("token");

const authLinks = document.getElementById("authLinks");

if(token && authLinks){

    const name = localStorage.getItem("userName") || "User";

    authLinks.innerHTML = `

        Welcome, ${name}

        <a href="#" onclick="logout()">

            Logout

        </a>

    `;

}

function logout(){

    localStorage.removeItem("token");

    localStorage.removeItem("userName");

    localStorage.removeItem("cart");

    window.location="login.html";

}

async function addWishlist(id){

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first to save items to your wishlist.");
        window.location = "login.html";
        return;
    }

    const response = await fetch(

        `http://localhost:5000/api/users/wishlist/${id}`,

        {

            method: "POST",

            headers: {

                Authorization: `Bearer ${token}`

            }

        }

    );

    const data = await response.json();

    if (!response.ok) {
        alert(data.message || "Unable to add to wishlist.");
        return;
    }

    alert(data.message || "Added to Wishlist");

}

function addCart(id){

    let cart = JSON.parse(
        localStorage.getItem("cart")
    ) || [];

    cart.push(id);

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    showToast("Added to Cart 🛒");

}

function showToast(message){

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.innerHTML = message;

    document.body.appendChild(toast);

    setTimeout(()=>{

        toast.remove();

    },2500);

}

const slides=document.querySelectorAll(".slide");

let currentSlide=0;

setInterval(()=>{

slides[currentSlide].classList.remove("active");

currentSlide++;

if(currentSlide>=slides.length){

currentSlide=0;

}

slides[currentSlide].classList.add("active");

},4000);

loadProducts();