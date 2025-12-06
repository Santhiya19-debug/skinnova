# SKINNOVA - Skincare E-Commerce Template

A polished, production-ready e-commerce frontend template for skincare brands. Clean design, botanical color palette, fully responsive, and feature-complete.

## ✨ Features

- **8 Complete Pages**: Home, Category, Product Detail, Cart, Checkout, Wishlist, Login, 404
- **Fully Responsive**: Mobile-first design with breakpoints for tablet and desktop
- **Interactive UI**: Cart, wishlist, search, filters, modals, accordions, image zoom
- **LocalStorage Persistence**: Cart and wishlist data saved across sessions
- **Accessibility**: ARIA labels, keyboard navigation, high contrast
- **Smooth Animations**: Subtle hover effects, transitions, parallax
- **12 Sample Products**: Complete with images, descriptions, reviews, ingredients
- **No Dependencies**: Pure vanilla JavaScript, no frameworks or build tools

## 🎨 Color Palette

```css
--white: #FFFFFF          /* Background */
--off-white: #F7F5F2      /* Warm background */
--sage: #C8D2C0           /* Botanical accent */
--olive: #7A8B74          /* Deep olive / headings */
--charcoal: #2B2B2B       /* Primary text */
--grey: #8A8A8A           /* Secondary text */
--nude: #D8C3A5           /* CTA / skin-tone */
--dark-accent: #5F503C    /* Dark accent / hover */
```

## 📁 File Structure

```
project-root/
├── assets/
│   ├── images/          (placeholder images via Unsplash)
│   ├── icons/
│   └── fonts/
├── css/
│   └── styles.css       (complete stylesheet, 2500+ lines)
├── js/
│   └── main.js          (all interactions, 900+ lines)
├── index.html           (homepage)
├── category.html        (product listing with filters)
├── product.html         (product detail page)
├── cart.html            (shopping cart)
├── checkout.html        (checkout form)
├── wishlist.html        (saved products)
├── login.html           (login/signup UI)
├── 404.html             (error page)
├── products.json        (12 sample products)
└── README.md            (this file)
```

## 🚀 Getting Started

### Run Locally

1. **Download/Clone** the template
2. **Open `index.html`** in your browser
3. That's it! No build process required.

### Test Features

- Browse products on homepage and category page
- Click product to view details
- Add items to cart (persists in localStorage)
- Add items to wishlist (heart icon)
- Use search overlay (top right search icon)
- Apply filters on category page
- Proceed through checkout (shows demo modal)

## 🛠 Customization

### Change Sample Data

Edit **`products.json`** to modify products:

```json
{
  "id": "p001",
  "slug": "product-name",
  "name": "Product Name",
  "price": 1299,
  "currency": "INR",
  "images": ["url1.jpg", "url2.jpg"],
  "rating": 4.6,
  "reviews": [...],
  "shortDesc": "...",
  "longDesc": "...",
  "ingredients": ["..."],
  "category": "serums",
  "tags": ["tag1", "tag2"],
  "stock": 26
}
```

### Replace Images

Replace placeholder URLs in `products.json` with your own images:

- **Hero image**: 1600×900px
- **Product images**: 800×800px
- **Thumbnails**: 400×400px

Recommended formats: WebP with JPG fallback for best performance.

### Modify Colors

All colors are defined as CSS variables in `css/styles.css` (lines 10-19). Change the hex values:

```css
:root {
  --white: #FFFFFF;
  --off-white: #F7F5F2;
  --sage: #C8D2C0;
  --olive: #7A8B74;
  /* ... */
}
```

### Update Brand Name

Search and replace "SKINNOVA" in all HTML files with your brand name.

## 💾 LocalStorage Keys

The template uses these localStorage keys:

- `skinnova_cart` - Shopping cart items
- `skinnova_wishlist` - Wishlist product IDs

To reset: Open browser DevTools → Application → LocalStorage → Delete keys.

## 🔌 Backend Integration

This is a **frontend-only template**. To add backend functionality:

### Recommended API Endpoints

```
GET    /api/products           - Fetch all products
GET    /api/products/:slug     - Fetch single product
POST   /api/cart               - Add to cart
POST   /api/checkout           - Process order
POST   /api/auth/login         - User login
POST   /api/newsletter         - Newsletter signup
```

### Payment Gateway Integration

The checkout page shows a demo modal. To integrate payments:

1. Add Razorpay, Stripe, or PayU SDK
2. Replace `handleCheckout()` function in `js/main.js`
3. Add API call to create order
4. Initialize payment gateway with order details

Example for Razorpay:

```javascript
function handleCheckout(e) {
  e.preventDefault();
  
  // Create order on your backend
  const orderData = await createOrder();
  
  // Initialize Razorpay
  const options = {
    key: 'YOUR_KEY',
    amount: orderData.amount,
    currency: 'INR',
    name: 'SKINNOVA',
    order_id: orderData.id,
    handler: function(response) {
      // Handle success
    }
  };
  
  const rzp = new Razorpay(options);
  rzp.open();
}
```

## 📱 Responsive Breakpoints

- **Desktop**: ≥1200px (4 columns)
- **Tablet**: 768px-1199px (2-3 columns)
- **Mobile**: ≤767px (1 column, hamburger menu)

## ♿ Accessibility

- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast meets WCAG AA standards
- Focus indicators on all interactive elements
- Alt text on all images

## 🎭 Fonts

**Display Font**: Playfair Display (serif, for headings)  
**Body Font**: Inter (sans-serif, for UI and body text)

Both loaded from Google Fonts CDN. To use local fonts:

1. Download fonts
2. Place in `assets/fonts/`
3. Update `@font-face` rules in CSS

## 🧪 Tested On

- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+
- ✅ Mobile Safari (iOS 16+)
- ✅ Chrome Mobile (Android 12+)

## 📦 Deployment

### Static Hosting

Upload all files to:

- **Netlify**: Drag & drop folder
- **Vercel**: Connect GitHub repo
- **GitHub Pages**: Push to `gh-pages` branch
- **AWS S3**: Upload as static website

No build step required.

### Performance Tips

1. Compress images (use WebP format)
2. Minify CSS and JS for production
3. Enable GZIP compression on server
4. Add CDN for static assets
5. Implement lazy loading (already included)

## 📝 License & Usage

This template can be used for:

- ✅ Commercial projects
- ✅ Client projects
- ✅ Personal projects
- ✅ Template resale (modified versions)

**Fonts**: Check Google Fonts licenses  
**Images**: Replace Unsplash placeholders with your own

## 🐛 Known Limitations

- **No backend**: All data is client-side only
- **No authentication**: Login UI is visual only
- **No payment processing**: Checkout shows demo modal
- **Search**: Client-side only (searches loaded products)
- **No email sending**: Newsletter form needs backend

## 📞 Support & Customization

For customization requests or issues:

1. Check this README first
2. Review code comments in JS/CSS files
3. Test in different browsers
4. Clear localStorage if issues persist

## 🎯 Future Enhancements

Possible additions for extended version:

- [ ] Product quick view modal
- [ ] Size/variant selection
- [ ] Stock status indicators
- [ ] Product comparison feature
- [ ] Email template for orders
- [ ] Admin dashboard mockup
- [ ] Blog page template
- [ ] Multi-currency support
- [ ] Language switcher

## 📊 File Sizes

- `styles.css`: ~45KB (unminified)
- `main.js`: ~32KB (unminified)
- `products.json`: ~8KB
- Total HTML: ~60KB
- **Total template size**: ~145KB (excluding images)

---

**Built with care for the skincare industry. Clean code. Clean skin. 🌿**

Version 1.0 | December 2025