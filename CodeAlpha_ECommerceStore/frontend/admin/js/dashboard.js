const API = "http://localhost:5000/api/admin/stats";

function setCardValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

async function loadDashboard() {
    try {
        console.log("Fetching dashboard stats from", API);
        const response = await fetch(API);
        console.log("Dashboard response status:", response.status);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("Dashboard data:", data);

        setCardValue("productCount", data.products ?? 0);
        setCardValue("orderCount", data.orders ?? 0);
        setCardValue("userCount", data.users ?? 0);
    } catch (error) {
        console.error("Dashboard Error:", error);
        setCardValue("productCount", 0);
        setCardValue("orderCount", 0);
        setCardValue("userCount", 0);
    }
}

window.addEventListener("DOMContentLoaded", loadDashboard);