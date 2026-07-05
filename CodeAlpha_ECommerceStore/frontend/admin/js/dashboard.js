const API = "http://localhost:5000/api";

async function loadDashboard() {

    try {

        const products = await fetch(`${API}/products`);
        const productData = await products.json();

        document.getElementById("productCount").innerText =
            productData.length;

    } catch (err) {
        console.error(err);
    }

    // Temporary values until backend admin APIs are added
    document.getElementById("orderCount").innerText = "-";
    document.getElementById("userCount").innerText = "-";
}

loadDashboard();