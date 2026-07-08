const API="http://localhost:5000/api/products/";

let cart=
JSON.parse(localStorage.getItem("cart"))||[];

const container=
document.getElementById("cartContainer");

let subtotal=0;

loadCart();

async function loadCart(){

const finalTotal =
    total - (total * discount / 100);

document.getElementById("total").innerHTML =
`
Original : ₹${total}<br>
Discount : ${discount}%<br>
Total : ₹${finalTotal.toFixed(2)}
`;

container.innerHTML="";

subtotal=0;

for(const id of cart){

const response=
await fetch(API+id);

const product=
await response.json();

subtotal+=product.price;

container.innerHTML+=`

<div class="cart-card">

<img src="https://picsum.photos/200?random=${id}">

<div class="cart-info">

<h3>${product.name}</h3>

<p>${product.description}</p>

<h2>₹${product.price}</h2>

<button
class="remove-btn"
onclick="removeItem('${id}')">

Remove

</button>

</div>

</div>

`;

}

updateSummary();

}

function removeItem(id){

cart=cart.filter(item=>item!==id);

localStorage.setItem(
"cart",
JSON.stringify(cart)
);

loadCart();

}

function updateSummary(){

let shipping=100;

let discount=0;

document.getElementById("subtotal").innerHTML=
"₹"+subtotal;

document.getElementById("shipping").innerHTML=
"₹"+shipping;

document.getElementById("discount").innerHTML=
"₹"+discount;

document.getElementById("total").innerHTML=
"₹"+(subtotal+shipping-discount);

}

function applyCoupon(){

const code=
document.getElementById("coupon").value;

if(code==="SAVE20"){

document.getElementById("discount").innerHTML="₹20";

document.getElementById("total").innerHTML=
"₹"+(subtotal+100-20);

alert("Coupon Applied!");

}else{

alert("Invalid Coupon");

}

}

let discount = 0;

async function applyCoupon() {

    const code =
        document.getElementById("couponCode").value;

    const response = await fetch(
        "http://localhost:5000/api/coupons/apply",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({ code })
        }
    );

    const data = await response.json();

    if (response.ok) {

        discount = data.discount;

        alert(`Coupon Applied (${discount}% OFF)`);

        loadCart();

    } else {

        alert(data.message);

    }

}

function checkout(){

window.location="checkout.html";

}