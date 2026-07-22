# Deployment Plan - CodeAlpha E-Commerce Store

## Information Gathered

After thorough analysis of all files:

- **Backend**: Node.js/Express.js with MongoDB (Mongoose), JWT auth, Multer file uploads. Runs on port 5000.
- **Frontend**: Pure HTML/CSS/JS (no framework). Lives in `frontend/` directory.
- **Database**: MongoDB (local connection string: `mongodb://127.0.0.1:27017/ecommerce`)
- **API URLs**: Every single JS file has `http://localhost:5000` hardcoded — 9 frontend JS files + 5 admin JS files = **14 files** to update
- **Image URLs**: Product images use `http://localhost:5000/uploads/...` hardcoded

### Deployment Strategy Options

**Option A: Deploy as Single Service (Recommended)**
- Modify backend to serve frontend static files (so it's one deployment)
- Change all API URLs from `http://localhost:5000` to relative paths (`/api/...`)
- Use MongoDB Atlas (free tier) for the database
- Deploy on Railway/Render as a single Node.js service
- **Pros**: Single deployment, simpler, no CORS issues
- **Cons**: Need to update all JS files

**Option B: Separate Frontend + Backend**
- Deploy backend on Render/Railway + MongoDB Atlas
- Deploy frontend on Vercel/Netlify with proxy rules
- **Pros**: No need to modify frontend code structure
- **Cons**: Two deployments, CORS, more complex setup

**Recommended: Option A** — Single deployment on Railway

## Plan

### Phase 1: Setup MongoDB Atlas (Free Tier)
1. Create a free MongoDB Atlas cluster
2. Get the connection string (URI)
3. Whitelist all IPs or specific IPs

### Phase 2: Code Changes for Production
1. **Create `frontend/js/config.js`** - Central API base URL config
2. **Update all 14 JS files** to use `API_URL` from config instead of hardcoded `http://localhost:5000`
3. **Modify `server.js`** to serve frontend static files
4. **Create production `.env`** with MongoDB Atlas URI, JWT secret, etc.
5. **Update `db.js`** to handle MongoDB Atlas connection
6. **Update `package.json`** with proper start/build scripts

### Phase 3: Deploy
1. Push code to GitHub
2. Deploy on Railway.app (or Render)
3. Set environment variables on the platform
4. Test all functionality

### Phase 4: Domain (Optional)
1. Connect custom domain if available
2. Set up SSL (auto-provided by Railway/Render)

## Files to Modify
1. `backend/server.js` - Serve frontend static files
2. `frontend/js/app.js` - Use relative API URLs
3. `frontend/js/cart.js` - Use relative API URLs
4. `frontend/js/checkout.js` - Use relative API URLs
5. `frontend/js/login.js` - Use relative API URLs
6. `frontend/js/orders.js` - Use relative API URLs
7. `frontend/js/product.js` - Use relative API URLs
8. `frontend/js/profile.js` - Use relative API URLs
9. `frontend/js/register.js` - Use relative API URLs
10. `frontend/js/wishlist.js` - Use relative API URLs
11. `frontend/admin/js/dashboard.js` - Use relative API URLs
12. `frontend/admin/js/orders.js` - Use relative API URLs
13. `frontend/admin/js/products.js` - Use relative API URLs
14. `frontend/admin/js/users.js` - Use relative API URLs
15. `frontend/admin/js/debug_products.js` - Use relative API URLs

## Follow-up Steps
1. Test the deployed site thoroughly
2. Verify all API endpoints work
3. Check image uploads
4. Verify admin functionality
5. Test on mobile

## Dependencies
- Node.js (already have)
- Git (need to check)
- GitHub account
- Railway.app or Render account
- MongoDB Atlas account (free)

