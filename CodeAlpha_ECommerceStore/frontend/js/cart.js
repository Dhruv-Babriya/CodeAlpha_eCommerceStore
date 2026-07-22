const API="/api/products/";

let cart=
JSON.parse(localStorage.getItem("cart"))||[];

const container=
document.getElementById("cartContainer");

let subtotal=0;
let appliedDiscount = 0;

loadCart();

async function loadCart(){

container.innerHTML="";

subtotal=0;

if (cart.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#94a3b8;"><i class="fas fa-shopping-cart" style="font-size:48px;margin-bottom:16px;display:block;"></i><p style="font-size:18px;">Your cart is empty.</p><a href="index.html" style="display:inline-block;margin-top:16px;padding:12px 28px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;border-radius:12px;text-decoration:none;font-weight:600;">Continue Shopping</a></div>';
    updateSummary();
    return;
}

for(const id of cart){

const response=
await fetch(API+id);

if (!response.ok) continue;

const product=
await response.json();

const qty = getItemQuantity(id);
const itemTotal = product.price * qty;
subtotal+=itemTotal;

const imgUrl = product.image || "https://via.placeholder.com/150";
        container.innerHTML+=`

<div class="cart-card">

<img
    src="${imgUrl}"
    loading="lazy"
    referrerpolicy="no-referrer"
    onerror="this.onerror=null;this.src='https://via.placeholder.com/150'">

<div class="cart-info">

<h3>${product.name}</h3>

<p>${product.description}</p>

<h2>₹${product.price}</h2>

<div class="quantity" style="margin-top:12px;">
    <button onclick="changeQty('${id}', -1)">−</button>
    <span id="qty-${id}">${qty}</span>
    <button onclick="changeQty('${id}', 1)">+</button>
</div>

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

function getItemQuantity(id) {
    const qtyKey = `qty_${id}`;
    return parseInt(localStorage.getItem(qtyKey)) || 1;
}

function setItemQuantity(id, qty) {
    if (qty < 1) qty = 1;
    const qtyKey = `qty_${id}`;
    localStorage.setItem(qtyKey, qty);
}

function changeQty(id, delta) {
    let qty = getItemQuantity(id);
    qty += delta;
    if (qty < 1) qty = 1;
    setItemQuantity(id, qty);
    loadCart();
}

function removeItem(id){

cart=cart.filter(item=>item!==id);

localStorage.setItem(
"cart",
JSON.stringify(cart)
);

// Clean up quantity keys
cart.forEach(cid => {
    const qtyKey = `qty_${cid}`;
    if (!cart.includes(cid)) localStorage.removeItem(qtyKey);
});

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

const totalValue = subtotal + shipping - discount;
document.getElementById("total").innerHTML=
"₹"+totalValue;

}

// Remove old standalone applyCoupon, keep only the API version
async function applyCoupon() {

    const code =
        document.getElementById("couponCode").value;

    if (!code.trim()) {
        alert("Please enter a coupon code.");
        return;
    }

    const response = await fetch(
        "/api/coupons/apply",
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

        appliedDiscount = data.discount;

        const discountAmount = (subtotal * appliedDiscount) / 100;
        document.getElementById("discount").innerHTML = "₹" + discountAmount.toFixed(2);
        document.getElementById("total").innerHTML = "₹" + (subtotal + 100 - discountAmount).toFixed(2);

        showToast(`Coupon Applied! ${appliedDiscount}% OFF 🎉`);

    } else {

        showToast(data.message || "Invalid Coupon", true);

    }

}

// Toast notification helper
function showToast(message, isError = false) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement("div");
    toast.className = "toast";
    if (isError) toast.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function checkout(){

window.location="checkout.html";

}