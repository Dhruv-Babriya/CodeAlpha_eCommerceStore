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

// Image uploader UI elements
const imageFileInput = document.getElementById("imageFile");
const dropZone = document.getElementById("dropZone");
const imagePreviewWrap = document.getElementById("imagePreviewWrap");
const imagePreview = document.getElementById("imagePreview");
const removeImageBtn = document.getElementById("removeImageBtn");
const uploadProgressWrap = document.getElementById("uploadProgressWrap");
const uploadProgress = document.getElementById("uploadProgress");
const uploadPercent = document.getElementById("uploadPercent");
const uploadSpinner = document.getElementById("uploadSpinner");

let selectedImageFile = null;

function resetUploadUI() {
    setUploadUI({ isUploading: false, percent: 0 });
}

// quick auth diagnostics (helps identify why create product fails)
(function debugAdminState(){
    try {
        const token = localStorage.getItem("token");
        const isAdmin = localStorage.getItem("isAdmin");
        console.log("[admin/products] auth state:", { tokenPresent: !!token, isAdmin });

        if (!token) {
            alert("Admin token missing. Please login again.");
        } else if (isAdmin !== "true") {
            alert("Not an admin account (isAdmin != true). Use an admin login.");
        }

    } catch (e) {
        // ignore
    }
})();

loadProducts();

function setUploadUI({ isUploading, percent = 0 }) {

    if (!uploadProgressWrap) return;
    uploadProgressWrap.style.display = isUploading ? "block" : "none";
    if (uploadSpinner) uploadSpinner.style.display = isUploading ? "block" : "none";
    if (uploadProgress) uploadProgress.value = percent;
    if (uploadPercent) uploadPercent.textContent = `${percent}%`;
}

function showPreview(file) {
    if (!file) {
        if (imagePreviewWrap) imagePreviewWrap.style.display = "none";
        if (imagePreview) imagePreview.src = "";
        return;
    }

    selectedImageFile = file;
    const url = URL.createObjectURL(file);
    imagePreview.src = url;
    if (imagePreviewWrap) imagePreviewWrap.style.display = "block";
}

function clearSelectedImage() {
    selectedImageFile = null;
    if (imageFileInput) imageFileInput.value = "";
    if (imagePreviewWrap) imagePreviewWrap.style.display = "none";
    if (imagePreview) imagePreview.src = "";
}

if (dropZone && imageFileInput) {
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");

        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) {
            imageFileInput.files = e.dataTransfer.files;
            showPreview(file);
        }
    });
}

if (imageFileInput) {
    imageFileInput.addEventListener("change", () => {
        const file = imageFileInput.files && imageFileInput.files[0];
        showPreview(file);
    });
}

if (removeImageBtn) {
    removeImageBtn.addEventListener("click", () => {
        clearSelectedImage();
    });
}

function isAllowedImageFile(file) {
    if (!file) return false;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const max = 5 * 1024 * 1024;
    return allowed.includes(file.type) && file.size <= max;
}

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

                <img
                    src="${product.image || ''}"
                    alt="${getProductName(product)}"
                    loading="lazy"
                    style="width:56px; height:42px; object-fit:cover; border-radius:6px;"
                    onerror="this.onerror=null;this.style.display='none';">

            </td>

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

// Ensure create flow doesn't accidentally use an old editingId.
editingId = null;


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
        const file = selectedImageFile;

        // If admin selected an image file, upload it first with progress.
        if (file) {
            // If this was a create flow, keep editingId null to ensure we hit /products/create.
            // (editingId can be accidentally left set by earlier edits.)
            if (!document.getElementById("imageFile") || !document.getElementById("productForm")) {
                // no-op guard
            }

            if (!isAllowedImageFile(file)) {
                alert("Invalid image. Allowed JPG/JPEG/PNG/WEBP and max size is 5MB.");
                return;
            }

            setUploadUI({ isUploading: true, percent: 0 });

            const fd = new FormData();
            fd.append("image", file);

            let uploadUrl = `${UPLOAD_API_BASE}/products/create`;
            if (editingId) {
                // For edit we replace the image on the server and backend will delete old file.
                uploadUrl = `${UPLOAD_API_BASE}/products/${editingId}`;
            }


            const xhr = new XMLHttpRequest();
            xhr.open("POST", uploadUrl, true);


            const headers = getAuthHeader();
            Object.keys(headers).forEach((k) => xhr.setRequestHeader(k, headers[k]));

            const uploadPromise = new Promise((resolve, reject) => {
                xhr.upload.addEventListener("progress", (ev) => {
                    if (ev.lengthComputable) {
                        const percent = Math.round((ev.loaded / ev.total) * 100);
                        setUploadUI({ isUploading: true, percent });
                    }
                });

                xhr.onload = () => {
                    const status = xhr.status;
                    const text = xhr.responseText;
                    if (status >= 200 && status < 300) {
                        try {
                            resolve(JSON.parse(text));
                        } catch {
                            resolve({});
                        }
                        return;
                    }

                    let parsed = null;
                    try { parsed = JSON.parse(text); } catch { /* ignore */ }

                    reject({
                        status,
                        raw: text,
                        message: parsed?.message || "Image upload failed"
                    });
                };

                xhr.onerror = () => reject({ message: "Image upload failed" });
            });

            xhr.send(fd);

            let uploaded;
            try {
                uploaded = await uploadPromise;
            } catch (uploadErr) {
                const statusPart = uploadErr?.status ? ` (HTTP ${uploadErr.status})` : "";
                const msgPart = uploadErr?.message ? `: ${uploadErr.message}` : "";
                const rawPart = uploadErr?.raw ? `\n${uploadErr.raw}` : "";
                alert(`Image upload failed${statusPart}${msgPart}${rawPart}`);
                return;
            }

            setUploadUI({ isUploading: false, percent: 0 });

            if (!uploaded || !uploaded.image) {
                alert(uploaded?.message || "Image upload failed");
                return;
            }

            product.image = uploaded.image;
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
        clearSelectedImage();
        setUploadUI({ isUploading: false, percent: 0 });

        loadProducts();

        alert("Product Saved Successfully!");

        const updatedProductId = localStorage.getItem("productId");
        if (updatedProductId && updatedProductId === String(updatedEditingId)) {
            try {
                window.location.href = "../product.html";
            } catch (e) {
                // ignore
            }
        }
    } catch (error) {
        setUploadUI({ isUploading: false, percent: 0 });
        console.error(error);
        alert(error.message || "Failed to save product");
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
    document.getElementById("image").value = product.image || "";

    // Keep preview empty until admin selects a new file.
    clearSelectedImage();
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