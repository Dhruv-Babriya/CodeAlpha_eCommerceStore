# Website Improvement Plan

## Information Gathered

After thorough analysis of all files (CSS, HTML, JS, Admin), the site already has a solid UI foundation with glassmorphism, gradients, animations, and responsive design. Now we need to fix bugs, add missing features, and enhance the user experience further.

### Current Issues Found:
1. **cart.js** - `loadCart()` function has bugs: references `total`/`discount` before defined, incorrectly overwrites total element
2. **register.js** - Double redirect bug (redirects to both login.html and index.html)
3. **product.js** - `wishlist()` just alerts, doesn't call API
4. **cart.html** - Duplicate coupon input fields (standalone + coupon-box)
5. **orders.html** - Inconsistent header (uses h2 instead of logo nav)
6. **wishlist.html** - Inconsistent header (uses h2 instead of logo nav)
7. **index.html** - Footer is too basic, no grid with useful links
8. **Admin dashboard** - Revenue display not populated from API
9. No dark mode toggle
10. No back-to-top button
11. No loading skeleton states (only spinner)
12. No social media links in footer
13. No product quantity selector in cart
14. No scroll-triggered animations for sections
15. No favicon reference in any HTML pages
16. No meta description tags for SEO

## Plan

### Phase 1: Bug Fixes
- Fix `cart.js` loadCart() function - proper variable scoping and total calculation
- Fix `register.js` double redirect bug
- Fix `product.js` wishlist() to actually call API
- Fix `cart.html` duplicate coupon inputs - keep only coupon-box version
- Fix `orders.html` header to match other pages
- Fix `wishlist.html` header to match other pages
- Fix Admin dashboard revenue display

### Phase 2: New Features
- **Dark Mode Toggle** - Add dark mode CSS variables and toggle button in navbar
- **Back to Top Button** - Floating button that appears on scroll
- **Loading Skeleton** - Replace spinner with skeleton cards for products
- **Product Quantity Selector** - Allow qty selection in cart
- **Scroll Animations** - Intersection Observer for fade-in sections
- **Enhanced Footer** - Full grid with links, social media, contact info
- **SEO Meta Tags** - Add descriptions to all pages
- **Favicon** - Add favicon reference to all pages

### Phase 3: Enhanced User Experience
- Product image zoom on hover (magnifier effect)
- Recently viewed products (localStorage tracking)
- Smooth page transitions
- Better error handling with user-friendly messages
- Toast notification improvements (stacking, auto-dismiss)

## Dependencies
- Font Awesome (already included)
- Google Fonts (already included)
- No new external dependencies

## Files to Modify
1. `frontend/css/style.css` - Dark mode, back-to-top, skeletons, scroll animations
2. `frontend/css/responsive.css` - Responsive adjustments for new features
3. `frontend/index.html` - Enhanced footer, meta tags, favicon, dark mode toggle
4. `frontend/cart.html` - Fix coupon inputs, meta tags, favicon
5. `frontend/checkout.html` - Meta tags, favicon
6. `frontend/product.html` - Meta tags, favicon
7. `frontend/profile.html` - Meta tags, favicon
8. `frontend/orders.html` - Fix header, meta tags, favicon
9. `frontend/wishlist.html` - Fix header, meta tags, favicon
10. `frontend/login.html` - Meta tags, favicon
11. `frontend/register.html` - Meta tags, favicon
12. `frontend/js/app.js` - Dark mode toggle, back-to-top, scroll animations, recently viewed
13. `frontend/js/cart.js` - Fix loadCart bugs, add quantity selector
14. `frontend/js/product.js` - Fix wishlist API call, image zoom
15. `frontend/js/register.js` - Fix double redirect
16. `frontend/admin/dashboard.html` - Revenue display fix
17. `frontend/admin/js/dashboard.js` - Fetch revenue data
18. `frontend/admin/products.html` - Meta tags
19. `frontend/admin/orders.html` - Meta tags
20. `frontend/admin/users.html` - Meta tags

### Follow-up Steps
1. Test all bug fixes
2. Verify dark mode works across all pages
3. Ensure responsive design still works with new features
4. Test cart quantity functionality
5. Verify wishlist API integration

