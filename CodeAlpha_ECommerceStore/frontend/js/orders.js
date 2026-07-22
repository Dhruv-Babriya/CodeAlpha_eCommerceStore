const API = "/api/orders";
const token = localStorage.getItem("token");
const container = document.getElementById("orderContainer");

if (!token) {
    container.innerHTML = "<p>Please login to view your orders.</p>";
} else {
    loadOrders();
}

async function loadOrders() {
    try {
        const response = await fetch(API, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load orders.");
        }

        const orders = Array.isArray(data) ? data : [];

        container.innerHTML = "";

        if (orders.length === 0) {
            container.innerHTML = "<div class='empty-state'>No orders yet. Start shopping to see them here.</div>";
            return;
        }

        orders.forEach(order => {
            const itemsMarkup = (order.orderItems || [])
                .map(item => `
                    <p>
                        ${item.name || "Item"} × ${item.qty || 1} ₹${item.price || 0}
                    </p>
                `)
                .join("");

            container.innerHTML += `
                <div class="order-card">
                    <h3>Order ID: ${order._id}</h3>
                    <p>Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
                    <p>Status: <b>${order.status || "Pending"}</b></p>

                    <h3>Items</h3>
                    ${itemsMarkup}

                    <h2>Total: ₹${order.totalPrice || 0}</h2>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = `<p>${error.message}</p>`;
    }
}
