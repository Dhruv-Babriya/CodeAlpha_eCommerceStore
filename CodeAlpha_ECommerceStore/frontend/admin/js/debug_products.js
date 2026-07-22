  // NOTE: This file is for debugging only. It contains a safer, more transparent admin product create/update flow.
// It should not be used in production.

const API = "/api/products";
const UPLOAD_API_BASE = "/api/upload";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function requireAdminOrLog() {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin");
  console.log("[debug_products] auth state:", { tokenPresent: !!token, isAdmin, tokenLen: token ? token.length : 0 });
  if (!token) alert("No admin token found. Login again.");
  if (isAdmin !== "true") alert("Not admin. isAdmin != true");
}

requireAdminOrLog();

const form = document.getElementById("productForm");
const selectedImageFileState = { file: null };

const imageFileInput = document.getElementById("imageFile");
const imagePreviewWrap = document.getElementById("imagePreviewWrap");
const imagePreview = document.getElementById("imagePreview");

const uploadProgressWrap = document.getElementById("uploadProgressWrap");
const uploadProgress = document.getElementById("uploadProgress");
const uploadPercent = document.getElementById("uploadPercent");

let editingId = null;

function setProgressVisible(visible) {
  if (uploadProgressWrap) uploadProgressWrap.style.display = visible ? "block" : "none";
}

function setProgress(percent) {
  if (uploadProgress) uploadProgress.value = percent;
  if (uploadPercent) uploadPercent.textContent = `${percent}%`;
}

function showPreview(file) {
  if (!file) {
    if (imagePreviewWrap) imagePreviewWrap.style.display = "none";
    if (imagePreview) imagePreview.src = "";
    selectedImageFileState.file = null;
    return;
  }
  selectedImageFileState.file = file;
  const url = URL.createObjectURL(file);
  if (imagePreview) imagePreview.src = url;
  if (imagePreviewWrap) imagePreviewWrap.style.display = "block";
}

if (imageFileInput) {
  imageFileInput.addEventListener("change", () => {
    const file = imageFileInput.files && imageFileInput.files[0];
    showPreview(file);
  });
}

async function uploadProductImage() {
  const file = selectedImageFileState.file;
  if (!file) return null;

  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const max = 5 * 1024 * 1024;
  if (!allowed.includes(file.type) || file.size > max) {
    throw new Error("Invalid image. Allowed JPG/JPEG/PNG/WEBP and max size is 5MB.");
  }

  setProgressVisible(true);
  setProgress(0);

  const fd = new FormData();
  fd.append("image", file);

const uploadUrl = `${UPLOAD_API_BASE}/products/create`;

  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl, true);

    const headers = getAuthHeader();
    Object.keys(headers).forEach((k) => xhr.setRequestHeader(k, headers[k]));

    xhr.upload.addEventListener("progress", (ev) => {
      if (ev.lengthComputable) {
        const percent = Math.round((ev.loaded / ev.total) * 100);
        setProgress(percent);
      }
    });

    xhr.onload = async () => {
      const status = xhr.status;
      const text = xhr.responseText;
      if (status >= 200 && status < 300) {
        try {
          resolve(JSON.parse(text));
        } catch {
          resolve({});
        }
      } else {
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = { message: "Image upload failed" };
        }
        reject({ status, parsed, raw: text });
      }
    };

    xhr.onerror = () => reject({ message: "Image upload failed" });

    xhr.send(fd);
  });
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  console.log("[debug_products] submit started");
  console.log("[debug_products] localStorage token/isAdmin:", {
    tokenPresent: !!localStorage.getItem("token"),
    isAdmin: localStorage.getItem("isAdmin")
  });

  const product = {
    name: document.getElementById("name")?.value,
    category: document.getElementById("category")?.value,
    description: document.getElementById("description")?.value,
    price: Number(document.getElementById("price")?.value),
    stock: Number(document.getElementById("stock")?.value),
    image: document.getElementById("image")?.value?.trim() || ""
  };

  try {
    const uploaded = await uploadProductImage();
    if (uploaded?.image) product.image = uploaded.image;

    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[debug_products] product create failed:", { status: response.status, data });
      alert(`Product create failed: ${data.message || response.status}`);
      return;
    }

    console.log("[debug_products] created:", data);
    alert("Product created successfully!");
  } catch (err) {
    console.error("[debug_products] error:", err);
    alert(err?.parsed?.message || err?.message || "Failed to create product");
  } finally {
    setProgressVisible(false);
  }
});

