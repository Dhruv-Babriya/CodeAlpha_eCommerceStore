const API = "http://localhost:5000/api/orders";

const table = document.getElementById("orderTable");

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

async function loadOrders() {
    try {
        const response = await fetch(API, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const orders = await response.json();

        table.innerHTML = "";

        if (orders.length === 0) {
            table.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8;">No orders found yet.</td></tr>`;
            return;
        }

        orders.forEach(order => {

            const orderId = order._id ? order._id.slice(-8).toUpperCase() : 'N/A';
            const customerName = order.user?.name || 'Unknown';
            const customerEmail = order.user?.email || '';
            const totalPrice = Number(order.totalPrice || 0).toLocaleString();
            const paymentBadge = order.paymentMethod === 'COD' ? 'COD' : (order.paymentMethod || 'N/A');

            let statusClass = 'pending';
            if (order.status === 'Processing') statusClass = 'pending';
            else if (order.status === 'Shipped') statusClass = 'shipped';
            else if (order.status === 'Delivered') statusClass = 'completed';
            else if (order.status === 'Cancelled') statusClass = 'cancelled';

            table.innerHTML += `
                <tr>
                    <td><span style="font-family: monospace; font-weight: 600; color: #6366f1;">#${orderId}</span></td>
                    <td>
                        <strong>${customerName}</strong>
                        ${customerEmail ? `<br><small style="color: #94a3b8;">${customerEmail}</small>` : ''}
                    </td>
                    <td><strong>₹${totalPrice}</strong></td>
                    <td>
                        <select class="status-select" data-order-id="${order._id}" onchange="updateStatus('${order._id}',this.value)" style="padding: 6px 10px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; background: #fff;">
                            <option value="Pending" ${order.status==="Pending"?"selected":""}>⏳ Pending</option>
                            <option value="Processing" ${order.status==="Processing"?"selected":""}>🔄 Processing</option>
                            <option value="Shipped" ${order.status==="Shipped"?"selected":""}>📦 Shipped</option>
                            <option value="Delivered" ${order.status==="Delivered"?"selected":""}>✅ Delivered</option>
                            <option value="Cancelled" ${order.status==="Cancelled"?"selected":""}>❌ Cancelled</option>
                        </select>
                    </td>
                    <td><span class="status-badge ${statusClass}">${paymentBadge}</span></td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error loading orders:", error);
        table.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #ef4444;">
            <i class="fas fa-exclamation-circle"></i> Failed to load orders. Make sure the server is running.
        </td></tr>`;
    }
}

async function updateStatus(id, status) {
    try {
        const response = await fetch(`${API}/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error("Failed to update status");
        }

        showToast("Order status updated!", false);
    } catch (error) {
        console.error(error);
        showToast("Failed to update status", true);
    }
}

async function deleteOrder(id) {
    if (!confirm("Delete this order permanently?")) return;

    try {
        const response = await fetch(`${API}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error("Failed to delete order");
        }

        showToast("Order deleted!", false);
        loadOrders();
    } catch (error) {
        console.error(error);
        showToast("Failed to delete order", true);
    }
}

function showToast(message, isError = false) {
    const toast = document.createElement("div");
    toast.className = `toast ${isError ? 'error' : 'success'}`;
    toast.innerHTML = `<i class="fas ${isError ? 'fa-times-circle' : 'fa-check-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

loadOrders();

