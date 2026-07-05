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

            <img src="${displayData.image}" alt="">

            <h3>${displayData.name}</h3>

            <p>${displayData.description}</p>

            <h2>₹${displayData.price}</h2>

            <button onclick="viewProduct('${product._id || product.id}')">

                View Details

            </button>

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

loadProducts();