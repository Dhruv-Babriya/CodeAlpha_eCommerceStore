const API="http://localhost:5000/api/products/";

const id=localStorage.getItem("productId");

loadProduct();

async function loadProduct(){

const response=await fetch(API+id);

const product=await response.json();

document.getElementById("productName").innerHTML=product.name;

document.getElementById("productPrice").innerHTML="₹"+product.price;

document.getElementById("productDescription").innerHTML=product.description;

document.getElementById("stockStatus").innerHTML=

product.stock>0?

"✅ In Stock":

"❌ Out of Stock";

document.getElementById("productImage").src=

"https://picsum.photos/600/500?random="+product._id;

}

function addCart(){

let cart=

JSON.parse(localStorage.getItem("cart"))||[];

cart.push(id);

localStorage.setItem("cart",JSON.stringify(cart));

alert("Added to Cart");

}

function wishlist(){

alert("Added to Wishlist ❤️");

}

function buyNow(){

window.location="checkout.html";

}