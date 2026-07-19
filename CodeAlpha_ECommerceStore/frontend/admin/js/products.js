const API = "http://localhost:5000/api/products";
const UPLOAD_API_BASE = "http://localhost:5000/api/upload";

// attach token for protected upload routes
function getAuthHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}


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
        image: document.getElementById("image").value.trim(),

    };

    try {

        // If user selected a file and we are editing an existing product,
        // upload file first and set product.image to uploaded file path.
        const imageFileInput = document.getElementById("imageFile");
        const file = imageFileInput && imageFileInput.files && imageFileInput.files[0];

        if (editingId && file) {
            const uploadRes = await fetch(`${UPLOAD_API_BASE}/products/${editingId}`, {
                method: "POST",
                headers: {
                    ...getAuthHeader()
                },
                body: (() => {
                    const fd = new FormData();
                    fd.append("image", file);
                    return fd;
                })()
            });


            // If upload fails due to auth, show message
            if (!uploadRes.ok) {
                const err = await uploadRes.json().catch(() => ({}));
                alert(err.message || "Image upload failed");
                return;
            }

            const uploaded = await uploadRes.json();
            if (uploaded && uploaded.image) {
                product.image = uploaded.image;
            }
        }

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

        const updatedEditingId = editingId;
        editingId = null;

        form.reset();

        loadProducts();

        alert("Product Saved Successfully!");

        // If user is working on the same product details page, refresh it.
        // Website product page uses localStorage.productId.
        const updatedProductId = localStorage.getItem("productId");
        if (updatedProductId && updatedProductId === String(updatedEditingId)) {
            // force refresh to avoid cached image
            try {
                window.location.href = "../product.html";
            } catch (e) {
                // ignore
            }
        }



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