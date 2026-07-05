const API = "http://localhost:5000/api/products";

const table = document.getElementById("productTable");
const form = document.getElementById("productForm");
const search = document.getElementById("search");

let editingId = null;
let products = [];

loadProducts();

async function loadProducts() {
    try {
        const response = await fetch(API);
        products = await response.json();
        showProducts(products);
    } catch (error) {
        console.error(error);
    }
}

function getProductName(product) {
    return product.name || product.title || "Untitled Product";
}

function getProductDescription(product) {
    return product.description || product.desc || "";
}

function showProducts(list) {

    table.innerHTML = "";

    list.forEach(product => {

        table.innerHTML += `
        <tr>

            <td>${getProductName(product)}</td>
            <td>${product.category || "Uncategorized"}</td>
            <td>₹${product.price ?? 0}</td>
            <td>${product.stock ?? 0}</td>

            <td>

                <button class="edit-btn"
                    onclick="editProduct('${product._id}')">
                    Edit
                </button>

                <button class="delete-btn"
                    onclick="deleteProduct('${product._id}')">
                    Delete
                </button>

            </td>

        </tr>
        `;

    });

}

form.addEventListener("submit", saveProduct);

async function saveProduct(e) {

    e.preventDefault();

    const product = {

        name: document.getElementById("name").value,
        category: document.getElementById("category").value,
        description: document.getElementById("description").value,
        price: Number(document.getElementById("price").value),
        stock: Number(document.getElementById("stock").value),
        image: "placeholder.jpg"

    };

    try {

        let response;

        if (editingId) {

            response = await fetch(`${API}/${editingId}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(product)

            });

        } else {

            response = await fetch(API, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(product)

            });

        }

        if (!response.ok) {
            const error = await response.json();
            alert(error.message);
            return;
        }

        editingId = null;

        form.reset();

        loadProducts();

        alert("Product Saved Successfully!");

    } catch (error) {

        console.error(error);

    }

}

function editProduct(id) {

    const product = products.find(p => p._id === id || p.id === id);

    if (!product) return;

    editingId = id;

    document.getElementById("name").value = getProductName(product);
    document.getElementById("category").value = product.category || "";
    document.getElementById("description").value = getProductDescription(product);
    document.getElementById("price").value = product.price ?? 0;
    document.getElementById("stock").value = product.stock ?? 0;

}

async function deleteProduct(id) {

    if (!confirm("Delete this product?")) return;

    try {

        const response = await fetch(`${API}/${id}`, {

            method: "DELETE"

        });

        if (!response.ok) {

            const error = await response.json();

            alert(error.message);

            return;

        }

        loadProducts();

        alert("Product Deleted Successfully!");

    } catch (error) {

        console.error(error);

    }

}

search.addEventListener("keyup", () => {

    const keyword = search.value.toLowerCase();

    const filtered = products.filter(product =>
        getProductName(product).toLowerCase().includes(keyword)
    );

    showProducts(filtered);

});