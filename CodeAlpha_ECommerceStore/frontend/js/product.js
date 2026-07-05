const API = "http://localhost:5000/api/products";

const id = localStorage.getItem("productId");

const container = document.getElementById("product-details");

async function loadProduct(){

    try{

        const response = await fetch(`${API}/${id}`);

        const product = await response.json();

        container.innerHTML = `

        <div class="product-box">

            <img src="${product.image || "https://via.placeholder.com/350"}" alt="Product">

            <div class="product-info">

                <h1>${product.name || product.title || "Untitled Product"}</h1>

                <h2>₹${product.price ?? 0}</h2>

                <p>${product.description || product.desc || "No description available"}</p>

                <p><strong>Category:</strong> ${product.category || "Uncategorized"}</p>

                <p><strong>Stock:</strong> ${product.stock ?? 0}</p>

                <label>Quantity</label><br>

                <input
                    type="number"
                    id="qty"
                    value="1"
                    min="1"
                    max="${product.stock}"
                >

                <button onclick="addToCart()">
                    Add To Cart
                </button>

                <button onclick="goHome()">
                    Back To Home
                </button>

            </div>

        </div>

        `;

        window.currentProduct = product;

    }catch(error){

        container.innerHTML = "<h2>Product not found.</h2>";

    }

}

function addToCart(){

    const quantity = Number(document.getElementById("qty").value);

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(item => item._id === currentProduct._id);

    if(existing){

        existing.quantity += quantity;

    }else{

        cart.push({
            ...currentProduct,
            quantity
        });

    }

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Product added to cart successfully!");

}

function goHome(){

    window.location = "index.html";

}

loadProduct();