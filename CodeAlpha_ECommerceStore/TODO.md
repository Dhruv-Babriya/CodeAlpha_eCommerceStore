# TODO - GUI/UI improvements

## Step 1: Product image correctness
- [x] Update `frontend/js/product.js` to display `product.image` (fallback to Picsum only if empty)
- [x] Add Image URL field in `frontend/admin/products.html`
- [x] Save entered image URL into `image` in `frontend/admin/js/products.js`

## Step 2: Admin dashboard login redirect fix
- [x] Save `isAdmin` in `frontend/js/login.js`
- [x] Ensure admin auth check runs and preserves redirect intent
- [x] Fix script order in `frontend/admin/dashboard.html`

## Step 3: Proper product photo upload (file upload)
- [ ] Add backend multer route to upload product images to `backend/uploads/products/`
- [ ] Update Admin Products UI to include `<input type="file">` and upload selected file on Edit
- [ ] Ensure saved `product.image` points to served static path `/uploads/products/<file>`
- [ ] Test: upload image → open website product page → verify image shows

