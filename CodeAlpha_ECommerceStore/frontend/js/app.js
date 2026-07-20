const API = "http://localhost:5000/api/products";

const container = document.getElementById("product-container");

const search = document.getElementById("search");

let products = [];

// Show skeleton loading on page load
function showSkeletons() {
    if (!container) return;
    container.innerHTML = `
        <div class="skeleton-grid" id="skeletonGrid">
            ${Array(8).fill(`
                <div class="skeleton-card">
                    <div class="skeleton-img"></div>
                    <div class="skeleton-text">
                        <div class="skeleton-line short"></div>
                        <div class="skeleton-line medium"></div>
                        <div class="skeleton-line price"></div>
                        <div class="skeleton-btn"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

showSkeletons();

async function loadProducts() {

    try {

        const response = await fetch(API);

        console.log("Status:", response.status);

        products = await response.json();

        console.log(products);

        console.log('Home products payload:', products);
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
        image: product.image || "",
        imageUrl: product.image && product.image.startsWith("/uploads") ? `http://localhost:5000${product.image}` : (product.image || "https://via.placeholder.com/180")
    };
}

function displayProducts(items){

    container.innerHTML = "";

    items.forEach(product=>{

        const displayData = getProductDisplayData(product);

        const imgSrc = displayData.imageUrl;


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
        src="${imgSrc}"
        loading="lazy"
        referrerpolicy="no-referrer"
        onerror="this.onerror=null;this.src='https://via.placeholder.com/180'">

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

// ========== DARK MODE TOGGLE ==========
function toggleDarkMode() {
    const html = document.documentElement;
    const body = document.body;
    html.classList.toggle('dark-mode');
    body.classList.toggle('dark-mode');
    const isDark = html.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    
    // Update toggle button icon
    const toggleBtn = document.querySelector('.dark-mode-toggle i');
    if (toggleBtn) {
        toggleBtn.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Load dark mode preference (applied by inline script in head, but this ensures body class is set too)
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
}

// ========== BACK TO TOP ==========
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        backToTopBtn?.classList.add('visible');
    } else {
        backToTopBtn?.classList.remove('visible');
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== SCROLL ANIMATIONS ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(el => {
        observer.observe(el);
    });
});
