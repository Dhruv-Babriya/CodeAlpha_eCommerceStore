const API = "http://localhost:5000/api/products/";
const ORDERS_API = "http://localhost:5000/api/orders";

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const summary = document.getElementById("orderSummary");

let total = 0;

loadSummary();

document.getElementById("checkoutForm").addEventListener("submit", placeOrder);

async function loadSummary() {
    summary.innerHTML = "";
    total = 0;

    for (const id of cart) {
        const response = await fetch(API + id);
        const product = await response.json();

        total += product.price;

        summary.innerHTML += `
            <div class="summary-item">
                <span>${product.name}</span>
                <span>₹${product.price}</span>
            </div>
        `;
    }

    document.getElementById("totalPrice").innerHTML = "₹" + total;
}

async function placeOrder(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login before placing an order.");
        window.location = "login.html";
        return;
    }

    if (!cart.length) {
        alert("Your cart is empty.");
        return;
    }

    const fullName = document.getElementById("fullname").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    if (!fullName || !address || !city || !state || !pincode) {
        alert("Please fill in your shipping details.");
        return;
    }

    try {
        const orderItems = [];

        for (const id of cart) {
            const response = await fetch(API + id);
            if (!response.ok) {
                throw new Error("Unable to load one or more products.");
            }

            const product = await response.json();
            orderItems.push({
                product: id,
                name: product.name,
                qty: 1,
                price: product.price,
                image: product.image || ""
            });
        }

        const response = await fetch(ORDERS_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                orderItems,
                totalPrice: total,
                shippingAddress: `${address}, ${city}, ${state} - ${pincode}`,
                paymentMethod
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to place order.");
        }

        localStorage.removeItem("cart");
        alert("🎉 Order Placed Successfully!");
        window.location = "orders.html";
    } catch (error) {
        alert(error.message);
    }
}