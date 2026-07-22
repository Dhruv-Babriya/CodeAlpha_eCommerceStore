const API="/api/products/";

const id=localStorage.getItem("productId");

loadProduct();

async function loadProduct(){

const response=await fetch(API+id);

const product=await response.json();
console.log('Product details payload:', product);

document.getElementById("productName").innerHTML=product.name;

document.getElementById("productPrice").innerHTML="₹"+product.price;

document.getElementById("productDescription").innerHTML=product.description;

document.getElementById("stockStatus").innerHTML=

product.stock>0?

"✅ In Stock":

"❌ Out of Stock";

const imgEl = document.getElementById("productImage");
imgEl.loading = "lazy";
imgEl.referrerPolicy = "no-referrer";
imgEl.onerror = () => {
    imgEl.onerror = null;
    imgEl.src = "https://via.placeholder.com/600x500";
};

if (product.image) {
    imgEl.src = product.image;
} else {
    imgEl.src = "https://via.placeholder.com/600x500";
}

}


function addCart(){

let cart=

JSON.parse(localStorage.getItem("cart"))||[];

cart.push(id);

localStorage.setItem("cart",JSON.stringify(cart));

alert("Added to Cart");

}

async function wishlist(){

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login first to add items to your wishlist.");
        window.location = "login.html";
        return;
    }

    try {
        const response = await fetch(
            `/api/users/wishlist/${id}`,
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

        alert(data.message || "Added to Wishlist ❤️");
    } catch (error) {
        alert("Failed to add to wishlist. Please try again.");
    }

}

function buyNow(){

window.location="checkout.html";

}