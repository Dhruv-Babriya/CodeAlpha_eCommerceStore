const API="http://localhost:5000/api/products/";

let cart=
JSON.parse(localStorage.getItem("cart"))||[];

const summary=
document.getElementById("orderSummary");

let total=0;

loadSummary();

async function loadSummary(){

summary.innerHTML="";

for(const id of cart){

const response=
await fetch(API+id);

const product=
await response.json();

total+=product.price;

summary.innerHTML+=`

<div class="summary-item">

<span>${product.name}</span>

<span>₹${product.price}</span>

</div>

`;

}

document.getElementById("totalPrice").innerHTML=
"₹"+total;

}

document
.getElementById("checkoutForm")
.addEventListener("submit",placeOrder);

function placeOrder(e){

e.preventDefault();

alert("🎉 Order Placed Successfully!");

localStorage.removeItem("cart");

window.location="orders.html";

}